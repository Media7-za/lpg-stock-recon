/**
 * Smart Routing — Cluster Engine
 *
 * Pure-logic module for spatial clustering of deliveries using DBSCAN.
 * Zero UI dependencies. Runs entirely client-side.
 *
 * Algorithm:
 *  1. Filter deliveries to geocoded-only
 *  2. Convert to GeoJSON FeatureCollection
 *  3. Run DBSCAN with configurable radius
 *  4. Split oversized clusters by weight
 *  5. Compute per-cluster stats (centroid, hull, weight, distance from depot)
 *  6. Sort by distance from depot
 */

import * as turf from "@turf/turf"
import type { Feature, Point, FeatureCollection } from "geojson"
import { getClusterColor, type ClusterColor } from "./cluster-colors"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DeliveryPoint {
    id: number
    customerName: string
    customerAddress: string
    areaName: string
    routeName: string
    latitude: number
    longitude: number
    totalWeight: number
    products: { name: string; quantity: number }[]
    // Original delivery data for reference
    raw: any
}

export interface ClusterStats {
    deliveryCount: number
    totalWeightKg: number
    distanceFromDepotKm: number
    spreadRadiusKm: number
    centroid: { lat: number; lng: number }
}

export interface DeliveryCluster {
    id: string
    index: number
    color: ClusterColor
    deliveries: DeliveryPoint[]
    stats: ClusterStats
    hull: { lat: number; lng: number }[] | null // convex hull polygon, null if < 3 points
}

export interface ClusterResult {
    clusters: DeliveryCluster[]
    unclustered: DeliveryPoint[]
    skipped: any[] // deliveries missing geocodes
    config: ClusterConfig
}

export interface ClusterConfig {
    radiusKm: number
    maxWeightKg: number
    depot: { lat: number; lng: number }
}

// ─── Default Configuration ────────────────────────────────────────────────────

export const DEFAULT_CONFIG: ClusterConfig = {
    radiusKm: 8,
    maxWeightKg: 1050,
    depot: { lat: -29.6061538, lng: 30.3603207 },
}

// ─── Core Engine ──────────────────────────────────────────────────────────────

/**
 * Extract a DeliveryPoint from a raw delivery object (from the API).
 * Returns null if the delivery has no geocode.
 */
export function toDeliveryPoint(delivery: any): DeliveryPoint | null {
    const lat = delivery.customer?.latitude
    const lng = delivery.customer?.longitude
    if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return null

    const totalWeight = delivery.deliveryItems?.reduce(
        (sum: number, item: any) => sum + (item.quantityToDeliver * (item.product?.totalWeight || 0)),
        0
    ) || 0

    const products = delivery.deliveryItems?.map((item: any) => ({
        name: item.product?.code || item.product?.name || "Unknown",
        quantity: item.quantityToDeliver,
    })) || []

    return {
        id: delivery.id,
        customerName: delivery.customer?.name || "Unknown",
        customerAddress: delivery.customer?.address || "",
        areaName: delivery.customer?.area?.name || "Unknown",
        routeName: delivery.customer?.area?.route?.name || "Unknown",
        latitude: lat,
        longitude: lng,
        totalWeight,
        products,
        raw: delivery,
    }
}

/**
 * Run the full clustering pipeline.
 */
export function clusterDeliveries(
    rawDeliveries: any[],
    config: ClusterConfig = DEFAULT_CONFIG
): ClusterResult {
    // 1. Separate geocoded from non-geocoded
    const points: DeliveryPoint[] = []
    const skipped: any[] = []

    for (const d of rawDeliveries) {
        const point = toDeliveryPoint(d)
        if (point) {
            points.push(point)
        } else {
            skipped.push(d)
        }
    }

    // Edge case: no geocoded deliveries
    if (points.length === 0) {
        return { clusters: [], unclustered: [], skipped, config }
    }

    // 2. Convert to GeoJSON FeatureCollection
    const features: Feature<Point>[] = points.map((p, i) => turf.point(
        [p.longitude, p.latitude],
        { index: i }
    ))
    const fc: FeatureCollection<Point> = turf.featureCollection(features)

    // 3. Run DBSCAN
    const clustered = turf.clustersDbscan(fc, config.radiusKm, {
        minPoints: 1, // Allow single-delivery clusters
    })

    // 4. Group by cluster ID
    const clusterMap = new Map<number, DeliveryPoint[]>()
    const unclustered: DeliveryPoint[] = []

    turf.clusterEach(clustered, "cluster", (cluster, clusterValue, _clusterIndex) => {
        if (cluster === null) return
        const clusterNum = clusterValue as number
        turf.featureEach(cluster, (feature) => {
            const idx = feature.properties?.index
            if (idx == null) return
            const point = points[idx]
            if (clusterNum === -1 || clusterNum === undefined) {
                // Noise point
                unclustered.push(point)
            } else {
                if (!clusterMap.has(clusterNum)) clusterMap.set(clusterNum, [])
                clusterMap.get(clusterNum)!.push(point)
            }
        })
    })

    // Also check for noise by the dbscan property
    turf.featureEach(clustered, (feature) => {
        if (feature.properties?.dbscan === "noise") {
            const idx = feature.properties?.index
            if (idx != null) {
                const point = points[idx]
                // Only add if not already in a cluster or unclustered
                const inCluster = Array.from(clusterMap.values()).some(arr => arr.some(p => p.id === point.id))
                const inUnclustered = unclustered.some(p => p.id === point.id)
                if (!inCluster && !inUnclustered) {
                    unclustered.push(point)
                }
            }
        }
    })

    // 5. Split oversized clusters and build output
    let clusters: DeliveryCluster[] = []
    let clusterIdx = 0

    for (const [, deliveries] of clusterMap) {
        const splits = splitByWeight(deliveries, config.maxWeightKg)
        for (const split of splits) {
            const stats = computeStats(split, config.depot)
            const hull = computeHull(split)
            clusters.push({
                id: `cluster-${clusterIdx}`,
                index: clusterIdx,
                color: getClusterColor(clusterIdx),
                deliveries: split,
                stats,
                hull,
            })
            clusterIdx++
        }
    }

    // 6. Sort by distance from depot (nearest first)
    clusters.sort((a, b) => a.stats.distanceFromDepotKm - b.stats.distanceFromDepotKm)

    // Re-index and re-color after sorting
    clusters = clusters.map((c, i) => ({
        ...c,
        id: `cluster-${i}`,
        index: i,
        color: getClusterColor(i),
    }))

    return { clusters, unclustered, skipped, config }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Split a cluster into sub-clusters if total weight exceeds maxWeight.
 * Splits by sorting deliveries by distance from centroid and slicing at weight boundaries.
 */
function splitByWeight(deliveries: DeliveryPoint[], maxWeight: number): DeliveryPoint[][] {
    const totalWeight = deliveries.reduce((sum, d) => sum + d.totalWeight, 0)
    if (totalWeight <= maxWeight) return [deliveries]

    // Sort by distance from cluster centroid (keeps geographically close deliveries together)
    const centroid = getCentroid(deliveries)
    const sorted = [...deliveries].sort((a, b) => {
        const distA = haversine(centroid.lat, centroid.lng, a.latitude, a.longitude)
        const distB = haversine(centroid.lat, centroid.lng, b.latitude, b.longitude)
        return distA - distB
    })

    // Greedy split
    const result: DeliveryPoint[][] = []
    let current: DeliveryPoint[] = []
    let currentWeight = 0

    for (const d of sorted) {
        if (currentWeight + d.totalWeight > maxWeight && current.length > 0) {
            result.push(current)
            current = []
            currentWeight = 0
        }
        current.push(d)
        currentWeight += d.totalWeight
    }
    if (current.length > 0) result.push(current)

    return result
}

/**
 * Compute stats for a cluster.
 */
function computeStats(deliveries: DeliveryPoint[], depot: { lat: number; lng: number }): ClusterStats {
    const centroid = getCentroid(deliveries)
    const totalWeight = deliveries.reduce((sum, d) => sum + d.totalWeight, 0)
    const distanceFromDepot = haversine(depot.lat, depot.lng, centroid.lat, centroid.lng)

    // Spread radius: max distance from centroid to any delivery
    const spreadRadius = deliveries.reduce((max, d) => {
        const dist = haversine(centroid.lat, centroid.lng, d.latitude, d.longitude)
        return Math.max(max, dist)
    }, 0)

    return {
        deliveryCount: deliveries.length,
        totalWeightKg: Math.round(totalWeight),
        distanceFromDepotKm: Math.round(distanceFromDepot * 10) / 10,
        spreadRadiusKm: Math.round(spreadRadius * 10) / 10,
        centroid,
    }
}

/**
 * Compute the convex hull polygon for a set of delivery points.
 * Returns null if fewer than 3 points.
 */
function computeHull(deliveries: DeliveryPoint[]): { lat: number; lng: number }[] | null {
    if (deliveries.length < 3) return null

    const points = deliveries.map(d => turf.point([d.longitude, d.latitude]))
    const fc = turf.featureCollection(points)
    const hull = turf.convex(fc)

    if (!hull || !hull.geometry) return null

    const coords = hull.geometry.coordinates[0]
    return coords.map(([lng, lat]: number[]) => ({ lat, lng }))
}

/**
 * Get the geographic centroid of a set of delivery points.
 */
function getCentroid(deliveries: DeliveryPoint[]): { lat: number; lng: number } {
    if (deliveries.length === 0) return { lat: 0, lng: 0 }
    if (deliveries.length === 1) return { lat: deliveries[0].latitude, lng: deliveries[0].longitude }

    const points = deliveries.map(d => turf.point([d.longitude, d.latitude]))
    const fc = turf.featureCollection(points)
    const center = turf.centroid(fc)
    const [lng, lat] = center.geometry.coordinates
    return { lat, lng }
}

/**
 * Haversine distance in kilometers.
 */
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const from = turf.point([lng1, lat1])
    const to = turf.point([lng2, lat2])
    return turf.distance(from, to, { units: "kilometers" })
}

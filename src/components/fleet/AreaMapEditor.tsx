// Ported from Orders-Module (components/area-map-editor.tsx) — Phase 4 Step 1.
// No logic changes needed — this component has no Next.js or API-route
// dependencies, only removed "use client" and retyped `areas`/`onAreaSelect`
// against the new Area shape from src/lib/api/routesAreas.ts.
import * as React from "react"
import { GoogleMap, Polygon } from "@react-google-maps/api"
import { Loader2 } from "lucide-react"
import type { Area } from "@/lib/api/routesAreas"

const mapContainerStyle = {
    width: "100%",
    height: "100%",
}

const defaultCenter = {
    lat: -29.8587, // Durban, South Africa
    lng: 31.0218,
}

interface AreaMapEditorProps {
    areas: Area[]
    selectedAreaId?: number | null
    center?: { lat: number; lng: number } | null
    onAreaSelect?: (area: Area) => void
    isLoaded: boolean
    loadError: Error | undefined
}

export function AreaMapEditor({
    areas,
    selectedAreaId,
    center,
    onAreaSelect,
    isLoaded,
    loadError,
}: AreaMapEditorProps) {

    const mapRef = React.useRef<google.maps.Map | null>(null)

    const onMapLoad = React.useCallback((map: google.maps.Map) => {
        mapRef.current = map
    }, [])

    // Pan to center when it changes
    React.useEffect(() => {
        if (mapRef.current && center) {
            mapRef.current.panTo(center)
            mapRef.current.setZoom(14)
        }
    }, [center])

    if (loadError) {
        return (
            <div className="flex items-center justify-center h-full bg-slate-100">
                <div className="text-center">
                    <p className="text-red-600 font-semibold">Error loading maps</p>
                    <p className="text-sm text-slate-500 mt-1">Check your API key configuration</p>
                </div>
            </div>
        )
    }

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-full bg-slate-100">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center || defaultCenter}
            zoom={center ? 14 : 11}
            onLoad={onMapLoad}
            options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
            }}
        >
            {/* Render existing area polygons */}
            {areas.map((area) => {
                if (!area.boundaryPolygon) return null

                try {
                    const parsedPaths = JSON.parse(area.boundaryPolygon)
                    const isSelected = selectedAreaId === area.id

                    return (
                        <Polygon
                            key={area.id}
                            paths={parsedPaths}
                            options={{
                                fillColor: isSelected ? '#EA580C' : '#6B7280',
                                fillOpacity: 0.2,
                                strokeColor: isSelected ? '#EA580C' : '#6B7280',
                                strokeWeight: 2,
                            }}
                            onClick={() => onAreaSelect && onAreaSelect(area)}
                        />
                    )
                } catch (error) {
                    console.error(`Failed to parse polygon for area ${area.id}:`, error)
                    return null
                }
            })}
        </GoogleMap>
    )
}

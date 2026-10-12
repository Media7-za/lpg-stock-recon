// Ported from Orders-Module (components/customer-sheet.tsx) — Phase 4 Step 2.
// Adapted: removed "use client"; next/link -> react-router-dom;
// process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY -> import.meta.env.VITE_GOOGLE_MAPS_KEY;
// fetch('/api/routes', type=route) -> createRoute(); fetch('/api/customers')
// -> createCustomer()/updateCustomer(). The Email field is DROPPED —
// commercial_customers has no email column (deliberately held back in the
// Phase 2 migration; no evidence anything used it). accountNumber now reads/
// writes through commercial_customer_accounts via customers.ts, not a flat
// column — this component still just holds a plain accountNumber string,
// the table-split is handled entirely in the data-access layer.
import * as React from "react"
import { Loader2, Search, MapPin, Users, CheckCircle2, AlertTriangle, ExternalLink, Plus } from "lucide-react"
import { toast } from "sonner"
import { Link } from "react-router-dom"
import usePlacesAutocomplete, { getDetails } from "use-places-autocomplete"
import { useLoadScript } from "@react-google-maps/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { createCustomer, updateCustomer, type Customer } from "@/lib/api/customers"
import { createRoute, type Area, type Route } from "@/lib/api/routesAreas"

const libraries: ("places")[] = ["places"]

interface CustomerSheetProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
    customer?: Customer | null
    areas: Area[]
    routes: Route[]
}

// Google Places Autocomplete Component
function PlacesAutocomplete({
    onPlaceSelect,
}: {
    onPlaceSelect: (placeDetails: any) => void
}) {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            componentRestrictions: { country: "za" }, // Restrict to South Africa
        },
        debounce: 300,
    })

    const handleSelect = async (placeId: string) => {
        // Clear value and suggestions immediately
        setValue("", false)
        clearSuggestions()

        try {
            const parameter = {
                placeId,
                fields: [
                    "name",
                    "formatted_address",
                    "formatted_phone_number",
                    "international_phone_number",
                    "website",
                    "address_components",
                    "geometry",
                    "url",
                ],
            }

            const placeDetails = await getDetails(parameter)
            onPlaceSelect(placeDetails)
        } catch (error) {
            console.error("Error fetching place details:", error)
            toast.error("Failed to fetch business details")
        } finally {
            // Final check to ensure suggestions are cleared
            clearSuggestions()
        }
    }

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            clearSuggestions()
                        }
                    }}
                    disabled={!ready}
                    placeholder="Search business (e.g. 'Spoon Eatery')..."
                    className="pl-10 bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-100"
                />
            </div>

            {status === "OK" && data.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full bg-white border border-blue-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {data.map(({ place_id, description }) => (
                        <li
                            key={place_id}
                            onClick={() => handleSelect(place_id)}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors flex items-start gap-2 border-b last:border-b-0"
                        >
                            <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{description}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

/**
 * Check if a point (lat, lng) is inside a polygon using ray-casting algorithm.
 */
function isPointInPolygon(point: { lat: number; lng: number }, polygon: { lat: number; lng: number }[]): boolean {
    let inside = false
    const n = polygon.length
    for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = polygon[i].lat, yi = polygon[i].lng
        const xj = polygon[j].lat, yj = polygon[j].lng
        const intersect = ((yi > point.lng) !== (yj > point.lng)) &&
            (point.lat < (xj - xi) * (point.lng - yi) / (yj - yi) + xi)
        if (intersect) inside = !inside
    }
    return inside
}

export function CustomerSheet({ open, onClose, onSuccess, customer, areas, routes }: CustomerSheetProps) {
    const [saving, setSaving] = React.useState(false)
    const [selectedRouteId, setSelectedRouteId] = React.useState("")
    const [formData, setFormData] = React.useState({
        name: "",
        address: "",
        areaId: "",
        latitude: "",
        longitude: "",
        googleMapsUrl: "",
        phone: "",
        accountNumber: "",
        notes: "",
        active: true,
    })

    // New Route Dialog State
    const [newRouteDialogOpen, setNewRouteDialogOpen] = React.useState(false)
    const [newRouteName, setNewRouteName] = React.useState("")
    const [newRouteCode, setNewRouteCode] = React.useState("")
    const [creatingRoute, setCreatingRoute] = React.useState(false)

    // Load Google Maps script
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || "",
        libraries,
     })

    React.useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name || "",
                address: customer.address || "",
                areaId: customer.areaId?.toString() || "",
                latitude: customer.latitude != null ? String(customer.latitude) : "",
                longitude: customer.longitude != null ? String(customer.longitude) : "",
                googleMapsUrl: customer.googleMapsUrl || "",
                phone: customer.phone || "",
                accountNumber: customer.accountNumber || "",
                notes: customer.notes || "",
                active: customer.active ?? true,
            })
            // Pre-select route from the customer's area
            const customerArea = areas.find(a => a.id === customer.areaId)
            if (customerArea) {
                setSelectedRouteId(customerArea.routeId?.toString() || "")
            } else {
                setSelectedRouteId("")
            }
        } else {
            setFormData({
                name: "",
                address: "",
                areaId: "",
                latitude: "",
                longitude: "",
                googleMapsUrl: "",
                phone: "",
                accountNumber: "",
                notes: "",
                active: true,
            })
            setSelectedRouteId("")
        }
    }, [customer, open, areas])

    // Filter areas by selected route
    const filteredAreas = selectedRouteId
        ? areas.filter((area) => area.routeId?.toString() === selectedRouteId)
        : areas

    // When route changes, clear area if it doesn't belong to the new route
    const handleRouteChange = (routeId: string) => {
        if (routeId === "new") {
            setNewRouteDialogOpen(true)
            return
        }
        setSelectedRouteId(routeId)
        // Check if current area belongs to the new route
        const currentArea = areas.find(a => a.id?.toString() === formData.areaId)
        if (currentArea && currentArea.routeId?.toString() !== routeId) {
            setFormData({ ...formData, areaId: "" })
        }
    }

    const handleQuickCreateRoute = async () => {
        if (!newRouteName.trim() || !newRouteCode.trim()) {
            toast.error("Please enter both Name and Code")
            return
        }
        setCreatingRoute(true)
        try {
            const newRoute = await createRoute({
                name: newRouteName.trim(),
                code: newRouteCode.trim().toUpperCase(),
            })

            toast.success(`Route "${newRoute.name}" created!`)
            onSuccess() // Refresh parent data
            setSelectedRouteId(newRoute.id.toString())
            setNewRouteDialogOpen(false)
            setNewRouteName("")
            setNewRouteCode("")
        } catch (error) {
            toast.error("Failed to create route")
        } finally {
            setCreatingRoute(false)
        }
    }

    // When area changes, auto-select its route
    const handleAreaChange = (areaId: string) => {
        setFormData({ ...formData, areaId })
        const selectedArea = areas.find(a => a.id?.toString() === areaId)
        if (selectedArea && selectedArea.routeId) {
            setSelectedRouteId(selectedArea.routeId.toString())
        }
    }

    /**
     * Auto-detect area from a lat/lng coordinate by checking which geofenced area contains the point.
     * Falls back to name matching from address components.
     */
    const detectArea = (
        lat: number | null,
        lng: number | null,
        addressComponents: any[]
    ): { areaId: string; routeId: string } => {
        // 1. Try geofence matching first (most accurate)
        if (lat && lng) {
            for (const area of areas) {
                if (area.boundaryPolygon) {
                    try {
                        const polygon = JSON.parse(area.boundaryPolygon)
                        if (isPointInPolygon({ lat, lng }, polygon)) {
                            return {
                                areaId: area.id.toString(),
                                routeId: area.routeId?.toString() || "",
                            }
                        }
                    } catch {
                        // Invalid polygon, skip
                    }
                }
            }
        }

        // 2. Fallback: match by sublocality/neighborhood name
        const sublocality = addressComponents.find(
            (component: any) =>
                component.types.includes("sublocality") ||
                component.types.includes("sublocality_level_1") ||
                component.types.includes("neighborhood") ||
                component.types.includes("locality")
        )

        if (sublocality) {
            const areaName = sublocality.long_name.toLowerCase()
            const matchedArea = areas.find((area) =>
                area.name.toLowerCase().includes(areaName) ||
                areaName.includes(area.name.toLowerCase())
            )
            if (matchedArea) {
                return {
                    areaId: matchedArea.id.toString(),
                    routeId: matchedArea.routeId?.toString() || "",
                }
            }
        }

        return { areaId: "", routeId: "" }
    }

    const handlePlaceSelect = (placeDetails: any) => {
        const addressComponents = placeDetails.address_components || []

        // Get lat/lng from the place's geometry
        let lat: number | null = null
        let lng: number | null = null
        if (placeDetails.geometry?.location) {
            lat = typeof placeDetails.geometry.location.lat === "function"
                ? placeDetails.geometry.location.lat()
                : placeDetails.geometry.location.lat
            lng = typeof placeDetails.geometry.location.lng === "function"
                ? placeDetails.geometry.location.lng()
                : placeDetails.geometry.location.lng
        }

        // Auto-detect area using geofence + fallback
        const { areaId, routeId } = detectArea(lat, lng, addressComponents)

        // Sanitize name: remove trailing period often returned by Google Places
        const sanitizedName = (placeDetails.name || formData.name).replace(/\.$/, "")

        setFormData({
            ...formData,
            name: sanitizedName,
            address: placeDetails.formatted_address || formData.address,
            phone: placeDetails.formatted_phone_number ||
                placeDetails.international_phone_number ||
                formData.phone,
            googleMapsUrl: placeDetails.url || formData.googleMapsUrl,
            areaId: areaId || formData.areaId,
            latitude: String(lat),
            longitude: String(lng),
        })

        if (routeId) {
            setSelectedRouteId(routeId)
        }

        if (areaId) {
            const matchedArea = areas.find(a => a.id.toString() === areaId)
            toast.success(`✨ Auto-filled! Area: ${matchedArea?.name || "detected"}`)
        } else {
            toast.warning("⚠️ Address is outside your delivery areas — please select Route & Area manually", {
                duration: 5000,
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            // Generate fallback Google Maps URL if lat/lng exist but no URL
            let finalGoogleMapsUrl = formData.googleMapsUrl
            if (!finalGoogleMapsUrl && formData.latitude && formData.longitude) {
                finalGoogleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${formData.latitude},${formData.longitude}`
            }

            const payload = {
                name: formData.name,
                address: formData.address,
                areaId: parseInt(formData.areaId),
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                googleMapsUrl: finalGoogleMapsUrl,
                phone: formData.phone,
                accountNumber: formData.accountNumber,
                notes: formData.notes,
                active: formData.active,
            }

            if (customer) {
                await updateCustomer(customer.id, payload)
            } else {
                await createCustomer(payload)
            }

            toast.success(customer ? "Customer updated" : "Customer created")
            onSuccess()
            onClose()
        } catch (error) {
            toast.error("Failed to save customer")
        } finally {
            setSaving(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent side="left" className="sm:max-w-[700px] p-0 flex flex-col overflow-hidden border-r border-slate-200 shadow-2xl">
                <div className="flex-1 overflow-y-auto px-8 py-10">
                    <SheetHeader className="mb-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <SheetTitle className="text-3xl font-black tracking-tight text-slate-900">
                                {customer ? "Edit Customer" : "New Customer"}
                            </SheetTitle>
                        </div>
                        <SheetDescription className="text-base text-slate-500 font-medium">
                            {customer
                                ? "Update existing customer profile and delivery preferences."
                                : "Add a new client to your delivery network. Use Google search to save time."}
                        </SheetDescription>
                    </SheetHeader>

                    <form id="customer-form" onSubmit={handleSubmit} className="space-y-12">
                        {/* SECTION 1: IDENTITY */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em]">01. Identity</h3>
                                <div className="h-px flex-1 bg-slate-100"></div>
                            </div>

                            {isLoaded && (
                                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 shadow-sm space-y-3">
                                    <label className="text-[10px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
                                        <span className="text-base">⚡</span> Quick Search (Google Places)
                                    </label>
                                    <PlacesAutocomplete onPlaceSelect={handlePlaceSelect} />
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[11px] text-blue-600 font-medium">
                                            {customer
                                                ? "Search to update this customer's details from Google."
                                                : "Type a business name to automatically pull address and contact details."}
                                        </p>
                                        <p className="text-[10px] text-slate-400 italic">
                                            Can't find the business? You can skip this and enter details manually below.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase">Customer Name *</Label>
                                    <Input
                                        id="name"
                                        required
                                        placeholder="Legal Business Name"
                                        className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl font-semibold"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="accountNumber" className="text-xs font-bold text-slate-500 uppercase">Account Number</Label>
                                    <Input
                                        id="accountNumber"
                                        placeholder="ACC-XXXX"
                                        className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl font-mono text-sm"
                                        value={formData.accountNumber}
                                        onChange={(e) =>
                                            setFormData({ ...formData, accountNumber: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: LOGISTICS */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em]">02. Logistics</h3>
                                <div className="h-px flex-1 bg-slate-100"></div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="routeId" className="text-xs font-bold text-slate-500 uppercase">Route *</Label>
                                        <Link
                                            to="/routes"
                                            className="text-[10px] font-black text-blue-500 hover:text-blue-700 uppercase tracking-wider flex items-center gap-1 transition-colors"
                                        >
                                            <Plus className="h-3 w-3" />
                                            Manage Routes
                                        </Link>
                                    </div>
                                    <Select
                                        value={selectedRouteId}
                                        onValueChange={handleRouteChange}
                                    >
                                        <SelectTrigger className="h-11 border-slate-200 rounded-xl font-medium">
                                            <SelectValue placeholder="Select Route" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {routes.map((route) => (
                                                <SelectItem key={route.id} value={route.id.toString()}>
                                                    {route.name} ({route.code})
                                                </SelectItem>
                                            ))}
                                            <SelectItem value="new" className="text-blue-600 font-bold border-t">
                                                + Add New Route
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="areaId" className="text-xs font-bold text-slate-500 uppercase">Area *</Label>
                                    <Select
                                        required
                                        value={formData.areaId}
                                        onValueChange={handleAreaChange}
                                    >
                                        <SelectTrigger className="h-11 border-slate-200 rounded-xl font-medium">
                                            <SelectValue placeholder="Select Area" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredAreas.map((area) => (
                                                <SelectItem key={area.id} value={area.id.toString()}>
                                                    {area.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="active" className="text-xs font-bold text-slate-500 uppercase">Status</Label>
                                    <Select
                                        value={formData.active ? "true" : "false"}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, active: value === "true" })
                                        }
                                    >
                                        <SelectTrigger className="h-11 border-slate-200 rounded-xl font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Active</SelectItem>
                                            <SelectItem value="false">On Hold</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {formData.areaId ? (
                                <div className="flex items-center gap-3 text-xs text-green-700 bg-green-50 px-4 py-3 rounded-xl border border-green-100 font-bold">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span>
                                        Route: <span className="text-slate-900">{routes.find(r => r.id.toString() === selectedRouteId)?.name}</span>
                                        <span className="mx-2 opacity-30">|</span>
                                        Area: <span className="text-slate-900">{areas.find(a => a.id.toString() === formData.areaId)?.name}</span>
                                    </span>
                                </div>
                            ) : formData.address && !formData.areaId ? (
                                <div className="flex flex-col gap-3 text-xs text-amber-700 bg-amber-50 px-4 py-4 rounded-xl border border-amber-100 shadow-sm font-semibold">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                                        <span>This address is outside your current geofenced delivery areas.</span>
                                    </div>
                                    <Link
                                        to={`/routes?address=${encodeURIComponent(formData.address)}&routeId=${selectedRouteId}`}
                                        className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 font-black underline underline-offset-4 ml-6"
                                    >
                                        Create a new service area here →
                                    </Link>
                                </div>
                            ) : null}

                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-xs font-bold text-slate-500 uppercase">Delivery Address *</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                    <Textarea
                                        id="address"
                                        required
                                        className="min-h-[100px] pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl font-medium text-sm leading-relaxed"
                                        placeholder="Building, Street, Suburb..."
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Coordinates (optional)</Label>
                                <p className="text-[11px] text-slate-500">Paste a Google Maps link (e.g. maps.google.com/...@lat,lng...) or enter latitude/longitude to auto-detect delivery area.</p>
                                <Input
                                    id="coordinates-paste"
                                    placeholder="Paste Google Maps URL here..."
                                    className="h-11 border-slate-200 rounded-xl font-mono text-sm"
                                    onPaste={(e) => {
                                        const pasted = e.clipboardData.getData("text")
                                        const match = pasted.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)

                                        // Always save the URL itself
                                        setFormData(prev => ({ ...prev, googleMapsUrl: pasted.trim() }))

                                        if (match) {
                                            const lat = parseFloat(match[1])
                                            const lng = parseFloat(match[2])
                                            setFormData(prev => ({ ...prev, latitude: String(lat), longitude: String(lng) }))
                                            const { areaId, routeId } = detectArea(lat, lng, [])
                                            if (routeId) setSelectedRouteId(routeId)
                                            if (areaId) setFormData(prev => ({ ...prev, areaId }))
                                            const matchedArea = areas.find(a => a.id.toString() === areaId)
                                            if (areaId) toast.success(`Area detected: ${matchedArea?.name || "matched"}`)
                                            else toast.warning("Coordinates are outside your delivery areas — select Route & Area manually.")
                                        } else {
                                            toast.info("URL saved, but no coordinates detected (ensure URL has @lat,lng)")
                                        }
                                    }}
                                    onChange={(e) => {
                                        const v = e.target.value.trim()
                                        // Update URL if it looks like a URL
                                        if (v.includes("google.com/maps") || v.startsWith("http")) {
                                            setFormData(prev => ({ ...prev, googleMapsUrl: v }))
                                        }

                                        const match = v.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
                                        if (match) {
                                            const lat = parseFloat(match[1])
                                            const lng = parseFloat(match[2])
                                            setFormData(prev => ({ ...prev, latitude: String(lat), longitude: String(lng) }))
                                            const { areaId, routeId } = detectArea(lat, lng, [])
                                            if (routeId) setSelectedRouteId(routeId)
                                            if (areaId) setFormData(prev => ({ ...prev, areaId }))
                                        }
                                    }}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="latitude" className="text-[11px] text-slate-500">Latitude</Label>
                                        <Input
                                            id="latitude"
                                            type="number"
                                            step="any"
                                            placeholder="e.g. -29.649"
                                            className="h-10 border-slate-200 rounded-lg font-mono text-sm"
                                            value={formData.latitude}
                                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                            onBlur={(e) => {
                                                const lat = e.currentTarget.value ? parseFloat(e.currentTarget.value) : NaN
                                                const lng = formData.longitude ? parseFloat(formData.longitude) : NaN
                                                if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                                                    const { areaId, routeId } = detectArea(lat, lng, [])
                                                    if (routeId) setSelectedRouteId(routeId)
                                                    if (areaId) setFormData(prev => ({ ...prev, areaId }))
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="longitude" className="text-[11px] text-slate-500">Longitude</Label>
                                        <Input
                                            id="longitude"
                                            type="number"
                                            step="any"
                                            placeholder="e.g. 30.341"
                                            className="h-10 border-slate-200 rounded-lg font-mono text-sm"
                                            value={formData.longitude}
                                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                            onBlur={(e) => {
                                                const lat = formData.latitude ? parseFloat(formData.latitude) : NaN
                                                const lng = e.currentTarget.value ? parseFloat(e.currentTarget.value) : NaN
                                                if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                                                    const { areaId, routeId } = detectArea(lat, lng, [])
                                                    if (routeId) setSelectedRouteId(routeId)
                                                    if (areaId) setFormData(prev => ({ ...prev, areaId }))
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="googleMapsUrl" className="text-xs font-bold text-slate-500 uppercase">Google Maps Link</Label>
                                <div className="relative">
                                    <Input
                                        id="googleMapsUrl"
                                        placeholder="Auto-filled from Places search or paste above"
                                        className="h-10 border-slate-200 rounded-lg font-mono text-xs pr-10"
                                        value={formData.googleMapsUrl}
                                        onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                                    />
                                    {formData.googleMapsUrl && (
                                        <a
                                            href={formData.googleMapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 transition-colors"
                                            title="Open in Google Maps"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-400 italic">Populated automatically from Google search or pasted URL. Drivers can use this to navigate.</p>
                            </div>
                        </div>

                        {/* SECTION 3: CONTACT & NOTES */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em]">03. Contact & Notes</h3>
                                <div className="h-px flex-1 bg-slate-100"></div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-xs font-bold text-slate-500 uppercase">Direct Phone</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+27..."
                                    className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl font-medium"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-xs font-bold text-slate-500 uppercase">Special Instructions for Driver</Label>
                                <Textarea
                                    id="notes"
                                    className="min-h-[100px] border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl font-medium text-sm italic"
                                    placeholder="E.g. Access code #1234, leave with security."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="bg-slate-50 border-t border-slate-200 px-8 py-6 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center justify-between gap-4 max-w-full">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={saving}
                            className="text-slate-500 font-bold px-6 hover:bg-slate-200 rounded-xl transition-all"
                        >
                            Cancel
                        </Button>
                        <Button
                            form="customer-form"
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-10 h-12 rounded-xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex items-center gap-2"
                        >
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                            {customer ? "Save Changes" : "Create Customer"}
                        </Button>
                    </div>
                </div>

                {/* Quick New Route Dialog */}
                <Dialog open={newRouteDialogOpen} onOpenChange={setNewRouteDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Quick Create Route</DialogTitle>
                            <DialogDescription>
                                Add a new delivery route. You can then add areas to it on the Routes page.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="quickRouteName">Route Name *</Label>
                                <Input
                                    id="quickRouteName"
                                    placeholder="e.g. Route PMB"
                                    value={newRouteName}
                                    onChange={(e) => {
                                        setNewRouteName(e.target.value)
                                        const words = e.target.value.trim().split(/\s+/)
                                        const code = words
                                            .map(w => w[0]?.toUpperCase() || "")
                                            .join("")
                                        setNewRouteCode(code)
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quickRouteCode">Route Code *</Label>
                                <Input
                                    id="quickRouteCode"
                                    placeholder="e.g. RPMB"
                                    value={newRouteCode}
                                    onChange={(e) => setNewRouteCode(e.target.value.toUpperCase())}
                                    className="font-mono uppercase"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setNewRouteDialogOpen(false)}
                                disabled={creatingRoute}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleQuickCreateRoute}
                                disabled={creatingRoute || !newRouteName.trim() || !newRouteCode.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {creatingRoute && <Loader2 className="mr-2 h-4 w-4 animate-spin font-bold" />}
                                Create Route
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </SheetContent>
        </Sheet>
    )
}

// Ported from Orders-Module (components/create-area-form.tsx) — Phase 4 Step 1.
// Adapted: removed "use client"; fetch('/api/routes', POST/PATCH) replaced
// with createArea()/updateArea() (direct Supabase calls).
import * as React from "react"
import { ArrowLeft, Loader2, Search, MapPin } from "lucide-react"
import { toast } from "sonner"
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createArea, updateArea, type Area, type Route } from "@/lib/api/routesAreas"

// Google Places Autocomplete for Regions
function RegionAutocomplete({
    onRegionSelect,
}: {
    onRegionSelect: (name: string, coords: { lat: number; lng: number }) => void
}) {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            types: ["(regions)"],
            componentRestrictions: { country: "za" },
        },
        debounce: 300,
    })

    const handleSelect = async (description: string) => {
        setValue(description, false)
        clearSuggestions()

        try {
            const results = await getGeocode({ address: description })
            const { lat, lng } = await getLatLng(results[0])
            const regionName = results[0].address_components[0]?.long_name || description
            onRegionSelect(regionName, { lat, lng })
            toast.success("📍 Region located")
        } catch (error) {
            console.error("Error geocoding region:", error)
            toast.error("Failed to locate region")
        }
    }

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={!ready}
                    placeholder="Search region (e.g. 'Umhlanga', 'Ballito')..."
                    className="pl-10 bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-100"
                />
            </div>

            {status === "OK" && (
                <ul className="absolute z-50 mt-1 w-full bg-white border border-blue-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {data.map(({ place_id, description }) => (
                        <li
                            key={place_id}
                            onClick={() => handleSelect(description)}
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

interface CreateAreaFormProps {
    routes: Route[]
    initialRouteId: number | null
    initialArea?: Area | null
    onCancel: () => void
    onSuccess: () => void
    onRegionSelect: (coords: { lat: number; lng: number }) => void
    isLoaded: boolean
    initialAddress?: string | null
}

export function CreateAreaForm({
    routes,
    initialRouteId,
    initialArea,
    onCancel,
    onSuccess,
    onRegionSelect,
    isLoaded,
    initialAddress,
}: CreateAreaFormProps) {
    const isEditMode = !!initialArea
    const [saving, setSaving] = React.useState(false)
    const [formData, setFormData] = React.useState({
        name: "",
        routeId: initialRouteId?.toString() || "",
        centerLat: null as number | null,
        centerLng: null as number | null,
    })
    const [regionLocated, setRegionLocated] = React.useState(false)

    // Populate form when entering edit mode
    React.useEffect(() => {
        if (initialArea) {
            setFormData({
                name: initialArea.name,
                routeId: initialArea.routeId.toString(),
                centerLat: initialArea.centerLat ?? null,
                centerLng: initialArea.centerLng ?? null,
            })
            setRegionLocated(initialArea.centerLat != null && initialArea.centerLng != null)
        }
    }, [initialArea?.id])

    // Reset form when initialRouteId changes (create mode only)
    React.useEffect(() => {
        if (!initialArea) {
            setFormData({
                name: "",
                routeId: initialRouteId?.toString() || "",
                centerLat: null,
                centerLng: null,
            })
            setRegionLocated(false)
        }
    }, [initialRouteId])

    const handleRegionSelect = (name: string, coords: { lat: number; lng: number }) => {
        setFormData({
            ...formData,
            name,
            centerLat: coords.lat,
            centerLng: coords.lng,
        })
        setRegionLocated(true)
        onRegionSelect(coords)
    }

    // Auto-locate if initialAddress is provided
    React.useEffect(() => {
        if (initialAddress && isLoaded && !regionLocated) {
            getGeocode({ address: initialAddress })
                .then(async (results) => {
                    const { lat, lng } = await getLatLng(results[0])
                    const name = results[0].address_components[0]?.long_name || initialAddress
                    handleRegionSelect(name, { lat, lng })
                    toast.info("🎯 Map centered on customer address")
                })
                .catch(err => console.error("Auto-geocode failed:", err))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialAddress, isLoaded])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.routeId) {
            toast.error("Please select a route")
            return
        }

        setSaving(true)

        try {
            if (isEditMode) {
                await updateArea(initialArea!.id, {
                    name: formData.name,
                    routeId: parseInt(formData.routeId),
                    centerLat: formData.centerLat,
                    centerLng: formData.centerLng,
                })
                toast.success(`✅ Area "${formData.name}" updated!`)
            } else {
                await createArea({
                    name: formData.name,
                    routeId: parseInt(formData.routeId),
                    centerLat: formData.centerLat,
                    centerLng: formData.centerLng,
                })
                toast.success(`✅ Area "${formData.name}" created!`)
            }

            onSuccess()
        } catch (error) {
            toast.error(isEditMode ? "Failed to update area" : "Failed to save area")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="flex flex-col h-full animate-in slide-in-from-left-4 duration-300">
            {/* Header with Back Button */}
            <div className="px-4 py-4 border-b bg-gradient-to-r from-slate-50 to-white flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onCancel}
                    className="h-8 w-8 rounded-full hover:bg-slate-200"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="font-semibold text-sm text-slate-900">{isEditMode ? "Edit Delivery Area" : "New Delivery Area"}</h2>
                    <p className="text-xs text-muted-foreground">{isEditMode ? "Update name or route" : "Search region, then name the area"}</p>
                </div>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-5">

                    {/* Step 1: Route Selection */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Step 1 — Route
                        </Label>
                        <Select
                            required
                            value={formData.routeId}
                            onValueChange={(value) => setFormData({ ...formData, routeId: value })}
                        >
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select a route..." />
                            </SelectTrigger>
                            <SelectContent>
                                {routes.map((route) => (
                                    <SelectItem key={route.id} value={route.id.toString()}>
                                        {route.name} ({route.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Step 2: Find Region */}
                    {isLoaded && (
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Step 2 — Find Region
                            </Label>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200 shadow-sm">
                                <RegionAutocomplete onRegionSelect={handleRegionSelect} />
                                <p className="text-xs text-blue-600 mt-2">
                                    Search for a suburb or area to locate it on the map
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Area Name (auto-filled) */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Step 3 — Area Name
                        </Label>
                        <Input
                            required
                            placeholder="e.g. Umhlanga Ridge"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-white"
                        />
                    </div>
                </div>

                {/* Sticky Bottom Actions */}
                <div className="p-4 border-t bg-white flex justify-end gap-2 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode ? "Save Changes" : "Create Area"}
                    </Button>
                </div>
            </form>
        </div>
    )
}

// Ported from Orders-Module (app/routes/page.tsx) — Phase 4 Step 1.
// Adapted: removed "use client"; next/navigation's useSearchParams ->
// react-router-dom's useSearchParams (compatible .get() API); fetch('/api/routes')
// replaced with listRoutes()/createRoute() (direct Supabase calls); the original
// dual-purpose POST /api/routes (body.type === 'route' vs area-create) is split
// into its two real operations now that we're not constrained by one REST
// endpoint. process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY -> import.meta.env.VITE_GOOGLE_MAPS_KEY.
import * as React from "react"
import { Suspense } from "react"
import { MapPin, Plus, Loader2, Pencil } from "lucide-react"
import { toast } from "sonner"
import { useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useLoadScript } from "@react-google-maps/api"
import { AreaMapEditor } from "@/components/fleet/AreaMapEditor"
import { CreateAreaForm } from "@/components/fleet/CreateAreaForm"
import { listRoutes, createRoute, type Route, type Area } from "@/lib/api/routesAreas"

const libraries: ("places")[] = ["places"]

// Route color palette
const ROUTE_COLORS: Record<string, string> = {
    "Route North": "#3B82F6",
    "Route South": "#10B981",
    "Route East": "#F59E0B",
    "Route West": "#8B5CF6",
}

function getRouteColor(name: string): string {
    // Check exact match first
    if (ROUTE_COLORS[name]) return ROUTE_COLORS[name]
    // Check partial match (e.g., "North" in "Route North")
    for (const [key, color] of Object.entries(ROUTE_COLORS)) {
        if (name.includes(key.replace("Route ", "")) || key.includes(name)) return color
    }
    // Generate a deterministic color for new routes
    const colors = ["#EC4899", "#06B6D4", "#84CC16", "#F97316", "#8B5CF6", "#14B8A6"]
    const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
    return colors[hash % colors.length]
}

export default function RoutesPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
            <RoutesPageContent />
        </Suspense>
    )
}

function RoutesPageContent() {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || "",
        libraries,
    })

    // Core state
    const [routes, setRoutes] = React.useState<Route[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchParams] = useSearchParams()
    const [selectedAreaId, setSelectedAreaId] = React.useState<number | null>(null)
    const [mapCenter, setMapCenter] = React.useState<{ lat: number; lng: number } | null>(null)

    // Left pane state: "list" shows the accordion, "create" shows the create form
    const [leftPaneView, setLeftPaneView] = React.useState<"list" | "create">("list")
    const [selectedRouteId, setSelectedRouteId] = React.useState<number | null>(null)
    const [editingArea, setEditingArea] = React.useState<Area | null>(null)

    // New route dialog state
    const [newRouteDialogOpen, setNewRouteDialogOpen] = React.useState(false)
    const [newRouteName, setNewRouteName] = React.useState("")
    const [newRouteCode, setNewRouteCode] = React.useState("")
    const [creatingRoute, setCreatingRoute] = React.useState(false)

    const fetchRoutes = React.useCallback(() => {
        setLoading(true)
        listRoutes()
            .then((data) => {
                setRoutes(data)
                setLoading(false)
            })
            .catch((err) => {
                console.error("Error fetching routes:", err)
                setLoading(false)
            })
    }, [])

    React.useEffect(() => {
        fetchRoutes()
    }, [fetchRoutes])

    // Handle Deep Linking from Customer Sheet
    React.useEffect(() => {
        const address = searchParams.get("address")
        const routeId = searchParams.get("routeId")

        if (address && routes.length > 0) {
            // Find the route if it exists
            if (routeId && routeId !== "null" && routeId !== "") {
                setSelectedRouteId(parseInt(routeId))
            }

            setLeftPaneView("create")
            // We'll let the map/form components handle the address search via geocoding if needed,
            // but for now we just open the mode.
        }
    }, [searchParams, routes])

    // Click an area in the accordion → highlight it and pan map
    const handleAreaClick = (area: Area) => {
        setSelectedAreaId(area.id)
        if (area.centerLat && area.centerLng) {
            setMapCenter({ lat: area.centerLat, lng: area.centerLng })
        }
    }

    // Click "+ Add Area" on a route → swap left pane to create form
    const handleAddArea = (routeId: number) => {
        setEditingArea(null)
        setSelectedRouteId(routeId)
        setLeftPaneView("create")
    }

    // Click pencil on an area → open create form pre-filled for editing
    const handleEditArea = (area: Area) => {
        setEditingArea(area)
        setSelectedRouteId(area.routeId)
        setSelectedAreaId(area.id)
        if (area.centerLat && area.centerLng) {
            setMapCenter({ lat: area.centerLat, lng: area.centerLng })
        }
        setLeftPaneView("create")
    }

    // Region search result → pan map to the located region
    const handleRegionSelect = (coords: { lat: number; lng: number }) => {
        setMapCenter(coords)
    }

    // Cancel form → go back to list
    const handleCancelCreate = () => {
        setLeftPaneView("list")
        setSelectedRouteId(null)
        setEditingArea(null)
    }

    // Area created/saved successfully → go back to list + refresh
    const handleCreateSuccess = () => {
        fetchRoutes()
        setLeftPaneView("list")
        setSelectedRouteId(null)
        setEditingArea(null)
    }

    // Create new route
    const handleCreateRoute = async () => {
        if (!newRouteName.trim() || !newRouteCode.trim()) {
            toast.error("Please enter both Route Name and Code")
            return
        }
        setCreatingRoute(true)
        try {
            await createRoute({
                name: newRouteName.trim(),
                code: newRouteCode.trim().toUpperCase(),
            })
            toast.success(`Route "${newRouteName}" created!`)
            fetchRoutes()
            setNewRouteDialogOpen(false)
            setNewRouteName("")
            setNewRouteCode("")
        } catch (error: any) {
            toast.error(error.message || "Failed to create route")
        } finally {
            setCreatingRoute(false)
        }
    }

    // Flatten all areas for map rendering
    const allAreas = routes.flatMap((route) => route.areas)

    return (
        <div className="flex flex-col h-[calc(100vh-80px)]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-[Inter]">
                        Routes & Areas
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage delivery routes and geofenced service areas.
                    </p>
                </div>
                <Button
                    onClick={() => setNewRouteDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="new-route-btn"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    New Route
                </Button>
            </div>

            {/* Split Screen Layout */}
            <div className="flex flex-1 overflow-hidden">

                {/* LEFT PANE: Fixed width, content swaps between list and form */}
                <div className="w-[350px] xl:w-[400px] flex-shrink-0 border-r border-slate-200 bg-slate-50/50 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
                    {leftPaneView === "create" ? (
                        <CreateAreaForm
                            routes={routes}
                            initialRouteId={selectedRouteId}
                            initialArea={editingArea}
                            onCancel={handleCancelCreate}
                            onSuccess={handleCreateSuccess}
                            onRegionSelect={handleRegionSelect}
                            isLoaded={isLoaded}
                            initialAddress={searchParams.get("address")}
                        />
                    ) : (
                        /* Routes Accordion List */
                        loading ? (
                            <div className="p-6 space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-20 bg-slate-200 animate-pulse rounded" />
                                ))}
                            </div>
                        ) : (
                            <Accordion type="multiple" className="w-full">
                                {routes.map((route) => {
                                    const routeColor = getRouteColor(route.name)
                                    return (
                                        <AccordionItem key={route.id} value={`route-${route.id}`} className="border-b border-slate-200">
                                            <AccordionTrigger className="px-6 py-4 hover:bg-slate-100/50 transition-colors">
                                                <div className="flex items-center justify-between w-full pr-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: routeColor }}
                                                        />
                                                        <span className="font-bold text-slate-900">{route.name}</span>
                                                    </div>
                                                    <Badge variant="secondary" className="bg-slate-200 text-slate-600 text-xs">
                                                        {route.areas?.length || 0}
                                                    </Badge>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-6 pb-4 bg-white">
                                                <div className="space-y-2">
                                                    {route.areas?.map((area) => (
                                                        <div
                                                            key={area.id}
                                                            onClick={() => handleAreaClick(area)}
                                                            className={`flex items-center gap-2 p-3 rounded-md cursor-pointer transition-all ${selectedAreaId === area.id
                                                                ? "bg-blue-50 border border-blue-200"
                                                                : "hover:bg-slate-50 border border-transparent"
                                                                }`}
                                                        >
                                                            <MapPin
                                                                className={`h-4 w-4 ${selectedAreaId === area.id ? "text-blue-600" : "text-slate-400"
                                                                    }`}
                                                            />
                                                            <span
                                                                className={`text-sm ${selectedAreaId === area.id
                                                                    ? "text-blue-900 font-semibold"
                                                                    : "text-slate-700"
                                                                    }`}
                                                            >
                                                                {area.name}
                                                            </span>
                                                            <div className="ml-auto flex items-center gap-1">
                                                                {area.boundaryPolygon && (
                                                                    <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                                                                        Mapped
                                                                    </Badge>
                                                                )}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleEditArea(area)
                                                                    }}
                                                                >
                                                                    <Pencil className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleAddArea(route.id)}
                                                        className="w-full mt-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        Add Area
                                                    </Button>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    )
                                })}
                            </Accordion>
                        )
                    )}
                </div>

                {/* RIGHT PANE: The Map Canvas (Always Mounted, Never Resized) */}
                <div className="flex-1 relative min-h-0">
                    <AreaMapEditor
                        areas={allAreas}
                        selectedAreaId={selectedAreaId}
                        center={mapCenter}
                        onAreaSelect={handleAreaClick}
                        isLoaded={isLoaded}
                        loadError={loadError}
                    />
                </div>
            </div>

            {/* New Route Dialog */}
            <Dialog open={newRouteDialogOpen} onOpenChange={setNewRouteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New Route</DialogTitle>
                        <DialogDescription>
                            Add a new delivery route. You can then add areas to it with geofenced boundaries.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="routeName">Route Name *</Label>
                            <Input
                                id="routeName"
                                placeholder="e.g. Route PMB, Route Hillcrest"
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
                            <Label htmlFor="routeCode">Route Code * <span className="text-xs text-muted-foreground">(unique short code)</span></Label>
                            <Input
                                id="routeCode"
                                placeholder="e.g. RPMB, RH"
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
                            onClick={handleCreateRoute}
                            disabled={creatingRoute || !newRouteName.trim() || !newRouteCode.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {creatingRoute && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Route
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

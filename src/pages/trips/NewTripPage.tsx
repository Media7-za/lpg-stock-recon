// Ported from Orders-Module (app/trips/new/page.tsx) — Phase 4 Step 4.
// Adapted: removed "use client"; useRouter/useSearchParams (next/navigation)
// -> useNavigate/useSearchParams (react-router-dom); fetch('/api/drivers'|
// '/api/vehicles'|'/api/routes') -> listDrivers()/listVehicles()/listRoutes()
// (Step 1); fetch('/api/orders?status=Unassigned') -> listUnassignedDeliveries()
// (Step 4) — a real simplification, not just a rename: the original fetched
// Orders and reached into `order.deliveries[0].id` to get the delivery id to
// assign; listUnassignedDeliveries() returns delivery-shaped records
// directly, so `assigned.map(d => d.id)` IS the delivery id, no indirection.
// fetch('/api/trips', POST) -> createTrip() (the upsert-trip Edge Function —
// NOT YET DEPLOYED, see Step 4 report).
//
// One behavior this couldn't carry over 1:1: the original's vehicle dropdown
// disabled vehicles already on an active trip via a server-computed
// `v.activeTrip` field (added by the old /api/vehicles route's enrichment).
// Step 1's listVehicles() doesn't compute that (kept plain CRUD, no
// trip-awareness). Rather than extend Step 1's shared data layer for this,
// it's computed locally here via listTrips() — same UX, no shared-layer
// change. The server-side INV-010 guard (reject on save if the vehicle is
// already on an active trip) still exists in upsert-trip regardless.
"use client"

import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { format } from "date-fns"
import {
    Plus,
    GripVertical,
    X,
    Truck,
    Calendar as CalendarIcon,
    Loader2,
    Search,
    ArrowRight,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { cn, formatDate } from "@/lib/utils"
import { ROUTE_COLORS } from "@/lib/trip-helpers"
import { ProductBadge } from "@/components/shared/ProductBadge"
import { listDrivers, type Driver } from "@/lib/api/drivers"
import { listVehicles, type Vehicle } from "@/lib/api/vehicles"
import { listRoutes, type Route } from "@/lib/api/routesAreas"
import { listUnassignedDeliveries, type UnassignedDelivery } from "@/lib/api/deliveries"
import { listTrips, createTrip } from "@/lib/api/trips"

// ─── Unassigned Card (Desktop) ───────────────────────────────────────────────
function UnassignedCard({ delivery, onAdd }: { delivery: UnassignedDelivery; onAdd: () => void }) {
    const totalWeight = delivery.totalWeight
    const areaName = delivery.customer?.area?.name || "Unknown"
    const routeColor = ROUTE_COLORS[areaName] || "border-l-gray-300"

    return (
        <div
            onClick={onAdd}
            className={`bg-white p-3 rounded border shadow-sm text-sm cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group flex gap-3 border-l-4 ${routeColor}`}
        >
            <div className="flex-1">
                <div className="flex justify-between items-start mb-0.5">
                    <div className="font-semibold text-slate-900 leading-tight">{delivery.customer?.name}</div>
                    <span className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold shrink-0 ml-2">
                        ⚖️ {totalWeight}kg
                    </span>
                </div>
                <div className="text-muted-foreground text-xs mt-1 truncate">{delivery.customer?.address}</div>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                    {delivery.products?.slice(0, 3).map((p, idx) => (
                        <ProductBadge
                            key={idx}
                            product={{ code: p.name, name: p.name }}
                            quantity={p.quantity}
                            className="text-[10px] h-5 px-1 bg-blue-50 text-blue-700 border-blue-100"
                        />
                    ))}
                    {delivery.products?.length > 3 && (
                        <span className="text-[10px] text-slate-400">+{delivery.products.length - 3} more</span>
                    )}
                </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 self-center">
                <ArrowRight className="h-4 w-4" />
            </div>
        </div>
    )
}

// ─── Mobile Unassigned Card ───────────────────────────────────────────────────
function MobileUnassignedCard({
    delivery,
    onAdd,
    isAdded,
}: {
    delivery: UnassignedDelivery
    onAdd: () => void
    isAdded: boolean
}) {
    const totalWeight = delivery.totalWeight
    const areaName = delivery.customer?.area?.name || ""

    return (
        <div
            className={cn(
                "bg-white border rounded-xl p-4 flex items-center gap-3 transition-all",
                isAdded ? "opacity-50 border-green-200" : "border-slate-200 hover:border-blue-200 shadow-sm"
            )}
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 text-sm truncate">{delivery.customer?.name}</span>
                    <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold shrink-0">
                        {totalWeight}kg
                    </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{delivery.customer?.address}</p>
                {areaName && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{areaName}</p>
                )}
                <div className="flex gap-1 mt-2 flex-wrap">
                    {delivery.products?.slice(0, 3).map((p, idx) => (
                        <ProductBadge
                            key={idx}
                            product={{ code: p.name, name: p.name }}
                            quantity={p.quantity}
                            className="text-[10px] h-5 px-1.5 bg-blue-50 text-blue-700 border-blue-100"
                        />
                    ))}
                </div>
            </div>

            {isAdded ? (
                <div className="shrink-0 w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
            ) : (
                <button
                    onClick={onAdd}
                    className="shrink-0 w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    aria-label={`Add ${delivery.customer?.name} to trip`}
                    data-testid={`add-delivery-${delivery.id}`}
                >
                    <Plus className="h-5 w-5" />
                </button>
            )}
        </div>
    )
}

// ─── Sortable Assigned Card (Shared) ─────────────────────────────────────────
function SortableAssignedCard({ id, delivery, index, onRemove, isOverlay = false, reorderMode = false }: {
    id: number
    delivery: UnassignedDelivery
    index: number
    onRemove?: () => void
    isOverlay?: boolean
    reorderMode?: boolean
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center gap-3 p-3 border rounded-xl bg-white transition-all group",
                isDragging ? "opacity-40 border-blue-300 bg-blue-50 shadow-xl" : "border-slate-200 hover:border-slate-300",
                isOverlay && "shadow-2xl ring-2 ring-blue-200 border-blue-400 opacity-90"
            )}
        >
            {reorderMode ? (
                <div
                    {...attributes}
                    {...listeners}
                    className="flex items-center justify-center w-11 h-11 rounded-xl bg-slate-100 text-slate-500 cursor-grab active:cursor-grabbing shrink-0"
                >
                    <GripVertical className="h-5 w-5" />
                </div>
            ) : (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm shrink-0">
                    {index + 1}
                </div>
            )}

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-900 truncate text-sm">{delivery.customer?.name}</span>
                    <span className="text-xs font-mono text-slate-400 shrink-0 ml-2">
                        {delivery.totalWeight}kg
                    </span>
                </div>
                <div className="text-xs text-slate-400 truncate mt-0.5">{delivery.customer?.address}</div>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                    {delivery.products?.map((p, idx) => (
                        <ProductBadge
                            key={idx}
                            product={{ code: p.name, name: p.name }}
                            quantity={p.quantity}
                            className="text-[10px] h-5 px-1.5 bg-slate-100 text-slate-600 border-slate-200"
                        />
                    ))}
                </div>
            </div>

            {!isOverlay && !reorderMode && (
                <button
                    onClick={onRemove}
                    className="shrink-0 w-11 h-11 rounded-xl border border-red-100 text-red-400 flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-95 transition-all"
                    aria-label="Remove from trip"
                    data-testid={`remove-delivery-${delivery?.id}`}
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    )
}

// ─── Sticky Capacity Header ───────────────────────────────────────────────────
function CapacityHeader({
    totalLoad,
    drops,
    vehicle,
    capacityPct,
}: {
    totalLoad: number
    drops: number
    vehicle: Vehicle | undefined
    capacityPct: number
}) {
    const isOverload = capacityPct > 100
    const isWarning = capacityPct > 85 && capacityPct <= 100

    return (
        <div
            className={cn(
                "sticky top-0 z-20 border-b px-4 py-3 shadow-sm transition-colors",
                isOverload
                    ? "bg-red-600 border-red-700"
                    : isWarning
                        ? "bg-amber-500 border-amber-600"
                        : "bg-[#1A2B4C] border-[#152240]"
            )}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    {isOverload && <AlertTriangle className="h-4 w-4 text-white shrink-0" />}
                    <div>
                        <p className={cn("text-[10px] font-bold uppercase tracking-wider", isOverload ? "text-red-100" : "text-blue-200")}>
                            Load
                        </p>
                        <p className="text-white font-bold text-lg leading-none">
                            {totalLoad}kg
                            {vehicle?.capacity != null && vehicle.capacity > 0 && (
                                <span className={cn("text-sm font-normal ml-1", isOverload ? "text-red-200" : "text-blue-300")}>
                                    / {vehicle.capacity}kg
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="text-center">
                    <p className={cn("text-[10px] font-bold uppercase tracking-wider", isOverload ? "text-red-100" : "text-blue-200")}>
                        Drops
                    </p>
                    <p className="text-white font-bold text-lg leading-none">{drops}</p>
                </div>

                {vehicle && (
                    <div className="text-right min-w-0">
                        <p className={cn("text-[10px] font-bold uppercase tracking-wider", isOverload ? "text-red-100" : "text-blue-200")}>
                            Vehicle
                        </p>
                        <p className="text-white text-sm font-semibold truncate">{vehicle.registration}</p>
                    </div>
                )}
            </div>

            {vehicle?.capacity != null && vehicle.capacity > 0 && (
                <div className="mt-2">
                    <div className={cn("w-full rounded-full h-1.5", isOverload ? "bg-red-400/40" : "bg-white/20")}>
                        <div
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-300",
                                isOverload ? "bg-white" : isWarning ? "bg-white" : "bg-green-400"
                            )}
                            style={{ width: `${Math.min(capacityPct, 100)}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NewTripPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [loading, setLoading] = React.useState(false)
    const [drivers, setDrivers] = React.useState<Driver[]>([])
    const [vehicles, setVehicles] = React.useState<Vehicle[]>([])
    const [activeVehicleIds, setActiveVehicleIds] = React.useState<Set<number>>(new Set())
    const [routes, setRoutes] = React.useState<Route[]>([])
    const [unassigned, setUnassigned] = React.useState<UnassignedDelivery[]>([])
    const [assigned, setAssigned] = React.useState<UnassignedDelivery[]>([])
    const [activeId, setActiveId] = React.useState<string | null>(null)
    const [activeTab, setActiveTab] = React.useState<"unassigned" | "sequence">("unassigned")
    const [reorderMode, setReorderMode] = React.useState(false)
    const [search, setSearch] = React.useState("")
    const [selectedFilterRouteId, setSelectedFilterRouteId] = React.useState<string>("")

    // Form State
    const [driverId, setDriverId] = React.useState<string>("")
    const [vehicleId, setVehicleId] = React.useState<string>("")
    const [routeId, setRouteId] = React.useState<string>("")
    const [tripDate, setTripDate] = React.useState<Date>(new Date())

    React.useEffect(() => {
        const paramRouteId = searchParams.get("routeId")
        if (paramRouteId && routes.length > 0) {
            const match = routes.find(r => r.id.toString() === paramRouteId)
            if (match) {
                setRouteId(paramRouteId)
                setSelectedFilterRouteId(paramRouteId)
            }
        }
    }, [routes, searchParams])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    React.useEffect(() => {
        listDrivers().then(setDrivers).catch(err => console.error("Error loading drivers:", err))
        listVehicles().then(setVehicles).catch(err => console.error("Error loading vehicles:", err))
        listRoutes().then(setRoutes).catch(err => console.error("Error loading routes:", err))
        listUnassignedDeliveries().then(setUnassigned).catch(err => console.error("Error loading unassigned deliveries:", err))
        listTrips()
            .then((trips) => {
                setActiveVehicleIds(new Set(
                    trips
                        .filter(t => ["planned", "in-progress"].includes(t.status))
                        .map(t => t.vehicle?.id)
                        .filter((id): id is number => id != null)
                ))
            })
            .catch(err => console.error("Error loading trips for vehicle availability:", err))
    }, [])

    const assignedIds = React.useMemo(() => new Set(assigned.map((d) => d.id)), [assigned])

    const filteredUnassigned = React.useMemo(() => {
        let list = [...unassigned]
        if (selectedFilterRouteId) {
            list = list.filter((d) => d.customer?.area?.routeId === parseInt(selectedFilterRouteId))
        }
        if (search.trim()) {
            const q = search.toLowerCase()
            list = list.filter(
                (d) =>
                    d.customer?.name?.toLowerCase().includes(q) ||
                    d.customer?.area?.name?.toLowerCase().includes(q)
            )
        }
        return list
    }, [unassigned, selectedFilterRouteId, search])

    const addToTrip = (deliveryId: number) => {
        const item = unassigned.find((d) => d.id === deliveryId)
        if (item && !assignedIds.has(deliveryId)) {
            setUnassigned((prev) => prev.filter((d) => d.id !== deliveryId))
            setAssigned((prev) => [...prev, item])
        }
    }

    const removeFromTrip = (deliveryId: number) => {
        const item = assigned.find((d) => d.id === deliveryId)
        if (item) {
            setAssigned((prev) => prev.filter((d) => d.id !== deliveryId))
            setUnassigned((prev) => [...prev, item])
        }
    }

    const handleDragStart = (event: { active: { id: string | number } }) => setActiveId(event.active.id?.toString())
    const handleDragEnd = (event: { active: { id: string | number }; over: { id: string | number } | null }) => {
        const { active, over } = event
        setActiveId(null)
        if (!over || active.id === over.id) return
        setAssigned((items) => {
            const oldIndex = items.findIndex((i) => i.id === Number(active.id))
            const newIndex = items.findIndex((i) => i.id === Number(over.id))
            if (oldIndex === -1 || newIndex === -1) return items
            const reordered = arrayMove(items, oldIndex, newIndex)
            toast.success("Route sequence updated.")
            return reordered
        })
    }

    const handleSave = async () => {
        if (!driverId || !vehicleId || !routeId) {
            toast.error("Please assign a driver and vehicle before saving.")
            return
        }
        if (assigned.length === 0) {
            toast.error("Please assign at least one delivery")
            return
        }
        if (capacityPercentage > 100) {
            toast.error("Cannot save: Total load exceeds vehicle capacity. Please remove stops.")
            return
        }

        setLoading(true)
        try {
            const data = await createTrip({
                driverId: parseInt(driverId),
                vehicleId: parseInt(vehicleId),
                routeId: parseInt(routeId),
                tripDate,
                deliveryIds: assigned.map((d) => d.id),
            })
            toast.success(`Trip ${data.trip?.trip_number ?? ""} saved successfully. Ready for dispatch.`)
            navigate(`/trips/${data.trip?.id}`)
        } catch (error) {
            toast.error("Connection lost. Please check your signal and try saving again.")
            setLoading(false)
        }
    }

    const activeItem = activeId ? assigned.find((d) => d.id === Number(activeId)) : null

    const selectedVehicle = React.useMemo(
        () => vehicles.find((v) => v.id.toString() === vehicleId),
        [vehicles, vehicleId]
    )
    const totalLoad = React.useMemo(
        () => assigned.reduce((acc, curr) => acc + (curr.totalWeight || 0), 0),
        [assigned]
    )
    const capacityPercentage = React.useMemo(
        () => (selectedVehicle?.capacity != null && selectedVehicle.capacity > 0 ? (totalLoad / selectedVehicle.capacity) * 100 : 0),
        [totalLoad, selectedVehicle]
    )
    const isOverload = capacityPercentage > 100
    const canSave = assigned.length > 0 && !isOverload

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
            {/* ── MOBILE LAYOUT ── */}
            <div className="md:hidden flex flex-col flex-1">
                <CapacityHeader
                    totalLoad={totalLoad}
                    drops={assigned.length}
                    vehicle={selectedVehicle}
                    capacityPct={capacityPercentage}
                />

                <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <Select value={driverId} onValueChange={setDriverId}>
                            <SelectTrigger className="bg-white h-11 w-full" id="mobile-driver-select">
                                <SelectValue placeholder="Driver" />
                            </SelectTrigger>
                            <SelectContent position="popper" align="start">
                                {drivers.map((d) => (
                                    <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={vehicleId} onValueChange={setVehicleId}>
                            <SelectTrigger className="bg-white h-11 w-full" id="mobile-vehicle-select">
                                <SelectValue placeholder="Vehicle" />
                            </SelectTrigger>
                            <SelectContent position="popper" align="start">
                                {vehicles.map((v) => (
                                    <SelectItem key={v.id} value={v.id.toString()} disabled={activeVehicleIds.has(v.id)}>
                                        {v.registration}{activeVehicleIds.has(v.id) ? ' — On active trip' : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={routeId} onValueChange={setRouteId}>
                            <SelectTrigger className="bg-white h-11 w-full" id="mobile-route-select">
                                <SelectValue placeholder="Route" />
                            </SelectTrigger>
                            <SelectContent position="popper" align="start">
                                {routes.map((r) => (
                                    <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full h-11 justify-start font-normal bg-white">
                                    <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                                    {formatDate(tripDate)}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={tripDate} onSelect={(d) => d && setTripDate(d)} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="px-3 pt-3 pb-0 bg-white">
                    <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                        <button
                            className={cn(
                                "flex-1 h-10 rounded-lg text-sm font-semibold transition-all",
                                activeTab === "unassigned"
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                            onClick={() => setActiveTab("unassigned")}
                            data-testid="tab-unassigned"
                        >
                            Unassigned ({filteredUnassigned.length})
                        </button>
                        <button
                            className={cn(
                                "flex-1 h-10 rounded-lg text-sm font-semibold transition-all",
                                activeTab === "sequence"
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                            onClick={() => setActiveTab("sequence")}
                            data-testid="tab-sequence"
                        >
                            Trip Sequence ({assigned.length})
                        </button>
                    </div>
                </div>

                <div className="flex-1 px-3 pb-2 overflow-y-auto">
                    {activeTab === "unassigned" ? (
                        <>
                            <div className="relative py-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 mt-1.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by area or route..."
                                    className="pl-9 h-11 bg-slate-50 border-slate-200"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    data-testid="mobile-unassigned-search"
                                />
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                <button
                                    onClick={() => setSelectedFilterRouteId("")}
                                    className={cn(
                                        "text-xs px-3 py-1.5 rounded-full font-semibold transition-colors whitespace-nowrap",
                                        selectedFilterRouteId === ""
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    )}
                                >
                                    All Routes
                                </button>
                                {routes.map((r) => (
                                    <button
                                        key={r.id}
                                        onClick={() => setSelectedFilterRouteId(r.id.toString())}
                                        className={cn(
                                            "text-xs px-3 py-1.5 rounded-full font-semibold transition-colors whitespace-nowrap",
                                            selectedFilterRouteId === r.id.toString()
                                                ? "bg-blue-600 text-white"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        )}
                                    >
                                        {r.name}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-col gap-2 pb-2">
                                {filteredUnassigned.length === 0 ? (
                                    <div className="flex flex-col items-center py-12 text-slate-400 gap-2">
                                        <Search className="h-8 w-8 opacity-20" />
                                        <p className="text-sm font-medium">
                                            {search ? `No customers found for "${search}"` : "No pending orders match this search."}
                                        </p>
                                    </div>
                                ) : (
                                    filteredUnassigned.map((d) => (
                                        <MobileUnassignedCard
                                            key={d.id}
                                            delivery={d}
                                            onAdd={() => addToTrip(d.id)}
                                            isAdded={assignedIds.has(d.id)}
                                        />
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between py-3">
                                <p className="text-sm text-slate-500">
                                    {assigned.length === 0 ? "No stops added yet" : `${assigned.length} stop${assigned.length !== 1 ? "s" : ""} planned`}
                                </p>
                                <button
                                    onClick={() => setReorderMode((m) => !m)}
                                    className={cn(
                                        "text-xs font-semibold px-4 py-2 rounded-lg transition-colors",
                                        reorderMode
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    )}
                                    data-testid="reorder-toggle"
                                >
                                    {reorderMode ? "Done" : "Reorder"}
                                </button>
                            </div>

                            {assigned.length === 0 ? (
                                <div className="flex flex-col items-center py-12 text-slate-400 gap-3">
                                    <Truck className="h-12 w-12 opacity-10" />
                                    <p className="text-sm font-medium text-center">
                                        No stops added yet.{"\n"}Add customers from the unassigned list to build your route.
                                    </p>
                                    <button
                                        onClick={() => setActiveTab("unassigned")}
                                        className="text-sm text-blue-600 font-semibold mt-1"
                                    >
                                        Go to Unassigned →
                                    </button>
                                </div>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={assigned.map((d) => d.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="flex flex-col gap-2 pb-2">
                                            {assigned.map((d, index) => (
                                                <SortableAssignedCard
                                                    key={d.id}
                                                    id={d.id}
                                                    delivery={d}
                                                    index={index}
                                                    onRemove={() => removeFromTrip(d.id)}
                                                    reorderMode={reorderMode}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                    <DragOverlay
                                        dropAnimation={{
                                            sideEffects: defaultDropAnimationSideEffects({
                                                styles: { active: { opacity: "0.4" } },
                                            }),
                                        }}
                                    >
                                        {activeItem && (
                                            <SortableAssignedCard
                                                id={activeItem.id}
                                                delivery={activeItem}
                                                index={assigned.findIndex((d) => d.id === activeItem.id)}
                                                isOverlay
                                                reorderMode={reorderMode}
                                            />
                                        )}
                                    </DragOverlay>
                                </DndContext>
                            )}
                        </>
                    )}
                </div>

                <div className="sticky bottom-16 left-0 right-0 px-3 py-2 bg-white border-t border-slate-200 z-10">
                    {isOverload && (
                        <p className="text-xs text-red-600 font-medium text-center mb-2 flex items-center justify-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Cannot save: Total load exceeds vehicle capacity. Please remove stops.
                        </p>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={loading || !canSave}
                        className={cn(
                            "w-full h-12 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2",
                            canSave && !loading
                                ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99]"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        )}
                        data-testid="mobile-save-trip"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Trip"}
                    </button>
                </div>
            </div>

            {/* ── DESKTOP LAYOUT ── */}
            <div className="hidden md:flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Plan Trip</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate("/trips")}>Cancel</Button>
                        <Button
                            onClick={handleSave}
                            disabled={loading || !canSave}
                            className="bg-blue-600 hover:bg-blue-700"
                            data-testid="save-trip-btn"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Trip"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border">
                    <Select value={driverId} onValueChange={setDriverId}>
                        <SelectTrigger className="bg-white w-full"><SelectValue placeholder="Select Driver" /></SelectTrigger>
                        <SelectContent position="popper" align="start">{drivers.map((d) => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={vehicleId} onValueChange={setVehicleId}>
                        <SelectTrigger className="bg-white w-full"><SelectValue placeholder="Select Vehicle" /></SelectTrigger>
                        <SelectContent position="popper" align="start">{vehicles.map((v) => <SelectItem key={v.id} value={v.id.toString()} disabled={activeVehicleIds.has(v.id)}>{v.registration} ({v.model}){activeVehicleIds.has(v.id) ? ' — On active trip' : ''}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={routeId} onValueChange={setRouteId}>
                        <SelectTrigger className="bg-white w-full"><SelectValue placeholder="Select Route" /></SelectTrigger>
                        <SelectContent position="popper" align="start">{routes.map((r) => <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal bg-white">
                                <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                                {format(tripDate, "dd MMM yyyy")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={tripDate} onSelect={(d) => d && setTripDate(d)} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>

                {selectedVehicle?.capacity != null && selectedVehicle.capacity > 0 && (
                    <div className={cn("p-3 rounded-lg border space-y-2", isOverload ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200")}>
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Vehicle Capacity ({selectedVehicle.registration})</span>
                            <span className={cn("font-mono font-semibold", isOverload ? "text-red-600" : capacityPercentage > 90 ? "text-orange-600" : "text-slate-600")}>
                                {totalLoad}kg / {selectedVehicle.capacity}kg ({Math.round(capacityPercentage)}%)
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                                className={cn("h-2 rounded-full transition-all duration-300", isOverload ? "bg-red-600" : capacityPercentage > 90 ? "bg-orange-500" : capacityPercentage > 75 ? "bg-yellow-500" : "bg-green-600")}
                                style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                            />
                        </div>
                        {isOverload && (
                            <div className="flex items-center gap-1.5 text-red-600 text-xs font-medium">
                                <AlertTriangle className="h-3 w-3" />
                                Over capacity by {totalLoad - selectedVehicle.capacity}kg — remove items or select a larger vehicle
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-12 gap-6 h-[calc(100vh-330px)]">
                    <div className="col-span-4 flex flex-col border rounded-lg bg-slate-50 overflow-hidden">
                        <div className="p-3 border-b bg-white">
                            <p className="text-sm font-semibold text-slate-700 mb-2">Unassigned ({filteredUnassigned.length})</p>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by area or route..."
                                    className="pl-8 h-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    data-testid="unassigned-search"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                            {filteredUnassigned.length === 0 ? (
                                <div className="text-center text-muted-foreground p-8 text-sm italic">
                                    {search ? `No customers found for "${search}"` : "No unassigned orders"}
                                </div>
                            ) : (
                                filteredUnassigned.map((d) => (
                                    <UnassignedCard key={d.id} delivery={d} onAdd={() => addToTrip(d.id)} />
                                ))
                            )}
                        </div>
                    </div>

                    <div className="col-span-8 flex flex-col border rounded-lg bg-white shadow-sm overflow-hidden">
                        <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
                            <span className="font-medium">Trip Sequence</span>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="text-muted-foreground">{assigned.length} Stops</span>
                                <span className="font-semibold border-l pl-4">Total Load: {totalLoad}kg</span>
                                <button
                                    onClick={() => setReorderMode((m) => !m)}
                                    className={cn(
                                        "text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors",
                                        reorderMode ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    )}
                                >
                                    {reorderMode ? "Done" : "Reorder"}
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                                <SortableContext items={assigned.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                                    {assigned.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 min-h-[200px]">
                                            <Truck className="h-12 w-12 opacity-10" />
                                            <div className="text-sm">Click items from the left to add them to this trip</div>
                                        </div>
                                    ) : (
                                        assigned.map((d, index) => (
                                            <SortableAssignedCard
                                                key={d.id}
                                                id={d.id}
                                                delivery={d}
                                                index={index}
                                                onRemove={() => removeFromTrip(d.id)}
                                                reorderMode={reorderMode}
                                            />
                                        ))
                                    )}
                                </SortableContext>
                                <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }) }}>
                                    {activeItem && (
                                        <SortableAssignedCard
                                            id={activeItem.id}
                                            delivery={activeItem}
                                            index={assigned.findIndex((d) => d.id === activeItem.id)}
                                            isOverlay
                                            reorderMode={reorderMode}
                                        />
                                    )}
                                </DragOverlay>
                            </DndContext>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

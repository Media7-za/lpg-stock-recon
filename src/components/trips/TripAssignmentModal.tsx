// Ported from Orders-Module (components/trip-assignment-modal.tsx) — Phase 4
// Step 4. Adapted: removed "use client"; fetch('/api/trips/available') ->
// getAvailableTrips(); fetch('/api/deliveries/assign', POST) ->
// assignDeliveryToTrip() (the upsert-trip Edge Function, mode "assign" —
// NOT YET DEPLOYED, see Step 4 report). The "+ Create New Trip" link was
// already a plain <a href> in the original (not next/link), so it's
// preserved as-is — a full page navigation, not a React Router transition,
// matching original behavior exactly.
import * as React from "react"
import { Truck, X, Loader2, Route, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getAvailableTrips, assignDeliveryToTrip, type AvailableTrip } from "@/lib/api/trips"

interface TripAssignmentModalProps {
    open: boolean
    onClose: () => void
    onAssigned: () => void
    deliveryId: number
    routeId: number
    routeName: string
    orderNumber: string
}

export function TripAssignmentModal({
    open,
    onClose,
    onAssigned,
    deliveryId,
    routeId,
    routeName,
    orderNumber,
}: TripAssignmentModalProps) {
    const [trips, setTrips] = React.useState<AvailableTrip[]>([])
    const [loading, setLoading] = React.useState(true)
    const [assigning, setAssigning] = React.useState<number | null>(null)
    const [tab, setTab] = React.useState<"recommended" | "all">("recommended")

    React.useEffect(() => {
        if (!open) return
        setLoading(true)
        setTab("recommended")
        getAvailableTrips(routeId)
            .then(data => {
                setTrips(data)
                setLoading(false)
            })
            .catch(() => {
                toast.error("Failed to load trips")
                setLoading(false)
            })
    }, [open, routeId])

    const handleAssign = async (tripId: number) => {
        setAssigning(tripId)
        try {
            await assignDeliveryToTrip(deliveryId, tripId)
            toast.success("Delivery assigned to trip!")
            onAssigned()
            onClose()
        } catch {
            toast.error("Failed to assign delivery to trip")
        } finally {
            setAssigning(null)
        }
    }

    if (!open) return null

    const recommendedTrips = trips.filter(t => t.stats.isRecommended)
    const displayTrips = tab === "recommended" ? recommendedTrips : trips

    const getCapacityColor = (color: string) => {
        switch (color) {
            case "green": return "bg-green-500"
            case "yellow": return "bg-yellow-500"
            case "red": return "bg-red-500"
            default: return "bg-slate-300"
        }
    }

    const getCapacityTextColor = (color: string) => {
        switch (color) {
            case "green": return "text-green-700"
            case "yellow": return "text-yellow-700"
            case "red": return "text-red-700"
            default: return "text-slate-500"
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-slate-200">
                <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Assign to Trip</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Order {orderNumber} • Delivery #{deliveryId}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex border-b bg-slate-50/50">
                    <button
                        onClick={() => setTab("recommended")}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${tab === "recommended"
                                ? "border-blue-600 text-blue-700 bg-white"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        <Route className="h-3.5 w-3.5 inline mr-1.5" />
                        Recommended ({routeName})
                        {!loading && (
                            <Badge variant="secondary" className="ml-2 text-xs h-5">
                                {recommendedTrips.length}
                            </Badge>
                        )}
                    </button>
                    <button
                        onClick={() => setTab("all")}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${tab === "all"
                                ? "border-blue-600 text-blue-700 bg-white"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        All Active Trips
                        {!loading && (
                            <Badge variant="secondary" className="ml-2 text-xs h-5">
                                {trips.length}
                            </Badge>
                        )}
                    </button>
                </div>

                <div className="max-h-[400px] overflow-y-auto p-3 space-y-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-slate-400">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Loading trips...
                        </div>
                    ) : displayTrips.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Truck className="h-10 w-10 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">
                                {tab === "recommended"
                                    ? "No recommended trips for this route."
                                    : "No active trips found."
                                }
                            </p>
                            {tab === "recommended" && (
                                <button
                                    onClick={() => setTab("all")}
                                    className="text-blue-600 text-sm mt-2 hover:underline"
                                >
                                    View all active trips →
                                </button>
                            )}
                        </div>
                    ) : (
                        displayTrips.map(trip => (
                            <div
                                key={trip.id}
                                className="border rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all group bg-white"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-slate-900 text-sm">
                                                {trip.tripNumber}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                                {trip.route?.name}
                                            </Badge>
                                            {trip.stats.fillPercentage > 90 && (
                                                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500 space-y-0.5">
                                            <div>Driver: <span className="font-medium text-slate-700">{trip.driver?.name}</span></div>
                                            <div>Vehicle: <span className="font-medium text-slate-700">{trip.vehicle.registration}</span> • {trip.deliveryCount} stops</div>
                                        </div>

                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${getCapacityColor(trip.stats.statusColor)}`}
                                                    style={{ width: `${Math.min(trip.stats.fillPercentage, 100)}%` }}
                                                />
                                            </div>
                                            <span className={`text-xs font-bold ${getCapacityTextColor(trip.stats.statusColor)}`}>
                                                {trip.stats.fillPercentage}%
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-0.5">
                                            {trip.stats.currentLoadKg}kg / {trip.stats.maxCapacity}kg
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        onClick={() => handleAssign(trip.id)}
                                        disabled={assigning !== null}
                                        className="shrink-0"
                                    >
                                        {assigning === trip.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Assign"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="border-t px-6 py-3 bg-slate-50 flex justify-between items-center">
                    <a
                        href="/trips/new"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                    >
                        + Create New Trip
                    </a>
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    )
}

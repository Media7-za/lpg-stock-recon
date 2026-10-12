// Ported from Orders-Module (app/trips/page.tsx) — Phase 4 Step 4.
// Adapted: removed "use client"; next/link -> react-router-dom;
// fetch('/api/trips') -> listTrips(). Functional now even with zero
// Delivery rows (see Step 4 report) — trips will just show "0 drops, 0kg"
// until Step 5 wires up delivery/order creation end-to-end, which is
// accurate given the actual data state, not a bug.
import * as React from "react"
import { Plus, Search, Truck, Weight, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader } from "@/components/ui/card"
import { cn, formatDate } from "@/lib/utils"
import { listTrips, type Trip } from "@/lib/api/trips"

function getStatusConfig(status: string) {
    switch (status.toLowerCase()) {
        case "planned":
            return { label: "Planned", className: "bg-blue-100 text-blue-700 border-blue-200" }
        case "in-progress":
            return { label: "In Progress", className: "bg-amber-100 text-amber-700 border-amber-200" }
        case "completed":
            return { label: "Completed", className: "bg-green-100 text-green-700 border-green-200" }
        default:
            return { label: status, className: "bg-slate-100 text-slate-700 border-slate-200" }
    }
}

function tripTotalWeight(trip: Trip): number {
    return trip.deliveries.reduce(
        (tripTotal, del) =>
            tripTotal + del.deliveryItems.reduce(
                (dropTotal, item) => dropTotal + item.quantityToDeliver * (item.product?.totalWeight || 0),
                0
            ),
        0
    )
}

function TripCard({ trip }: { trip: Trip }) {
    const status = getStatusConfig(trip.status)
    const totalWeight = tripTotalWeight(trip)

    return (
        <Link to={`/trips/${trip.id}`} className="block" data-testid={`trip-card-${trip.id}`}>
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 active:scale-[0.99] transition-transform shadow-sm hover:border-blue-200 hover:shadow-md">
                <div className="shrink-0 w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-blue-600" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-base">{trip.tripNumber}</span>
                        <Badge variant="outline" className={cn("text-[11px] h-5 px-2", status.className)}>
                            {status.label}
                        </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {formatDate(trip.tripDate) || "Unscheduled"}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                            <Weight className="h-3 w-3 text-slate-400" />
                            <span className="font-semibold font-mono">{totalWeight}kg</span>
                        </span>
                        <span className="text-slate-300">·</span>
                        <span>{trip.deliveries.length || 0} drops</span>
                        {trip.vehicle?.registration && (
                            <>
                                <span className="text-slate-300">·</span>
                                <span className="truncate text-slate-500">{trip.vehicle.registration}</span>
                            </>
                        )}
                    </div>
                </div>

                <ChevronRight className="h-5 w-5 text-slate-300 shrink-0" />
            </div>
        </Link>
    )
}

export default function TripsPage() {
    const [trips, setTrips] = React.useState<Trip[]>([])
    const [loading, setLoading] = React.useState(true)
    const [search, setSearch] = React.useState("")

    React.useEffect(() => {
        listTrips()
            .then((data) => {
                setTrips(data)
                setLoading(false)
            })
            .catch((err) => {
                console.error("Error fetching trips:", err)
                setLoading(false)
            })
    }, [])

    const filteredTrips = trips.filter(
        (trip) =>
            trip.tripNumber.toLowerCase().includes(search.toLowerCase()) ||
            trip.driver?.name.toLowerCase().includes(search.toLowerCase()) ||
            trip.route?.name.toLowerCase().includes(search.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "planned": return "bg-blue-100 text-blue-700 border-blue-200"
            case "in-progress": return "bg-amber-100 text-amber-700 border-amber-200"
            case "completed": return "bg-green-100 text-green-700 border-green-200"
            default: return "bg-slate-100 text-slate-700 border-slate-200"
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Trips</h1>
                    <p className="text-muted-foreground text-sm mt-0.5 hidden md:block">Plan and manage delivery routes.</p>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 h-11 min-w-[44px]" data-testid="plan-trip-btn">
                    <Link to="/trips/new">
                        <Plus className="mr-1 h-4 w-4 md:mr-2" />
                        <span className="hidden sm:inline">Plan Trip</span>
                    </Link>
                </Button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search trips..."
                    className="pl-9 h-11 border-slate-200"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    data-testid="trips-search"
                />
            </div>

            {/* ── MOBILE: Card List ── */}
            <div className="md:hidden flex flex-col gap-3">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 animate-pulse">
                            <div className="h-11 w-11 rounded-full bg-slate-100 shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-2/3 bg-slate-100 rounded" />
                                <div className="h-3 w-1/2 bg-slate-100 rounded" />
                            </div>
                        </div>
                    ))
                ) : filteredTrips.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                        <Truck className="h-12 w-12 opacity-20" />
                        <p className="text-sm font-medium">No trips found.</p>
                    </div>
                ) : (
                    filteredTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)
                )}
            </div>

            {/* ── DESKTOP: Table ── */}
            <Card className="border-slate-200 hidden md:block">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 p-4" />
                <div className="rounded-md border-t border-slate-100">
                    <Table data-testid="trips-table">
                        <TableHeader className="bg-slate-50/80">
                            <TableRow>
                                <TableHead className="w-[120px] font-semibold text-slate-700">Trip #</TableHead>
                                <TableHead className="font-semibold text-slate-700">Route</TableHead>
                                <TableHead className="font-semibold text-slate-700">Driver</TableHead>
                                <TableHead className="font-semibold text-slate-700">Vehicle</TableHead>
                                <TableHead className="font-semibold text-slate-700">Date</TableHead>
                                <TableHead className="font-semibold text-slate-700">Deliveries</TableHead>
                                <TableHead className="font-semibold text-slate-700">Total Weight</TableHead>
                                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 9 }).map((_, j) => (
                                            <TableCell key={j}><div className="h-4 w-full bg-slate-100 animate-pulse rounded" /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : filteredTrips.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center text-slate-500">
                                        No trips found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTrips.map((trip) => (
                                    <TableRow key={trip.id} className="hover:bg-slate-50/50 transition-colors border-slate-100">
                                        <TableCell className="font-medium text-blue-600">
                                            <Link to={`/trips/${trip.id}`}>{trip.tripNumber}</Link>
                                        </TableCell>
                                        <TableCell>{trip.route?.name}</TableCell>
                                        <TableCell>{trip.driver?.name}</TableCell>
                                        <TableCell>{trip.vehicle?.registration}</TableCell>
                                        <TableCell>{formatDate(trip.tripDate) || "Unscheduled"}</TableCell>
                                        <TableCell>{trip.deliveries.length || 0} drops</TableCell>
                                        <TableCell>
                                            <span className="font-semibold text-slate-700 font-mono">
                                                {tripTotalWeight(trip)}kg
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getStatusColor(trip.status)}>
                                                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link to={`/trips/${trip.id}`}>View</Link>
                                            </Button>
                                            <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700">
                                                <Link to={`/trips/${trip.id}/edit`}>Edit</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}

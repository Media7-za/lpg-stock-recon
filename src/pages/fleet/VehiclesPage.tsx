// Ported from Orders-Module (app/vehicles/page.tsx) — Phase 4 Step 1.
// Adapted: removed "use client"; fetch('/api/vehicles') replaced with
// listVehicles() (direct Supabase call).
import * as React from "react"
import { Search, Car, Truck, Plus } from "lucide-react"

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
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { VehicleSheet } from "@/components/fleet/VehicleSheet"
import { listVehicles, type Vehicle } from "@/lib/api/vehicles"

export default function VehiclesPage() {
    const [vehicles, setVehicles] = React.useState<Vehicle[]>([])
    const [loading, setLoading] = React.useState(true)
    const [search, setSearch] = React.useState("")
    const [sheetOpen, setSheetOpen] = React.useState(false)
    const [selectedVehicle, setSelectedVehicle] = React.useState<Vehicle | null>(null)

    const fetchVehicles = React.useCallback(() => {
        setLoading(true)
        listVehicles()
            .then((data) => {
                setVehicles(data)
                setLoading(false)
            })
            .catch((err) => {
                console.error("Error fetching vehicles:", err)
                setLoading(false)
            })
    }, [])

    React.useEffect(() => {
        fetchVehicles()
    }, [fetchVehicles])

    const filteredVehicles = vehicles.filter((v) =>
        v.registration?.toLowerCase().includes(search.toLowerCase()) ||
        v.make?.toLowerCase().includes(search.toLowerCase()) ||
        v.model?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-[Inter]">Vehicles</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage your delivery fleet.</p>
                </div>
                <Button
                    onClick={() => {
                        setSelectedVehicle(null)
                        setSheetOpen(true)
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vehicle
                </Button>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100 mb-4 bg-slate-50/50">
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search vehicles..."
                                className="pl-9 h-9 border-slate-200 font-[Inter]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="rounded-md border-t border-slate-100 font-[Inter]">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                <TableRow>
                                    <TableHead className="font-semibold text-slate-700">Registration</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Make</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Model</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Capacity</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Notes</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            {Array.from({ length: 6 }).map((_, j) => (
                                                <TableCell key={j}><div className="h-4 w-full bg-slate-100 animate-pulse rounded" /></TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : filteredVehicles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Car className="h-8 w-8 opacity-20" />
                                                No vehicles found.
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredVehicles.map((vehicle) => (
                                        <TableRow
                                            key={vehicle.id}
                                            onClick={() => {
                                                setSelectedVehicle(vehicle)
                                                setSheetOpen(true)
                                            }}
                                            className="hover:bg-slate-50/50 transition-colors border-slate-100 cursor-pointer"
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Truck className="h-4 w-4 text-blue-500" />
                                                    <span className="font-bold text-slate-900">{vehicle.registration}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-600">{vehicle.make || "-"}</TableCell>
                                            <TableCell className="text-slate-600">{vehicle.model || "-"}</TableCell>
                                            <TableCell>
                                                {vehicle.capacity ? (
                                                    <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-none font-medium text-xs">
                                                        {vehicle.capacity} units
                                                    </Badge>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-slate-500 text-sm max-w-[200px] truncate">
                                                {vehicle.notes || "-"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={vehicle.active ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-500 border-slate-200"}>
                                                    {vehicle.active ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <VehicleSheet
                open={sheetOpen}
                onClose={() => {
                    setSheetOpen(false)
                    setSelectedVehicle(null)
                }}
                onSuccess={fetchVehicles}
                vehicle={selectedVehicle}
            />
        </div>
    )
}

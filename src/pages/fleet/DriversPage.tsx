// Ported from Orders-Module (app/drivers/page.tsx) — Phase 4 Step 1.
// Adapted: removed "use client"; fetch('/api/drivers') replaced with
// listDrivers() (direct Supabase call).
import * as React from "react"
import { Search, UserCircle, Phone, CreditCard, Plus } from "lucide-react"

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
import { DriverSheet } from "@/components/fleet/DriverSheet"
import { listDrivers, type Driver } from "@/lib/api/drivers"

export default function DriversPage() {
    const [drivers, setDrivers] = React.useState<Driver[]>([])
    const [loading, setLoading] = React.useState(true)
    const [search, setSearch] = React.useState("")
    const [sheetOpen, setSheetOpen] = React.useState(false)
    const [selectedDriver, setSelectedDriver] = React.useState<Driver | null>(null)

    const fetchDrivers = React.useCallback(() => {
        setLoading(true)
        listDrivers()
            .then((data) => {
                setDrivers(data)
                setLoading(false)
            })
            .catch((err) => {
                console.error("Error fetching drivers:", err)
                setLoading(false)
            })
    }, [])

    React.useEffect(() => {
        fetchDrivers()
    }, [fetchDrivers])

    const filteredDrivers = drivers.filter((d) =>
        d.name?.toLowerCase().includes(search.toLowerCase()) ||
        d.phone?.toLowerCase().includes(search.toLowerCase()) ||
        d.license?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-[Inter]">Drivers</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage your delivery drivers.</p>
                </div>
                <Button
                    onClick={() => {
                        setSelectedDriver(null)
                        setSheetOpen(true)
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Driver
                </Button>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100 mb-4 bg-slate-50/50">
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search drivers..."
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
                                    <TableHead className="font-semibold text-slate-700">Name</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Phone</TableHead>
                                    <TableHead className="font-semibold text-slate-700">License</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            {Array.from({ length: 4 }).map((_, j) => (
                                                <TableCell key={j}><div className="h-4 w-full bg-slate-100 animate-pulse rounded" /></TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : filteredDrivers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <UserCircle className="h-8 w-8 opacity-20" />
                                                No drivers found.
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredDrivers.map((driver) => (
                                        <TableRow
                                            key={driver.id}
                                            onClick={() => {
                                                setSelectedDriver(driver)
                                                setSheetOpen(true)
                                            }}
                                            className="hover:bg-slate-50/50 transition-colors border-slate-100 cursor-pointer"
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                                                        {driver.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <span className="font-bold text-slate-900">{driver.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-slate-600">
                                                    <Phone className="h-3 w-3 text-slate-400" />
                                                    {driver.phone}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {driver.license ? (
                                                    <div className="flex items-center gap-1 text-sm text-slate-500">
                                                        <CreditCard className="h-3 w-3 text-slate-400" />
                                                        <span className="font-mono text-xs">{driver.license}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">Not recorded</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={driver.active ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-500 border-slate-200"}>
                                                    {driver.active ? "Active" : "Inactive"}
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

            <DriverSheet
                open={sheetOpen}
                onClose={() => {
                    setSheetOpen(false)
                    setSelectedDriver(null)
                }}
                onSuccess={fetchDrivers}
                driver={selectedDriver}
            />
        </div>
    )
}

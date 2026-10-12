// Ported from Orders-Module (app/customers/page.tsx) — Phase 4 Step 2.
// Adapted: removed "use client"; next/link -> react-router-dom;
// fetch('/api/customers') -> listCustomers(); fetch('/api/routes') ->
// listRoutes() (areas derived by flattening routes.areas, same approach
// RoutesPage.tsx already uses — one query instead of two).
//
// KNOWN GAP: the mobile "Add Customer" button still links to /customers/new,
// which is Orders-Module's separate full-page creation flow
// (app/customers/new/page.tsx, 665 lines). That page was NOT in this step's
// named scope ("Adapt customer-sheet.tsx...") and hasn't been ported — the
// link is left in place rather than silently removed, but it will 404 on
// mobile until that page is ported in a future step.
import * as React from "react"
import {
    Search, Users, MapPin, Phone, Plus,
    ExternalLink, ChevronDown, ChevronUp, MessageCircle, Edit,
} from "lucide-react"
import { Link } from "react-router-dom"

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
import { CustomerSheet } from "@/components/customers/CustomerSheet"
import { cn } from "@/lib/utils"
import { listCustomers, type Customer } from "@/lib/api/customers"
import { listRoutes, type Area, type Route } from "@/lib/api/routesAreas"

// ─── Helpers ─────────────────────────────────────────────────────────────────
function toWhatsAppUrl(phone: string): string {
    // Strip all non-digits; if starts with 0, replace with 27 (SA country code)
    let digits = phone.replace(/\D/g, "")
    if (digits.startsWith("0")) digits = "27" + digits.slice(1)
    return `https://wa.me/${digits}`
}

// ─── Mobile Customer Card ─────────────────────────────────────────────────────
function MobileCustomerCard({
    customer,
    onEdit,
}: {
    customer: Customer
    onEdit: () => void
}) {
    const [expanded, setExpanded] = React.useState(false)

    return (
        <div
            className={cn(
                "bg-white border rounded-xl overflow-hidden shadow-sm transition-all",
                expanded ? "border-slate-300" : "border-slate-200"
            )}
        >
            {/* ── Card Header (always visible, tap to expand) ── */}
            <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full px-4 pt-4 pb-3 flex items-start gap-3 text-left"
                data-testid={`customer-card-${customer.id}`}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm leading-snug">
                            {customer.name}
                        </span>
                        <span
                            className={cn(
                                "shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border",
                                customer.active
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-slate-100 text-slate-500 border-slate-200"
                            )}
                        >
                            {customer.active ? "ACTIVE" : "INACTIVE"}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{customer.address}</span>
                        {customer.googleMapsUrl && (
                            <a
                                href={customer.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="shrink-0 ml-0.5"
                            >
                                <ExternalLink className="h-3 w-3 text-blue-400" />
                            </a>
                        )}
                    </div>
                </div>
                {expanded ? (
                    <ChevronUp className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                )}
            </button>

            {/* ── Expanded: Contact actions + meta ── */}
            {expanded && (
                <div className="px-4 pb-4 space-y-3">
                    {/* TEL + WHATSAPP tiles */}
                    {customer.phone ? (
                        <div className="grid grid-cols-2 gap-2">
                            <a
                                href={`tel:${customer.phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex flex-col items-start gap-1 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 hover:bg-blue-100 active:scale-[0.98] transition-all"
                                data-testid={`tel-${customer.id}`}
                            >
                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">TEL</span>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-blue-600 shrink-0" />
                                    <span className="text-sm font-semibold text-blue-700 leading-tight">{customer.phone}</span>
                                </div>
                            </a>

                            <a
                                href={toWhatsAppUrl(customer.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex flex-col items-start gap-1 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5 hover:bg-green-100 active:scale-[0.98] transition-all"
                                data-testid={`wa-${customer.id}`}
                            >
                                <span className="text-[9px] font-black uppercase tracking-widest text-green-600">WHATSAPP</span>
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4 text-green-600 shrink-0" />
                                    <span className="text-sm font-semibold text-green-700 leading-tight">{customer.phone}</span>
                                </div>
                            </a>
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic">No phone number saved.</p>
                    )}

                    {/* Account # + Edit */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Account #</p>
                            <p className="text-xs font-mono font-semibold text-slate-600">
                                {customer.accountNumber || <span className="italic text-slate-300">—</span>}
                            </p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit() }}
                            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg px-3 py-2 transition-colors active:scale-95"
                            data-testid={`edit-customer-${customer.id}`}
                        >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function CustomersPage() {
    const [customers, setCustomers] = React.useState<Customer[]>([])
    const [areas, setAreas] = React.useState<Area[]>([])
    const [routes, setRoutes] = React.useState<Route[]>([])
    const [loading, setLoading] = React.useState(true)
    const [search, setSearch] = React.useState("")
    const [sheetOpen, setSheetOpen] = React.useState(false)
    const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null)

    const fetchCustomers = React.useCallback(() => {
        setLoading(true)
        listCustomers()
            .then((data) => {
                setCustomers(data)
                setLoading(false)
            })
            .catch((err) => {
                console.error("Error fetching customers:", err)
                setLoading(false)
            })
    }, [])

    React.useEffect(() => {
        fetchCustomers()
        listRoutes()
            .then((data) => {
                setRoutes(data)
                setAreas(data.flatMap((route) => route.areas))
            })
            .catch((err) => console.error("Error fetching routes/areas:", err))
    }, [fetchCustomers])

    const filteredCustomers = customers.filter((c) =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.address?.toLowerCase().includes(search.toLowerCase()) ||
        c.accountNumber?.toLowerCase().includes(search.toLowerCase()) ||
        c.area?.name?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="flex-1 flex flex-col gap-6 min-h-0 overflow-y-auto p-4 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-[Inter]">Customers</h1>
                    <p className="text-muted-foreground text-sm mt-1 hidden md:block">Manage your customer database.</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Mobile: navigate to full-screen new customer page */}
                    <Button asChild className="md:hidden bg-blue-600 hover:bg-blue-700 h-11 w-11 p-0" data-testid="add-customer-mobile-btn">
                        <Link to="/customers/new"><Plus className="h-5 w-5" /></Link>
                    </Button>
                    {/* Desktop: open the sheet */}
                    <Button
                        onClick={() => { setSelectedCustomer(null); setSheetOpen(true) }}
                        className="hidden md:flex bg-blue-600 hover:bg-blue-700"
                        data-testid="add-customer-btn"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Customer
                    </Button>
                </div>
            </div>

            {/* ── MOBILE: Card list ── */}
            <div className="md:hidden">
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search customers..."
                        className="pl-9 h-11 border-slate-200"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        data-testid="customers-search-mobile"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 animate-pulse">
                                <div className="h-10 w-10 rounded-full bg-slate-100 shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-2/3 bg-slate-100 rounded" />
                                    <div className="h-3 w-1/2 bg-slate-100 rounded" />
                                </div>
                            </div>
                        ))
                    ) : filteredCustomers.length === 0 ? (
                        <div className="flex flex-col items-center py-16 text-slate-400 gap-2">
                            <Users className="h-10 w-10 opacity-20" />
                            <p className="text-sm font-medium">No customers found.</p>
                        </div>
                    ) : (
                        filteredCustomers.map((customer) => (
                            <MobileCustomerCard
                                key={customer.id}
                                customer={customer}
                                onEdit={() => { setSelectedCustomer(customer); setSheetOpen(true) }}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* ── DESKTOP: Table ── */}
            <Card className="border-slate-200 shadow-sm hidden md:block">
                <CardHeader className="pb-3 border-b border-slate-100 mb-4 bg-slate-50/50">
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search customers..."
                                className="pl-9 h-9 border-slate-200 font-[Inter]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                data-testid="customers-search"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="rounded-md border-t border-slate-100 font-[Inter]">
                        <Table data-testid="customers-table">
                            <TableHeader className="bg-slate-50/80">
                                <TableRow>
                                    <TableHead className="font-semibold text-slate-700">Name</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Address</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Area</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Route</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Phone</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Account #</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            {Array.from({ length: 7 }).map((_, j) => (
                                                <TableCell key={j}><div className="h-4 w-full bg-slate-100 animate-pulse rounded" /></TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : filteredCustomers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Users className="h-8 w-8 opacity-20" />
                                                No customers found.
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCustomers.map((customer) => (
                                        <TableRow
                                            key={customer.id}
                                            onClick={() => {
                                                setSelectedCustomer(customer)
                                                setSheetOpen(true)
                                            }}
                                            className="hover:bg-slate-50/50 transition-colors border-slate-100 cursor-pointer"
                                        >
                                            <TableCell className="font-bold text-slate-900">{customer.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-slate-600">
                                                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                                                    <span className="truncate max-w-[200px]">{customer.address}</span>
                                                    {customer.googleMapsUrl && (
                                                        <a
                                                            href={customer.googleMapsUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            title="Open in Google Maps"
                                                            className="ml-1 shrink-0"
                                                        >
                                                            <ExternalLink className="h-3 w-3 text-blue-500 hover:text-blue-700 transition-colors" />
                                                        </a>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-600">{customer.area?.name || <span className="table-placeholder">-</span>}</TableCell>
                                            <TableCell className="text-slate-600">{customer.area?.route?.name || <span className="table-placeholder">-</span>}</TableCell>
                                            <TableCell>
                                                {customer.phone ? (
                                                    <div className="flex items-center gap-1 text-sm text-slate-600">
                                                        <Phone className="h-3 w-3 text-slate-400" />
                                                        {customer.phone}
                                                    </div>
                                                ) : (
                                                    <span className="table-placeholder text-slate-400 text-xs italic">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {customer.accountNumber ? (
                                                    <span className="text-xs font-mono text-slate-500">
                                                        {customer.accountNumber}
                                                    </span>
                                                ) : (
                                                    <span className="table-placeholder text-xs font-mono text-slate-500">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={customer.active ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-500 border-slate-200"}>
                                                    {customer.active ? "Active" : "Inactive"}
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


            <CustomerSheet
                open={sheetOpen}
                onClose={() => {
                    setSheetOpen(false)
                    setSelectedCustomer(null)
                }}
                onSuccess={fetchCustomers}
                customer={selectedCustomer}
                areas={areas}
                routes={routes}
            />
        </div>
    )
}

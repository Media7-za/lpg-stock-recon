// Ported from Orders-Module (components/layout/sidebar.tsx) — Phase 3.
// Adapted: next/link -> react-router-dom Link, next/navigation usePathname -> useLocation.
// NOT adapted yet (follow-up, out of Phase 3 scope): hardcoded "Jamie Mthembu / Dispatcher"
// footer and the `/api/orders` fetch for the order-count badge — both assume Orders-Module's
// original API routes and a real auth/user context that don't exist here yet.
"use client"

import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import {
    LayoutDashboard,
    ShoppingCart,
    Truck,
    PackageCheck,
    Users,
    Package,
    Map,
    Car,
    UserCircle,
    History,
    Sparkles,
} from "lucide-react"

import { ensureArray } from "@/lib/utils"

const data = {
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Orders",
            url: "/orders",
            icon: ShoppingCart,
        },
        {
            title: "Trips",
            url: "/trips",
            icon: Truck,
        },
        {
            title: "Deliveries",
            url: "/deliveries",
            icon: PackageCheck,
            badge: 0,
        },
        {
            title: "History",
            url: "/orders/history",
            icon: History,
        },
    ],
    navAdmin: [
        {
            title: "Customers",
            url: "/customers",
            icon: Users,
        },
        {
            title: "Products",
            url: "/products",
            icon: Package,
        },
        {
            title: "Routes & Areas",
            url: "/routes",
            icon: Map,
        },
        {
            title: "Vehicles",
            url: "/vehicles",
            icon: Car,
        },
        {
            title: "Drivers",
            url: "/drivers",
            icon: UserCircle,
        },
        {
            title: "Settings",
            url: "/settings",
            icon: Package, // Using Package icon since it matches Master Data aesthetic, or it could be Settings
        },
    ],
    navPrototype: [
        {
            title: "Smart Routing",
            url: "/prototype/smart-routing",
            icon: Sparkles,
        },
    ],
}

export function AppSidebar() {
    const pathname = useLocation().pathname
    const [orderCount, setOrderCount] = React.useState<number | null>(null)

    React.useEffect(() => {
        const fetchCount = async () => {
            try {
                const res = await fetch('/api/orders')
                const jsonData = await res.json()
                const data = ensureArray(jsonData)
                const todayStr = new Date().toISOString().split('T')[0]

                // Count of today's Unassigned + Assigned orders
                const count = data.filter((o: any) => {
                    const scheduledDate = (o.requestedDeliveryDate || o.orderDate || "").split('T')[0]
                    if (scheduledDate !== todayStr) return false

                    // Simple check for Unassigned/Assigned based on trip existence
                    // Note: In a production app, this would be an optimized endpoint call
                    const delivery = o.deliveries?.[0]
                    const trip = delivery?.trip
                    const isDispatched = trip?.status === 'in-progress'
                    const isDelivered = delivery?.status === 'delivered'
                    const isFailed = delivery?.status === 'failed'
                    const isCancelled = o.status === 'cancelled'

                    if (isCancelled || isDelivered || isFailed || isDispatched) return false
                    return true // Covers Unassigned (no trip) and Assigned (trip exists but not dispatched)
                }).length
                setOrderCount(count)
            } catch (err) {
                console.error("Sidebar count fetch failed:", err)
            }
        }
        fetchCount()
    }, [])

    return (
        <aside className="w-[260px] flex-shrink-0 flex flex-col bg-[var(--color-surface)] border-r border-[var(--color-border)]">
            {/* Logo Block */}
            <div className="p-5 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[var(--color-accent)] rounded-lg flex items-center justify-center text-white shadow-sm">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.5 4 6.5 2 2 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.3-2.35.8-3.5 1.1 2.5 2.2 3.5 2.7 3.5"></path>
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-[15px] leading-tight tracking-tight text-[var(--color-text)]">LPG Delivery</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">Management System</span>
                    </div>
                </div>
            </div>

            {/* Navigation Content */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                {/* Operations Group */}
                <div className="space-y-1">
                    <div className="px-3 mb-2">
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">Operations</span>
                    </div>
                    {data.navMain.map((item) => (
                        <Link
                            key={item.title}
                            to={item.url}
                            className={`sidebar-nav-item flex items-center gap-3 px-3 h-10 rounded-lg text-[13px] font-medium transition-all ${pathname === item.url || pathname.startsWith(`${item.url}/`)
                                ? "bg-[var(--color-accent-dim)] text-[var(--color-accent)] active"
                                : "text-[var(--color-text2)] hover:bg-[var(--color-surface2)] hover:text-[var(--color-text)]"
                                }`}
                        >
                            <span className="w-5 flex justify-center">{item.icon && <item.icon size={18} strokeWidth={pathname === item.url ? 2.5 : 2} />}</span>
                            <span>{item.title}</span>
                            {item.title === "Orders" && orderCount !== null && orderCount > 0 && (
                                <span className="ml-auto bg-[var(--color-accent)] text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full">
                                    {orderCount}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Master Data Group */}
                <div className="space-y-1">
                    <div className="px-3 mb-2">
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">Master Data</span>
                    </div>
                    {data.navAdmin.map((item) => (
                        <Link
                            key={item.title}
                            to={item.url}
                            className={`sidebar-nav-item flex items-center gap-3 px-3 h-10 rounded-lg text-[13px] font-medium transition-all ${pathname === item.url || pathname.startsWith(`${item.url}/`)
                                ? "bg-[var(--color-accent-dim)] text-[var(--color-accent)] active"
                                : "text-[var(--color-text2)] hover:bg-[var(--color-surface2)] hover:text-[var(--color-text)]"
                                }`}
                        >
                            <span className="w-5 flex justify-center">{item.icon && <item.icon size={18} strokeWidth={pathname === item.url ? 2.5 : 2} />}</span>
                            <span>{item.title}</span>
                        </Link>
                    ))}
                </div>

                {/* 🧪 Prototype Group */}
                <div className="space-y-1">
                    <div className="px-3 mb-2">
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.1em] text-violet-500">🧪 Prototype</span>
                    </div>
                    {data.navPrototype.map((item) => (
                        <Link
                            key={item.title}
                            to={item.url}
                            className={`sidebar-nav-item flex items-center gap-3 px-3 h-10 rounded-lg text-[13px] font-medium transition-all ${
                                pathname === item.url || pathname.startsWith(`${item.url}/`)
                                    ? "bg-violet-50 text-violet-700 active"
                                    : "text-[var(--color-text2)] hover:bg-violet-50/50 hover:text-violet-600"
                            }`}
                        >
                            <span className="w-5 flex justify-center">{item.icon && <item.icon size={18} strokeWidth={pathname === item.url ? 2.5 : 2} />}</span>
                            <span>{item.title}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* User Footer */}
            <div className="p-4 border-t border-[var(--color-border)]">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-surface2)] cursor-pointer transition-colors">
                    <div className="w-9 h-9 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-[12px] font-bold shadow-sm">
                        JM
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="sidebar-footer-name text-[13px] font-semibold text-[var(--color-text)] truncate">Jamie Mthembu</span>
                        <span className="sidebar-footer-role text-[11px] text-[var(--color-muted)] truncate">Dispatcher</span>
                    </div>
                </div>
            </div>
        </aside>
    )
}

// Ported from Orders-Module (components/layout/bottom-nav.tsx) — Phase 3.
// Adapted: next/link -> react-router-dom Link, next/navigation usePathname -> useLocation.
// Uses only standard Tailwind palette colors (slate/blue/white) — no custom CSS vars needed.
"use client"

import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, ShoppingCart, Truck, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Orders", href: "/orders", icon: ShoppingCart },
    { title: "Trips", href: "/trips", icon: Truck },
    { title: "Menu", href: "/customers", icon: Menu },
]

export function BottomNav() {
    const pathname = useLocation().pathname

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
            <div className="grid grid-cols-4 h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                    return (
                        <Link
                            key={item.title}
                            to={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px]",
                                isActive
                                    ? "text-blue-600"
                                    : "text-slate-400 hover:text-slate-700"
                            )}
                            data-testid={`bottom-nav-${item.title.toLowerCase()}`}
                        >
                            <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                            <span className={cn("text-[10px] font-semibold tracking-wide", isActive && "text-blue-600")}>
                                {item.title}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}

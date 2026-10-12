// New in Phase 4 Step 1 — wraps ported Orders-Module pages with their own
// nav chrome (AppSidebar/BottomNav from Phase 3), kept separate from this
// app's existing Layout/Header/Navigation (a different, pre-existing section
// of lpg-stock-recon). Deliberately has NO auth/role guard: "skip auth for
// now" was an explicit decision for the migrated Orders-Module pages, unlike
// every other route in this app's router, which is wrapped in ProtectedRoute.
import { AppSidebar } from "./AppSidebar"
import { BottomNav } from "./BottomNav"

export function OrdersModuleLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-white text-slate-900">
            <div className="hidden md:flex">
                <AppSidebar />
            </div>
            <main className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6">
                {children}
            </main>
            <BottomNav />
        </div>
    )
}

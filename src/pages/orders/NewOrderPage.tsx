// Ported from Orders-Module (app/orders/new/page.tsx) — Phase 4 Step 3.
// Adapted: removed "use client" (trivial wrapper, no other changes needed).
import { OrderForm } from "@/components/orders/OrderForm"

export default function NewOrderPage() {
    return (
        <div className="h-full overflow-y-auto">
            <OrderForm mode="create" />
        </div>
    )
}

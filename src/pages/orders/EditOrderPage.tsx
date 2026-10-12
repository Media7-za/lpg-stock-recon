// Ported from Orders-Module (app/orders/[id]/edit/page.tsx) — Phase 4 Step 3.
// Adapted: removed "use client"; useParams (next/navigation) -> react-router-dom
// (same hook name, string params — parsed to a number here since order ids
// are Int); fetch(`/api/orders/${id}`) -> getOrder() (direct Supabase read).
import * as React from "react"
import { useParams } from "react-router-dom"
import { OrderForm } from "@/components/orders/OrderForm"
import { AlertCircle, Loader2 } from "lucide-react"
import { getOrder, type Order } from "@/lib/api/orders"

export default function EditOrderPage() {
    const params = useParams()
    const [order, setOrder] = React.useState<Order | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        if (!params.id) return
        const orderId = parseInt(params.id, 10)
        if (!Number.isInteger(orderId)) {
            setError("Invalid order ID")
            setLoading(false)
            return
        }
        getOrder(orderId)
            .then((data) => {
                setOrder(data)
                setLoading(false)
            })
            .catch((err) => {
                setError(err.message || "Order not found")
                setLoading(false)
            })
    }, [params.id])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-slate-500 font-medium">Loading order details...</p>
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <h2 className="text-xl font-bold text-slate-900">Error</h2>
                <p className="text-slate-500">{error || "Something went wrong"}</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <OrderForm initialData={order} mode="edit" />
        </div>
    )
}

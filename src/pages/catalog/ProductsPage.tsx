// Ported from Orders-Module (app/products/page.tsx) — Phase 4 Step 2.
// Adapted: removed "use client"; fetch('/api/products') replaced with
// listProducts(); Active/Inactive status column dropped (see ProductSheet.tsx
// — the real `products` table has no active column).
import * as React from "react"
import { Search, Package, Plus } from "lucide-react"

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
import { ProductSheet } from "@/components/catalog/ProductSheet"
import { listProducts, type Product } from "@/lib/api/products"

export default function ProductsPage() {
    const [products, setProducts] = React.useState<Product[]>([])
    const [loading, setLoading] = React.useState(true)
    const [search, setSearch] = React.useState("")
    const [sheetOpen, setSheetOpen] = React.useState(false)
    const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)

    const fetchProducts = React.useCallback(() => {
        setLoading(true)
        listProducts()
            .then((data) => {
                setProducts(data)
                setLoading(false)
            })
            .catch((err) => {
                console.error("Error fetching products:", err)
                setLoading(false)
            })
    }, [])

    React.useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    const filteredProducts = products.filter((p) =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.code?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-[Inter]">Products</h1>
                    <p className="text-muted-foreground text-sm mt-1">View and manage your product catalog.</p>
                </div>
                <Button
                    onClick={() => {
                        setSelectedProduct(null)
                        setSheetOpen(true)
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                </Button>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100 mb-4 bg-slate-50/50">
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search products..."
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
                                    <TableHead className="font-semibold text-slate-700">Code</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Name</TableHead>
                                    <TableHead className="font-semibold text-slate-700">SKU</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Category</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Weight</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Tare</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Total</TableHead>
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
                                ) : filteredProducts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Package className="h-8 w-8 opacity-20" />
                                                No products found.
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <TableRow
                                            key={product.id}
                                            onClick={() => {
                                                setSelectedProduct(product)
                                                setSheetOpen(true)
                                            }}
                                            className="hover:bg-slate-50/50 transition-colors border-slate-100 cursor-pointer"
                                        >
                                            <TableCell>
                                                <span className="font-mono text-sm font-bold text-blue-600">{product.code}</span>
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-900">{product.name}</TableCell>
                                            <TableCell>
                                                <span className="text-xs font-mono text-slate-500">{product.sku}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-medium text-xs">
                                                    {product.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-700 font-medium font-mono">
                                                {product.weight}kg
                                            </TableCell>
                                            <TableCell className="text-slate-500 font-mono">
                                                {product.tareWeight}kg
                                            </TableCell>
                                            <TableCell className="text-slate-700 font-bold font-mono">
                                                {product.totalWeight}kg
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <ProductSheet
                open={sheetOpen}
                onClose={() => {
                    setSheetOpen(false)
                    setSelectedProduct(null)
                }}
                onSuccess={fetchProducts}
                product={selectedProduct}
            />
        </div>
    )
}

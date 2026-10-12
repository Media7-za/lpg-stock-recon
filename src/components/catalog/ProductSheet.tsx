// Ported from Orders-Module (components/product-sheet.tsx) — Phase 4 Step 2.
// Adapted: removed "use client"; fetch('/api/products') replaced with
// createProduct()/updateProduct() (direct Supabase calls); the Active/Inactive
// status selector is DROPPED — the real `products` table has no active column
// (Phase 2's migration only added weight/tare_weight/total_weight/sku, per
// spec), so this isn't faked as client-only state. See src/lib/api/products.ts
// for the field mapping (code->stockno, name->description).
import * as React from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createProduct, updateProduct, type Product } from "@/lib/api/products"

interface ProductSheetProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
    product?: Product | null
}

export function ProductSheet({ open, onClose, onSuccess, product }: ProductSheetProps) {
    const [saving, setSaving] = React.useState(false)
    const [formData, setFormData] = React.useState({
        code: "",
        name: "",
        sku: "",
        weight: "",
        tareWeight: "",
        category: "",
    })

    React.useEffect(() => {
        if (product) {
            setFormData({
                code: product.code || "",
                name: product.name || "",
                sku: product.sku || "",
                weight: product.weight?.toString() || "",
                tareWeight: product.tareWeight?.toString() || "",
                category: product.category || "",
            })
        } else if (open) {
            setFormData({
                code: "",
                name: "",
                sku: "",
                weight: "",
                tareWeight: "",
                category: "",
            })
        }
    }, [product, open])

    const totalWeight = (parseFloat(formData.weight) || 0) + (parseFloat(formData.tareWeight) || 0)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const payload = {
                code: formData.code,
                name: formData.name,
                sku: formData.sku,
                weight: parseFloat(formData.weight),
                tareWeight: parseFloat(formData.tareWeight),
                totalWeight,
                category: formData.category,
            }

            if (product) {
                await updateProduct(product.id, payload)
            } else {
                await createProduct(payload)
            }

            toast.success(product ? "Product updated" : "Product created")
            onSuccess()
            onClose()
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setSaving(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-[550px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle>{product ? "Edit Product" : "New Product"}</SheetTitle>
                    <SheetDescription>
                        {product ? "Update product details" : "Add a new product to the catalog."}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* SECTION 1: IDENTITY */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Product Code *</Label>
                            <Input
                                id="code"
                                required
                                placeholder="e.g. 9KG"
                                className="font-mono"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU *</Label>
                            <Input
                                id="sku"
                                required
                                placeholder="e.g. LPG-009"
                                className="font-mono"
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                            id="name"
                            required
                            placeholder="e.g. 9kg LPG Cylinder"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* SECTION 2: WEIGHT & CATEGORY */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="weight">Gas Weight (kg) *</Label>
                            <Input
                                id="weight"
                                required
                                type="number"
                                step="0.1"
                                placeholder="9"
                                className="font-mono"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tareWeight">Tare Weight (kg) *</Label>
                            <Input
                                id="tareWeight"
                                required
                                type="number"
                                step="0.1"
                                placeholder="5"
                                className="font-mono"
                                value={formData.tareWeight}
                                onChange={(e) => setFormData({ ...formData, tareWeight: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Total Weight</Label>
                            <div className="h-10 flex items-center px-3 bg-slate-100 rounded-md font-mono font-bold text-slate-700 border">
                                {totalWeight}kg
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                            required
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="LPG">LPG</SelectItem>
                                <SelectItem value="Cylinder">Cylinder</SelectItem>
                                <SelectItem value="Accessory">Accessory</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <SheetFooter className="gap-2 mt-6 flex-row justify-end">
                        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {product ? "Update Product" : "Create Product"}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}

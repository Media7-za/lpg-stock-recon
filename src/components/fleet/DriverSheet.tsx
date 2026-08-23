// Ported from Orders-Module (components/driver-sheet.tsx) — Phase 4 Step 1.
// Adapted: removed "use client"; fetch('/api/drivers') replaced with direct
// Supabase calls via src/lib/api/drivers.ts.
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
import { createDriver, updateDriver, type Driver } from "@/lib/api/drivers"

interface DriverSheetProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
    driver?: Driver | null
}

export function DriverSheet({ open, onClose, onSuccess, driver }: DriverSheetProps) {
    const [saving, setSaving] = React.useState(false)
    const [formData, setFormData] = React.useState({
        name: "",
        phone: "",
        license: "",
        active: true,
    })

    React.useEffect(() => {
        if (driver) {
            setFormData({
                name: driver.name || "",
                phone: driver.phone || "",
                license: driver.license || "",
                active: driver.active ?? true,
            })
        } else if (open) {
            setFormData({
                name: "",
                phone: "",
                license: "",
                active: true,
            })
        }
    }, [driver, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const payload = {
                name: formData.name,
                phone: formData.phone,
                license: formData.license,
                active: formData.active,
            }

            if (driver) {
                await updateDriver(driver.id, payload)
            } else {
                await createDriver(payload)
            }

            toast.success(driver ? "Driver updated" : "Driver added")
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
            <SheetContent className="sm:max-w-[500px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle>{driver ? "Edit Driver" : "New Driver"}</SheetTitle>
                    <SheetDescription>
                        {driver ? "Update driver details" : "Register a new delivery driver."}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                            id="name"
                            required
                            placeholder="e.g. Sipho Mkhize"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone *</Label>
                            <Input
                                id="phone"
                                required
                                type="tel"
                                placeholder="083..."
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="license">License Number</Label>
                            <Input
                                id="license"
                                placeholder="e.g. DRV-001"
                                className="font-mono"
                                value={formData.license}
                                onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="active">Status</Label>
                        <Select
                            value={formData.active ? "true" : "false"}
                            onValueChange={(value) =>
                                setFormData({ ...formData, active: value === "true" })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Unavailable</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <SheetFooter className="gap-2 mt-6 flex-row justify-end">
                        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {driver ? "Update Driver" : "Add Driver"}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}

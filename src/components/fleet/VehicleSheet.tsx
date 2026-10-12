// Ported from Orders-Module (components/vehicle-sheet.tsx) — Phase 4 Step 1.
// Adapted: removed "use client"; fetch('/api/vehicles') replaced with direct
// Supabase calls via src/lib/api/vehicles.ts.
import * as React from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { createVehicle, updateVehicle, type Vehicle } from "@/lib/api/vehicles"

interface VehicleSheetProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
    vehicle?: Vehicle | null
}

export function VehicleSheet({ open, onClose, onSuccess, vehicle }: VehicleSheetProps) {
    const [saving, setSaving] = React.useState(false)
    const [formData, setFormData] = React.useState({
        registration: "",
        make: "",
        model: "",
        capacity: "",
        notes: "",
        active: true,
    })

    React.useEffect(() => {
        if (vehicle) {
            setFormData({
                registration: vehicle.registration || "",
                make: vehicle.make || "",
                model: vehicle.model || "",
                capacity: vehicle.capacity?.toString() || "",
                notes: vehicle.notes || "",
                active: vehicle.active ?? true,
            })
        } else if (open) {
            setFormData({
                registration: "",
                make: "",
                model: "",
                capacity: "",
                notes: "",
                active: true,
            })
        }
    }, [vehicle, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const payload = {
                registration: formData.registration,
                make: formData.make,
                model: formData.model,
                capacity: formData.capacity ? parseInt(formData.capacity) : null,
                notes: formData.notes,
                active: formData.active,
            }

            if (vehicle) {
                await updateVehicle(vehicle.id, payload)
            } else {
                await createVehicle(payload)
            }

            toast.success(vehicle ? "Vehicle updated" : "Vehicle added")
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
                    <SheetTitle>{vehicle ? "Edit Vehicle" : "New Vehicle"}</SheetTitle>
                    <SheetDescription>
                        {vehicle ? "Update vehicle details" : "Add a vehicle to the fleet."}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="registration">Registration *</Label>
                        <Input
                            id="registration"
                            required
                            placeholder="e.g. ND 12345"
                            className="font-mono uppercase"
                            value={formData.registration}
                            onChange={(e) => setFormData({ ...formData, registration: e.target.value.toUpperCase() })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="make">Make</Label>
                            <Input
                                id="make"
                                placeholder="e.g. Toyota"
                                value={formData.make}
                                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="model">Model</Label>
                            <Input
                                id="model"
                                placeholder="e.g. Dyna 4-ton"
                                value={formData.model}
                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Capacity (units)</Label>
                            <Input
                                id="capacity"
                                type="number"
                                placeholder="e.g. 80"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            />
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
                                    <SelectItem value="false">Out of Service</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="E.g. Service due March 2026, LPG certified."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <SheetFooter className="gap-2 mt-6 flex-row justify-end">
                        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {vehicle ? "Update Vehicle" : "Add Vehicle"}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}

// Ported from Orders-Module (components/order-form.tsx) — Phase 4 Step 3.
// Adapted: removed "use client"; useRouter (next/navigation) -> useNavigate
// (react-router-dom); dropped an unused `Link from "next/link"` import (dead
// in the original — grepped, never referenced in the JSX);
// process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY -> import.meta.env.VITE_GOOGLE_MAPS_KEY;
// fetch('/api/customers'|'/api/products'|'/api/routes') -> listCustomers()/
// listProducts()/listRoutes(); fetch('/api/orders', POST/PATCH) ->
// createOrder()/updateOrder() (the upsert-order Edge Function).
//
// REAL FIX, not just adaptation: `itemQuantities` was `Record<number, number>`
// keyed by `product.id` with `parseInt()` calls throughout (productId ->
// number). products.id is a text/cuid string in this schema, not an integer
// — parseInt() on a cuid silently produces NaN. Retyped to
// Record<string, number> and removed every parseInt() on a product id.
"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Search, Calendar, MapPin, Route, CheckCircle2, AlertCircle, X } from "lucide-react"
import { toast } from "sonner"

import { cn, formatDate } from "@/lib/utils"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import usePlacesAutocomplete, { getDetails } from "use-places-autocomplete"
import { useLoadScript } from "@react-google-maps/api"
import { listCustomers, createCustomer, type Customer as ApiCustomer } from "@/lib/api/customers"
import { listProducts, type Product as ApiProduct } from "@/lib/api/products"
import { listRoutes, type Route as ApiRoute } from "@/lib/api/routesAreas"
import { createOrder, updateOrder, type Order } from "@/lib/api/orders"

const libraries: ("places")[] = ["places"]

interface Area {
    id: number
    name: string
    routeId: number
    boundaryPolygon?: string | null
    route?: {
        name: string
    }
}

interface RouteType {
    id: number
    name: string
    code: string
    areas: Area[]
}

interface Customer {
    id: string
    name: string
    address: string | null
    area: Area | null
}

interface Product {
    id: string
    code: string
    name: string
    weight: number | null
    tareWeight: number | null
    totalWeight: number | null
    category: string | null
}

function isPointInPolygon(point: { lat: number; lng: number }, polygon: { lat: number; lng: number }[]): boolean {
    let inside = false
    const n = polygon.length
    for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = polygon[i].lat, yi = polygon[i].lng
        const xj = polygon[j].lat, yj = polygon[j].lng
        const intersect = ((yi > point.lng) !== (yj > point.lng)) &&
            (point.lat < (xj - xi) * (point.lng - yi) / (yj - yi) + xi)
        if (intersect) inside = !inside
    }
    return inside
}

function PlacesAutocomplete({
    onPlaceSelect,
    isLoaded,
}: {
    onPlaceSelect: (placeDetails: any) => void
    isLoaded: boolean
}) {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            componentRestrictions: { country: "za" },
        },
        debounce: 300,
    })

    const handleSelect = async (placeId: string) => {
        setValue("", false)
        clearSuggestions()

        try {
            const parameter = {
                placeId,
                fields: [
                    "name",
                    "formatted_address",
                    "formatted_phone_number",
                    "international_phone_number",
                    "address_components",
                    "geometry",
                    "url",
                ],
            }

            const placeDetails = await getDetails(parameter)
            onPlaceSelect(placeDetails)
        } catch (error) {
            console.error("Error fetching place details:", error)
            toast.error("Failed to fetch business details")
        } finally {
            clearSuggestions()
        }
    }

    if (!isLoaded) return null

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#ff6b2b]" />
                <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            clearSuggestions()
                        }
                    }}
                    disabled={!ready}
                    placeholder="Search business (e.g. 'Spoon Eatery')..."
                    className="w-full bg-[#32241b] border-none rounded-xl py-6 pl-12 placeholder:text-[#5d4037] text-white focus:ring-2 focus:ring-[#ff6b2b]/50 transition-all font-bold"
                />
            </div>

            {status === "OK" && data.length > 0 && (
                <ul className="absolute z-[110] mt-1 w-full bg-[#251b14] border border-[#3d2b1f] rounded-xl shadow-2xl max-h-60 overflow-auto">
                    {data.map(({ place_id, description }) => (
                        <li
                            key={place_id}
                            onClick={() => {
                                handleSelect(place_id)
                            }}
                            className="px-4 py-3 hover:bg-[#32241b] cursor-pointer transition-colors flex items-start gap-3 border-b border-[#3d2b1f] last:border-b-0"
                        >
                            <MapPin className="h-4 w-4 text-[#ff6b2b] mt-1 flex-shrink-0" />
                            <span className="text-sm font-medium text-[#ede0d4]">{description}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

interface OrderFormProps {
    initialData?: Order | null
    mode?: "create" | "edit"
}

export function OrderForm({ initialData, mode = "create" }: OrderFormProps) {
    const navigate = useNavigate()
    const [loading, setLoading] = React.useState(false)
    const [customers, setCustomers] = React.useState<Customer[]>([])
    const [products, setProducts] = React.useState<Product[]>([])
    const [routes, setRoutes] = React.useState<RouteType[]>([])
    const [searchQuery, setSearchQuery] = React.useState("")
    const [showDropdown, setShowDropdown] = React.useState(false)

    // Modal State
    const [isModalOpen, setIsModalOpen] = React.useState(false)
    const [isCreatingCustomer, setIsCreatingCustomer] = React.useState(false)
    const [newCustomer, setNewCustomer] = React.useState({
        name: "",
        phone: "",
        address: "",
        areaId: "",
        googleMapsUrl: "",
        latitude: "",
        longitude: ""
    })

    // Form State
    const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null)
    const [orderType, setOrderType] = React.useState<"Delivery" | "Collection">("Delivery")
    const [requestedDate, setRequestedDate] = React.useState<Date>(new Date())
    const [priority, setPriority] = React.useState<"normal" | "urgent">("normal")
    const [itemQuantities, setItemQuantities] = React.useState<Record<string, number>>({})
    const [openCalendar, setOpenCalendar] = React.useState(false)

    // Load Google Maps script
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || "",
        libraries,
    })

    React.useEffect(() => {
        listCustomers()
            .then((data: ApiCustomer[]) => {
                setCustomers(data.map((c) => ({
                    id: c.id,
                    name: c.name,
                    address: c.address,
                    area: c.area ? {
                        id: c.area.id,
                        name: c.area.name,
                        routeId: c.area.routeId,
                        route: c.area.route ? { name: c.area.route.name } : undefined,
                    } : null,
                })))
            })
            .catch(err => console.error("Error loading customers:", err))

        listProducts()
            .then((data: ApiProduct[]) => {
                setProducts(data.map((p) => ({
                    id: p.id,
                    code: p.code,
                    name: p.name,
                    weight: p.weight,
                    tareWeight: p.tareWeight,
                    totalWeight: p.totalWeight,
                    category: p.category,
                })))
            })
            .catch(err => console.error("Error loading products:", err))

        listRoutes()
            .then((data: ApiRoute[]) => {
                setRoutes(data.map((r) => ({
                    id: r.id,
                    name: r.name,
                    code: r.code,
                    areas: r.areas.map((a) => ({
                        id: a.id,
                        name: a.name,
                        routeId: a.routeId,
                        boundaryPolygon: a.boundaryPolygon,
                    })),
                })))
            })
            .catch(err => console.error("Error loading routes:", err))
    }, [])

    // Pre-populate if initialData exists
    React.useEffect(() => {
        if (initialData) {
            if (initialData.customer) {
                setSelectedCustomer({
                    id: initialData.customer.id,
                    name: initialData.customer.name,
                    address: initialData.customer.address,
                    area: initialData.customer.area ? {
                        id: initialData.customer.area.id,
                        name: initialData.customer.area.name,
                        routeId: initialData.customer.area.routeId,
                        route: initialData.customer.area.route ? { name: initialData.customer.area.route.name } : undefined,
                    } : null,
                })
                setSearchQuery(initialData.customer.name)
            }
            setOrderType(initialData.orderType as "Delivery" | "Collection")
            setRequestedDate(initialData.requestedDeliveryDate ? new Date(initialData.requestedDeliveryDate) : new Date())
            setPriority(initialData.priority as "normal" | "urgent")

            const quantities: Record<string, number> = {}
            initialData.orderItems?.forEach((item) => {
                quantities[item.productId] = item.quantityOrdered
            })
            setItemQuantities(quantities)
        }
    }, [initialData])

    // Escape key listener for modal
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isModalOpen) {
                setIsModalOpen(false)
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isModalOpen])

    const handleQuantityAdjust = (productId: string, delta: number) => {
        setItemQuantities(prev => {
            const current = prev[productId] || 0
            const newValue = Math.max(0, current + delta)
            return { ...prev, [productId]: newValue }
        })
    }

    const handleQuantityInput = (productId: string, value: string) => {
        const num = parseInt(value) || 0
        setItemQuantities(prev => ({ ...prev, [productId]: Math.max(0, num) }))
    }

    const handleCustomerSearch = (value: string) => {
        setSearchQuery(value)
        setShowDropdown(value.length > 0)
        if (value.length === 0) {
            setSelectedCustomer(null)
        }
    }

    const selectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer)
        setSearchQuery(customer.name)
        setShowDropdown(false)
    }

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const calculateTotals = () => {
        let totalCylinders = 0
        let totalWeight = 0

        Object.entries(itemQuantities).forEach(([productId, qty]) => {
            if (qty > 0) {
                const product = products.find(p => p.id === productId)
                if (product) {
                    totalCylinders += qty
                    totalWeight += (product.totalWeight || 0) * qty
                }
            }
        })

        return { totalCylinders, totalWeight }
    }

    const allAreas = routes.flatMap(r => r.areas)

    const detectArea = (
        lat: number | null,
        lng: number | null,
        addressComponents: any[]
    ): { areaId: string } => {
        if (lat && lng) {
            for (const area of allAreas) {
                if (area.boundaryPolygon) {
                    try {
                        const polygon = JSON.parse(area.boundaryPolygon)
                        if (isPointInPolygon({ lat, lng }, polygon)) {
                            return { areaId: area.id.toString() }
                        }
                    } catch { /* skip */ }
                }
            }
        }

        const sublocality = addressComponents.find(
            (c: any) => c.types.includes("sublocality") || c.types.includes("neighborhood") || c.types.includes("locality")
        )

        if (sublocality) {
            const areaName = sublocality.long_name.toLowerCase()
            const matchedArea = allAreas.find(a =>
                a.name.toLowerCase().includes(areaName) || areaName.includes(a.name.toLowerCase())
            )
            if (matchedArea) return { areaId: matchedArea.id.toString() }
        }

        return { areaId: "" }
    }

    const handlePlaceSelect = (placeDetails: any) => {
        const addressComponents = placeDetails.address_components || []
        let lat: number | null = null
        let lng: number | null = null

        if (placeDetails.geometry?.location) {
            lat = typeof placeDetails.geometry.location.lat === "function"
                ? placeDetails.geometry.location.lat()
                : placeDetails.geometry.location.lat
            lng = typeof placeDetails.geometry.location.lng === "function"
                ? placeDetails.geometry.location.lng()
                : placeDetails.geometry.location.lng
        }

        const { areaId } = detectArea(lat, lng, addressComponents)

        setNewCustomer(prev => {
            const sanitizedName = (placeDetails.name || prev.name).replace(/\.$/, "")

            return {
                ...prev,
                name: sanitizedName,
                address: placeDetails.formatted_address || prev.address,
                phone: placeDetails.formatted_phone_number || placeDetails.international_phone_number || prev.phone,
                areaId: areaId || prev.areaId,
                googleMapsUrl: placeDetails.url || prev.googleMapsUrl,
                latitude: lat ? String(lat) : prev.latitude,
                longitude: lng ? String(lng) : prev.longitude
            }
        })

        if (areaId) {
            const area = allAreas.find(a => a.id.toString() === areaId)
            toast.success(`✨ Auto-filled! Area detected: ${area?.name}`)
        } else {
            toast.warning("⚠️ Outside delivery areas - select Route & Area manually")
        }
    }

    const handleCreateCustomer = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCustomer.name || !newCustomer.address || !newCustomer.areaId) {
            toast.error("Please fill in required fields")
            return
        }

        setIsCreatingCustomer(true)
        try {
            let finalGoogleMapsUrl = newCustomer.googleMapsUrl
            if (!finalGoogleMapsUrl && newCustomer.latitude && newCustomer.longitude) {
                finalGoogleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${newCustomer.latitude},${newCustomer.longitude}`
            }

            const data = await createCustomer({
                name: newCustomer.name,
                address: newCustomer.address,
                areaId: parseInt(newCustomer.areaId),
                phone: newCustomer.phone,
                googleMapsUrl: finalGoogleMapsUrl,
                latitude: newCustomer.latitude ? parseFloat(newCustomer.latitude) : null,
                longitude: newCustomer.longitude ? parseFloat(newCustomer.longitude) : null,
            })

            toast.success(`Customer ${data.name} created!`)

            const updatedData = await listCustomers()
            setCustomers(updatedData.map((c) => ({
                id: c.id,
                name: c.name,
                address: c.address,
                area: c.area ? {
                    id: c.area.id,
                    name: c.area.name,
                    routeId: c.area.routeId,
                    route: c.area.route ? { name: c.area.route.name } : undefined,
                } : null,
            })))

            selectCustomer({
                id: data.id,
                name: data.name,
                address: data.address,
                area: data.area ? {
                    id: data.area.id,
                    name: data.area.name,
                    routeId: data.area.routeId,
                    route: data.area.route ? { name: data.area.route.name } : undefined,
                } : null,
            })
            setIsModalOpen(false)
            setNewCustomer({ name: "", phone: "", address: "", areaId: "", googleMapsUrl: "", latitude: "", longitude: "" })
        } catch (error) {
            toast.error("Error creating customer")
        } finally {
            setIsCreatingCustomer(false)
        }
    }

    const handleSubmit = async () => {
        if (!selectedCustomer) {
            toast.error("Please select a customer")
            return
        }

        const items = Object.entries(itemQuantities)
            .filter(([, qty]) => qty > 0)
            .map(([id, qty]) => ({
                productId: id,
                quantity: qty
            }))

        if (items.length === 0) {
            toast.error("Please add at least one product")
            return
        }

        setLoading(true)
        try {
            const data = mode === "edit" && initialData
                ? await updateOrder(initialData.id, {
                    orderType,
                    requestedDeliveryDate: requestedDate,
                    priority,
                    items,
                })
                : await createOrder({
                    customerId: selectedCustomer.id,
                    orderType,
                    requestedDeliveryDate: requestedDate,
                    priority,
                    items,
                })

            toast.success(`Order ${data.order?.order_number ?? ""} ${mode === "edit" ? "updated" : "created"} successfully`)
            navigate("/orders")
        } catch (error) {
            toast.error("Something went wrong")
            setLoading(false)
        }
    }

    const { totalCylinders, totalWeight } = calculateTotals()
    const canSubmit = totalCylinders > 0 && selectedCustomer

    const cylinderProducts = products.filter(p => !["SV", "DV"].includes(p.code))
    const valveProducts = products.filter(p => ["SV", "DV"].includes(p.code))

    return (
        <div className="flex flex-col min-h-full">
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center p-4 max-w-2xl mx-auto w-full">
                    <button
                        onClick={() => navigate("/orders")}
                        className="p-2 -ml-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-xl font-bold ml-2">{mode === "edit" ? `Edit Order ${initialData?.orderNumber}` : "New Order"}</h1>
                </div>
            </header>

            <main className="flex-1 w-full max-w-2xl mx-auto p-4 pb-32">
                <section className="mb-8">
                    <label className="block text-sm font-semibold mb-2 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Customer Lookup
                    </label>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 z-10" />
                        <Input
                            autoFocus={mode === "create"}
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg transition-all"
                            placeholder="Search by name or ID..."
                            value={searchQuery}
                            onChange={(e) => handleCustomerSearch(e.target.value)}
                            onFocus={() => searchQuery.length > 0 && setShowDropdown(true)}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                            disabled={mode === "edit"}
                        />
                        {showDropdown && mode === "create" && (
                            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg max-h-60 overflow-auto">
                                {filteredCustomers.length > 0 ? (
                                    filteredCustomers.map((customer) => (
                                        <button
                                            key={customer.id}
                                            className={cn(
                                                "w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors first:rounded-t-xl last:rounded-b-xl flex flex-col",
                                                selectedCustomer?.id === customer.id && "bg-blue-50 dark:bg-blue-950"
                                            )}
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => selectCustomer(customer)}
                                        >
                                            <span className="font-semibold text-sm">{customer.name}</span>
                                            <span className="text-xs text-slate-500">{customer.address}</span>
                                        </button>
                                    ))
                                ) : (
                                    <button
                                        className="w-full text-left px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-xl flex items-center justify-between"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => {
                                            setIsModalOpen(true)
                                            setShowDropdown(false)
                                            if (!selectedCustomer) {
                                                setNewCustomer(prev => ({ ...prev, name: searchQuery }))
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Search className="h-4 w-4" />
                                            <span className="text-sm">No customer found.</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-blue-600 font-bold text-sm">
                                            <AlertCircle className="h-4 w-4 fill-blue-600 text-white" />
                                            Add New
                                        </div>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    {selectedCustomer && (
                        <div className="mt-3 px-1 flex flex-col gap-1">
                            <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>{selectedCustomer.address}</span>
                            </div>
                            <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                                <Route className="h-4 w-4 mr-2" />
                                <span>Route: <span className="text-blue-600 font-medium">{selectedCustomer.area?.route?.name || selectedCustomer.area?.name}</span></span>
                            </div>
                        </div>
                    )}
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-semibold mb-3 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Order Type
                        </label>
                        <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-lg">
                            <button
                                onClick={() => setOrderType("Delivery")}
                                className={cn(
                                    "flex-1 py-2 text-sm font-bold rounded-md transition-all",
                                    orderType === "Delivery"
                                        ? "bg-white dark:bg-slate-700 shadow-sm"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                )}
                            >
                                Delivery
                            </button>
                            <button
                                onClick={() => setOrderType("Collection")}
                                className={cn(
                                    "flex-1 py-2 text-sm font-bold rounded-md transition-all",
                                    orderType === "Collection"
                                        ? "bg-white dark:bg-slate-700 shadow-sm"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                )}
                            >
                                Collection
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-3 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Requested Date
                        </label>
                        <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                            <PopoverTrigger asChild>
                                <button className="w-full flex items-center px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all">
                                    <Calendar className="h-5 w-5 text-slate-400 mr-2" />
                                    <span className="text-sm">{formatDate(requestedDate)}</span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                    mode="single"
                                    selected={requestedDate}
                                    onSelect={(date) => {
                                        if (date) setRequestedDate(date)
                                        setOpenCalendar(false)
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </section>

                <section className="mb-10">
                    <label className="block text-sm font-semibold mb-3 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Order Priority
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setPriority("normal")}
                            className={cn(
                                "flex items-center justify-center gap-2 py-4 border-2 font-bold rounded-xl transition-all",
                                priority === "normal"
                                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600 ring-2 ring-blue-200 dark:ring-blue-900"
                                    : "border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:text-blue-500"
                            )}
                        >
                            <CheckCircle2 className="h-5 w-5" />
                            Normal
                        </button>
                        <button
                            onClick={() => setPriority("urgent")}
                            className={cn(
                                "flex items-center justify-center gap-2 py-4 border-2 font-bold rounded-xl transition-all",
                                priority === "urgent"
                                    ? "border-red-600 bg-red-50 dark:bg-red-950 text-red-600 ring-2 ring-red-200 dark:ring-red-900"
                                    : "border-slate-200 dark:border-slate-800 hover:border-red-500 hover:text-red-500"
                            )}
                        >
                            <AlertCircle className="h-5 w-5" />
                            Urgent
                        </button>
                    </div>
                </section>

                <section className="space-y-4">
                    <label className="block text-sm font-semibold mb-4 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Product Selection
                    </label>

                    {cylinderProducts.map((product) => (
                        <div
                            key={product.id}
                            className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4"
                        >
                            <div className="flex-1">
                                <h4 className="font-bold text-lg">{product.code}</h4>
                                <p className="text-xs text-slate-500">{product.name}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1 mr-3">
                                    <button
                                        onClick={() => handleQuantityAdjust(product.id, -5)}
                                        className="h-10 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-red-500/10 hover:text-red-500 rounded-md font-bold text-sm transition-colors"
                                    >
                                        -5
                                    </button>
                                    <button
                                        onClick={() => handleQuantityAdjust(product.id, -1)}
                                        className="h-10 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-red-500/10 hover:text-red-500 rounded-md font-bold text-sm transition-colors"
                                    >
                                        -1
                                    </button>
                                </div>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    className="w-20 py-3 text-center text-2xl font-bold bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                                    placeholder="0"
                                    value={itemQuantities[product.id] || ""}
                                    onChange={(e) => handleQuantityInput(product.id, e.target.value)}
                                />
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleQuantityAdjust(product.id, 1)}
                                        className="h-10 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-blue-500/20 hover:text-blue-600 rounded-md font-bold text-sm transition-colors"
                                    >
                                        +1
                                    </button>
                                    <button
                                        onClick={() => handleQuantityAdjust(product.id, 5)}
                                        className="h-10 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-blue-500/20 hover:text-blue-600 rounded-md font-bold text-sm transition-colors"
                                    >
                                        +5
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {valveProducts.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {valveProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4"
                                >
                                    <div className="flex-1">
                                        <h4 className="font-bold">{product.code}</h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleQuantityAdjust(product.id, -1)}
                                            className="h-8 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-500/10 hover:text-red-500 rounded-md font-bold text-xs mr-1"
                                        >
                                            -1
                                        </button>
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            className="w-16 py-2 text-center font-bold bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                                            placeholder="0"
                                            value={itemQuantities[product.id] || ""}
                                            onChange={(e) => handleQuantityInput(product.id, e.target.value)}
                                        />
                                        <button
                                            onClick={() => handleQuantityAdjust(product.id, 1)}
                                            className="h-8 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-500/20 hover:text-blue-600 rounded-md font-bold text-xs"
                                        >
                                            +1
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <footer className="sticky bottom-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] w-full">
                <div className="max-w-2xl mx-auto p-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between text-sm px-1">
                        <div className="flex gap-4">
                            <div className="flex flex-col">
                                <span className="text-slate-500">Total Cylinders</span>
                                <span className="font-bold text-lg">{totalCylinders} Units</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-500">Est. Load Weight</span>
                                <div className="flex items-center mt-1">
                                    <span className="bg-blue-600/20 text-blue-600 font-black px-2 py-0.5 rounded text-base">
                                        {totalWeight.toFixed(1)} kg
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1" />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit || loading}
                        className={cn(
                            "w-full py-4 font-black text-lg rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                            canSubmit && !loading
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900 active:scale-95"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                        )}
                    >
                        {loading ? (mode === "edit" ? "Updating..." : "Creating...") : (mode === "edit" ? "Update Order" : "Create Order")}
                    </button>

                    {!canSubmit && (
                        <p className="text-[10px] text-center text-slate-500 italic">
                            Select at least one product to enable order {mode === "edit" ? "update" : "creation"}
                        </p>
                    )}
                </div>
            </footer>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 sm:items-center">
                    <div className="w-full max-w-md bg-[#251b14] text-[#ede0d4] rounded-t-[2rem] sm:rounded-[1.5rem] p-6 shadow-2xl relative border border-[#3d2b1f] animate-in fade-in slide-in-from-bottom-10 duration-300">
                        <div className="w-12 h-1.5 bg-[#3d2b1f] rounded-full mx-auto mb-6"></div>

                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#3d2b1f] text-[#8b7355] hover:text-[#ede0d4] transition-all"
                            title="Close (Esc)"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-1">
                            <div className="bg-[#ff6b2b]/10 p-2 rounded-lg">
                                <AlertCircle className="h-6 w-6 text-[#ff6b2b]" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">Create New Customer</h2>
                        </div>
                        <p className="text-sm text-[#8b7355] mb-8 font-medium">Register a new client to the LPG delivery network.</p>

                        <div className="mb-8">
                            <label className="block text-[10px] font-black text-[#ff6b2b] uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                                <span className="text-sm">⚡</span> Auto-Fill from Google
                            </label>
                            <PlacesAutocomplete isLoaded={isLoaded} onPlaceSelect={handlePlaceSelect} />
                        </div>

                        <form onSubmit={handleCreateCustomer} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-[#ff6b2b] uppercase tracking-[0.15em] mb-2">Customer Name <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Input
                                        className="w-full bg-[#32241b] border-none rounded-xl py-4 pl-12 placeholder:text-[#5d4037] text-white focus:ring-2 focus:ring-[#ff6b2b]/50 transition-all font-bold"
                                        placeholder="Enter full legal name"
                                        value={newCustomer.name}
                                        onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                        required
                                    />
                                    <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#5d4037]" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-[#ff6b2b] uppercase tracking-[0.15em] mb-2">Phone Number</label>
                                <div className="relative">
                                    <Input
                                        className="w-full bg-[#32241b] border-none rounded-xl py-4 pl-12 placeholder:text-[#5d4037] text-white focus:ring-2 focus:ring-[#ff6b2b]/50 transition-all font-bold"
                                        placeholder="+1 (555) 000-0000"
                                        value={newCustomer.phone}
                                        onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                    />
                                    <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#5d4037]" />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-[10px] font-black text-[#ff6b2b] uppercase tracking-[0.15em]">Delivery Route <span className="text-red-500">*</span></label>
                                </div>
                                <div className="relative">
                                    <select
                                        className="w-full bg-[#32241b] border-none rounded-xl py-4 pl-12 text-white focus:ring-2 focus:ring-[#ff6b2b]/50 transition-all font-bold appearance-none cursor-pointer"
                                        value={newCustomer.areaId}
                                        onChange={e => setNewCustomer({ ...newCustomer, areaId: e.target.value })}
                                        required
                                    >
                                        <option value="" disabled className="text-[#5d4037]">Select assigned route</option>
                                        {routes.map(route => route.areas.map(area => (
                                            <option key={area.id} value={area.id} className="bg-[#251b14] text-white">
                                                {route.name} - {area.name}
                                            </option>
                                        )))}
                                    </select>
                                    <Route className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#5d4037]" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-[#ff6b2b] uppercase tracking-[0.15em] mb-2">Delivery Address <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <textarea
                                        className="w-full bg-[#32241b] border-none rounded-xl py-4 pl-12 pr-4 placeholder:text-[#5d4037] text-white focus:ring-2 focus:ring-[#ff6b2b]/50 transition-all font-bold min-h-[100px] resize-none"
                                        placeholder="Enter full street address, building, or landmark..."
                                        value={newCustomer.address}
                                        onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                        required
                                    />
                                    <MapPin className="absolute left-4 top-4 h-5 w-5 text-[#5d4037]" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={isCreatingCustomer}
                                    className="w-full bg-[#ff6b2b] hover:bg-[#ff8c5a] text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-[#ff6b2b]/20"
                                >
                                    {isCreatingCustomer ? "Processing..." : (
                                        <>
                                            <AlertCircle className="h-5 w-5 fill-white text-[#ff6b2b]" />
                                            Create Customer
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full bg-[#32241b] hover:bg-[#3d2b1f] text-white font-black py-4 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Standard utility for UI date display.
 * Formats: Date | string | null | undefined -> "dd MMM yyyy" (e.g., 28 Mar 2026)
 * Returns "" for null/undefined/invalid inputs.
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ""
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return ""
    return format(d, "dd MMM yyyy")
  } catch (err) {
    return ""
  }
}

/**
 * Standard utility for UI date+time display.
 * Formats: Date | string | null | undefined -> "dd MMM yyyy, HH:mm" (e.g., 28 Mar 2026, 14:30)
 * Returns "" for null/undefined/invalid inputs.
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return ""
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return ""
    return format(d, "dd MMM yyyy, HH:mm")
  } catch (err) {
    return ""
  }
}

// Route Color Mapping for Visual Identification
export const ROUTE_COLORS: Record<string, string> = {
  RN: "blue",    // Route North
  RS: "emerald", // Route South
  RE: "amber",   // Route East
  RW: "purple",  // Route West
  RC: "rose",    // Route Central
  DEFAULT: "slate"
}

export const getRouteColorClasses = (routeCode: string) => {
  const color = ROUTE_COLORS[routeCode as keyof typeof ROUTE_COLORS] || ROUTE_COLORS.DEFAULT

  return {
    border: `border-l-${color}-500`,         // Strong left border
    badge: `bg-${color}-50 text-${color}-700 border-${color}-200`, // Subtle badge
    text: `text-${color}-700`,              // Colored text
    bgHover: `hover:bg-${color}-50`,        // Interactive hover state
    bg: `bg-${color}-100`,                  // Background accent
  }
}

// Calculate total weight for a delivery
export const calculateDeliveryWeight = (delivery: {
  deliveryItems?: Array<{
    product?: { totalWeight?: number; weight?: number };
    quantityToDeliver: number;
  }>;
}): number => {
  if (!delivery?.deliveryItems) return 0

  return delivery.deliveryItems.reduce((sum: number, item) => {
    const productWeight = item.product?.totalWeight || item.product?.weight || 0
    return sum + (item.quantityToDeliver * productWeight)
  }, 0)
}

/**
 * Defensive utility to ensure a value is an array.
 * Useful for handling API responses that might return error objects instead of data.
 */
export function ensureArray<T>(data: unknown): T[] {
    return Array.isArray(data) ? data : []
}

const ROUTE_ACRONYMS = ['CBD', 'SW']

export function normaliseRouteName(name: string | null | undefined): string {
  if (!name) return ""
  if (ROUTE_ACRONYMS.includes(name.toUpperCase())) return name.toUpperCase()
  return name
    .toLowerCase()
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => {
      if (ROUTE_ACRONYMS.includes(word.toUpperCase())) return word.toUpperCase()
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

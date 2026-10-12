// Cluster color palette — 10 visually distinct colors for map markers, hulls, and sidebar cards
// Each color has a hex value (for Google Maps) and Tailwind utility classes (for sidebar UI)

export interface ClusterColor {
    hex: string
    bg: string        // Tailwind bg class
    bgLight: string   // Tailwind light bg (for cards)
    border: string    // Tailwind border class
    text: string      // Tailwind text class
    label: string     // Human-readable label
}

const CLUSTER_PALETTE: ClusterColor[] = [
    { hex: "#3B82F6", bg: "bg-blue-500",    bgLight: "bg-blue-50",    border: "border-blue-300",    text: "text-blue-700",    label: "Blue" },
    { hex: "#10B981", bg: "bg-emerald-500", bgLight: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700", label: "Green" },
    { hex: "#F59E0B", bg: "bg-amber-500",   bgLight: "bg-amber-50",   border: "border-amber-300",   text: "text-amber-700",   label: "Amber" },
    { hex: "#8B5CF6", bg: "bg-violet-500",  bgLight: "bg-violet-50",  border: "border-violet-300",  text: "text-violet-700",  label: "Violet" },
    { hex: "#EC4899", bg: "bg-pink-500",    bgLight: "bg-pink-50",    border: "border-pink-300",    text: "text-pink-700",    label: "Pink" },
    { hex: "#06B6D4", bg: "bg-cyan-500",    bgLight: "bg-cyan-50",    border: "border-cyan-300",    text: "text-cyan-700",    label: "Cyan" },
    { hex: "#F97316", bg: "bg-orange-500",  bgLight: "bg-orange-50",  border: "border-orange-300",  text: "text-orange-700",  label: "Orange" },
    { hex: "#14B8A6", bg: "bg-teal-500",    bgLight: "bg-teal-50",    border: "border-teal-300",    text: "text-teal-700",    label: "Teal" },
    { hex: "#A855F7", bg: "bg-purple-500",  bgLight: "bg-purple-50",  border: "border-purple-300",  text: "text-purple-700",  label: "Purple" },
    { hex: "#EF4444", bg: "bg-red-500",     bgLight: "bg-red-50",     border: "border-red-300",     text: "text-red-700",     label: "Red" },
]

// Unclustered / noise color
export const UNCLUSTERED_COLOR: ClusterColor = {
    hex: "#94A3B8",
    bg: "bg-slate-400",
    bgLight: "bg-slate-50",
    border: "border-slate-300",
    text: "text-slate-600",
    label: "Unclustered",
}

// Depot marker color
export const DEPOT_COLOR = {
    hex: "#1E293B",
    label: "Depot",
}

/**
 * Get a deterministic color for a cluster by index.
 * Wraps around if more clusters than colors.
 */
export function getClusterColor(index: number): ClusterColor {
    return CLUSTER_PALETTE[index % CLUSTER_PALETTE.length]
}

/**
 * Get all palette colors (for legend rendering).
 */
export function getAllClusterColors(): ClusterColor[] {
    return [...CLUSTER_PALETTE]
}

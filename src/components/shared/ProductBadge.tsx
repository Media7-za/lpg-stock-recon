import { Badge } from "@/components/ui/badge"

interface ProductBadgeProps {
    product: {
        code: string;
        name: string;
        weight?: number;
        totalWeight?: number;
    };
    quantity: number;
    variant?: "default" | "outline";
    className?: string;
}

const productDescriptions: Record<string, string> = {
    "SV": "48kg LPG Cylinder (Special Valve)",
    "DV": "48kg LPG Cylinder (Dual Valve)",
    "9KG": "9kg LPG Cylinder",
    "14KG": "14kg LPG Cylinder",
    "19KG": "19kg LPG Cylinder",
    "48KG": "48kg LPG Cylinder",
}

export function ProductBadge({ product, quantity, variant = "secondary" as any, className }: ProductBadgeProps) {
    const description = productDescriptions[product.code] || product.name

    return (
        <span className="group/tooltip relative inline-flex">
            <Badge
                variant={variant as any}
                className={className || "text-[10px] bg-slate-100 text-slate-600 border-none font-medium cursor-help"}
            >
                {quantity}x {product.code}
            </Badge>
            <span className="invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-opacity absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-[11px] rounded-lg whitespace-nowrap z-50 shadow-lg pointer-events-none">
                <span className="font-medium">{description}</span>
                <br />
                <span className="text-gray-300">{product.totalWeight}kg gross · {product.weight}kg gas</span>
                <span className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900" />
            </span>
        </span>
    )
}

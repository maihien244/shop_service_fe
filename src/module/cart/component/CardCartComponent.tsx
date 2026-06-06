import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import type { CartItem } from "../dto"
import { Link } from "@tanstack/react-router"

type CardCartProps = {
    item: CartItem
    checkedItems: Record<string, boolean>
    toggleItem: (id: number) => void
    updateQuantity: (id: number, quantity: number) => void
    removeFromCart: (id: number) => void
    formatPrice: (price: number) => string
    getFileUrl: (key: string) => string
}

export function CardCartComponent({ item, checkedItems, toggleItem, updateQuantity, removeFromCart, formatPrice, getFileUrl }: CardCartProps) {
    const isChecked = checkedItems[item.id] !== false
    return (
        <div
            key={item.id}
            className={`bg-white dark:bg-bg-weak-50 border rounded-2xl p-4 shadow-sm flex gap-3 relative transition-all duration-200 ${isChecked ? 'border-red-200 dark:border-red-950/40 ring-1 ring-red-100 dark:ring-red-950/20' : 'border-gray-200 dark:border-stroke-sub-300'
                }`}
        >
            {/* Item Checkbox */}
            <div className="flex items-center self-center shrink-0">
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleItem(item.id)}
                    className="accent-[#d70018] size-4 rounded cursor-pointer"
                />
            </div>

            {/* Product Thumbnail */}
            <div className="size-20 bg-neutral-50 dark:bg-bg-surface-850 rounded-xl overflow-hidden flex items-center justify-center p-1.5 shrink-0 border border-gray-100 dark:border-transparent">
                {item.imageKey ? (
                    <img
                        src={getFileUrl(item.imageKey)}
                        alt={item.laptopName}
                        className="max-h-full max-w-full object-contain select-none"
                    />
                ) : (
                    <ShoppingBag className="text-gray-300" size={24} />
                )}
            </div>

            {/* Product Meta */}
            <div className="flex-1 space-y-1">
                <Link
                    to={`/public/laptops/${item.laptopSlug}` as any}
                    className="text-xs font-black text-gray-800 dark:text-white hover:text-[#d70018] line-clamp-2 pr-6 block"
                >
                    {item.laptopName}
                </Link>
                <span className="inline-block bg-neutral-100 dark:bg-bg-surface-800 text-[10px] text-gray-500 dark:text-text-soft-400 font-extrabold px-2 py-0.5 rounded-lg">
                    Cấu hình: {item.optionName}
                </span>

                {/* Pricing row */}
                <div className="flex items-baseline gap-2 pt-1 flex-wrap">
                    <span className="text-xs font-black text-[#d70018]">
                        {formatPrice(item.price)}
                    </span>
                    {item.originalPrice > item.price && (
                        <span className="text-[10px] text-gray-400 line-through">
                            {formatPrice(item.originalPrice)}
                        </span>
                    )}
                </div>

                {/* Quantity controls */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-gray-200 dark:border-stroke-sub-300 rounded-lg overflow-hidden h-7 bg-gray-50 dark:bg-bg-surface-850">
                        <button
                            disabled={item.total <= 1}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 h-full hover:bg-gray-150 dark:hover:bg-bg-surface-800 text-gray-500 transition-colors"
                        >
                            <Minus size={11} />
                        </button>
                        <span className="w-8 text-center text-xs font-bold select-none">
                            {item.quantity}
                        </span>
                        <button
                            disabled={item.total <= item.quantity}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 h-full hover:bg-gray-150 dark:hover:bg-bg-surface-800 text-gray-500 transition-colors"
                        >
                            <Plus size={11} />
                        </button>
                    </div>

                    {/* Simulating loyalty promo tag */}
                    <span className="text-[10px] text-green-600 font-bold">
                        Còn lại {item.total} sản phẩm
                    </span>
                </div>
            </div>

            {/* Remove button */}
            <button
                onClick={() => {
                    removeFromCart(item.id)
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                title="Xóa sản phẩm"
            >
                <Trash2 size={15} />
            </button>
        </div>
    )
}
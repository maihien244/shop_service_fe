import type { LaptopResponse } from "../../dto"
import { Link } from "@tanstack/react-router";
import { useFileUrl } from "#/module/attachs/hooks/use-file";
import { useEffect, useState } from "react";

export type LaptopCardProps = {
    laptop: LaptopResponse
    cpuMap: Map<number, string | undefined>
    ramMap: Map<number, string | undefined>
    storageMap: Map<number, string | undefined>
}

export function LaptopCard({ laptop, cpuMap, ramMap, storageMap }: LaptopCardProps) {
    const { getFileUrl } = useFileUrl()
    const [discount, setDiscount] = useState<{ value: string, hasDiscount: boolean }>({ value: '', hasDiscount: false })
    const imgUrl = laptop.attaches && laptop.attaches.length > 0
        ? getFileUrl(laptop.attaches[0].attachMetadata?.keyName || '')
        : undefined

    // Simulated Discounting calculations for CellphoneS feel

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(price)
    }

    useEffect(() => {
        if (laptop.discountType == "PERCENT" && laptop.discountValue) {
            setDiscount({ value: laptop.discountValue + '%', hasDiscount: true })
        } else if (laptop.discountType == "FIXED" && laptop.discountValue) {
            setDiscount({ value: formatPrice(laptop.discountValue), hasDiscount: true })
        } else {
            setDiscount({ value: '', hasDiscount: false })
        }
        console.log("discount", discount)
    }, [laptop])

    return (
        <Link
            to={`/public/laptops/${laptop.slug}`}
            key={laptop.id}
            className="group flex flex-col bg-white dark:bg-bg-weak-50 rounded-2xl p-3 border border-[#e5e7eb] dark:border-stroke-sub-300 shadow-sm hover:shadow-lg transition-all duration-300 relative h-full justify-between"
        >

            {/* Badges Overlay */}
            <div className="absolute top-0 left-0 z-10 flex flex-col items-start gap-1">
                {discount?.hasDiscount && (
                    <span className="bg-[#d70018] text-white px-2 py-0.5 rounded-br-lg rounded-tl-2xl text-[9px] font-extrabold shadow-sm">
                        Giảm {discount.value}
                    </span>
                )}
            </div>

            <span className="absolute top-3 right-3 z-10 border border-blue-400 dark:border-blue-700 text-blue-600 dark:text-blue-400 text-[8px] font-extrabold px-1 py-0.5 rounded bg-blue-50/50 dark:bg-bg-surface-850 backdrop-blur-sm select-none">
                Trả góp 0%
            </span>

            {/* Thumbnail Image Section */}
            <div className="relative w-full aspect-square flex items-center justify-center pt-3 pb-3 overflow-hidden bg-neutral-50/50 dark:bg-bg-surface-850 rounded-xl">
                {imgUrl ? (
                    <img
                        src={imgUrl}
                        alt={laptop.name}
                        className="w-[85%] h-auto object-contain transition-transform duration-300 group-hover:scale-105 select-none"
                    />
                ) : (
                    <div className="text-gray-400 text-[10px] font-semibold">Chưa có hình ảnh</div>
                )}
            </div>

            {/* Tech Specs tags directly under image */}
            <div className="mt-3 flex flex-wrap gap-1">
                {cpuMap.get(laptop.cpuId) && (
                    <span className="text-[9px] font-bold text-gray-600 dark:text-text-soft-400 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-bg-surface-800">
                        {cpuMap.get(laptop.cpuId)}
                    </span>
                )}
                {ramMap.get(laptop.ramId) && (
                    <span className="text-[9px] font-bold text-gray-600 dark:text-text-soft-400 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-bg-surface-800">
                        {ramMap.get(laptop.ramId)}
                    </span>
                )}
                {storageMap.get(laptop.storageId) && (
                    <span className="text-[9px] font-bold text-gray-600 dark:text-text-soft-400 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-bg-surface-800">
                        {storageMap.get(laptop.storageId)}
                    </span>
                )}
            </div>

            {/* Laptop Title */}
            <h3 className="mt-2 text-xs md:text-sm font-bold text-gray-800 dark:text-white line-clamp-2 h-[40px] leading-relaxed group-hover:text-[#d70018] transition-colors" title={laptop.name}>
                {laptop.name}
            </h3>

            {/* Pricing Box */}
            <div className="mt-2.5 flex items-baseline flex-wrap gap-x-2">
                <span className="text-xs md:text-sm font-extrabold text-[#d70018]">
                    {formatPrice(laptop.price)}
                </span>
                <span className="text-[10px] text-gray-400 line-through font-normal">
                    {formatPrice(laptop.originalPrice)}
                </span>
            </div>

            {/* Loyalty Smember Discounts
            <div className="mt-2.5 space-y-1">
                <div className="bg-[#f0f4f8] dark:bg-bg-surface-800 text-[#1a56db] dark:text-blue-400 text-[9px] font-bold px-2 py-1 rounded flex justify-between items-center leading-snug">
                    <span>Smember giảm thêm:</span>
                    <span>-1%</span>
                </div>
                <div className="bg-[#eef2ff] dark:bg-bg-surface-800 text-[#4f46e5] dark:text-purple-400 text-[9px] font-bold px-2 py-1 rounded flex justify-between items-center leading-snug">
                    <span>S-Student giảm thêm:</span>
                    <span>-3%</span>
                </div>
            </div> */}

            {/* Footer Row (Star Rating & Favorite / View details button) */}
            <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-stroke-sub-300 flex items-center justify-between">

                {/* Inline Star Rating */}
                <div className="flex items-center gap-0.5 text-[10px] font-extrabold text-yellow-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z" />
                    </svg>
                    <span className="ml-0.5 text-gray-600 dark:text-text-soft-400">5.0 (20)</span>
                </div>

                {/* View Details Link Styled as a Red Border Button */}
                <Link
                    to={`/public/laptops/${laptop.slug}` as any}
                    className="text-[10px] font-bold border border-[#d70018] text-[#d70018] hover:bg-[#d70018] hover:text-white px-2.5 py-1 rounded-lg transition-all duration-200"
                >
                    Chi tiết
                </Link>

            </div>

        </Link>
    )
}
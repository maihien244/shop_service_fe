import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { OrderService } from '../service/order-service'
import { useFileUrl } from '#/module/attachs/hooks/use-file'
import {
    ChevronLeft,
    ShoppingBag,
    CreditCard,
    Loader2,
    ChevronRight,
    Calendar
} from 'lucide-react'
import { PaymentStatus, ProcessStatus } from '../dto'
import { PaymentType } from '#/module/cart/dto'

export function ListOrderComponent() {
    const orderService = useMemo(() => new OrderService(), [])
    const { getFileUrl } = useFileUrl()

    const { data, isLoading, error } = useQuery({
        queryKey: ['user-orders'],
        queryFn: () => orderService.getListOrder(),
    })

    // Filter States
    const [selectedTab, setSelectedTab] = useState<keyof typeof ProcessStatus>(ProcessStatus.MOI.value as keyof typeof ProcessStatus)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [searchQuery] = useState('')

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(price)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        })
    }

    const filteredOrders = useMemo(() => {
        if (!data?.results) return []

        return data.results.filter((order) => {
            if (order.status !== selectedTab) {
                return false
            }

            // 2. Date Range filter
            if (startDate) {
                const start = new Date(startDate)
                start.setHours(0, 0, 0, 0)
                const orderDate = new Date(order.createAt)
                if (orderDate < start) return false
            }
            if (endDate) {
                const end = new Date(endDate)
                end.setHours(23, 59, 59, 999)
                const orderDate = new Date(order.createAt)
                if (orderDate > end) return false
            }

            return true
        })
    }, [data, selectedTab, startDate, endDate, searchQuery])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f4f6f8] dark:bg-bg-white-0 flex flex-col justify-center items-center p-4">
                <div className="bg-white dark:bg-bg-weak-50 border border-neutral-200 dark:border-stroke-sub-300 rounded-2xl p-8 max-w-md w-full text-center shadow-sm space-y-6">
                    <div className="size-16 rounded-full bg-red-50 dark:bg-red-950/20 text-[#d70018] flex items-center justify-center mx-auto animate-pulse">
                        <Loader2 size={32} className="animate-spin" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Đang tải lịch sử mua hàng...</h2>
                        <p className="text-xs text-gray-500 dark:text-text-soft-400">
                            Vui lòng chờ trong giây lát.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[#f4f6f8] dark:bg-bg-white-0 flex flex-col justify-center items-center p-4">
                <div className="bg-white dark:bg-bg-weak-50 border border-neutral-200 dark:border-stroke-sub-300 rounded-2xl p-8 max-w-md w-full text-center shadow-sm space-y-6">
                    <div className="size-16 rounded-full bg-red-50 dark:bg-red-955/20 text-[#d70018] flex items-center justify-center mx-auto">
                        <ShoppingBag size={32} className="stroke-[1.5]" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Không thể tải dữ liệu</h2>
                        <p className="text-xs text-gray-500 dark:text-text-soft-400">
                            Có lỗi xảy ra khi lấy danh sách đơn hàng. Vui lòng thử lại sau.
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-[#d70018] hover:bg-red-700 text-white font-bold text-sm py-3 rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                        Tải lại trang
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f4f6f8] text-[#1f2937] dark:bg-bg-white-0 dark:text-static-white py-8 px-4 transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-5">

                {/* Navigation Breadcrumb */}
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <Link to="/public/laptops" className="hover:text-[#d70018] flex items-center gap-1 transition-all">
                        <ChevronLeft size={16} /> Trang chủ
                    </Link>
                    <span className="text-gray-300">/</span>
                    <span className="text-[#d70018] font-black">Lịch sử mua hàng</span>
                </div>

                <h1 className="text-xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">
                    Lịch sử mua hàng
                </h1>

                {/* Smember Tabs Navigation */}
                <div className="bg-white dark:bg-bg-weak-50 border border-neutral-200 dark:border-stroke-sub-300 rounded-xl overflow-hidden shadow-sm">
                    <div className="flex overflow-x-auto scrollbar-none divide-x divide-neutral-100 dark:divide-stroke-sub-300 border-b border-neutral-150 dark:border-stroke-sub-300">
                        {Object.values(ProcessStatus).map((tab, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedTab(tab.value as keyof typeof ProcessStatus)}
                                className={`flex-1 min-w-[100px] text-center py-3 text-xs font-bold transition-all relative shrink-0 outline-none ${selectedTab === tab.value
                                    ? 'text-[#d70018] bg-red-50/10 dark:bg-red-955/5'
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                {tab.label}
                                {selectedTab === tab.value && (
                                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#d70018]" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Search and Date Range Filter Container */}
                    <div className="p-4 flex items-center justify-end">

                        {/* Date Inputs */}
                        <div className="md:col-span-6 flex items-center justify-end gap-2 text-xs font-bold text-gray-500 w-full">
                            <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-bg-surface-850 border border-neutral-200 dark:border-stroke-sub-300 rounded-xl px-2.5 py-1.5 w-full md:w-auto">
                                <span className="text-[10px] text-gray-400 uppercase font-black shrink-0">Từ ngày</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-transparent focus:outline-none text-gray-800 dark:text-white select-none text-[11px] font-bold"
                                />
                            </div>
                            <span className="text-neutral-300 hidden md:inline">→</span>
                            <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-bg-surface-850 border border-neutral-200 dark:border-stroke-sub-300 rounded-xl px-2.5 py-1.5 w-full md:w-auto">
                                <span className="text-[10px] text-gray-400 uppercase font-black shrink-0">Đến ngày</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-transparent focus:outline-none text-gray-800 dark:text-white select-none text-[11px] font-bold"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders list */}
                <div className="space-y-4">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white dark:bg-bg-weak-50 border border-neutral-200 dark:border-stroke-sub-300 rounded-xl p-12 text-center shadow-sm">
                            <ShoppingBag size={40} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-xs text-gray-500 font-bold">Không tìm thấy đơn hàng nào phù hợp với bộ lọc.</p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => {
                            const firstItem = order.orderDetails[0]
                            const hasMoreItems = order.orderDetails.length > 1

                            return (
                                <div
                                    key={order.id}
                                    className="bg-white dark:bg-bg-weak-50 border border-neutral-200 dark:border-stroke-sub-300 rounded-xl p-4 md:p-5 shadow-sm space-y-4 hover:shadow-md transition-all animate-slide-up"
                                >
                                    {/* Order Card Header */}
                                    <div className="flex items-center justify-between border-b border-neutral-100 dark:border-stroke-sub-300 pb-3">
                                        <div className="space-y-0.5">
                                            <h4 className="text-xs font-black text-gray-800 dark:text-white">
                                                Đơn hàng: <span className="text-[#d70018]">#{order.id}</span>
                                            </h4>
                                            <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                                <Calendar size={11} />
                                                Ngày đặt hàng: {formatDate(order.createAt)}
                                            </p>
                                        </div>
                                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${PaymentStatus[order.paymentStatus as keyof typeof PaymentStatus].colorClass}`}>
                                            {PaymentStatus[order.paymentStatus as keyof typeof PaymentStatus].label}
                                        </span>
                                    </div>

                                    {/* Product Details Section */}
                                    {firstItem && (
                                        <div className="flex gap-4">
                                            {/* Product Thumbnail */}
                                            <div className="size-16 bg-neutral-50 dark:bg-bg-surface-850 rounded-lg overflow-hidden flex items-center justify-center p-1 shrink-0 border border-neutral-200 dark:border-transparent">
                                                {firstItem.imageKey ? (
                                                    <img
                                                        src={getFileUrl(firstItem.imageKey)}
                                                        alt={firstItem.name}
                                                        className="max-h-full max-w-full object-contain select-none"
                                                    />
                                                ) : (
                                                    <ShoppingBag className="text-gray-300" size={24} />
                                                )}
                                            </div>

                                            {/* Product Information */}
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <Link
                                                    to={`/public/laptops/${firstItem.laptopSlug}` as any}
                                                    className="text-xs font-black text-gray-800 dark:text-white hover:text-[#d70018] line-clamp-2 pr-6 block"
                                                >
                                                    {firstItem.laptopName}
                                                </Link>
                                                <span className="inline-block bg-neutral-100 dark:bg-bg-surface-800 text-[10px] text-gray-500 dark:text-text-soft-400 font-extrabold px-2 py-0.5 rounded-lg">
                                                    Cấu hình: {firstItem.name}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-800 dark:text-white">
                                                        {formatPrice(order.total / order.orderDetails.reduce((acc, curr) => acc + curr.quantity, 0))}
                                                    </span>
                                                </div>
                                                {hasMoreItems && (
                                                    <span className="inline-block bg-neutral-100 dark:bg-bg-surface-850 text-gray-500 text-[9px] font-black px-1.5 py-0.5 rounded uppercase mt-1">
                                                        Cùng {order.orderDetails.length - 1} sản phẩm khác
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Card Footer */}
                                    <div className="flex items-center justify-between border-t border-neutral-100 dark:border-stroke-sub-300 pt-3">
                                        {/* Payment/Shipping summary */}
                                        <div className="text-[10px] text-gray-400 font-bold flex items-center gap-2">
                                            <span className="flex items-center gap-0.5">
                                                <CreditCard size={12} className="text-gray-400" />
                                                {PaymentType[order.paymentType]?.label || order.paymentType}
                                            </span>
                                        </div>

                                        {/* Pricing summary & View link */}
                                        <div className="text-right space-y-1">
                                            <div className="text-xs font-bold text-gray-500">
                                                Tổng thanh toán:{' '}
                                                <span className="text-sm font-black text-[#d70018]">{formatPrice(order.total)}</span>
                                            </div>
                                            <Link
                                                to={`/users/orders/${order.id}` as any}
                                                className="text-[11px] font-bold text-gray-400 hover:text-[#d70018] flex items-center justify-end gap-0.5 transition-all cursor-pointer"
                                            >
                                                Xem chi tiết <ChevronRight size={13} />
                                            </Link>
                                        </div>
                                    </div>

                                </div>
                            )
                        })
                    )}
                </div>

            </div>
        </div>
    )
}

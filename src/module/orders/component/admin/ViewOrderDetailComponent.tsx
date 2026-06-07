import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { OrderService } from '../../service/order-service'
import { useFileUrl } from '#/module/attachs/hooks/use-file'
import {
    ChevronLeft,
    ShoppingBag,
    Calendar,
    CreditCard,
    User,
    Loader2,
    CheckCircle2
} from 'lucide-react'
import { PaymentType } from '#/module/cart/dto'
import { PaymentStatus, ProcessStatus } from '../../dto'
import { RiPushpinFill } from '@remixicon/react'
import * as Tag from '@/components/ui/tag'
import { AdminOrderService } from '../../service/admin-order-service'

export function ViewOrderDetailComponent({ orderId }: { orderId: number }) {
    const orderService = useMemo(() => new AdminOrderService(), [])
    const { getFileUrl } = useFileUrl()

    const { data: order, isLoading, error } = useQuery({
        queryKey: ['order-detail', orderId],
        queryFn: () => {
            if (!orderId) return Promise.reject(new Error('Mã đơn hàng không hợp lệ'))
            return orderService.getOrder(orderId)
        },
        enabled: !!orderId,
    })

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(price)
    }

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getWarrantyDate = (dateString: string) => {
        const d = new Date(dateString)
        d.setFullYear(d.getFullYear() + 2) // 24 Months Warranty
        return d.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        })
    }

    const calculateTotal = useMemo(() => {
        return order?.orderDetails.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
    }, [order])

    const calculatedDiscount = useMemo(() => {
        return (calculateTotal || 0) - (order?.total || 0)
    }, [order?.total, calculateTotal])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f4f6f8] dark:bg-bg-white-0 flex flex-col justify-center items-center p-4">
                <div className="bg-white dark:bg-bg-weak-50 border border-neutral-200 dark:border-stroke-sub-300 rounded-2xl p-8 max-w-md w-full text-center shadow-sm space-y-6 animate-pulse">
                    <div className="size-16 rounded-full bg-red-50 dark:bg-red-955/20 text-[#d70018] flex items-center justify-center mx-auto">
                        <Loader2 size={32} className="animate-spin" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Đang tải chi tiết đơn hàng...</h2>
                        <p className="text-xs text-gray-500 dark:text-text-soft-400">
                            Vui lòng chờ trong giây lát.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-[#f4f6f8] dark:bg-bg-white-0 flex flex-col justify-center items-center p-4">
                <div className="bg-white dark:bg-bg-weak-50 border border-neutral-200 dark:border-stroke-sub-300 rounded-2xl p-8 max-w-md w-full text-center shadow-sm space-y-6">
                    <div className="size-16 rounded-full bg-red-50 dark:bg-red-955/20 text-[#d70018] flex items-center justify-center mx-auto">
                        <ShoppingBag size={32} className="stroke-[1.5]" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Không tìm thấy đơn hàng</h2>
                        <p className="text-xs text-gray-500 dark:text-text-soft-400">
                            Không thể tìm thấy thông tin đơn hàng #{orderId} hoặc đã xảy ra lỗi.
                        </p>
                    </div>
                    <Link
                        to="/admin/orders"
                        className="block w-full bg-[#d70018] text-white font-bold text-sm py-3 rounded-xl shadow-sm hover:bg-red-700 active:scale-[0.98] transition-all uppercase tracking-wider text-center cursor-pointer"
                    >
                        Quay lại danh sách đơn hàng
                    </Link>
                </div>
            </div>
        )
    }

    const orderStatus = ProcessStatus[order.status];
    const totalQuantity = order.orderDetails.reduce((sum, item) => sum + item.quantity, 0)

    // Timeline Step definition
    const timelineSteps = [
        { label: 'Đặt hàng thành công', desc: 'Đơn hàng được khởi tạo thành công' },
        { label: 'Xác nhận đơn hàng', desc: 'Hệ thống xác thực thông tin giao dịch' },
        { label: 'Đang giao hàng', desc: 'Đang vận chuyển sản phẩm đến địa chỉ của bạn' },
        { label: 'Đã nhận hàng', desc: 'Giao hàng thành công và ký nhận' }
    ]

    return (
        <div className="h-full overflow-y-auto scrollbar-hide bg-[#f4f6f8] text-[#1f2937] dark:bg-bg-white-0 dark:text-static-white py-8 px-4 transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-5">

                {/* Navigation Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <Link to="/admin/orders" className="hover:text-[#d70018] flex items-center gap-1 transition-all">
                        <ChevronLeft size={16} /> Quản lý đơn hàng
                    </Link>
                    <span className="text-gray-300">/</span>
                    <span className="text-[#d70018] font-black">Chi tiết đơn hàng #{order.id}</span>
                </div>

                {/* Section 1: Overview Card */}
                <div className="bg-white dark:bg-bg-weak-50 border border-neutral-200 dark:border-stroke-sub-300 rounded-xl p-5 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-stroke-sub-300 pb-4">
                        <div className="space-y-1">
                            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
                                Đơn hàng: <span className="text-[#d70018]">#WB{order.id}</span>
                            </h2>
                            <p className="text-[11px] text-gray-400 font-bold flex items-center gap-1">
                                <Calendar size={13} />
                                Ngày đặt hàng: {formatDateTime(order.createAt)}
                            </p>
                        </div>
                        <div className='flex flex-row gap-2'>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-black px-3 py-1.5 rounded-full ${orderStatus.colorClass}`}>
                                    {orderStatus.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-black px-3 py-1.5 rounded-full ${PaymentStatus[order.paymentStatus as keyof typeof PaymentStatus].colorClass}`}>
                                    {PaymentStatus[order.paymentStatus as keyof typeof PaymentStatus].label}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Product list */}
                    <div className="divide-y divide-neutral-100 dark:divide-stroke-sub-300">
                        {order.orderDetails.map((item) => (
                            <div key={item.id} className='my-2'>
                                <div className="first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="flex gap-3.5 items-center">
                                        <div className="size-16 bg-neutral-50 dark:bg-bg-surface-850 rounded-lg overflow-hidden flex items-center justify-center p-1 border border-neutral-200 dark:border-transparent shrink-0">
                                            {item.imageKey ? (
                                                <img
                                                    src={getFileUrl(item.imageKey)}
                                                    alt={item.name}
                                                    className="max-h-full max-w-full object-contain select-none"
                                                />
                                            ) : (
                                                <ShoppingBag className="text-gray-300" size={24} />
                                            )}
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <Link
                                                to={`/public/laptops/${item.laptopSlug}` as any}
                                                className="text-xs font-black text-gray-800 dark:text-white hover:text-[#d70018] line-clamp-2 pr-6 block"
                                            >
                                                {item.laptopName}
                                            </Link>
                                            <div className="flex flex-row gap-2 items-center">
                                                <span className="inline-block bg-neutral-100 dark:bg-bg-surface-800 text-[10px] text-gray-500 dark:text-text-soft-400 font-extrabold px-2 py-0.5 rounded-lg">
                                                    Cấu hình: {item.name}
                                                </span>
                                                <span className="bg-neutral-100 dark:bg-bg-surface-850 text-gray-500 dark:text-text-soft-400 text-[9px] font-black px-1.5 py-0.5 rounded">
                                                    Phiên bản chuẩn
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-semibold">
                                                    Bảo hành đến: {getWarrantyDate(order.createAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-50">
                                        <div className="text-left sm:text-right">
                                            <span className="text-xs font-black text-gray-800 dark:text-white block">
                                                {formatPrice((item.price || 0))}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-semibold block">
                                                Số lượng: {item.quantity}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className='py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                                    {item.serialNumbers?.map((sn, idx) => (
                                        <Tag.Root key={idx} variant='stroke'>
                                            <Tag.Icon as={RiPushpinFill} />
                                            {sn}
                                        </Tag.Root>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 2: Order Status Stepper */}
                {orderStatus.value !== 'HUY' && (
                    <div className="bg-white dark:bg-bg-weak-50 border border-neutral-200 dark:border-stroke-sub-300 rounded-xl p-5 shadow-sm space-y-4">
                        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                            Trạng thái vận chuyển
                        </h3>

                        {/* Desktop Stepper */}
                        <div className="hidden md:flex items-center justify-between relative px-8 py-4">
                            <div className="absolute top-[37px] left-20 right-20 h-0.5 bg-neutral-200 dark:bg-stroke-sub-300 z-0">
                                <div
                                    className="h-full bg-[#d70018] transition-all duration-500"
                                    style={{ width: `${Math.max(0, (orderStatus.order - 1) * 33.3)}%` }}
                                />
                            </div>

                            {Object.values(ProcessStatus).map((step, idx) => {
                                const stepNum = step.order
                                const isCompleted = stepNum <= orderStatus.order
                                const isActive = stepNum === orderStatus.order
                                const isCancelled = step.value === ProcessStatus.HUY.value

                                return (
                                    !isCancelled && <div key={idx} className="flex flex-col items-center text-center space-y-2 z-10 w-24">
                                        <div
                                            className={`size-10 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted
                                                ? 'bg-[#d70018] border-[#d70018] text-white shadow-sm'
                                                : 'bg-white dark:bg-bg-weak-50 border-neutral-200 dark:border-stroke-sub-300 text-gray-400'
                                                }`}
                                        >
                                            {isCompleted ? <CheckCircle2 size={18} /> : <span className="text-xs font-extrabold">{stepNum}</span>}
                                        </div>
                                        <span
                                            className={`text-[10px] font-black leading-tight ${isActive
                                                ? 'text-[#d70018]'
                                                : isCompleted
                                                    ? 'text-gray-800 dark:text-white'
                                                    : 'text-gray-400'
                                                }`}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Mobile Stepper (Vertical Timeline) */}
                        <div className="flex md:hidden flex-col gap-5 pl-4 py-2 relative">
                            <div className="absolute top-4 bottom-4 left-[27px] w-0.5 bg-neutral-200 dark:bg-stroke-sub-300">
                                <div
                                    className="w-full bg-[#d70018] transition-all duration-500"
                                    style={{ height: `${Math.max(0, (orderStatus.order - 1) * 33.3)}%` }}
                                />
                            </div>

                            {timelineSteps.map((step, idx) => {
                                const stepNum = idx + 1
                                const isCompleted = stepNum <= orderStatus.order
                                const isActive = stepNum === orderStatus.order

                                return (
                                    <div key={step.label} className="flex gap-4 items-start relative z-10">
                                        <div
                                            className={`size-7 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${isCompleted
                                                ? 'bg-[#d70018] border-[#d70018] text-white'
                                                : 'bg-white dark:bg-bg-weak-50 border-neutral-200 dark:border-stroke-sub-300 text-gray-400'
                                                }`}
                                        >
                                            {isCompleted ? <CheckCircle2 size={13} /> : <span className="text-[10px] font-extrabold">{stepNum}</span>}
                                        </div>
                                        <div className="space-y-0.5 pt-0.5">
                                            <span
                                                className={`text-xs font-black block leading-none ${isActive
                                                    ? 'text-[#d70018]'
                                                    : isCompleted
                                                        ? 'text-gray-800 dark:text-white'
                                                        : 'text-gray-400'
                                                    }`}
                                            >
                                                {step.label}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-semibold block leading-tight">
                                                {step.desc}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Section 3: Details Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">

                    {/* Left Column: Customer details */}
                    <div className="w-full md:col-span-7 space-y-4">

                        {/* Customer Info Card */}
                        <div className="bg-white dark:bg-bg-weak-50 border border-neutral-200 dark:border-stroke-sub-300 rounded-xl p-5 shadow-sm space-y-4">
                            <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5 border-b border-neutral-100 dark:border-stroke-sub-300 pb-3">
                                <User size={14} className="text-[#d70018]" />
                                Thông tin nhận hàng
                            </h3>

                            <div className="space-y-3.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
                                <div className="flex justify-between border-b border-neutral-50 dark:border-transparent pb-2">
                                    <span className="text-gray-400 font-medium">Họ và tên khách hàng</span>
                                    <span className="text-gray-900 dark:text-white font-extrabold text-right">{order.fullName}</span>
                                </div>
                                <div className="flex justify-between border-b border-neutral-50 dark:border-transparent pb-2">
                                    <span className="text-gray-400 font-medium">Số điện thoại liên hệ</span>
                                    <span className="text-gray-900 dark:text-white font-extrabold text-right">{order.phoneNumber}</span>
                                </div>
                                {order.email && (
                                    <div className="flex justify-between border-b border-neutral-50 dark:border-transparent pb-2">
                                        <span className="text-gray-400 font-medium">Địa chỉ email</span>
                                        <span className="text-gray-900 dark:text-white font-extrabold text-right">{order.email}</span>
                                    </div>
                                )}
                                <div className="space-y-1 pt-1.5 border-t border-neutral-100 dark:border-stroke-sub-300">
                                    <span className="text-gray-400 font-medium block">Yêu cầu giao hàng khác</span>
                                    <p className="italic font-bold text-gray-700 dark:text-gray-300">{(order as any).notes || "Không có ghi chú nào khác."}</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Billing and payment */}
                    <div className="w-full md:col-span-5 space-y-4">

                        {/* Billing summary card */}
                        <div className="bg-white dark:bg-bg-weak-50 border border-neutral-200 dark:border-stroke-sub-300 rounded-xl shadow-sm overflow-hidden">
                            <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5 p-4 border-b border-neutral-100 dark:border-stroke-sub-300">
                                <CreditCard size={14} className="text-[#d70018]" />
                                Thông tin thanh toán
                            </h3>

                            <div className="divide-y divide-neutral-100 dark:divide-stroke-sub-300">
                                {/* Header row 1 */}
                                <div className="bg-neutral-50/50 dark:bg-bg-surface-850/50 px-4 py-1.5 text-[10px] text-gray-400 font-black uppercase">
                                    Sản phẩm
                                </div>

                                <div className="px-4 py-3 space-y-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 font-medium">Số lượng sản phẩm:</span>
                                        <span className="text-gray-900 dark:text-white font-extrabold">{totalQuantity}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 font-medium">Tổng tiền hàng:</span>
                                        <span className="text-gray-900 dark:text-white font-extrabold">{formatPrice(calculateTotal || 0)}</span>
                                    </div>
                                </div>

                                {/* Header row 2 */}
                                <div className="bg-neutral-50/50 dark:bg-bg-surface-850/50 px-4 py-1.5 text-[10px] text-gray-400 font-black uppercase">
                                    Thanh toán
                                </div>

                                <div className="px-4 py-3.5 space-y-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
                                    {calculatedDiscount > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-400 font-medium">Giảm giá voucher:</span>
                                            <span className="text-emerald-600 font-extrabold">{formatPrice(calculatedDiscount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 font-medium">Phí giao hàng:</span>
                                        <span className="text-emerald-600 font-extrabold">Miễn phí</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 font-medium">Hình thức thanh toán:</span>
                                        <span className="text-gray-800 dark:text-white font-extrabold">
                                            {PaymentType[order.paymentType].label}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-0.5 border-t border-neutral-100 dark:border-stroke-sub-300 pt-2.5">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-xs font-black text-gray-800 dark:text-white">Tổng tiền thanh toán:</span>
                                            <span className="text-base font-black text-[#d70018]">{formatPrice(order.total)}</span>
                                        </div>
                                        <span className="text-[9px] text-gray-400 font-semibold block leading-tight mt-0.5">
                                            (Giá trị đơn hàng đã bao gồm thuế giá trị gia tăng VAT)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA action buttons */}
                        <div className="space-y-3">
                            <Link
                                to="/admin/orders"
                                className="w-full border-2 border-neutral-200 dark:border-stroke-sub-300 text-gray-500 hover:text-gray-800 dark:hover:text-white font-bold text-xs py-3 rounded-xl shadow-sm active:scale-[0.98] transition-all uppercase tracking-wider text-center block cursor-pointer"
                            >
                                Quay lại danh sách đơn hàng
                            </Link>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}

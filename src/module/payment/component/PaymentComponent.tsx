import { useEffect, useMemo, useState, useRef } from "react"
import { PaymentService } from "../service/payment-service"
import type { PaymentDto } from "../dto"
import { useMutation } from "@tanstack/react-query"
import { CreditCard, ArrowRight, Loader2, ShieldCheck, AlertCircle } from "lucide-react"
import { getRouteApi } from "@tanstack/react-router"

// Define the ordered list of fields to sign/submit to match SePay's signature verification order.
const SEPAY_FIELDS_ORDER = [
    "order_amount",
    "merchant",
    "currency",
    "operation",
    "order_description",
    "order_invoice_number",
    "customer_id",
    "payment_method",
    "success_url",
    "error_url",
    "cancel_url"
]

export function PaymentComponent() {
    const route = getRouteApi('/users/payment/$orderId')
    const { orderId } = route.useParams() as { orderId: number }
    const paymentService = useMemo(() => new PaymentService(), [])
    const [paymentDto, setPaymentDto] = useState<PaymentDto>()
    const [countdown, setCountdown] = useState(3)
    const [isRedirecting, setIsRedirecting] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const formRef = useRef<HTMLFormElement>(null)
    const checkoutURL = import.meta.env.VITE_SEPAY_URL || 'https://pay-sandbox.sepay.vn/v1/checkout/init'

    const paymentMutation = useMutation<PaymentDto>({
        mutationFn: (orderId: number) => paymentService.createPayment(orderId),
        onSuccess: (data) => {
            console.log("Payment initialization success:", data)
            setPaymentDto(data)
        },
        onError: (err: any) => {
            console.error("Payment initialization failed:", err)
            setErrorMsg(err?.message || "Không thể khởi tạo giao dịch thanh toán. Vui lòng thử lại sau.")
        }
    })

    useEffect(() => {
        if (orderId) {
            paymentMutation.mutateAsync(orderId)
        }
    }, [orderId])

    useEffect(() => {
        if (!paymentDto) return

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    setIsRedirecting(true)
                    // Auto submit form to redirect to SePay gateway
                    setTimeout(() => {
                        formRef.current?.submit()
                    }, 500)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [paymentDto])

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(price)
    }

    if (errorMsg) {
        return (
            <div className="min-h-screen bg-[#f4f6f9] dark:bg-bg-white-0 flex flex-col justify-center items-center p-4">
                <div className="bg-white dark:bg-bg-weak-50 border border-red-200 dark:border-red-950/30 rounded-3xl p-8 max-w-md w-full text-center shadow-lg space-y-6 animate-fade-in">
                    <div className="size-16 rounded-full bg-red-50 dark:bg-red-950/20 text-red-600 flex items-center justify-center mx-auto">
                        <AlertCircle size={32} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Lỗi thanh toán</h2>
                        <p className="text-xs text-gray-500 dark:text-text-soft-400">
                            {errorMsg}
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-[#d70018] hover:bg-red-700 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow transition-all cursor-pointer"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        )
    }

    if (!paymentDto) {
        return (
            <div className="min-h-screen bg-[#f4f6f9] dark:bg-bg-white-0 flex flex-col justify-center items-center p-4">
                <div className="bg-white dark:bg-bg-weak-50 border border-gray-200 dark:border-stroke-sub-300 rounded-3xl p-8 max-w-md w-full text-center shadow-lg space-y-6">
                    <div className="size-16 rounded-full bg-red-50 dark:bg-red-950/20 text-[#d70018] flex items-center justify-center mx-auto animate-pulse">
                        <Loader2 size={32} className="animate-spin" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Đang kết nối cổng thanh toán...</h2>
                        <p className="text-xs text-gray-500 dark:text-text-soft-400">
                            Hệ thống đang thiết lập giao dịch an toàn với SePay. Vui lòng chờ trong giây lát.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f4f6f9] dark:bg-bg-white-0 flex flex-col justify-center items-center p-4">
            <div className="bg-white dark:bg-bg-weak-50 border border-gray-200 dark:border-stroke-sub-300 rounded-3xl p-8 max-w-md w-full text-center shadow-lg space-y-6 transition-all duration-300">

                {/* Visual Header */}
                <div className="relative">
                    <div className="size-16 rounded-full bg-red-50 dark:bg-red-950/20 text-[#d70018] flex items-center justify-center mx-auto">
                        {isRedirecting ? (
                            <Loader2 size={32} className="animate-spin" />
                        ) : (
                            <CreditCard size={32} />
                        )}
                    </div>
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1 shadow">
                        <ShieldCheck size={14} />
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                        {isRedirecting ? "Đang chuyển hướng..." : "Xác nhận thanh toán"}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-text-soft-400">
                        {isRedirecting
                            ? "Vui lòng không đóng trình duyệt hoặc tải lại trang."
                            : `Hệ thống sẽ tự động chuyển hướng đến SePay sau ${countdown} giây.`
                        }
                    </p>
                </div>

                {/* Progress Bar */}
                {!isRedirecting && (
                    <div className="w-full bg-gray-100 dark:bg-bg-surface-850 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="bg-[#d70018] h-full transition-all duration-1000 ease-linear"
                            style={{ width: `${(countdown / 3) * 100}%` }}
                        />
                    </div>
                )}

                {/* Transaction details card */}
                <div className="text-left text-xs space-y-3 border border-gray-150 dark:border-stroke-sub-300 p-4 rounded-2xl bg-neutral-50 dark:bg-bg-surface-850">
                    <div className="flex justify-between border-b border-gray-200 dark:border-stroke-sub-300 pb-2">
                        <span className="text-gray-400 font-bold uppercase text-[10px]">Mã hóa đơn</span>
                        <span className="font-extrabold text-gray-800 dark:text-white">{paymentDto.order_invoice_number}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-stroke-sub-300 pb-2">
                        <span className="text-gray-400 font-bold uppercase text-[10px]">Phương thức</span>
                        <span className="font-bold text-gray-800 dark:text-white">Chuyển khoản SePay</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-stroke-sub-300 pb-2">
                        <span className="text-gray-400 font-bold uppercase text-[10px]">Mô tả</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300 line-clamp-1">{paymentDto.order_description || "Thanh toán đơn hàng"}</span>
                    </div>
                    <div className="flex justify-between pt-1 items-center">
                        <span className="text-gray-400 font-black uppercase text-[10px]">Số tiền cần thanh toán</span>
                        <span className="text-base font-black text-[#d70018]">{formatPrice(paymentDto.order_amount)}</span>
                    </div>
                </div>

                {/* Submit Form */}
                <form ref={formRef} action={checkoutURL} method="POST" className="pt-2">
                    {/* Render fields in SePay's expected order */}
                    {SEPAY_FIELDS_ORDER.map(field => {
                        const val = paymentDto[field as keyof PaymentDto]
                        if (val !== undefined && val !== null) {
                            return (
                                <input
                                    key={field}
                                    type="hidden"
                                    name={field}
                                    value={val}
                                />
                            )
                        }
                        return null
                    })}

                    {/* Always include signature */}
                    {paymentDto.signature && (
                        <input
                            type="hidden"
                            name="signature"
                            value={paymentDto.signature}
                        />
                    )}

                    <button
                        type="submit"
                        disabled={isRedirecting}
                        onClick={() => setIsRedirecting(true)}
                        className="w-full bg-[#d70018] hover:bg-red-700 active:scale-[0.98] text-white font-extrabold text-sm py-4 rounded-2xl shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        <span>{isRedirecting ? "Đang chuyển hướng..." : "Thanh toán ngay"}</span>
                        {!isRedirecting && <ArrowRight size={16} />}
                    </button>
                </form>

            </div>
        </div>
    )
}
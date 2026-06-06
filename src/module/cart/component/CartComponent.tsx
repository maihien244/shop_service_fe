import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useCart } from '../hooks/use-cart'
import { useFileUrl } from '#/module/attachs/hooks/use-file'
import { useToast } from '#/lib/toast/use-toast'
import * as Input from '#/components/ui/input'
import {
  ChevronLeft,
  Trash2,
  Percent,
  ShoppingBag
} from 'lucide-react'
import { CardCartComponent } from './CardCartComponent'
import { OrderComponent } from './OrderComponent'
import { PublicDiscountService } from '#/module/discounts/service/public-discount-service'
import { useMutation } from '@tanstack/react-query'
import type { DiscountResponse } from '#/module/discounts/dto'
import { PaymentType, ShipmentType, type CreateOrderRequest, type CustomerInfo } from '../dto'
import { GenderType } from '#/module/auth/dto'
import { OrderService } from '../serivce/order-service'
import { useAuth } from '#/module/auth/context/auth-context'

export function CartComponent() {
  const publicDiscountService = useMemo(() => new PublicDiscountService(), [])
  const orderService = useMemo(() => new OrderService(), [])
  const navigate = useNavigate()
  const { getFileUrl } = useFileUrl()
  const { toastSuccess, toastError, toastWarning } = useToast()
  const { auth } = useAuth()

  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart
  } = useCart()

  // Track checked items for checkout calculation
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  // Toggle selection for a single item
  const toggleItem = (cartId: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [cartId]: !prev[cartId]
    }))
  }

  // Toggle selection for all items
  const isAllChecked = useMemo(() => {
    if (cartItems.length === 0) return false
    return cartItems.every(item => checkedItems[item.id] !== false)
  }, [cartItems, checkedItems])

  const toggleAll = () => {
    const nextState = !isAllChecked
    const updated: Record<string, boolean> = {}
    cartItems.forEach(item => {
      updated[item.id] = nextState
    })
    setCheckedItems(updated)
  }

  // Selected items list
  const selectedItems = useMemo(() => {
    return cartItems.filter(item => {
      return checkedItems[item.id] !== false
    })
  }, [cartItems, checkedItems])

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<DiscountResponse | null>(null)

  const [discountItem, setDiscountItem] = useState<DiscountResponse[]>([])
  const discountMutation = useMutation({
    mutationFn: () => {
      if (selectedItems.length === 0) return Promise.resolve({ results: [] as DiscountResponse[] });
      return publicDiscountService.getListDiscounts({
        'laptopId:in': selectedItems.map(item => item.laptopId)
      })
    },
    onSuccess: (data) => {
      setDiscountItem(data.results)
    }
  })

  useEffect(() => {
    if (selectedItems.length > 0) {
      discountMutation.mutate()
    } else {
      setDiscountItem([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems])

  // Calculation based only on selected items
  const subtotalPrice = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  }, [selectedItems])

  const originalSubtotalPrice = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.originalPrice * item.quantity, 0)
  }, [selectedItems])

  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) {
      toastWarning('Vui lòng nhập mã giảm giá')
      return
    }

    const code = voucherCode.trim().toUpperCase()

    const foundDiscount = discountItem.find(d => d.code.toUpperCase() === code)
    if (foundDiscount) {
      setAppliedVoucher(foundDiscount)
      toastSuccess(`Áp dụng mã ${code} thành công!`)
    } else {
      toastError('Mã giảm giá không hợp lệ hoặc không áp dụng cho sản phẩm này!')
    }
    setVoucherCode('')
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    toastSuccess('Đã hủy bỏ mã giảm giá')
  }

  const calculatedVoucherDiscount = useMemo(() => {
    if (!appliedVoucher) return 0;
    if (appliedVoucher.type === 'PERCENT') {
      return Math.round(subtotalPrice * (appliedVoucher.value / 100));
    }
    return Math.min(appliedVoucher.value, subtotalPrice);
  }, [appliedVoucher, subtotalPrice]);

  const totalDiscount = originalSubtotalPrice - subtotalPrice + calculatedVoucherDiscount
  const finalPrice = Math.max(0, subtotalPrice - calculatedVoucherDiscount)

  // Checkout form toggle & fields
  const [showCheckoutForm, setShowCheckoutForm] = useState(false)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    gender: GenderType.MALE.value as keyof typeof GenderType,
    fullName: '',
    phoneNumber: '',
    email: '',
    shipmentType: ShipmentType.GTN.value as keyof typeof ShipmentType,
    addressDetail: '',
    province: '',
    district: '',
    commune: '',
    storeAddress: '',
    paymentType: PaymentType.COD.value as keyof typeof PaymentType,
    notes: ''
  })

  const createOrderMutation = useMutation({
    mutationFn: (request: CreateOrderRequest) => {
      return orderService.createOrder(request)
    },
    onSuccess: () => {
      toastSuccess('Đặt hàng thành công! Chúng tôi sẽ liên hệ để xác nhận sớm nhất.')
      if (auth.isAuthenticated) {
        navigate({ to: '/users/orders' })
      } else {
        clearCart()
        navigate({ to: '/public/laptops' })
      }
    },
    onError: (error) => {
      toastError(error.message)
    }
  })

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedItems.length === 0) {
      toastError('Vui lòng chọn ít nhất một sản phẩm để thanh toán!')
      return
    }
    if (!customerInfo.fullName.trim()) {
      toastError('Vui lòng nhập họ và tên')
      return
    }
    if (!customerInfo.phoneNumber.trim() || !/^\d{10,11}$/.test(customerInfo.phoneNumber)) {
      toastError('Vui lòng nhập số điện thoại hợp lệ (10-11 số)')
      return
    }
    if (customerInfo.shipmentType === ShipmentType.GTN.value && !customerInfo.addressDetail.trim()) {
      toastError('Vui lòng nhập địa chỉ giao hàng')
      return
    }

    const request: CreateOrderRequest = {
      ...customerInfo,
      cartIds: selectedItems.map(item => item.id),
      discountId: appliedVoucher?.id || undefined
    }
    createOrderMutation.mutate(request)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f4f6f9] dark:bg-bg-white-0 flex flex-col justify-center items-center p-4">
        <div className="bg-white dark:bg-bg-weak-50 border border-gray-200 dark:border-stroke-sub-300 rounded-3xl p-8 max-w-md w-full text-center shadow-lg space-y-6 animate-fade-in">
          <div className="size-24 rounded-full bg-red-50 dark:bg-red-950/20 text-[#d70018] flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag size={48} className="stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Giỏ hàng của bạn đang trống</h2>
            <p className="text-xs text-gray-500 dark:text-text-soft-400">
              Hãy chọn cho mình chiếc laptop ưng ý nhất tại cửa hàng nhé!
            </p>
          </div>
          <Link
            to="/public/laptops"
            className="block w-full bg-[#d70018] text-white font-extrabold text-sm py-3.5 rounded-2xl shadow hover:bg-red-700 active:scale-[0.98] transition-all uppercase tracking-wider text-center"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-[#1f2937] dark:bg-bg-white-0 dark:text-static-white py-8 px-4 transition-colors duration-300">
      <div className="max-w-[620px] lg:max-w-5xl mx-auto space-y-4 lg:space-y-6">

        {/* Header Navigation */}
        <div className="flex items-center justify-between bg-white dark:bg-bg-weak-50 border border-gray-200 dark:border-stroke-sub-300 rounded-2xl p-4 shadow-sm">
          <Link to="/public/laptops" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#d70018] font-bold transition-all">
            <ChevronLeft size={16} />
            Mua thêm sản phẩm khác
          </Link>
          <h1 className="text-sm font-black uppercase text-gray-800 dark:text-white">Giỏ hàng của bạn</h1>
          <div className="text-xs text-gray-400 font-bold">
            ({cartItems.length}) sản phẩm
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* Left Column: Items and Vouchers */}
          <div className="w-full lg:col-span-7 space-y-4">

            {/* Check All Controls */}
            <div className="flex items-center justify-between bg-white dark:bg-bg-weak-50 border border-gray-200 dark:border-stroke-sub-300 rounded-xl px-4 py-2 text-xs font-semibold">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllChecked}
                  onChange={toggleAll}
                  className="accent-[#d70018] size-4 rounded cursor-pointer"
                />
                <span>Chọn tất cả ({cartItems.length} sản phẩm)</span>
              </label>
              <button
                onClick={() => {
                  if (window.confirm('Bạn có muốn xóa toàn bộ giỏ hàng?')) {
                    clearCart()
                    toastSuccess('Đã làm trống giỏ hàng')
                  }
                }}
                className="text-gray-400 hover:text-red-500 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={14} />
                Xóa tất cả
              </button>
            </div>

            {/* Cart items list */}
            <div className="space-y-3">
              {cartItems.map((item) => {
                return (
                  <CardCartComponent
                    key={item.id}
                    item={item}
                    checkedItems={checkedItems}
                    toggleItem={toggleItem}
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                    formatPrice={formatPrice}
                    getFileUrl={getFileUrl}
                  />
                )
              })}
            </div>

            {/* Voucher Promobox */}
            <div className="bg-white dark:bg-bg-weak-50 border border-gray-200 dark:border-stroke-sub-300 rounded-2xl p-4 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase text-gray-400 flex items-center gap-1.5">
                <Percent size={14} className="text-[#d70018]" />
                Mã giảm giá / Quà tặng
              </h3>

              {/* HORIZONTAL SCROLLABLE DISCOUNT LIST */}
              {discountItem.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-hide w-full">
                  {discountItem.map(discount => (
                    <div
                      key={discount.id}
                      onClick={() => setVoucherCode(discount.code)}
                      className={`w-[85%] md:w-[calc(50%-6px)] lg:w-[calc(33.333%-8px)] shrink-0 snap-start border rounded-xl p-3 cursor-pointer transition-all ${appliedVoucher?.code === discount.code
                        ? 'border-white bg-[#d70018] text-white'
                        : 'border-gray-200 text-[#d70018] hover:border-[#d70018]/50 dark:border-stroke-sub-300 dark:hover:border-red-900/50'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm uppercase tracking-tight">{discount.code}</span>
                      </div>

                      <div className="text-[11px] text-gray-500 font-medium line-clamp-2" title={discount.name}>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${appliedVoucher?.code === discount.code
                          ? 'bg-white text-red-600'
                          : 'bg-red-100 text-red-600'
                          }`}>
                          {discount.type === 'PERCENT' ? `Giảm ${discount.value}%` : `Giảm ${formatPrice(discount.value)}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input.Root className="flex-1 rounded-xl">
                  <Input.Wrapper className="h-9 px-3 bg-neutral-50 hover:bg-neutral-100/50 dark:bg-bg-surface-850 rounded-xl">
                    <Input.Input
                      placeholder="Nhập mã ưu đãi (WELCOME, CELLPHONES, STUDENT)"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      className="text-xs"
                    />
                  </Input.Wrapper>
                </Input.Root>
                <button
                  onClick={handleApplyVoucher}
                  className="bg-[#d70018] hover:bg-red-700 text-white font-extrabold text-xs px-4 rounded-xl shadow-sm transition-all h-9 cursor-pointer"
                >
                  Áp dụng
                </button>
              </div>

              {appliedVoucher && (
                <div className="bg-red-50/50 dark:bg-red-955/10 border border-dashed border-red-200 dark:border-red-900/40 rounded-xl p-2.5 flex items-center justify-between text-xs animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#d70018] text-white px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase">
                      {appliedVoucher.code}
                    </span>
                    <span className="font-semibold text-gray-600 dark:text-text-soft-400">
                      Được giảm {formatPrice(calculatedVoucherDiscount)}
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveVoucher}
                    className="text-[10px] text-gray-400 hover:text-red-500 font-bold transition-all"
                  >
                    Hủy bỏ
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Summary, Actions, Checkout Form */}
          <div className="w-full lg:col-span-5 space-y-4 lg:sticky lg:top-6">

            {/* Pricing Summary Card */}
            <div className="bg-white dark:bg-bg-weak-50 border border-gray-200 dark:border-stroke-sub-300 rounded-2xl p-5 shadow-sm space-y-3.5">
              <div className="space-y-2 text-xs font-semibold text-gray-500">
                <div className="flex justify-between">
                  <span>Tổng tiền tạm tính:</span>
                  <span className="text-gray-800 dark:text-white font-bold">{formatPrice(subtotalPrice)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Tổng khuyến mãi giảm giá:</span>
                    <span>-{formatPrice(totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
              </div>

              <div className="border-t border-gray-150 dark:border-stroke-sub-300 pt-3.5 flex justify-between items-center">
                <span className="text-xs font-black uppercase text-gray-800 dark:text-white">Tổng tiền cần thanh toán:</span>
                <span className="text-xl font-black text-[#d70018]">{formatPrice(finalPrice)}</span>
              </div>
            </div>

            {/* CTA Actions */}
            {!showCheckoutForm && (
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    if (selectedItems.length === 0) {
                      toastError('Vui lòng chọn ít nhất một sản phẩm để tiếp tục thanh toán!')
                    } else {
                      setShowCheckoutForm(true)
                    }
                  }}
                  className="w-full bg-[#d70018] hover:bg-red-700 active:scale-[0.98] text-white py-3.5 rounded-2xl flex flex-col items-center justify-center transition-all shadow-md cursor-pointer"
                >
                  <span className="text-sm font-black uppercase tracking-wider">Tiến hành đặt hàng</span>
                  <span className="text-[10px] opacity-90 mt-0.5">Nhận hàng trong 2 giờ hoặc tại cửa hàng</span>
                </button>

                <Link
                  to="/public/laptops"
                  className="w-full border-2 border-[#d70018] text-[#d70018] font-black text-sm py-3.5 rounded-2xl shadow-sm hover:bg-red-50/5 active:scale-[0.98] transition-all uppercase tracking-wider text-center block"
                >
                  Chọn thêm sản phẩm khác
                </Link>
              </div>
            )}

            {/* Checkout Form Card */}
            {showCheckoutForm && (
              <OrderComponent
                finalPrice={finalPrice}
                handleCheckoutSubmit={handleCheckoutSubmit}
                setShowCheckoutForm={setShowCheckoutForm}
                customerInfo={customerInfo}
                setCustomerInfo={setCustomerInfo}
                formatPrice={formatPrice}
              />
            )}

          </div>
        </div>

      </div>
    </div>
  )
}

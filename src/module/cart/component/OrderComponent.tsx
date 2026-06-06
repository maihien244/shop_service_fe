import React from 'react'
import * as Input from "#/components/ui/input"
import { User, Phone, Mail, MapPin, Store, MessageSquare } from "lucide-react"
import { GenderType } from '#/module/users/dto'
import { PaymentType, ShipmentType, type CustomerInfo } from '../dto'

type OrderProps = {
    finalPrice: number
    handleCheckoutSubmit: (e: React.FormEvent) => void
    setShowCheckoutForm: (show: boolean) => void
    customerInfo: CustomerInfo
    setCustomerInfo: React.Dispatch<React.SetStateAction<CustomerInfo>>
    formatPrice: (price: number) => string
}

export function OrderComponent({
    finalPrice,
    handleCheckoutSubmit,
    setShowCheckoutForm,
    customerInfo,
    setCustomerInfo,
    formatPrice
}: OrderProps) {
    return (
        <div className="bg-white dark:bg-bg-weak-50 border border-gray-200 dark:border-stroke-sub-300 rounded-2xl p-5 shadow-lg space-y-5 animate-slide-up">
            <div className="flex items-center justify-between border-b border-gray-150 dark:border-stroke-sub-300 pb-3">
                <h2 className="text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white flex items-center gap-1.5">
                    <User size={16} className="text-[#d70018]" />
                    Thông tin khách hàng
                </h2>
                <button
                    type="button"
                    onClick={() => setShowCheckoutForm(false)}
                    className="text-xs text-gray-400 hover:text-gray-600 font-bold"
                >
                    Quay lại
                </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">

                {/* Gender Radio */}
                <div className="flex gap-4 text-xs font-bold">
                    {Object.keys(GenderType).map((g, index) => (
                        <label key={index} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="radio"
                                name="gender"
                                value={g}
                                checked={customerInfo.gender === g}
                                onChange={(e) => setCustomerInfo(prev => ({ ...prev, gender: e.target.value as keyof typeof GenderType }))}
                                className="accent-[#d70018] size-4"
                            />
                            <span>{GenderType[g as keyof typeof GenderType].label}</span>
                        </label>
                    ))}
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Full name */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-400 uppercase">Họ và tên *</label>
                        <Input.Root className="rounded-xl">
                            <Input.Wrapper className="h-9 px-3 bg-neutral-50 dark:bg-bg-surface-850 rounded-xl">
                                <Input.Icon as={User} className="text-gray-400 size-4 mr-1.5" />
                                <Input.Input
                                    placeholder="Nhập họ và tên"
                                    value={customerInfo.fullName}
                                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, fullName: e.target.value }))}
                                    className="text-xs"
                                    required
                                />
                            </Input.Wrapper>
                        </Input.Root>
                    </div>

                    {/* Phone number */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-400 uppercase">Số điện thoại *</label>
                        <Input.Root className="rounded-xl">
                            <Input.Wrapper className="h-9 px-3 bg-neutral-50 dark:bg-bg-surface-850 rounded-xl">
                                <Input.Icon as={Phone} className="text-gray-400 size-4 mr-1.5" />
                                <Input.Input
                                    placeholder="Nhập số điện thoại"
                                    value={customerInfo.phoneNumber}
                                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                    className="text-xs"
                                    type="tel"
                                    required
                                />
                            </Input.Wrapper>
                        </Input.Root>
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-400 uppercase">Email (Không bắt buộc)</label>
                    <Input.Root className="rounded-xl">
                        <Input.Wrapper className="h-9 px-3 bg-neutral-50 dark:bg-bg-surface-850 rounded-xl">
                            <Input.Icon as={Mail} className="text-gray-400 size-4 mr-1.5" />
                            <Input.Input
                                placeholder="Nhập email để nhận hóa đơn điện tử"
                                value={customerInfo.email}
                                onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                                className="text-xs"
                                type="email"
                            />
                        </Input.Wrapper>
                    </Input.Root>
                </div>

                {/* Delivery method options */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase block">Phương thức nhận hàng *</label>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.keys(ShipmentType).map((s, index) => (
                            <button
                                key={index}
                                type="button"
                                value={s}
                                onClick={() => setCustomerInfo(prev => ({ ...prev, shipmentType: s as keyof typeof ShipmentType }))}
                                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${customerInfo.shipmentType === s
                                    ? 'border-[#d70018] bg-red-50/5 ring-1 ring-[#d70018]'
                                    : 'border-gray-200 dark:border-stroke-sub-300 hover:border-gray-400'
                                    }`}
                            >
                                {s === ShipmentType.GTN.value ? (
                                    <MapPin size={16} className={customerInfo.shipmentType === s ? 'text-[#d70018]' : 'text-gray-500'} />
                                ) : (
                                    <Store size={16} className={customerInfo.shipmentType === s ? 'text-[#d70018]' : 'text-gray-500'} />
                                )}
                                {ShipmentType[s as keyof typeof ShipmentType].label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Delivery info fields */}
                {customerInfo.shipmentType === ShipmentType.GTN.value ? (
                    <div className="space-y-3 p-3 bg-neutral-50 dark:bg-bg-surface-850 rounded-xl border border-gray-150 dark:border-stroke-sub-300">
                        <div className="grid grid-cols-3 gap-2">
                            <input
                                placeholder="Tỉnh/Thành"
                                value={customerInfo.province}
                                onChange={(e) => setCustomerInfo(prev => ({ ...prev, province: e.target.value }))}
                                className="text-xs bg-white dark:bg-bg-weak-50 border border-gray-200 dark:border-stroke-sub-300 rounded-lg p-2 focus:outline-none"
                            />
                            <input
                                placeholder="Quận/Huyện"
                                value={customerInfo.district}
                                onChange={(e) => setCustomerInfo(prev => ({ ...prev, district: e.target.value }))}
                                className="text-xs bg-white dark:bg-bg-weak-50 border border-gray-200 dark:border-stroke-sub-300 rounded-lg p-2 focus:outline-none"
                            />
                            <input
                                placeholder="Phường/Xã"
                                value={customerInfo.commune}
                                onChange={(e) => setCustomerInfo(prev => ({ ...prev, commune: e.target.value }))}
                                className="text-xs bg-white dark:bg-bg-weak-50 border border-gray-200 dark:border-stroke-sub-300 rounded-lg p-2 focus:outline-none"
                            />
                        </div>
                        <input
                            placeholder="Địa chỉ cụ thể (Số nhà, tên đường) *"
                            value={customerInfo.addressDetail}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, addressDetail: e.target.value }))}
                            className="text-xs w-full bg-white dark:bg-bg-weak-50 border border-gray-200 dark:border-stroke-sub-300 rounded-lg p-2.5 focus:outline-none"
                            required
                        />
                    </div>
                ) : (
                    <div className="p-3 bg-neutral-50 dark:bg-bg-surface-850 rounded-xl border border-gray-150 dark:border-stroke-sub-300 space-y-2 text-xs">
                        <span className="font-bold text-gray-500">Cửa hàng phục vụ:</span>
                        <div className="flex gap-2 items-center bg-white dark:bg-bg-weak-50 p-2.5 rounded-lg border border-gray-200 dark:border-stroke-sub-300">
                            <Store size={14} className="text-green-600 shrink-0" />
                            <span className="font-semibold text-gray-700 dark:text-white">{customerInfo.storeAddress}</span>
                        </div>
                    </div>
                )}

                {/* Payment Methods */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase block">Hình thức thanh toán *</label>
                    <div className="space-y-2">
                        {Object.keys(PaymentType).map((method) => (
                            <label
                                key={method}
                                onClick={() => setCustomerInfo(prev => ({ ...prev, paymentType: method as keyof typeof PaymentType }))}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${customerInfo.paymentType === method
                                    ? 'border-[#d70018] bg-red-50/5 ring-1 ring-[#d70018]'
                                    : 'border-gray-200 dark:border-stroke-sub-300 hover:border-gray-300'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value={method}
                                    checked={customerInfo.paymentType === method}
                                    onChange={() => { }}
                                    className="accent-[#d70018] size-4 shrink-0 mt-0.5"
                                />
                                <div className="space-y-0.5">
                                    <span className="text-xs font-black text-gray-800 dark:text-white block">{PaymentType[method as keyof typeof PaymentType].label}</span>
                                    <span className="text-[10px] text-gray-500 dark:text-text-soft-400">{PaymentType[method as keyof typeof PaymentType].description}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Additional notes */}
                <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-400 uppercase">Ghi chú yêu cầu khác (Nếu có)</label>
                    <Input.Root className="rounded-xl">
                        <Input.Wrapper className="h-16 px-3 bg-neutral-50 dark:bg-bg-surface-850 rounded-xl items-start py-2">
                            <Input.Icon as={MessageSquare} className="text-gray-400 size-4 mr-1.5 mt-0.5" />
                            <textarea
                                placeholder="Ghi chú thêm về thời gian giao hàng, yêu cầu cài đặt phần mềm máy tính..."
                                value={customerInfo.notes}
                                onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                                className="text-xs w-full bg-transparent outline-none h-full resize-none leading-relaxed text-text-strong-950 placeholder:text-text-soft-400"
                            />
                        </Input.Wrapper>
                    </Input.Root>
                </div>

                {/* Final Submit order Button */}
                <button
                    type="submit"
                    className="w-full bg-[#d70018] hover:bg-red-700 active:scale-[0.98] text-white py-4 rounded-2xl flex flex-col items-center justify-center transition-all shadow-md font-black uppercase tracking-wider text-sm cursor-pointer"
                >
                    Xác nhận đơn hàng ({formatPrice(finalPrice)})
                </button>

            </form>
        </div>
    )
}
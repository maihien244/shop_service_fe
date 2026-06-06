import type { GenderType } from "#/module/auth/dto"

export interface CartItem {
    id: number
    laptopId: number
    laptopName: string
    laptopSlug: string
    optionId: number
    optionName: string
    price: number
    originalPrice: number
    imageKey: string
    quantity: number
    brandName?: string
    total: number
}

export interface CreateCartRequest {
    optionId: number
    quantity: number
}

export interface UpdateCartRequest {
    quantity: number
}

export const ShipmentType = {
    GTN: {
        label: 'Giao hàng tận nơi',
        value: 'GTN'
    },
    NTCH: {
        label: 'Nhận tại cửa hàng',
        value: 'NTCH'
    }
}

export const PaymentType = {
    QR: {
        label: 'Thanh toán qua QR',
        value: 'QR',
        description: 'Thanh toán qua QR'
    },
    COD: {
        label: 'Thanh toán khi nhận hàng',
        value: 'COD',
        description: 'Trả tiền mặt trực tiếp khi shipper giao sản phẩm'
    }
}

export type CustomerInfo = {
    gender: keyof typeof GenderType
    fullName: string
    phoneNumber: string
    email: string
    shipmentType: keyof typeof ShipmentType
    addressDetail: string
    province: string
    district: string
    commune: string
    storeAddress: string
    paymentType: keyof typeof PaymentType
    notes: string
}

export type CreateOrderRequest = {
    gender: keyof typeof GenderType
    fullName: string
    phoneNumber: string
    email: string
    shipmentType: keyof typeof ShipmentType
    addressDetail: string
    province: string
    district: string
    commune: string
    storeAddress: string
    paymentType: keyof typeof PaymentType
    notes: string
    cartIds: number[]
    discountId?: number
}

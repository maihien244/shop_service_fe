import type { UserDto } from "#/module/auth/dto"
import type { LaptopResponse } from "#/module/laptop/dto"

export const DiscountType = {
    PERCENT: {
        label: "Phần trăm",
        value: "PERCENT"
    },
    FIXED: {
        label: "Cố định",
        value: "FIXED"
    }
}

export type CreateDiscountRequest = {
    name: string
    code: string
    userIds?: number[]
    quantity: number
    moduleIds?: number[]
    type: keyof typeof DiscountType
    expiryFrom?: string
    expiryTo?: string
    isActive: number
    value: number
}

export type DiscountResponse = {
    id: number
    name: string
    code: string
    userIds?: number[]
    quantity: number
    moduleId?: number
    type: keyof typeof DiscountType
    expiryFrom: string
    expiryTo: string
    isActive: number
    laptops: LaptopResponse[]
    users: UserDto[]
    value: number
}
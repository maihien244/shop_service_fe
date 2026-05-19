export const StoreModelStatus = {
    NEW: {
        label: "Mới",
        value: "NEW"
    },
    ORDERED: {
        label: "Đã đặt hàng",
        value: "ORDERED"
    },
    SOLD: {
        label: "Đã bán",
        value: "SOLD"
    },
    REFUND: {
        label: "Trả hàng",
        value: "REFUND"
    }
}

export type CreateStoreModelRequest = {
    warehouseId: number
    serialNumbers: string[]
    laptopId: number
    status: keyof typeof StoreModelStatus
}

export type StoreModelResponse = {
    id: number              
    name: string
    isActive: number       
    warehouseId: number
    status: keyof typeof StoreModelStatus
    serialNumber: string
    laptopId: number
    quantity: number
    createAt: string
    updateAt: string
}

export type CountStoreModelResponse = {
    laptopName: string
    warehouseName: string
    warehouseId: number
    laptopId: number
    quantity: number
    status: keyof typeof StoreModelStatus
}


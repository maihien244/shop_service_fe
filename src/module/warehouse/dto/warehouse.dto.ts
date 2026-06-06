export type WarehouseDto = {
    id: number,
    name: string,
    isActive: number,
    address: string,
    createAt: string,
    updateAt: string,
    total?: number
}

export type CreateWarehouseRequest = {
    name: string,
    address: string,
    isActive: number,
}
    
import type { AttachDto } from "#/module/attachs/dto"

export type CreateLaptopRequest = {
    name: string,
    description: string,
    isActive: number,
    originalPrice: number,
    attachIds?: number[],
    parentId?: number,
    brandId: number,
    screenSizeId: number,
    ramId: number,
    storageId: number,
    gpuId: number,
    cpuId: number,
    screenId: number,
    slug: string,
    options: CreateOptionLaptopRequest[]
}

export type LaptopResponse = {
    id: number,
    name: string,
    description: string,
    isActive: number,
    originalPrice: number,
    price: number,
    attaches?: AttachDto[],
    parentId?: number,
    brandId: number,
    screenSizeId: number,
    ramId: number,
    storageId: number,
    gpuId: number,
    cpuId: number,
    screenId: number,
    slug: string,
    options: OptionLaptopResponse[]
    discountType?: string
    discountValue?: number
    relations?: LaptopResponse[]
}

export type CreateOptionLaptopRequest = {
    id?: number
    name: string
    price: string
    attachId?: number
}

export type OptionLaptopResponse = {
    id: number,
    name: string,
    price: string,
    attach: AttachDto,
    laptopId: number,
}
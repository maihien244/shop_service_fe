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
}

export type LaptopResponse = {
    id: number,
    name: string,
    description: string,
    isActive: number,
    originalPrice: number,
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
}
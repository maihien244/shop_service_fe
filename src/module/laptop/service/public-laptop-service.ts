import { ApiClient, HttpClient, type CollectionResponse } from "#/lib/http.client";
import { BaseParams } from "#/lib/dto/base-params";
import type { LaptopResponse } from "../dto";
import type { WarehouseDto } from "#/module/warehouse/dto/warehouse.dto";

export class GetListPublicLaptopParam extends BaseParams {
    'name:ct'?: string
    'price:ge'?: number
    'price:le'?: number
    brandId?: number
    cpuId?: number
    ramId?: number
    storageId?: number
    screenSizeId?: number
    gpuId?: number
    screenId?: number
}


export class PublicLaptopService {
    protected apiClient : HttpClient
    protected baseUrl: string

    constructor() {
        this.apiClient = ApiClient
        this.baseUrl = '/v1/public/laptops'
    }

    async getList(params?: GetListPublicLaptopParam) : Promise<CollectionResponse<LaptopResponse>> {
        return await this.apiClient.get<CollectionResponse<LaptopResponse>>(this.baseUrl, { params })
    }

    async getLaptopBySlug(slug: string) : Promise<LaptopResponse> {
        return await this.apiClient.get<LaptopResponse>(`${this.baseUrl}/${slug}`)
    }

    async getStoreModelDtoHasProduct(laptopId: number, optionId: number) : Promise<CollectionResponse<WarehouseDto>> {
        return await this.apiClient.get<CollectionResponse<WarehouseDto>>(`${this.baseUrl}/${laptopId}/options/${optionId}/warehouses`)
    }
}
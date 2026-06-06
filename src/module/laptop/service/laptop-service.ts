import { ApiClient, type CollectionResponse, type HttpClient } from "#/lib/http.client";
import type { CreateLaptopRequest, LaptopResponse, OptionLaptopResponse } from "../dto";
import { BaseParams } from "#/lib/dto/base-params";
import type { WarehouseDto } from "#/module/warehouse/dto/warehouse.dto";

export class GetListLaptopRequest extends BaseParams {
    'name:ct'?: string
    isActive?: number
    'originalPrice:ge'?: number
    'originalPrice:le'?: number
}

export class LaptopService {
    protected apiClient: HttpClient
    protected adminUrl: string
    protected clientUrl: string
    
    constructor() {
        this.apiClient = ApiClient
        this.adminUrl = '/v1/admin/laptops'
        this.clientUrl = '/v1/public/laptops'
    }

    async createLaptop(request: CreateLaptopRequest) : Promise<LaptopResponse> {
        return await this.apiClient.post<LaptopResponse>(this.adminUrl, request)
    }

    async updateLaptop(id: number, request: CreateLaptopRequest) : Promise<LaptopResponse> {
        return await this.apiClient.put<LaptopResponse>(`${this.adminUrl}/${id}`, request)
    }

    async getById(id: number) : Promise<LaptopResponse> {
        return await this.apiClient.get<LaptopResponse>(`${this.adminUrl}/${id}`)
    }

    async getBySlug(slug: string) : Promise<LaptopResponse> {
        return await this.apiClient.get<LaptopResponse>(`${this.clientUrl}/${slug}`)
    }

    async delete(id: number) : Promise<void> {
        await this.apiClient.delete<void>(`${this.adminUrl}/${id}`)
    }

    async getList(params?: GetListLaptopRequest) : Promise<CollectionResponse<LaptopResponse>> {
        return await this.apiClient.get<CollectionResponse<LaptopResponse>>(this.adminUrl, { params })
    }

    async getListPublic(params?: GetListLaptopRequest) : Promise<CollectionResponse<LaptopResponse>> {
        return await this.apiClient.get<CollectionResponse<LaptopResponse>>(this.clientUrl, { params })
    }

    async getOptionsOfLaptop(id: number) : Promise<CollectionResponse<OptionLaptopResponse>> {
        return await this.apiClient.get<CollectionResponse<OptionLaptopResponse>>(`${this.adminUrl}/${id}/options`)
    }
}
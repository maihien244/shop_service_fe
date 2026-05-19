import { BaseParams } from "#/lib/dto/base-params";
import { ApiClient, type CollectionResponse, type HttpClient } from "#/lib/http.client";
import type { CreateDiscountRequest, DiscountResponse } from "../dto";

export class GetListDiscountParams extends BaseParams {
    'name:ct'?: string
    'code:eq'?: string
    'type:eq'?: string
    'isActive'?: string
    'expiredAt:ge'?: string
    'expiredAt:le'?: string
}

export class DiscountService {
    protected apiClient : HttpClient
    protected adminUrl : string
    
    constructor() {
        this.apiClient = ApiClient
        this.adminUrl = 'v1/admin/discounts'
    }

    async getListDiscounts(params?: GetListDiscountParams) : Promise<CollectionResponse<DiscountResponse>> {
        return this.apiClient.get<CollectionResponse<DiscountResponse>>(`${this.adminUrl}`, {params})
    }

    async create(request: CreateDiscountRequest) : Promise<DiscountResponse> {
        return this.apiClient.post<DiscountResponse>(`${this.adminUrl}`, request)
    }

    async update(id: number, request: CreateDiscountRequest) : Promise<DiscountResponse> {
        return this.apiClient.patch<DiscountResponse>(`${this.adminUrl}/${id}`, request)
    }

    async delete(id: number) : Promise<DiscountResponse> {
        return this.apiClient.delete<DiscountResponse>(`${this.adminUrl}/${id}`)
    }

    async getDetail(id: number) : Promise<DiscountResponse> {
        return this.apiClient.get<DiscountResponse>(`${this.adminUrl}/${id}`)
    }
}
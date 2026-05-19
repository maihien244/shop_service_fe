import { ApiClient, type CollectionResponse, type HttpClient } from "#/lib/http.client"
import type { BaseCategoryResponse, CreateBaseCategoryRequest } from "../dto/base-category.dto"

export class BaseCreateCategoryParams {
    page?: number | null
    size?: number
    sort?: string
    'name:ct'?: string
    'code:eq'?: string
    isActive?: number
}

export class BaseCategoryService {
    protected apiClient : HttpClient
    protected adminUrl: string
    protected clientUrl: string

    constructor() {
        this.apiClient = ApiClient
        this.adminUrl = '/v1/admin/base-categories'
        this.clientUrl = '/v1/public/base-categories'
    }

    async createBaseCategory(request: CreateBaseCategoryRequest) : Promise<BaseCategoryResponse> {
        return await this.apiClient.post<BaseCategoryResponse>(this.adminUrl, request)
    }

    async getList(params?: BaseCreateCategoryParams) : Promise<CollectionResponse<BaseCategoryResponse>> {
        return await this.apiClient.get<CollectionResponse<BaseCategoryResponse>>(this.adminUrl, { params })
    }

    async getById(baseCategoryId: number) : Promise<BaseCategoryResponse> {
        return await this.apiClient.get<BaseCategoryResponse>(`${this.adminUrl}/${baseCategoryId}`)
    }

    async delete(id: number) : Promise<void> {
        await this.apiClient.delete<void>(`${this.adminUrl}/${id}`)
    }

    async updateBaseCategory(id: number, request: CreateBaseCategoryRequest) : Promise<BaseCategoryResponse> {
        return await this.apiClient.put<BaseCategoryResponse>(`${this.adminUrl}/${id}`, request)
    }
}
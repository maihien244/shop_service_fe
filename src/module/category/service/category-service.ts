import { ApiClient, type CollectionResponse, type HttpClient } from "#/lib/http.client"
import type { CategoryResponse, CreateCategoryRequest } from "../dto/category.dto"

export class CategoryParams {
    page?: number | null
    size?: number
    sort?: string
    'name:ct'?: string
    'code:eq'?: string
    'baseCode:eq'?: string
    isActive?: number
}

export class CategoryService {
    protected apiClient : HttpClient
    protected adminUrl: string
    protected clientUrl: string

    constructor() {
        this.apiClient = ApiClient
        this.adminUrl = '/v1/admin/categories'
        this.clientUrl = '/v1/categories'
    }

    async getList(params?: CategoryParams) : Promise<CollectionResponse<CategoryResponse>> {
        return this.apiClient.get<CollectionResponse<CategoryResponse>>(this.adminUrl, { params })
    }

    async getById(id: number) : Promise<CategoryResponse> {
        return this.apiClient.get<CategoryResponse>(`${this.adminUrl}/${id}`)
    }

    async create(request: CreateCategoryRequest) : Promise<CategoryResponse> {
        return this.apiClient.post<CategoryResponse>(this.adminUrl, request)
    }

    async update(id: number, request: CreateCategoryRequest) : Promise<CategoryResponse> {
        return this.apiClient.put<CategoryResponse>(`${this.adminUrl}/${id}`, request)
    }

    async delete(id: number) : Promise<void> {
        await this.apiClient.delete<void>(`${this.adminUrl}/${id}`)
    }
}
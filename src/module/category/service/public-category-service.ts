import { ApiClient, type CollectionResponse, type HttpClient } from "#/lib/http.client"
import type { CategoryResponse } from "../dto/category.dto"

export class PublicCategoryParams {
    page?: number | null
    size?: number
    sort?: string
    'name:ct'?: string
    'code:eq'?: string
    'baseCode:eq'?: string
}

export class PublicCategoryService {
    protected apiClient : HttpClient
    protected clientUrl: string

    constructor() {
        this.apiClient = ApiClient
        this.clientUrl = '/v1/public/categories'
    }

    async getList(params?: PublicCategoryParams) : Promise<CollectionResponse<CategoryResponse>> {
        return this.apiClient.get<CollectionResponse<CategoryResponse>>(this.clientUrl, { params })
    }

    async getById(id: number) : Promise<CategoryResponse> {
        return this.apiClient.get<CategoryResponse>(`${this.clientUrl}/${id}`)
    }
}
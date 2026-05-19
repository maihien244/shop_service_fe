import { ApiClient, type CollectionResponse, type HttpClient } from "#/lib/http.client"
import { BaseParams } from "#/lib/dto/base-params"
import type { CountStoreModelResponse, CreateStoreModelRequest, StoreModelResponse, StoreModelStatus } from "../dto/store-model.dto"

export class GetListStoreModelRequest extends BaseParams {
    'nameLaptop:ct'?: string
    'warehouseId:eq'?: number
    'status:in'?: (keyof typeof StoreModelStatus)[]
}

export class StoreModelService {
    protected apiClient: HttpClient
    protected adminUrl: string
    constructor() {
        this.apiClient = ApiClient
        this.adminUrl = '/v1/admin/store-models'
    }

    async getList(params?: GetListStoreModelRequest) : Promise<CollectionResponse<CountStoreModelResponse>> {
        return await this.apiClient.get<CollectionResponse<CountStoreModelResponse>>(this.adminUrl, { params })
    }

    async create(request: CreateStoreModelRequest) {
        return await this.apiClient.post(this.adminUrl, request)
    }
}
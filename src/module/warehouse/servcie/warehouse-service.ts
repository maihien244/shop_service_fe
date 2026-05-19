import { BaseParams } from "#/lib/dto/base-params";
import { ApiClient, type CollectionResponse, type HttpClient } from "#/lib/http.client";
import type { CreateWarehouseRequest, WarehouseDto } from "../dto/warehouse.dto";

export class GetWarehouseListParams extends BaseParams {
    'name:ct'?: string
    isActive?: number
}

export class WarehouseService {
    protected apiClient : HttpClient
    private adminUrl: string = '/v1/admin/warehouses'

    constructor() {
        this.apiClient = ApiClient
    }

    async create(data: CreateWarehouseRequest): Promise<WarehouseDto> {
        return await this.apiClient.post<WarehouseDto>(`${this.adminUrl}`, data)
    }

    async update(id: number, data: CreateWarehouseRequest): Promise<WarehouseDto> {
        return await this.apiClient.put<WarehouseDto>(`${this.adminUrl}/${id}`, data)
    }

    async getById(id: number) : Promise<WarehouseDto> {
        return await this.apiClient.get<WarehouseDto>(`${this.adminUrl}/${id}`)
    }

    async delete(id: number) : Promise<void> {
        await this.apiClient.delete<void>(`${this.adminUrl}/${id}`)
    }

    async getList(params?: GetWarehouseListParams ) : Promise<CollectionResponse<WarehouseDto>> {
        return await this.apiClient.get<CollectionResponse<WarehouseDto>>(`${this.adminUrl}`, {params})
    }
}
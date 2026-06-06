import { ApiClient, type CollectionResponse, type HttpClient } from "#/lib/http.client"
import type { OrderDto } from "../dto"

export class OrderService {
    protected apiClient : HttpClient
    public baseUrl: string

    constructor() {
        this.apiClient = ApiClient
        this.baseUrl = '/v1/orders'
    }

    async getListOrder() : Promise<CollectionResponse<OrderDto>> {
        return this.apiClient.get(this.baseUrl)
    }

    async getOrder(orderId: number) : Promise<OrderDto> {
        return this.apiClient.get(`${this.baseUrl}/${orderId}`)
    }
}
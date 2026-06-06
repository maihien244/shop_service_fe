import { ApiClient, HttpClient } from "#/lib/http.client";
import type { CreateOrderRequest } from "../dto";

export class OrderService {
    protected apiClient: HttpClient;
    protected baseUrl: string;

    constructor() {
        this.apiClient = ApiClient;
        this.baseUrl = '/v1/orders';
    }

    async createOrder(request: CreateOrderRequest): Promise<void> {
        return await this.apiClient.post<void>(this.baseUrl, request);
    }

}
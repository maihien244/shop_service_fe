import { ApiClient, type HttpClient } from "#/lib/http.client";
import type { PaymentDto } from "../dto";

export class PaymentService {
    protected apiClient : HttpClient
    protected baseUrl: string
    constructor() {
        this.apiClient = ApiClient
        this.baseUrl = '/v1/payments'
    }

    async createPayment(orderId: number) : Promise<PaymentDto> {
        return this.apiClient.get(`${this.baseUrl}/${orderId}`)
    }
}
import { BaseParams } from "#/lib/dto/base-params";
import { ApiClient, type CollectionResponse } from "#/lib/http.client";
import type { ShipmentType } from "#/module/cart/dto";
import type { OrderDto, PaymentStatus, ProcessStatus } from "../dto";

export class GetListOrderRequest extends BaseParams {
    'paymentStatus:in'?: (keyof typeof PaymentStatus)[]
    'processStatus:in'?: (keyof typeof ProcessStatus)[]
    'shipmentType:eq'?: (keyof typeof ShipmentType)[]
    'email:eq'?: string
}

export class AdminOrderService {
    protected apiClient = ApiClient
    protected adminUrl = '/v1/admin/orders'

    async getList(params?: GetListOrderRequest) : Promise<CollectionResponse<OrderDto>> {
        return await this.apiClient.get<CollectionResponse<OrderDto>>(this.adminUrl, { params })
    }

    async updateProcessStatus(orderId: number, status: keyof typeof ProcessStatus): Promise<OrderDto> {
        return await this.apiClient.put<OrderDto>(`${this.adminUrl}/${orderId}/status`, null, { params: { status } })
    }
}
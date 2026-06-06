import { BaseParams } from "#/lib/dto/base-params";
import { ApiClient, type CollectionResponse, type HttpClient } from "#/lib/http.client";
import type { DiscountResponse } from "../dto";

export class GetListDiscountParams extends BaseParams {
    'code:eq'?: string
    'laptopId:in'?: number[]
}

export class PublicDiscountService {
    protected apiClient: HttpClient
    protected publicUrl: string

    constructor() {
        this.apiClient = ApiClient
        this.publicUrl = 'v1/public/discounts'
    }

    async getListDiscounts(params?: GetListDiscountParams) : Promise<CollectionResponse<DiscountResponse>> {
        return this.apiClient.get<CollectionResponse<DiscountResponse>>(`${this.publicUrl}`, {params})
    }
}
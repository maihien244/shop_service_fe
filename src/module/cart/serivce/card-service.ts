import { ApiClient, HttpClient, type CollectionResponse } from "#/lib/http.client";
import type { CartItem, CreateCartRequest, UpdateCartRequest } from "../dto";

export class CartService {
    protected apiClient: HttpClient;
    protected baseUrl: string;

    constructor() {
        this.apiClient = ApiClient;
        this.baseUrl = '/v1/carts';
    }

    async getMyCart(): Promise<CollectionResponse<CartItem>> {
        return await this.apiClient.get<CollectionResponse<CartItem>>(this.baseUrl);
    }

    async addToCart(request: CreateCartRequest): Promise<CartItem> {
        return await this.apiClient.post<CartItem>(this.baseUrl, request);
    }

    async updateCart(cartId: number, request: UpdateCartRequest): Promise<CartItem> {
        return await this.apiClient.put<CartItem>(`${this.baseUrl}/${cartId}`, request);
    }

    async deleteCart(cartId: number): Promise<void> {
        return await this.apiClient.delete<void>(`${this.baseUrl}/${cartId}`);
    }
}
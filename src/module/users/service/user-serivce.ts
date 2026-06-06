import { ApiClient, type CollectionResponse, type HttpClient } from "#/lib/http.client";
import type { UsersDto } from "../dto";
import { BaseParams } from "#/lib/dto/base-params";

export class ListUserParams extends BaseParams {
    'name:ct'?: string
    'email:ct'?: string
    'phoneNumber:ct'?: string
    isActive?: number
}

export class UserService {
    protected apiClient: HttpClient
    private adminUrl: string
    constructor() {
        this.adminUrl = "/v1/admin/users"
        this.apiClient = ApiClient
    }

    async getListForSelect(params: ListUserParams): Promise<CollectionResponse<UsersDto>> {
        return await this.apiClient.get(this.adminUrl, { params })
    }

    async getProfile(): Promise<UsersDto> {
        return await this.apiClient.get("/v1/users/profile")
    }

}
import { ApiClient, HttpClient } from "#/lib/http.client"
import type { AttachDto, CreateAttachRequest } from "../dto"

export class AttachService {
    protected baseUrl: string
    protected apiClient: HttpClient

    constructor() {
        this.baseUrl = 'v1/attaches'
        this.apiClient = ApiClient
    }

    createAttach(request: CreateAttachRequest): Promise<AttachDto> {
        return this.apiClient.post<AttachDto>(this.baseUrl, request)
    }
}
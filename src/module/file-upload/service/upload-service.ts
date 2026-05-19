import { ApiClient, type HttpClient } from "#/lib/http.client"
import type { PresignedUrlDto } from "../dto"

export class UploadService {
    protected apiClient: HttpClient
    protected baseUrl: string

    constructor() {
        this.apiClient = ApiClient
        this.baseUrl = 'v1/upload'
    }

    getPresignedUrl(fileName: string) {
        return this.apiClient.get<PresignedUrlDto>(`${this.baseUrl}/presigned-url`, {
            params: {
                fileName,
            },
        })
    }

    uploadImage(presignedUrl: string, file: File) {
        return this.apiClient.put(presignedUrl, file,
            {
            headers: {
                'Content-Type': file.type,
                'Authorization': null
            },
        })
    }
}
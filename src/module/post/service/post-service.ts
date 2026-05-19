import { ApiClient, HttpClient } from '#/lib/http.client'
import type { CreatePostRequestDto, UpdatePostRequestDto, PostStatus } from '../dto'

import type { CollectionResponse } from '#/lib/http.client'
import type { PostDto } from '../dto'

export type GetPostParams = {
    page?: number | null
    size?: number
    sort?: string
    'title:ct'?: string
    'createAt:ge'?: string
    'createAt:le'?: string
    'status:in'?: string[] | null
}


export class PostService {
    protected apiClient: HttpClient
    protected baseUrl: string

    constructor() {
        this.apiClient = ApiClient
        this.baseUrl = '/v1/admin/posts'
    }

    createPost(request: CreatePostRequestDto) {
        return this.apiClient.post(this.baseUrl, request)
    }

    getPosts(params?: GetPostParams) {
        return this.apiClient.get<CollectionResponse<PostDto>>(this.baseUrl, { params })
    }

    updatePost(postId: number, request: UpdatePostRequestDto) {
        return this.apiClient.put(`${this.baseUrl}/${postId}`, request)
    }

    getPost(postId: number) {
        return this.apiClient.get<PostDto>(`${this.baseUrl}/${postId}`)
    }

    deletePost(postId: number) {
        return this.apiClient.delete(`${this.baseUrl}/${postId}`)
    }
}

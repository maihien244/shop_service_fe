import type {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    CreateAxiosDefaults,
} from 'axios'
import axios from 'axios'

export interface IHttpService {
    get: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>
    post: <T>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig,
    ) => Promise<T>
    put: <T>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig,
    ) => Promise<T>
    delete: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>
    patch: <T>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig,
    ) => Promise<T>
}

export interface ErrorMessage {
    status: number
    message: string
    timestamp: string
}

export class HttpClient implements IHttpService {
    protected axiosInstance: AxiosInstance
    private apiKeyHeader = 'X-API-KEY'
    private apiKey = import.meta.env.VITE_API_KEY

    constructor(options: CreateAxiosDefaults) {
        this.axiosInstance = axios.create({
            ...options,
        })

        this.setupInterceptors()
    }


    setupInterceptors() {
        this.axiosInstance.interceptors.response.use(
            this.onFulfilled,
            this.onRejected,
        )
    }

    onFulfilled(res: AxiosResponse) {
        return res.data
    }

    onRejected(err: AxiosError) {
        throw err.response?.data as ErrorMessage
    }

    getAccessToken() {
        const accessToken = localStorage.getItem('access-token')
        if (!accessToken) {
            return null
        }
        return `Bearer ${accessToken}`
    }

    get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.axiosInstance.get(url, {
            ...config,
            headers: {
                [this.apiKeyHeader]: this.apiKey,
                Authorization: this.getAccessToken(),
                ...config?.headers,
            },
        })
    }

    post<T>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig,
    ): Promise<T> {
        return this.axiosInstance.post(url, data, {
            ...config,
            headers: {
                [this.apiKeyHeader]: this.apiKey,
                Authorization: this.getAccessToken(),
                ...config?.headers,
            },
        })
    }

    put<T>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig,
    ): Promise<T> {
        return this.axiosInstance.put(url, data, {
            ...config,
            headers: {
                [this.apiKeyHeader]: this.apiKey,
                Authorization: this.getAccessToken(),
                ...config?.headers,
            },
        })
    }

    patch<T>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig,
    ): Promise<T> {
        return this.axiosInstance.patch(url, data, {
            ...config,
            headers: {
                [this.apiKeyHeader]: this.apiKey,
                Authorization: this.getAccessToken(),
                ...config?.headers,
            },
        })
    }

    delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.axiosInstance.delete(url, {
            ...config,
            headers: {
                [this.apiKeyHeader]: this.apiKey,
                Authorization: this.getAccessToken(),
                ...config?.headers,
            },
        })
    }
}

export const ApiClient = new HttpClient({
    baseURL: import.meta.env.VITE_API_URL,
})

export type CollectionResponse<T> = {
    results: T[],
    nextPageToken: number | null,
    total: number
}

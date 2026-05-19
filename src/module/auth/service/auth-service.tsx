import { ApiClient, HttpClient } from '#/lib/http.client'
import type { AuthTokenDto, LoginRequestDto, RegisterRequestDto, SsoCallbackRequest } from '../dto'

export class AuthService {
    protected apiClient: HttpClient
    protected ssoUrl: string
    protected authUrl: string

    constructor() {
        this.apiClient = ApiClient
        this.ssoUrl = 'v1/auth/sso'
        this.authUrl = 'v1/auth'
    }

    getAuthorizationUrl(loginType: string) {
        return this.apiClient.get<string>(
            `${this.ssoUrl}?login-type=${loginType}`,
        )
    }

    googleVerify<T>(request: SsoCallbackRequest) {
        return this.apiClient.post<T>(`${this.ssoUrl}/google-sso`, request)
    }

    login(request: LoginRequestDto) {
        return this.apiClient.post<AuthTokenDto>(
            `${this.authUrl}/login`,
            request,
        )
    }

    register(request: RegisterRequestDto) {
        return this.apiClient.post(
            `${this.authUrl}/sign-up`,
            request,
        )
    }

    refreshToken() {
        return this.apiClient.get<AuthTokenDto>(`${this.authUrl}/token`)
    }
}


import type { AuthTokenDto } from "@/module/auth/dto";

export function onSaveToken(token: AuthTokenDto) {
    localStorage.setItem('access-token', token.accessToken)
    localStorage.setItem('refresh-token', token.refreshToken || '')
    localStorage.setItem('expiry', token.expiry.toString())
}

export function onRemoveToken() {
    localStorage.removeItem('access-token')
    localStorage.removeItem('refresh-token')
    localStorage.removeItem('expiry')
}

export function onGetToken(): AuthTokenDto | null {
    const accessToken = localStorage.getItem('access-token')
    const refreshToken = localStorage.getItem('refresh-token')
    const expiry = localStorage.getItem('expiry')
    
    console.log('onGetToken debug:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken, 
        hasExpiry: !!expiry,
        accessToken,
        refreshToken,
        expiry 
    })

    if (accessToken) {
        return {
            accessToken,
            refreshToken,
            expiry: Number(expiry),
        }
    }
    return null
}
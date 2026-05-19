import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { AuthService } from '../service/auth-service'
import type { AuthTokenDto } from '../dto'
import { onGetToken, onRemoveToken, onSaveToken } from '#/hooks/use-token'

interface AuthContextType {
    token: AuthTokenDto | null
    setToken: (token: AuthTokenDto | null) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const authService = new AuthService()

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate()
    const [token, setTokenState] = useState<AuthTokenDto | null>(() => {
        return onGetToken()
    })
    
    const setToken = (newToken: AuthTokenDto | null) => {
        setTokenState(newToken)
        if(newToken) onSaveToken(newToken)
            else onRemoveToken()
    }

    const logout = () => {
        setToken(null)
        navigate({ to: '/auth/login' })
    }

    useEffect(() => {
        if (!token) return

        const interval = setInterval(async () => {
            try {
                const response = await authService.refreshToken()
                if (response) {
                    setToken(response)
                }
            } catch (error) {
                logout()
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [token])

    return (
        <AuthContext.Provider value={{ token, setToken, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { AuthService } from '../service/auth-service'
import { UserService } from '#/module/users/service/user-serivce'
import type { AuthTokenDto } from '../dto'
import type { UsersDto } from '#/module/users/dto'
import { onGetToken, onRemoveToken, onSaveToken } from '#/hooks/use-token'
import { NotFoundComponent } from '#/components/ui/NotFoundComponent'

// Reusable Bean in context to hold auth state and helpers
export interface AuthBean {
    token: AuthTokenDto | null
    user: UsersDto | null
    isLoading: boolean
    isAdmin: boolean
    isAuthenticated: boolean
    hasRole: (role: string) => boolean
    logout: () => void
    login: (token: AuthTokenDto) => void
    isLoginModalOpen: boolean
    openLoginModal: () => void
    closeLoginModal: () => void
}

interface AuthContextType {
    auth: AuthBean
    // Destructuring support for compatibility
    token: AuthTokenDto | null
    user: UsersDto | null
    isLoading: boolean
    isAdmin: boolean
    isAuthenticated: boolean
    logout: () => void
    setToken: (token: AuthTokenDto | null) => void
    openLoginModal: () => void
    closeLoginModal: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const authService = new AuthService()

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const userService = useMemo(() => new UserService(), [])
    const [token, setTokenState] = useState<AuthTokenDto | null>(() => {
        return onGetToken()
    })
    const [user, setUser] = useState<UsersDto | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false)

    const tokenRef = useRef<AuthTokenDto | null>(null)
    tokenRef.current = token

    const userRef = useRef<UsersDto | null>(null)
    userRef.current = user

    const openLoginModal = () => setIsLoginModalOpen(true)
    const closeLoginModal = () => setIsLoginModalOpen(false)

    const setToken = (newToken: AuthTokenDto | null) => {
        if (tokenRef.current?.accessToken === newToken?.accessToken) {
            return
        }
        setTokenState(newToken)
        if (newToken) {
            onSaveToken(newToken)
            setUser(null)
        } else {
            onRemoveToken()
            setUser(null)
        }
    }

    const logout = () => {
        setToken(null)
        // Using window.location.href is extremely safe as AuthProvider might be mounted
        // outside of TanStack Router's RouterProvider (as seen in main.tsx)
        window.location.href = '/auth/login'
    }

    const login = (newToken: AuthTokenDto) => {
        setToken(newToken)
    }

    // Fetch user profile on token change
    useEffect(() => {
        if (!token) {
            setUser(null)
            setIsLoading(false)
            return
        }

        let isMounted = true
        // Only set isLoading to true if we don't have a user profile loaded yet.
        // This prevents the application from showing a full-screen loading spinner
        // during background profile refreshes or token updates.
        if (!userRef.current) {
            setIsLoading(true)
        }

        userService.getProfile()
            .then((profile) => {
                if (isMounted) {
                    setUser(prev => {
                        // Prevent unnecessary re-renders if profile data hasn't changed
                        if (prev && JSON.stringify(prev) === JSON.stringify(profile)) {
                            return prev
                        }
                        return profile
                    })
                }
            })
            .catch((error) => {
                console.error('Failed to fetch user profile:', error)
                if (isMounted) {
                    // Force log out if token is invalid or expired
                    logout()
                }
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoading(false)
                }
            })

        return () => {
            isMounted = false
        }
    }, [token, userService])

    // Token refresh mechanism
    useEffect(() => {
        if (!token) return

        const interval = setInterval(async () => {
            try {
                const response = await authService.refreshToken()
                if (response) {
                    setTokenState(prev => {
                        // Prevent re-renders if the access token hasn't actually changed
                        if (prev?.accessToken === response.accessToken) return prev;
                        onSaveToken(response);
                        return response;
                    })
                }
            } catch (error) {
                logout()
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [token])

    const isAdmin = useMemo(() => {
        if (!user) return false
        // Support checking role from User DTO
        const userRoles = (user as UsersDto).roles || []
        return userRoles.includes('ADMIN')
    }, [user])

    const isAuthenticated = useMemo(() => {
        return !!token && !!user
    }, [token, user])

    const hasRole = (role: string) => {
        if (!user) return false
        const userRoles = (user as UsersDto).roles || []
        return userRoles.includes(role)
    }

    // Reusable bean object
    const authBean: AuthBean = useMemo(() => ({
        token,
        user,
        isLoading,
        isAdmin,
        isAuthenticated,
        hasRole,
        logout,
        login,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal
    }), [token, user, isLoading, isAdmin, isAuthenticated, isLoginModalOpen])

    const contextValue = useMemo(() => ({
        auth: authBean,
        token,
        user,
        isLoading,
        isAdmin,
        isAuthenticated,
        logout,
        setToken,
        openLoginModal,
        closeLoginModal
    }), [authBean, token, user, isLoading, isAdmin, isAuthenticated, isLoginModalOpen])

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

// Hook to access the Auth Context and its AuthBean
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

// Hook to secure routes or components programmatically
export function useRequireAuth(allowedRoles?: string[]) {
    const { auth } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!auth.isLoading) {
            if (!auth.isAuthenticated) {
                navigate({ to: '/auth/login' as any })
            } else if (allowedRoles && auth.user) {
                const userRoles = (auth.user as UsersDto).roles || ['CUSTOMER']
                const hasRequiredRole = allowedRoles.some(r => userRoles.includes(r))
                if (!hasRequiredRole) {
                    navigate({ to: '/' as any }) // Redirect to home if unauthorized
                }
            }
        }
    }, [auth.isLoading, auth.isAuthenticated, auth.user, allowedRoles, navigate])

    return auth
}

// Guard component to authorize route sub-trees declaratively
export function AuthGuard({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
    const { auth } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [unauthPath] = useState(location.pathname)
    const [hasTriggeredModal, setHasTriggeredModal] = useState(false)

    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated && !hasTriggeredModal) {
            auth.openLoginModal()
            setHasTriggeredModal(true)
        }
    }, [auth.isLoading, auth.isAuthenticated, auth, hasTriggeredModal])

    useEffect(() => {
        // If the modal is closed and the user is still unauthenticated on the blocked path,
        // it means they declined/cancelled the login request. We gracefully send them to the fallback public page.
        if (hasTriggeredModal && !auth.isLoginModalOpen && !auth.isAuthenticated && location.pathname === unauthPath && !auth.isLoading) {
            navigate({ to: '/public/laptops' as any, replace: true })
        }
    }, [hasTriggeredModal, auth.isLoginModalOpen, auth.isAuthenticated, auth.isLoading, location.pathname, unauthPath, navigate])

    if (auth.isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8] dark:bg-bg-white-0">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-100 border-t-red-600"></div>
                    <span className="text-xs font-semibold text-gray-500">Đang xác thực thông tin...</span>
                </div>
            </div>
        )
    }

    if (!auth.isAuthenticated) {
        return null
    }

    if (allowedRoles && auth.user) {
        const userRoles = (auth.user as UsersDto).roles || ['CUSTOMER']
        const hasRequiredRole = allowedRoles.some(r => userRoles.includes(r))
        if (!hasRequiredRole) {
            // Act as if the route doesn't exist for unauthorized users
            return <NotFoundComponent />
        }
    }

    return <>{children}</>
}

// Dedicated Guard component for Admin routes
export function AdminGuard({ children }: { children: React.ReactNode }) {
    return <AuthGuard allowedRoles={['ADMIN']}>{children}</AuthGuard>
}

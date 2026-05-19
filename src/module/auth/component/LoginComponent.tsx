import { useState } from 'react'
import { AuthService } from '../service/auth-service'
import { useMutation } from '@tanstack/react-query'
import type { ErrorMessage } from '#/lib/http.client'
import { useNavigateErrorPage } from '#/hooks/use-navigate-error-page'
import type { AuthTokenDto, LoginRequestDto } from '../dto'
import type { AbstractForm } from '#/utils/validate-form'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../context/auth-context'

const loginFormRules: AbstractForm<LoginRequestDto> = {
    email: (val) => {
        if (!val) return 'Email không được để trống'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Email không đúng định dạng'
        return null
    },
    password: (val) => {
        if (!val) return 'Mật khẩu không được để trống'
        if (val.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự'
        return null
    },
}

export function LoginComponent() {
    const [authService] = useState(() => new AuthService())
    const authContext = useAuth()
    
    const [loginRequestState, setLoginRequest] = useState<LoginRequestDto>({
        email: '',
        password: '',
    })

    const [errors, setErrors] = useState<Partial<Record<keyof LoginRequestDto, string>>>({})

    const { navigateErrorPage } = useNavigateErrorPage()
    const navigate = useNavigate()

    const ssoMutation = useMutation({
        mutationFn: (loginType: string) =>
            authService.getAuthorizationUrl(loginType),
        onSuccess: (url: string) => {
            window.location.href = url
        },
        onError: (error: ErrorMessage) => {
            navigateErrorPage(error.status)
        },
    })

    const loginMutation = useMutation({
        mutationFn: () => authService.login(loginRequestState),
        onSuccess: (result : AuthTokenDto) => {
            authContext.setToken(result)
            navigate({ to: '/' })
        }
    })

    const validateBeforeLogin = () => {
        let isValid = true
        const newErrors: Partial<Record<keyof LoginRequestDto, string>> = {}
        
        // Lặp qua các rules để validate
        for (const key in loginFormRules) {
            const field = key as keyof LoginRequestDto
            const rule = loginFormRules[field]
            if (rule) {
                const error = rule(loginRequestState[field], loginRequestState)
                if (typeof error === 'string') {
                    newErrors[field] = error
                    isValid = false
                }
            }
        }
        
        setErrors(newErrors)
        return isValid
    }

    const handleLogin = () => {
        if (validateBeforeLogin()) {
            loginMutation.mutate()
        }
    }

    const handleInputChange = (field: keyof LoginRequestDto) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setLoginRequest(prev => ({ ...prev, [field]: value }))
        
        // Reset error text khi user type
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    const handleValidateField = (field: keyof LoginRequestDto, value: string) => {
        const rule = loginFormRules[field]
        if (rule) {
            const error = rule(value, loginRequestState)
            if (typeof error === 'string') {
                setErrors(prev => ({ ...prev, [field]: error }))
            }
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-bg-weak-50 px-4 py-12 transition-colors duration-300 dark:bg-bg-white-0">
            <div className="w-full max-w-md overflow-hidden rounded-20 bg-bg-white-0 shadow-complex-12 transition-all dark:bg-bg-weak-50">
                <div className="px-8 pt-10 pb-8 text-center">
                    {/* Brand Logo Placeholder */}
                    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-10 bg-primary-base text-static-white shadow-fancy-buttons-primary">
                        <span className="text-label-xl font-bold">S</span>
                    </div>

                    <h1 className="mb-2 text-title-h5 font-bold tracking-tight text-text-strong-950">
                        Đăng nhập
                    </h1>
                    <p className="mb-8 text-paragraph-sm text-text-sub-600">
                        Vui lòng nhập thông tin của bạn để đăng nhập
                    </p>

                    <div className="space-y-4">
                        {/* Google Login Button */}
                        <button
                            onClick={() => ssoMutation.mutate('google')}
                            disabled={ssoMutation.isPending}
                            className="group relative flex w-full items-center justify-center gap-3 rounded-10 border border-stroke-soft-200 bg-bg-white-0 px-4 py-3 text-label-sm font-medium text-text-strong-950 shadow-regular-sm transition-all hover:bg-bg-weak-50 hover:shadow-regular-md active:scale-[0.98] disabled:opacity-50 dark:border-stroke-sub-300 dark:bg-bg-weak-50 dark:hover:bg-bg-surface-800"
                        >
                            {ssoMutation.isPending ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-base border-t-transparent" />
                            ) : (
                                <svg
                                    className="h-5 w-5 transition-transform group-hover:scale-110"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                            )}
                            <span>Đăng nhập với Google</span>
                        </button>

                        <div className="relative my-8 flex items-center justify-center">
                            <div className="h-[1px] w-full bg-stroke-soft-200 dark:bg-stroke-sub-300"></div>
                            <span className="absolute bg-bg-white-0 px-3 text-label-2xs font-medium uppercase tracking-wider text-text-soft-400 dark:bg-bg-weak-50">
                                Hoặc đăng nhập với
                            </span>
                        </div>

                        {/* Traditional Login Forms (UI Only for now) */}
                        <div className="space-y-2 text-left text-text-strong-950">
                            <label className="text-label-xs font-semibold">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="name@company.com"
                                value={loginRequestState.email}
                                onBlur={(e) => handleValidateField('email', e.target.value)}
                                onChange={handleInputChange('email')}
                                className={`w-full rounded-10 border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-stroke-soft-200 focus:border-primary-base focus:ring-primary-alpha-10'} bg-bg-white-0 px-4 py-2.5 text-paragraph-sm shadow-custom-input outline-none transition-all focus:ring-4 dark:border-stroke-sub-300 dark:bg-bg-weak-50`}
                            />
                            {errors.email && (
                                <p className="mt-1 text-label-xs text-red-500">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2 text-left text-text-strong-950">
                            <div className="flex items-center justify-between">
                                <label className="text-label-xs font-semibold">
                                    Mật khẩu
                                </label>
                                <a
                                    href="#"
                                    className="text-label-xs font-medium text-primary-base hover:underline"
                                >
                                    Quên mật khẩu?
                                </a>
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={loginRequestState.password}
                                onBlur={(e) => handleValidateField('password', e.target.value)}
                                onChange={handleInputChange('password')}
                                className={`w-full rounded-10 border ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-stroke-soft-200 focus:border-primary-base focus:ring-primary-alpha-10'} bg-bg-white-0 px-4 py-2.5 text-paragraph-sm shadow-custom-input outline-none transition-all focus:ring-4 dark:border-stroke-sub-300 dark:bg-bg-weak-50`}
                            />
                            {errors.password && (
                                <p className="mt-1 text-label-xs text-red-500">{errors.password}</p>
                            )}
                        </div>

                        <button 
                            onClick={handleLogin}
                            disabled={loginMutation.isPending}
                            className="mt-4 flex w-full items-center justify-center rounded-10 bg-static-black px-4 py-3 text-label-sm font-semibold text-static-white shadow-fancy-buttons-neutral transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50 dark:bg-primary-base dark:hover:bg-blue-600">
                            {loginMutation.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </div>
                </div>

                <div className="border-t border-stroke-soft-200 bg-bg-weak-25 px-8 py-5 text-center dark:border-stroke-sub-300 dark:bg-bg-surface-800">
                    <p className="text-label-xs text-text-sub-600">
                        Chưa có tài khoản?{' '}
                        <Link
                            to="/auth/sign-up"
                            className="font-semibold text-primary-base hover:underline"
                        >
                            Đăng ký
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

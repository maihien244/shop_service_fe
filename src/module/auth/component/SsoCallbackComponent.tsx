import { useNavigate, useSearch } from '@tanstack/react-router'
import type {
    AuthTokenDto,
    RegisterResponseDto,
    SsoCallbackRequest,
} from '../dto'
import { useEffect, useState } from 'react'
import { AuthService } from '../service/auth-service'
import { useMutation } from '@tanstack/react-query'
import { useNavigateErrorPage } from '#/hooks/use-navigate-error-page'
import type { ErrorMessage } from '#/lib/http.client'
import { SsoRegisterModal } from './SsoRegisterModal'
import { useAuth } from '../context/auth-context'

export function SsoCallbackComponent() {
    const navigate = useNavigate()
    const { setToken } = useAuth()
    const [authService] = useState(() => new AuthService())
    const requestParam = useSearch({ strict: false }) as SsoCallbackRequest

    // State for registration modal
    const [isRegisterModalOpen, setRegisterModalOpen] = useState(false)
    const [registerData, setRegisterData] = useState<RegisterResponseDto | null>(null)

    const { navigateErrorPage } = useNavigateErrorPage()
    const mutation = useMutation<
        AuthTokenDto | RegisterResponseDto,
        ErrorMessage
    >({
        mutationFn: () =>
            authService.googleVerify<AuthTokenDto | RegisterResponseDto>(
                requestParam,
            ),
        onError: (error: ErrorMessage) => {
            navigateErrorPage(error.status)
        },
        onSuccess: (data: AuthTokenDto | RegisterResponseDto) => {
            if ('accessToken' in data) {
                // If the user already exists, backend returns token. We log them in.
                setToken(data as AuthTokenDto)
                navigate({ to: '/public/laptops' as any })
            } else {
                // If user doesn't exist, backend returns email & fullName. We ask for the rest.
                setRegisterData(data as RegisterResponseDto)
                setRegisterModalOpen(true)
            }
        },
    })

    useEffect(() => {
        mutation.mutate()
    }, [requestParam, mutation.mutate])

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8] dark:bg-bg-white-0">
            {mutation.isPending && (
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#d70018] border-t-transparent"></div>
                    <span className="text-sm font-semibold text-gray-500">Đang xác thực thông tin từ Google...</span>
                </div>
            )}
            <SsoRegisterModal
                isOpen={isRegisterModalOpen}
                onClose={() => {
                    setRegisterModalOpen(false)
                    navigate({ to: '/public/laptops' as any })
                }}
                initialData={registerData}
            />
        </div>
    )
}

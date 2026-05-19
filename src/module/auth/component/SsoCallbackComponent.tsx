import { useSearch } from '@tanstack/react-router'
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

export function SsoCallbackComponent() {
    const [authService] = useState(() => new AuthService())
    const requestParam = useSearch({ strict: false }) as SsoCallbackRequest
    console.log(requestParam)

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
            console.log('data', data)
        },
    })

    useEffect(() => {
        mutation.mutate()
    }, [requestParam])
    return <div>SsoCallbackComponent</div>
}

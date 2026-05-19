import { useNavigate } from '@tanstack/react-router'

export function useNavigateErrorPage() {
    const navigate = useNavigate()

    const navigateErrorPage = (status: number) => {
        navigate({
            to: '/error',
            search: {
                status,
            },
        })
    }

    return { navigateErrorPage }
}

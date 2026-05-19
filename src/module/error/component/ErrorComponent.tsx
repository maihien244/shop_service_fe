export interface ErrorComponentProps {
    status: number
}

export function ErrorComponent({ status }: ErrorComponentProps) {
    console.log('status', status)
    return <>{status} status</>
}

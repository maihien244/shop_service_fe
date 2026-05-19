export function LoadingComponent() {
    return (
        <div className="flex items-center justify-center gap-3 text-text-sub-600 dark:text-text-soft-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-base border-t-transparent" />
            <span>Đang tải dữ liệu...</span>
        </div>
    )
}
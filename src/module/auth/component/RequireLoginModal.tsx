import { Link } from '@tanstack/react-router'
import { AlertCircle, X } from 'lucide-react'

type RequireLoginModalProps = {
    isOpen: boolean
    onClose: () => void
    title?: string
    message?: string
}

export function RequireLoginModal({ 
    isOpen, 
    onClose, 
    title = 'Yêu cầu đăng nhập', 
    message = 'Bạn cần đăng nhập để tiếp tục thực hiện hành động này. Bạn có muốn chuyển đến trang đăng nhập không?' 
}: RequireLoginModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-static-black/40 px-4 backdrop-blur-sm transition-all duration-300">
            <div className="relative w-full max-w-sm animate-slide-up rounded-2xl bg-white p-6 shadow-complex-20 dark:bg-bg-weak-50">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-neutral-100 hover:text-gray-600 transition-all dark:hover:bg-bg-surface-850 dark:hover:text-static-white outline-none"
                >
                    <X size={18} />
                </button>

                {/* Content */}
                <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[#d70018] dark:bg-red-955/20">
                        <AlertCircle size={28} className="stroke-[1.5]" />
                    </div>
                    
                    <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-static-white">
                        {title}
                    </h3>
                    
                    <p className="mb-6 text-sm text-gray-500 dark:text-text-soft-400 leading-relaxed">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex w-full gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-neutral-50 dark:border-stroke-sub-300 dark:bg-bg-weak-50 dark:text-text-soft-400 dark:hover:bg-bg-surface-850 dark:hover:text-static-white outline-none"
                        >
                            Hủy bỏ
                        </button>
                        <Link
                            to="/auth/login"
                            search={{ redirect: window.location.pathname + window.location.search }}
                            onClick={onClose}
                            className="flex-1 rounded-xl bg-[#d70018] py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-red-700 active:scale-[0.98] text-center"
                        >
                            Đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

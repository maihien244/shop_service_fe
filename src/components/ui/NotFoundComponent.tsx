import { Link, useRouter } from '@tanstack/react-router'
import { Home, ArrowLeft } from 'lucide-react'

export function NotFoundComponent() {
    const router = useRouter()
    
    return (
        <div className="min-h-screen flex flex-col bg-[#f4f6f8] text-[#1f2937] dark:bg-bg-white-0 dark:text-static-white items-center justify-center p-4">
            <div className="text-center max-w-lg w-full animate-slide-up">
                
                <div className="mb-10 relative inline-block">
                    <h1 className="text-[120px] sm:text-[150px] leading-none font-black text-gray-200 dark:text-stroke-sub-300 drop-shadow-sm select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="bg-white/90 dark:bg-bg-weak-50/90 px-6 py-2 text-xl sm:text-2xl font-black text-[#d70018] rounded-2xl backdrop-blur-md shadow-sm border border-red-100 dark:border-red-900/30 uppercase tracking-widest">
                            Not Found
                        </span>
                    </div>
                </div>
                
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-static-white mb-4">
                    Không tìm thấy nội dung
                </h2>
                
                <p className="text-base text-gray-500 dark:text-text-soft-400 mb-10 leading-relaxed max-w-sm mx-auto font-medium">
                    Trang bạn đang tìm kiếm có thể đã bị xóa, thay đổi đường dẫn, hoặc bạn không có quyền truy cập.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => window.history.length > 2 ? router.history.back() : window.location.href = '/public/laptops'}
                        className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-neutral-200 dark:border-stroke-sub-300 bg-white dark:bg-bg-weak-50 text-gray-700 dark:text-static-white font-bold hover:bg-neutral-50 dark:hover:bg-bg-surface-850 transition-all text-sm outline-none"
                    >
                        <ArrowLeft size={18} strokeWidth={2.5} />
                        Quay lại
                    </button>
                    <Link
                        to="/public/laptops"
                        className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#d70018] text-white font-bold hover:bg-red-700 transition-all shadow-md active:scale-[0.98] text-sm outline-none"
                    >
                        <Home size={18} strokeWidth={2.5} />
                        Trang chủ
                    </Link>
                </div>
                
            </div>
        </div>
    )
}

import { useState } from 'react'
import { Outlet, Link, useNavigate } from '@tanstack/react-router'
import { useCart } from '../module/cart/hooks/use-cart'
import {
    Search,
    ShoppingCart,
    Truck,
    User,
    Menu,
    X,
    Laptop,
    LogOut
} from 'lucide-react'
import { useAuth } from '../module/auth/context/auth-context'
import * as Popover from '#/components/ui/popover'

export function PublicLayout() {
    const navigate = useNavigate()
    const { totalItemsCount } = useCart()
    const { auth } = useAuth()
    const { isAuthenticated, user, logout } = auth
    const [searchVal, setSearchVal] = useState('')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchVal.trim()) {
            navigate({
                to: '/public/laptops' as any,
                search: { search: searchVal.trim() } as any
            } as any)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#f4f6f8] text-[#1f2937] dark:bg-bg-white-0 dark:text-static-white transition-colors duration-300">

            {/* Sticky Premium Header */}
            <header className="sticky top-0 z-50 bg-[#d70018] text-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

                    {/* Logo & Brand Name */}
                    <Link
                        to="/public/laptops"
                        className="flex items-center gap-2 shrink-0 select-none hover:opacity-90 transition-opacity"
                    >
                        <div className="bg-white text-[#d70018] p-1.5 rounded-xl shadow-inner flex items-center justify-center">
                            <Laptop size={20} className="stroke-[2.5]" />
                        </div>
                        <span className="text-md font-black uppercase tracking-wider hidden sm:inline-block">
                            SHOP LAPTOP
                        </span>
                    </Link>

                    {/* Navigation Action Links */}
                    <div className="hidden lg:flex items-center gap-4 text-xs font-extrabold">
                        <Link
                            to="/users/orders"
                            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl hover:bg-white/10 transition-all shrink-0"
                        >
                            <Truck size={16} />
                            <div className="text-left leading-tight">
                                <span className="text-[9px] font-bold block opacity-80">Tra cứu</span>
                                <span>Đơn hàng</span>
                            </div>
                        </Link>

                        {/* Shopping Cart with Badge */}
                        <Link
                            to="/users/carts"
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl transition-all relative shrink-0"
                        >
                            <ShoppingCart size={16} />
                            <span>Giỏ hàng</span>
                            {totalItemsCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-gray-900 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#d70018] shadow-sm animate-bounce">
                                    {totalItemsCount}
                                </span>
                            )}
                        </Link>

                        {/* User Account / Profile */}
                        {isAuthenticated && user ? (
                            <Popover.Root>
                                <Popover.Trigger asChild>
                                    <button className="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-2 py-1.5 rounded-full transition-all shrink-0 outline-none">
                                        <div className="w-7 h-7 rounded-full bg-white text-[#d70018] flex items-center justify-center font-bold text-xs shadow-inner">
                                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <span className="max-w-[120px] truncate text-sm font-semibold pr-2">{user.fullName || 'User'}</span>
                                    </button>
                                </Popover.Trigger>
                                <Popover.Content align="end" sideOffset={8} className="w-60 p-2 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-neutral-100 flex flex-col gap-1 dark:bg-bg-weak-50 dark:border-stroke-sub-300 outline-none z-50">
                                    <div className="px-3 py-2 border-b border-neutral-100 dark:border-stroke-sub-300 mb-1">
                                        <p className="font-bold text-sm text-gray-900 dark:text-static-white truncate">{user.fullName}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                    <Link to="/users/orders" className="px-3 py-2.5 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-bg-surface-850 rounded-xl transition-colors flex items-center gap-2.5 text-gray-700 dark:text-static-white outline-none">
                                        <Truck size={16} /> Đơn hàng của tôi
                                    </Link>
                                    {auth.hasRole('ADMIN') && (
                                        <Link to="/admin" className="px-3 py-2.5 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-bg-surface-850 rounded-xl transition-colors flex items-center gap-2.5 text-gray-700 dark:text-static-white outline-none">
                                            <User size={16} /> Trang quản trị
                                        </Link>
                                    )}
                                    <button onClick={() => logout()} className="px-3 py-2.5 text-sm font-semibold text-[#d70018] hover:bg-red-50 dark:hover:bg-red-955/20 rounded-xl transition-colors flex items-center gap-2.5 text-left outline-none mt-1">
                                        <LogOut size={16} /> Đăng xuất
                                    </button>
                                </Popover.Content>
                            </Popover.Root>
                        ) : (
                            <Link
                                to="/auth/login"
                                className="flex items-center gap-1.5 bg-white text-[#d70018] hover:bg-red-50 px-3.5 py-2 rounded-xl transition-all shadow-sm shrink-0 outline-none"
                            >
                                <User size={16} />
                                <span>Đăng nhập</span>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Right Controls */}
                    <div className="flex lg:hidden items-center gap-3">
                        <Link
                            to="/users/carts"
                            className="relative p-2 hover:bg-white/10 rounded-xl transition-all"
                        >
                            <ShoppingCart size={20} />
                            {totalItemsCount > 0 && (
                                <span className="absolute top-0 right-0 bg-yellow-400 text-gray-900 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                                    {totalItemsCount}
                                </span>
                            )}
                        </Link>

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 hover:bg-white/10 rounded-xl transition-all outline-none"
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>

                </div>

                {/* Mobile Sub Search Bar */}
                <div className="md:hidden px-4 pb-3">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <input
                            type="text"
                            placeholder="Bạn cần tìm sản phẩm laptop nào?..."
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                            className="w-full bg-white/15 hover:bg-white/20 focus:bg-white text-white focus:text-gray-900 placeholder-white/80 focus:placeholder-gray-400 text-xs font-semibold px-4 py-2 pl-9 rounded-lg outline-none transition-all"
                        />
                        <Search size={14} className="absolute left-3 top-2.5 text-white/80 pointer-events-none" />
                    </form>
                </div>

                {/* Mobile Navigation Drawer Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden bg-[#b30012] border-t border-red-700 py-4 px-4 space-y-3 font-bold text-sm">
                        <Link
                            to="/public/laptops"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-2 hover:text-red-200 transition-all"
                        >
                            Danh sách Laptop
                        </Link>
                        <Link
                            to="/users/orders"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-2 hover:text-red-200 transition-all"
                        >
                            Lịch sử mua hàng
                        </Link>
                        <Link
                            to="/users/carts"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-2 hover:text-red-200 transition-all"
                        >
                            Giỏ hàng của tôi ({totalItemsCount})
                        </Link>
                        {isAuthenticated && user ? (
                            <div className="pt-2 mt-2 border-t border-red-700/50 space-y-2">
                                <div className="py-2 px-2 flex items-center gap-3 bg-red-955/20 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-white text-[#d70018] flex items-center justify-center font-bold shadow-inner">
                                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-white font-bold truncate">{user.fullName}</p>
                                        <p className="text-red-200 text-xs truncate">{user.email}</p>
                                    </div>
                                </div>
                                {auth.hasRole('ADMIN') && (
                                    <Link
                                        to="/admin"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block py-2.5 px-3 hover:bg-red-955/20 rounded-lg transition-all flex items-center gap-2"
                                    >
                                        <User size={16} /> Trang quản trị
                                    </Link>
                                )}
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        logout();
                                    }}
                                    className="w-full text-left py-2.5 px-3 hover:bg-red-955/20 rounded-lg transition-all flex items-center gap-2"
                                >
                                    <LogOut size={16} /> Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/auth/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block bg-white text-[#d70018] py-2.5 rounded-lg text-center font-extrabold shadow-sm transition-all"
                            >
                                Đăng nhập / Đăng ký
                            </Link>
                        )}
                    </div>
                )}
            </header>

            {/* Main Page Layout Content */}
            <main className="flex-1 w-full mx-auto pb-12">
                <Outlet />
            </main>

            {/* CellphoneS Style Professional Footer */}
            <footer className="bg-white dark:bg-bg-weak-50 border-t border-neutral-200 dark:border-stroke-sub-300 text-xs text-gray-500 pt-10 pb-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

                    <div className="space-y-3">
                        <h4 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                            Tổng đài hỗ trợ miễn phí
                        </h4>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                            Thông tin và chính sách
                        </h4>
                        <ul className="space-y-1.5 font-semibold text-gray-600 dark:text-gray-300">
                            <li><Link to="/public/laptops" className="hover:text-[#d70018] hover:underline">Mua hàng và thanh toán Online</Link></li>
                            <li><Link to="/public/laptops" className="hover:text-[#d70018] hover:underline">Chính sách giao hàng tận nơi</Link></li>
                            <li><Link to="/public/laptops" className="hover:text-[#d70018] hover:underline">Tra cứu thông tin bảo hành</Link></li>
                            <li><Link to="/public/laptops" className="hover:text-[#d70018] hover:underline">Chính sách bảo mật thông tin</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                            Dịch vụ và thông tin khác
                        </h4>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                            Hệ thống cửa hàng
                        </h4>
                    </div>

                </div>
            </footer>

        </div>
    )
}

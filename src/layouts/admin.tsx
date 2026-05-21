import { Outlet, Link, useLocation } from '@tanstack/react-router'
import { 
    LayoutDashboard, 
    FileText, 
    Image as ImageIcon, 
    Settings, 
    Users,
    LogOut,
    ChevronRight,
    DotIcon,
    Laptop,
    Warehouse,
    TicketPercent
} from 'lucide-react'
import { clsx } from 'clsx'
import { SidebarNavigation } from '#/components/ui/slider-navigation'
import type { NavItemDividerType, NavItemType } from '#/components/application/app-navigation/config'

type NavItem = {
    label: string
    icon: any
    href: string
    children?: { label: string; href: string }[]
}

const navItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { 
        label: 'Bài viết', 
        icon: FileText, 
        href: '/admin/posts',
        children: [
            { label: 'Danh sách bài viết', href: '/admin/posts' },
            { label: 'Tạo bài viết', href: '/admin/posts/create' }
        ]
    },
    { 
        label: 'Sản phẩm', 
        icon: Laptop, 
        href: '/admin/laptops',
        children: [
            { label: 'Danh sách sản phẩm', href: '/admin/laptops' },
            { label: 'Tạo sản phẩm', href: '/admin/laptops/create' }
        ]
    },
    { 
        label: 'Danh Mục', 
        icon: ImageIcon, 
        href: '/admin/categories',
        children: [
            { label: 'Danh mục chung', href: '/admin/categories/base'},
            { label: 'Danh sách danh mục con', href: '/admin/categories' },
        ]
    },
    { 
        label: 'Kho', 
        icon: Warehouse, 
        href: '/admin/warehouses',
        children: [
            { label: 'Danh sách kho', href: '/admin/warehouses' },
            { label: 'Quản lý kho', href: '/admin/warehouses/storage' },
        ]
    },
    { 
        label: 'Mã giảm giá', 
        icon: TicketPercent, 
        href: '/admin/discounts',
        children: [
            { label: 'Danh sách mã giảm giá', href: '/admin/discounts' },
            { label: 'Tạo mã giảm giá', href: '/admin/discounts/create' }
        ]
    },
    { label: 'Người dùng', icon: Users, href: '/admin/users' },
    { label: 'Cài đặt', icon: Settings, href: '/admin/settings' },
]

const navItemsWithDividers: (NavItemType | NavItemDividerType)[] = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { divider: true },
    { 
        label: 'Bài viết', 
        icon: FileText, 
        href: '/admin/posts',
        items: [
            { label: 'Danh sách bài viết', href: '/admin/posts' },
            { label: 'Tạo bài viết', href: '/admin/posts/create' }
        ]
    },
    { divider: true },
    { 
        label: 'Sản phẩm', 
        icon: Laptop, 
        href: '/admin/laptops',
        items: [
            { label: 'Danh sách sản phẩm', href: '/admin/laptops' },
            { label: 'Tạo sản phẩm', href: '/admin/laptops/create' }
        ]
    },
    { divider: true },
    { 
        label: 'Danh Mục', 
        icon: ImageIcon, 
        href: '/admin/categories',
        items: [
            { label: 'Danh mục chung', href: '/admin/categories/base'},
            { label: 'Danh sách danh mục con', href: '/admin/categories' },
        ]
    },
    { divider: true },
    { 
        label: 'Kho', 
        icon: Warehouse, 
        href: '/admin/warehouses',
        items: [
            { label: 'Danh sách kho', href: '/admin/warehouses' },
            { label: 'Quản lý kho', href: '/admin/warehouses/storage' },
        ]
    },
    { divider: true },
    { 
        label: 'Mã giảm giá', 
        icon: TicketPercent, 
        href: '/admin/discounts',
        items: [
            { label: 'Danh sách mã giảm giá', href: '/admin/discounts' },
            { label: 'Tạo mã giảm giá', href: '/admin/discounts/create' }
        ]
    },
    { divider: true },
    { label: 'Người dùng', icon: Users, href: '/admin/users' },
    { label: 'Cài đặt', icon: Settings, href: '/admin/settings' },
]

export function AdminLayout() {
    const location = useLocation()

    return (
        <div className="flex h-screen w-full bg-bg-weak-50 p-4 gap-4 transition-colors duration-300 dark:bg-bg-white-0 overflow-y-hidden">
            {/* Floating Sidebar */}
            <aside className="flex w-[280px] flex-col rounded-3xl border border-stroke-soft-200 bg-bg-white-0 shadow-soft dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                {/* Logo Area */}
                <div className="flex h-24 items-center px-8 pt-2">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-lighter text-primary-base dark:bg-primary-alpha-24">
                            <LayoutDashboard size={22} />
                        </div>
                        <span className="text-label-md font-bold tracking-tight text-text-strong-950 dark:text-static-white">
                            Quản trị
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
                    <div className="mb-6 px-4 text-label-2xs font-bold uppercase tracking-widest text-text-soft-400">
                        Danh mục chính
                    </div>
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.href)
                        return (
                            <div key={item.href} className="flex flex-col gap-1">
                                <Link
                                    to={item.href}
                                    className={clsx(
                                        "group flex items-center justify-between rounded-2xl px-3 py-2.5 transition-all duration-300",
                                        isActive
                                            ? "bg-bg-weak-50 text-text-strong-950 dark:bg-bg-surface-800 dark:text-static-white" 
                                            : "text-text-sub-600 hover:bg-bg-weak-50/80 hover:text-text-strong-950 dark:text-text-soft-400 dark:hover:bg-bg-surface-800/80 dark:hover:text-static-white"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={clsx(
                                            "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300", 
                                            isActive ? "bg-primary-base text-static-white shadow-fancy-buttons-primary" : "bg-transparent group-hover:bg-bg-white-0 dark:group-hover:bg-bg-weak-50"
                                        )}>
                                            <item.icon size={18} className={clsx("transition-transform duration-300", isActive && "scale-110")} />
                                        </div>
                                        <span className="text-label-sm font-semibold">{item.label}</span>
                                    </div>
                                    {item.children ? (
                                        <ChevronRight size={16} className={clsx("text-text-soft-400 transition-transform duration-300", isActive && "rotate-90")} />
                                    ) : (
                                        isActive && <ChevronRight size={16} className="text-text-soft-400" />
                                    )}
                                </Link>

                                {/* Sub Navigation */}
                                {item.children && isActive && (
                                    <div className="mt-1 flex flex-col gap-1">
                                        {item.children.map((child) => {
                                            // Handle exact match for children
                                            const isChildActive = location.pathname === child.href || location.pathname === child.href + '/';
                                            return (
                                                <Link
                                                    key={child.href}
                                                    to={child.href}
                                                    className={clsx(
                                                        "rounded-xl px-3 py-3 text-paragraph-sm font-medium transition-all duration-300",
                                                        isChildActive 
                                                            ? "bg-primary-lighter text-primary-base dark:bg-primary-alpha-12" 
                                                            : "text-text-sub-600 hover:text-text-strong-950 dark:text-text-soft-400 dark:hover:text-static-white"
                                                    )}
                                                >
                                                    <span className='text-label-sm font-semibold pl-6 flex gap-2'>
                                                        <DotIcon size={20} />
                                                        {child.label}
                                                    </span>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </nav>

                {/* Bottom Logout Area */}
                <div className="p-4">
                    <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-stroke-soft-200 to-transparent dark:via-stroke-sub-300" />
                    <button className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-text-sub-600 transition-all duration-300 hover:bg-error-lighter hover:text-error-base dark:text-text-soft-400 dark:hover:bg-error-dark dark:hover:text-static-white">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-transparent transition-colors duration-300 group-hover:bg-bg-white-0 dark:group-hover:bg-bg-weak-50">
                            <LogOut size={18} />
                        </div>
                        <span className="text-label-sm font-semibold">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-stroke-soft-200 bg-bg-white-0 shadow-soft dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                {/* Content Outlet */}
                <main className="flex-1 overflow-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

// export function AdminLayout() {
//     const location = useLocation()

//     return (
//         <div className="flex h-screen w-full bg-bg-weak-50 p-4 gap-4 transition-colors duration-300 dark:bg-bg-white-0 overflow-y-hidden">
//             <aside className="flex w-[280px] flex-col rounded-3xl border border-stroke-soft-200 bg-bg-white-0 shadow-soft dark:border-stroke-sub-300 dark:bg-bg-weak-50">
//                 <SidebarNavigation items={navItemsWithDividers} activeUrl={location.pathname} />
//             </aside>

//             {/* Main Content Area */}
//             <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-secondary border-stroke-soft-200 bg-bg-white-0 shadow-soft dark:border-stroke-sub-300 dark:bg-bg-weak-50">
//                 {/* Content Outlet */}
//                 <main className="flex-1 overflow-hidden">
//                     <Outlet />
//                 </main>
//             </div>
//         </div>
//     )
// }

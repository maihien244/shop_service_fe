import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { X, Mail, User, Phone, MapPin, Lock } from 'lucide-react'
import { AuthService } from '../service/auth-service'
import { GenderType, type RegisterRequestDto, type RegisterResponseDto } from '../dto'
import { useNavigate } from '@tanstack/react-router'
import type { ErrorMessage } from '#/lib/http.client'
import { useToast } from '#/lib/toast/use-toast'
import * as Select from '#/components/ui/select'

type SsoRegisterModalProps = {
    isOpen: boolean
    onClose: () => void
    initialData: RegisterResponseDto | null
}

export function SsoRegisterModal({ isOpen, onClose, initialData }: SsoRegisterModalProps) {
    const { toastError, toastSuccess } = useToast()
    const navigate = useNavigate()
    const [authService] = useState(() => new AuthService())
    const [formData, setFormData] = useState<RegisterRequestDto>({
        email: '',
        fullName: '',
        phoneNumber: '',
        address: '',
        password: '',
        gender: GenderType.MALE.value as keyof typeof GenderType,
    })

    // Populate initial data from Google when it becomes available
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                email: initialData.email || '',
                fullName: initialData.fullName || '',
            }))
        }
    }, [initialData])

    const registerMutation = useMutation({
        mutationFn: (data: RegisterRequestDto) => authService.register(data),
        onSuccess: () => {
            toastSuccess("Đăng ký thành công")
            onClose()
            navigate({ to: '/auth/login' as any })
        },
        onError: (err: ErrorMessage) => {
            toastError(err.message)
        }
    })

    if (!isOpen) return null

    const handleChange = (field: keyof RegisterRequestDto) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }))
    }

    const handleSelectChange = (field: keyof RegisterRequestDto) => (value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        registerMutation.mutate(formData)
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-static-black/40 px-4 backdrop-blur-sm transition-all duration-300">
            <div className="relative w-full max-w-md animate-slide-up rounded-2xl bg-white p-6 shadow-complex-20 dark:bg-bg-weak-50">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-neutral-100 hover:text-gray-600 transition-all dark:hover:bg-bg-surface-850 dark:hover:text-static-white outline-none"
                >
                    <X size={18} />
                </button>

                {/* Content */}
                <div className="mb-6 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-static-white">
                        Hoàn tất đăng ký
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-text-soft-400 mt-1">
                        Vui lòng bổ sung các thông tin còn thiếu để hoàn tất.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Read-only fields from Google */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 dark:border-stroke-sub-300 dark:bg-bg-surface-850">
                            <Mail size={16} className="text-gray-400" />
                            <input
                                type="email"
                                value={formData.email}
                                readOnly
                                className="w-full bg-transparent text-sm font-semibold text-gray-500 outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 dark:border-stroke-sub-300 dark:bg-bg-surface-850">
                            <User size={16} className="text-gray-400" />
                            <input
                                type="text"
                                value={formData.fullName}
                                readOnly
                                className="w-full bg-transparent text-sm font-semibold text-gray-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="my-4 h-px w-full bg-neutral-100 dark:bg-stroke-sub-300"></div>

                    {/* Additional fields */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 focus-within:border-[#d70018] dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                            <Phone size={16} className="text-gray-400" />
                            <input
                                type="tel"
                                required
                                placeholder="Số điện thoại"
                                value={formData.phoneNumber}
                                onChange={handleChange('phoneNumber')}
                                className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none placeholder:font-normal dark:text-static-white"
                            />
                        </div>

                        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 focus-within:border-[#d70018] dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                            <MapPin size={16} className="text-gray-400" />
                            <input
                                type="text"
                                required
                                placeholder="Địa chỉ giao hàng"
                                value={formData.address}
                                onChange={handleChange('address')}
                                className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none placeholder:font-normal dark:text-static-white"
                            />
                        </div>

                        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 focus-within:border-[#d70018] dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                            <Lock size={16} className="text-gray-400" />
                            <input
                                type="password"
                                required
                                placeholder="Mật khẩu tài khoản"
                                value={formData.password}
                                onChange={handleChange('password')}
                                className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none placeholder:font-normal dark:text-static-white"
                            />
                        </div>

                        <Select.Root onValueChange={handleSelectChange('gender')}>
                            <Select.Trigger>
                                <Select.Value placeholder="Giới tính" />
                            </Select.Trigger>
                            <Select.Content >
                                {Object.keys(GenderType).map((key, index) => (
                                    <Select.Item key={index} value={key}>
                                        {GenderType[key as keyof typeof GenderType].lable}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                    </div>

                    <button
                        type="submit"
                        disabled={registerMutation.isPending}
                        className="mt-6 w-full rounded-xl bg-[#d70018] py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-50"
                    >
                        {registerMutation.isPending ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
                    </button>
                </form>
            </div>
        </div>
    )
}


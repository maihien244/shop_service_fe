import { useState } from 'react'
import { AuthService } from '../service/auth-service'
import { useMutation } from '@tanstack/react-query'
import type { ErrorMessage } from '#/lib/http.client'
import { GenderType, type RegisterRequestDto } from '../dto'
import type { AbstractForm, ValidatorFunction } from '#/utils/validate-form'
import { Link, useNavigate } from '@tanstack/react-router'
import * as Select from '#/components/ui/select'

interface SignUpForm extends RegisterRequestDto {
    confirmPassword: string
}

const registerFormRules: AbstractForm<SignUpForm> = {
    email: (val) => {
        if (!val) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Email không đúng định dạng'
        return null
    },
    phoneNumber: (val) => {
        if (!val) return 'Số điện thoại không được để trống'
        if (!/^\d{10,11}$/.test(val)) return 'Số điện thoại phải có 10-11 chữ số'
        return null
    },
    fullName: (val) => {
        if (!val) return 'Họ tên không được để trống'
        if (val.length < 2) return 'Họ tên phải có ít nhất 2 ký tự'
        return null
    },
    address: (val) => {
        if (!val) return 'Địa chỉ không được để trống'
        return null
    },
    gender: () => null,
    password: (val) => {
        if (!val) return 'Mật khẩu không được để trống'
        if (val.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự'
        return null
    },
    confirmPassword: (val, form) => {
        if (!val) return 'Xác nhận mật khẩu không được để trống'
        if (val !== form.password) return 'Mật khẩu xác nhận không khớp'
        return null
    },
}

export function SignUpComponent() {
    const [authService] = useState(() => new AuthService())
    const [registerState, setRegisterState] = useState<SignUpForm>({
        email: '',
        phoneNumber: '',
        address: '',
        fullName: '',
        password: '',
        confirmPassword: '',
        gender: null
    })

    const [errors, setErrors] = useState<Partial<Record<keyof SignUpForm, string>>>({})
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const navigate = useNavigate()

    const registerMutation = useMutation({
        mutationFn: (data: RegisterRequestDto) => authService.register(data),
        onSuccess: () => {
            navigate({ to : '/auth/login'})
        },
        onError: (error: ErrorMessage) => {
            console.log(error)
            setErrorMessage(error.message || 'Registration failed. Please try again.')
        },
    })

    const validateField = <K extends keyof SignUpForm>(field: K, value: SignUpForm[K]) => {
        const rule = registerFormRules[field] as ValidatorFunction<SignUpForm[K], SignUpForm> | undefined
        if (rule) {
            const error = rule(value, registerState)
            if (typeof error === 'string') {
                setErrors(prev => ({ ...prev, [field]: error }))
            } else {
                setErrors(prev => ({ ...prev, [field]: undefined }))
            }
        }
    }

    const validateAll = () => {
        let isValid = true
        const newErrors: Partial<Record<keyof SignUpForm, string>> = {}
        
        for (const key in registerFormRules) {
            const field = key as keyof SignUpForm
            const rule = registerFormRules[field] as ValidatorFunction<any, SignUpForm> | undefined
            if (rule) {
                const error = rule(registerState[field], registerState)
                if (typeof error === 'string') {
                    newErrors[field] = error
                    isValid = false
                }
            }
        }
        
        setErrors(newErrors)
        return isValid
    }

    const handleInputBlur = (field: keyof SignUpForm) => () => {
        validateField(field, registerState[field])
    }

    const handleInputChange = (field: keyof SignUpForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        let value: any = e.target.value
        
        // Chuyển đổi giá trị nếu là gender (vì GenderType là numeric enum)
        if (field === 'gender' && value !== '') {
            value = GenderType[value as keyof typeof GenderType]
        } else if (field === 'gender' && value === '') {
            value = null
        }

        setRegisterState(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
        if (errorMessage) {
            setErrorMessage(null)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validateAll()) {
            const { confirmPassword, ...data } = registerState
            registerMutation.mutate(data)
        }
    }

    const inputClasses = (field: keyof SignUpForm) => `
        w-full rounded-10 border px-4 py-2.5 text-paragraph-sm shadow-custom-input outline-none transition-all focus:ring-4
        ${errors[field] 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
            : 'border-stroke-soft-200 focus:border-primary-base focus:ring-primary-alpha-10'}
        bg-bg-white-0 dark:border-stroke-sub-300 dark:bg-bg-weak-50
    `

    return (
        <div className="flex min-h-screen items-center justify-center bg-bg-weak-50 px-4 py-12 transition-colors duration-300 dark:bg-bg-white-0">
            <div className="w-full max-w-lg overflow-hidden rounded-20 bg-bg-white-0 shadow-complex-12 transition-all dark:bg-bg-weak-50">
                <div className="px-8 pt-10 pb-8 text-center">
                    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-10 bg-primary-base text-static-white shadow-fancy-buttons-primary">
                        <span className="text-label-xl font-bold">S</span>
                    </div>

                    <h1 className="mb-2 text-title-h5 font-bold tracking-tight text-text-strong-950">
                        Đăng ký tài khoản
                    </h1>
                    <p className="mb-8 text-paragraph-sm text-text-sub-600">
                        Tham gia cùng chúng tôi ngay hôm nay! Chỉ mất một phút.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4 text-left">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label className="text-label-xs font-semibold text-text-strong-950">
                                Họ tên
                            </label>
                            <input
                                type="text"
                                placeholder="Nguyễn Văn A"
                                value={registerState.fullName}
                                onChange={handleInputChange('fullName')}
                                onBlur={handleInputBlur('fullName')}
                                className={inputClasses('fullName')}
                            />
                            {errors.fullName && <p className="text-label-2xs text-red-500 mt-1">{errors.fullName}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-label-xs font-semibold text-text-strong-950">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="name@company.com"
                                value={registerState.email}
                                onChange={handleInputChange('email')}
                                onBlur={handleInputBlur('email')}
                                className={inputClasses('email')}
                            />
                            {errors.email && <p className="text-label-2xs text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        {/* Phone Number & Address in a grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-label-xs font-semibold text-text-strong-950">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    placeholder="0123456789"
                                    value={registerState.phoneNumber}
                                    onChange={handleInputChange('phoneNumber')}
                                    onBlur={handleInputBlur('phoneNumber')}
                                    className={inputClasses('phoneNumber')}
                                />
                                {errors.phoneNumber && <p className="text-label-2xs text-red-500 mt-1">{errors.phoneNumber}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-label-xs font-semibold text-text-strong-950">
                                    Địa chỉ
                                </label>
                                <input
                                    type="text"
                                    placeholder="Hanoi, Vietnam"
                                    value={registerState.address}
                                    onChange={handleInputChange('address')}
                                    onBlur={handleInputBlur('address')}
                                    className={inputClasses('address')}
                                />
                                {errors.address && <p className="text-label-2xs text-red-500 mt-1">{errors.address}</p>}
                            </div>
                        </div>

                        {/* Gender */}
                        <div className="space-y-1.5">
                            <label className="text-label-xs font-semibold text-text-strong-950">
                                Giới tính
                            </label>
                            <Select.Root>
                                <Select.Trigger>
                                <Select.Value placeholder='Giới tính' />
                                </Select.Trigger>
                                <Select.Content>
                                {Object.values(GenderType).map((item, index) => (
                                    <Select.Item onChange={(e)=>handleInputChange('gender')} key={index} value={item.value}>
                                    {item.lable}
                                    </Select.Item>
                                ))}
                                </Select.Content>
                            </Select.Root>
                            {errors.gender && <p className="text-label-2xs text-red-500 mt-1">{errors.gender}</p>}
                        </div>

                        {/* Password Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-label-xs font-semibold text-text-strong-950">
                                    Mật khẩu
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={registerState.password}
                                    onChange={handleInputChange('password')}
                                    onBlur={handleInputBlur('password')}
                                    className={inputClasses('password')}
                                />
                                {errors.password && <p className="text-label-2xs text-red-500 mt-1">{errors.password}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-label-xs font-semibold text-text-strong-950">
                                    Xác nhận mật khẩu
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={registerState.confirmPassword}
                                    onChange={handleInputChange('confirmPassword')}
                                    onBlur={handleInputBlur('confirmPassword')}
                                    className={inputClasses('confirmPassword')}
                                />
                                {errors.confirmPassword && <p className="text-label-2xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                            </div>
                        </div>

                        {errorMessage && (
                            <div className="mt-4 rounded-10 bg-red-50 p-3 text-center dark:bg-red-900/20">
                                <span className="text-label-xs font-medium text-red-500">{errorMessage}</span>
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={registerMutation.isPending}
                            className="mt-6 flex w-full items-center justify-center rounded-10 bg-static-black px-4 py-3 text-label-sm font-semibold text-static-white shadow-fancy-buttons-neutral transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50 dark:bg-primary-base dark:hover:bg-blue-600"
                        >
                            {registerMutation.isPending ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : 'Create account'}
                        </button>
                    </form>
                </div>

                <div className="border-t border-stroke-soft-200 bg-bg-weak-25 px-8 py-5 text-center dark:border-stroke-sub-300 dark:bg-bg-surface-800">
                    <p className="text-label-xs text-text-sub-600">
                        Đã có tài khoản?{' '}
                        <Link
                            to="/auth/login"
                            className="font-semibold text-primary-base hover:underline"
                        >
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
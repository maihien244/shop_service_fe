import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { 
    Save,
    X,
    Loader2
} from 'lucide-react'
import { DiscountService } from '../service/discount-service'
import { type CreateDiscountRequest, DiscountType } from '../dto'
import { useToast } from '#/lib/toast/use-toast'
import * as Select from '#/components/ui/select'
import * as Input from '#/components/ui/input'
import type { AbstractForm, ValidatorFunction } from '#/utils/validate-form'
import type { DateRange } from 'react-day-picker'
import { DatePicker } from '#/components/ui/date-picker-ui'

const discountService = new DiscountService()

const discountFormRules: AbstractForm<CreateDiscountRequest> = {
    name: (val) => {
        if (!val || !val.trim()) return 'Tên khuyến mãi không được để trống'
        return null
    },
    code: (val) => {
        if (!val || !val.trim()) return 'Mã Code không được để trống'
        return null
    },
    quantity: (val) => {
        if (val === null || val === undefined || val < 0) return 'Số lượng không hợp lệ'
        return null
    },
    value: (val) => {
        if (val === null || val === undefined || val <= 0) return 'Giá trị không hợp lệ'
        return null
    }
}

interface UpdateDiscountControllerProps {
    discountId: number
    isOpen: boolean
    onClose: () => void
}

export function UpdateDiscountController({ discountId, isOpen, onClose }: UpdateDiscountControllerProps) {
    const queryClient = useQueryClient()
    const { toastSuccess, toastError } = useToast()
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    
    const [formState, setFormState] = useState<CreateDiscountRequest>({
        name: '',
        code: '',
        quantity: 0,
        type: DiscountType.PERCENT.value as keyof typeof DiscountType,
        expiryFrom: '',
        expiryTo: '',
        isActive: 1,
        value: 0
    })

    const [errors, setErrors] = useState<Partial<Record<keyof CreateDiscountRequest, string>>>({})

    const { data: discount, isLoading: isFetching } = useQuery({
        queryKey: ['discount', discountId],
        queryFn: () => discountService.getDetail(discountId),
        enabled: isOpen && !!discountId,
    })

    useEffect(() => {
        if (discount) {
            setFormState({
                name: discount.name,
                code: discount.code,
                quantity: discount.quantity,
                type: discount.type,
                expiryFrom: discount.expiryFrom ? new Date(discount.expiryFrom).toISOString().split('T')[0] : '',
                expiryTo: discount.expiryTo ? new Date(discount.expiryTo).toISOString().split('T')[0] : '',
                isActive: discount.isActive,
                value: discount.value ?? 0
            })
        }
    }, [discount])

    const validateField = <K extends keyof CreateDiscountRequest>(field: K, value: CreateDiscountRequest[K]) => {
        const rule = discountFormRules[field] as ValidatorFunction<CreateDiscountRequest[K], CreateDiscountRequest> | undefined
        if (rule) {
            const error = rule(value, formState)
            if (typeof error === 'string') {
                setErrors(prev => ({ ...prev, [field]: error }))
            } else {
                setErrors(prev => ({ ...prev, [field]: undefined }))
            }
        }
    }

    const validateAll = () => {
        let isValid = true
        const newErrors: Partial<Record<keyof CreateDiscountRequest, string>> = {}
        
        for (const key in discountFormRules) {
            const field = key as keyof CreateDiscountRequest
            const rule = discountFormRules[field] as ValidatorFunction<any, CreateDiscountRequest> | undefined
            if (rule) {
                const error = rule(formState[field], formState)
                if (typeof error === 'string') {
                    newErrors[field] = error
                    isValid = false
                }
            }
        }
        
        setErrors(newErrors)
        return isValid
    }

    const handleInputBlur = (field: keyof CreateDiscountRequest) => () => {
        validateField(field, formState[field])
    }

    const handleInputChange = (field: keyof CreateDiscountRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value
        setFormState(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }
    
    const handleSelectChange = (field: keyof CreateDiscountRequest, value: any) => {
        setFormState(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    const updateMutation = useMutation({
        mutationFn: (data: CreateDiscountRequest) => discountService.update(discountId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discounts'] })
            queryClient.invalidateQueries({ queryKey: ['discount', discountId] })
            onClose()
            toastSuccess('Cập nhật khuyến mãi thành công')
        },
        onError: () => {
            toastError('Cập nhật khuyến mãi thất bại')
        }
    })

    const handleSubmit = () => {
        if (!validateAll()) {
            toastError('Vui lòng kiểm tra lại thông tin');
            return;
        }

        const dataToSubmit = {
            ...formState,
            expiryFrom: formState.expiryFrom?.includes('T') ? formState.expiryFrom : formState.expiryFrom + "T00:00:00",
            expiryTo: formState.expiryTo?.includes('T') ? formState.expiryTo : formState.expiryTo + "T23:59:59"
        }

        updateMutation.mutate(dataToSubmit)
    }

    const handleChangeDate = (value: DateRange | undefined) => {
        setDateRange(value)
        setFormState(prev => ({ 
            ...prev, 
            expiryFrom: value?.from?.toISOString(), 
            expiryTo: value?.to?.toISOString() }))
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-bg-white-0/40 backdrop-blur-sm transition-opacity dark:bg-static-black/40" 
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-24 border border-stroke-soft-200 bg-bg-white-0 shadow-modal transition-all dark:border-stroke-sub-300 dark:bg-bg-weak-50 flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stroke-soft-200 px-6 py-4 dark:border-stroke-sub-300">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <h2 className="text-label-md font-bold text-text-strong-950 dark:text-static-white">
                                Chỉnh sửa khuyến mãi
                            </h2>
                            <p className="text-paragraph-xs text-text-sub-600 dark:text-text-soft-400">
                                Cập nhật thông tin mã khuyến mãi
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="group flex h-10 w-10 items-center justify-center rounded-14 border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 shadow-regular-sm transition-all hover:bg-bg-weak-50 active:scale-95 dark:border-stroke-sub-300 dark:bg-bg-weak-50 dark:text-text-soft-400"
                    >
                        <X size={20} className="transition-transform group-hover:rotate-90" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isFetching ? (
                        <div className="flex h-64 flex-col items-center justify-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary-base" />
                            <p className="text-label-sm text-text-sub-600 dark:text-text-soft-400">Đang tải thông tin...</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                            {/* Main Content */}
                            <div className="space-y-6">
                                <div className="rounded-24 border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                                    <div className="border-b border-stroke-soft-200 bg-bg-weak-25 px-5 py-3 dark:border-stroke-sub-300 dark:bg-bg-surface-800 overflow-hidden">
                                        <label className="text-label-2xs font-bold uppercase tracking-widest text-text-soft-400">
                                            Thông tin khuyến mãi
                                        </label>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div>
                                            <label className="text-label-sm font-semibold text-text-sub-600 dark:text-text-soft-400 mb-2 block">
                                                Tên khuyến mãi <span className="text-error-base">*</span>
                                            </label>
                                            <Input.Root size='medium' hasError={!!errors.name}>
                                                <Input.Wrapper>
                                                    <Input.Input
                                                        value={formState.name}
                                                        onChange={handleInputChange('name')}
                                                        onBlur={handleInputBlur('name')}
                                                        placeholder='Nhập tên khuyến mãi...'
                                                    />
                                                </Input.Wrapper>
                                            </Input.Root>
                                            {errors.name && <p className="text-label-sm text-error-base mt-1">{errors.name}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-label-sm font-semibold text-text-sub-600 dark:text-text-soft-400 mb-2 block">
                                                    Mã Code <span className="text-error-base">*</span>
                                                </label>
                                                <Input.Root size='medium' hasError={!!errors.code}>
                                                    <Input.Wrapper>
                                                        <Input.Input
                                                            value={formState.code}
                                                            onChange={handleInputChange('code')}
                                                            onBlur={handleInputBlur('code')}
                                                            placeholder='Nhập mã...'
                                                            className="uppercase"
                                                        />
                                                    </Input.Wrapper>
                                                </Input.Root>
                                                {errors.code && <p className="text-label-sm text-error-base mt-1">{errors.code}</p>}
                                            </div>
                                            <div>
                                                <label className="text-label-sm font-semibold text-text-sub-600 dark:text-text-soft-400 mb-2 block">
                                                    Số lượng
                                                </label>
                                                <Input.Root size='medium' hasError={!!errors.quantity}>
                                                    <Input.Wrapper>
                                                        <Input.Input
                                                            type="number"
                                                            value={formState.quantity}
                                                            onChange={handleInputChange('quantity')}
                                                            onBlur={handleInputBlur('quantity')}
                                                            placeholder='Nhập số lượng...'
                                                            min={0}
                                                        />
                                                    </Input.Wrapper>
                                                </Input.Root>
                                                {errors.quantity && <p className="text-label-sm text-error-base mt-1">{errors.quantity}</p>}
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-label-sm font-semibold text-text-sub-600 dark:text-text-soft-400 mb-2 block">
                                                    Giá trị <span className="text-error-base">*</span>
                                                </label>
                                                <Input.Root size='medium' hasError={!!errors.value}>
                                                    <Input.Wrapper>
                                                        <Input.Input
                                                            type="number"
                                                            value={formState.value}
                                                            onChange={handleInputChange('value')}
                                                            onBlur={handleInputBlur('value')}
                                                            placeholder='Nhập giá trị...'
                                                            min={0}
                                                        />
                                                    </Input.Wrapper>
                                                </Input.Root>
                                                {errors.value && <p className="text-label-sm text-error-base mt-1">{errors.value}</p>}
                                                <p className="text-paragraph-xs text-text-soft-400 mt-1">
                                                    (Nhập số tiền hoặc phần trăm tùy theo loại khuyến mãi)
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                <div className="rounded-24 border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                                    <h3 className="mb-4 text-label-xs font-bold text-text-strong-950 dark:text-static-white uppercase tracking-wider">
                                        Cài đặt
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-label-2xs font-semibold text-text-sub-600 dark:text-text-soft-400">
                                                Trạng thái
                                            </label>
                                            <div className="relative">
                                                <Select.Root value={formState.isActive.toString()} onValueChange={(value) => handleSelectChange('isActive', value)}>
                                                    <Select.Trigger>
                                                        <Select.Value placeholder='Trạng thái' />
                                                    </Select.Trigger>
                                                    <Select.Content>
                                                        <Select.Item value="1">Hoạt động</Select.Item>
                                                        <Select.Item value="0">Đã khóa</Select.Item>
                                                    </Select.Content>
                                                </Select.Root>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-label-2xs font-semibold text-text-sub-600 dark:text-text-soft-400">
                                                Loại khuyến mãi
                                            </label>
                                            <div className="relative">
                                                <Select.Root value={formState.type} onValueChange={(value) => handleSelectChange('type', value as keyof typeof DiscountType)}>
                                                    <Select.Trigger>
                                                        <Select.Value placeholder='Loại' />
                                                    </Select.Trigger>
                                                    <Select.Content>
                                                        {Object.values(DiscountType).map((item, index) => (
                                                        <Select.Item key={index} value={item.value}>
                                                            {item.label}
                                                        </Select.Item>
                                                        ))}
                                                    </Select.Content>
                                                </Select.Root>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-label-2xs font-semibold text-text-sub-600 dark:text-text-soft-400">
                                                Ngày hết hạn <span className="text-error-base">*</span>
                                            </label>
                                            <DatePicker 
                                                value={dateRange}
                                                onChange={handleChangeDate}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-24 border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                                    <h3 className="mb-3 text-label-2xs font-bold text-text-strong-950 dark:text-static-white uppercase tracking-wider">
                                        Thông tin
                                    </h3>
                                    <div className="space-y-2 text-[11px]">
                                        <div className="flex justify-between">
                                            <span className="text-text-soft-400">ID</span>
                                            <span className="font-semibold text-text-strong-950 dark:text-static-white">#{discountId}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-stroke-soft-200 bg-bg-weak-25 px-6 py-4 dark:border-stroke-sub-300 dark:bg-bg-surface-800">
                    <button
                        onClick={onClose}
                        className="rounded-14 border border-stroke-soft-200 bg-bg-white-0 px-5 py-2.5 text-label-sm font-semibold text-text-sub-600 transition-all hover:bg-bg-weak-50 active:scale-95 dark:border-stroke-sub-300 dark:bg-bg-weak-50 dark:text-text-soft-400"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={updateMutation.isPending || isFetching}
                        className="flex items-center gap-2 rounded-14 bg-primary-base px-6 py-2.5 text-label-sm font-semibold text-static-white shadow-fancy-buttons-primary transition-all hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50"
                    >
                        {updateMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    )
}

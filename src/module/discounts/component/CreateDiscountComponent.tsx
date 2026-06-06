import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { 
    Save,
    X
} from 'lucide-react'
import { DiscountService } from '../service/discount-service'
import { type CreateDiscountRequest, DiscountType } from '../dto'
import { useToast } from '#/lib/toast/use-toast'
import * as Input from '#/components/ui/input'
import * as Select from '#/components/ui/select'
import type { AbstractForm, ValidatorFunction } from '#/utils/validate-form'
import type { DateRange } from 'react-day-picker'
import { DatePicker } from '#/components/ui/date-picker-ui'
import { MultiSelect } from '#/components/base/select/multi-select'
import { useSearchLaptop } from '#/module/laptop/hooks/use-search-laptop'
import type { Selection } from "react-aria-components"
import { useSearchUsers } from '#/module/users/hooks/use-search-users'
import type { SelectItemType } from '#/components/base/select/select-shared'
import type { BaseError } from '#/lib/dto/base-error'

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

export function CreateDiscountComponent() {
    const navigate = useNavigate()
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
        value: 0,
        moduleIds: [],
    })

    const [errors, setErrors] = useState<Partial<Record<keyof CreateDiscountRequest, string>>>({})

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

    const createMutation = useMutation({
        mutationFn: (data: CreateDiscountRequest) => discountService.create(data),
        onSuccess: () => {
            navigate({ to: '/admin/discounts' })
            toastSuccess('Tạo khuyến mãi thành công')
        },
        onError: (error: BaseError) => {
            if (error?.status === 409) {
                toastError("Mã Code đã tồn tại!")
            } else {
                toastError('Tạo khuyến mãi thất bại')
            }
        }
    })

    const handleSubmit = () => {
        if (!validateAll()) {
            toastError('Vui lòng kiểm tra lại thông tin');
            return;
        }

        const dataToSubmit = {
            ...formState,
            expiryFrom: formState.expiryFrom ? formState.expiryFrom?.includes('T') ? formState.expiryFrom : formState.expiryFrom + "T00:00:00" : '',
            expiryTo: formState.expiryTo ? formState.expiryTo?.includes('T') ? formState.expiryTo : formState.expiryTo + "T23:59:59" : ''
        }
        console.log('formState', formState)
        console.log('dataToSubmit', dataToSubmit)

        createMutation.mutate(dataToSubmit)
    }

    const handleChangeDate = (value: DateRange | undefined) => {
        setDateRange(value)
        setFormState(prev => ({ 
            ...prev, 
            expiryFrom: value?.from?.toISOString(), 
            expiryTo: value?.to?.toISOString() }))
    }

    const { options: laptopOptions, input: laptopInput, setInput: setLaptopInput } = useSearchLaptop({
        param: 'name:ct',
        queryKey: ['laptops']
    })

    const { options: userOptions, input: userInput, setInput: setUserInput } = useSearchUsers({
        params: 'email:ct',
        queryKey: ['users']
    })

    const handleSelectionChange = (field: keyof CreateDiscountRequest, keys: Selection, options: SelectItemType[] | undefined) => {
        if (keys === 'all') {
            setFormState(prev => ({ 
                ...prev, 
                [field]: options?.map((item) => Number(item.id)) || [] 
            }));
        } else {
            setFormState(prev => ({ 
                ...prev, 
                [field]: Array.from(keys).map((key) => Number(key)) 
            }));
        }
    }

    const handleSelectAll = (field: keyof CreateDiscountRequest, options: SelectItemType[] | undefined) => {
        setFormState(prev => ({ 
            ...prev, 
            [field]: options?.map((item) => Number(item.id)) || [] 
        }));
    }

    const handleSelectNone = (field: keyof CreateDiscountRequest) => {
        setFormState(prev => ({ ...prev, [field]: [] }));
    }

    return (
        <div className="min-h-screen bg-bg-weak-50 transition-colors duration-300 dark:bg-bg-white-0 overflow-hidden">
            {/* Sticky Header */}
            <header className="sticky h-20 top-0 z-20 border-b border-stroke-soft-200 bg-bg-white-0/80 backdrop-blur-md dark:border-stroke-sub-300 dark:bg-bg-weak-50/80">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate({ to: '/admin/discounts' })}
                            className="group flex h-10 w-10 items-center justify-center rounded-10 border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 shadow-regular-sm transition-all hover:bg-bg-weak-50 active:scale-95 dark:border-stroke-sub-300 dark:bg-bg-weak-50 dark:text-text-soft-400"
                        >
                            <X size={20} className="transition-transform group-hover:rotate-90" />
                        </button>
                        <div>
                            <h1 className="text-label-md font-bold text-text-strong-950 dark:text-static-white">
                                Tạo khuyến mãi mới
                            </h1>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSubmit}
                            disabled={createMutation.isPending}
                            className="flex items-center gap-2 rounded-10 bg-static-black px-6 py-2.5 text-label-sm font-semibold text-static-white shadow-fancy-buttons-neutral transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50 dark:bg-primary-base dark:hover:bg-blue-600 dark:shadow-fancy-buttons-primary"
                        >
                            {createMutation.isPending ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-static-white border-t-transparent" />
                            ) : (
                                <>
                                    <Save size={18} />
                                    Lưu thay đổi
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl p-4 overflow-hidden">
                <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                    {/* Primary Area */}
                    <div className="space-y-8">
                        {/* Information Section */}
                        <div className="overflow-hidden rounded-20 bg-bg-white-0 shadow-complex dark:bg-bg-weak-50">
                            <div className="border-b border-stroke-soft-200 bg-bg-weak-25 px-6 py-4 dark:border-stroke-sub-300 dark:bg-bg-surface-800">
                                <label className="text-label-xs font-bold uppercase tracking-widest text-text-soft-400">
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
                                    <div>
                                        <label className="text-label-sm font-semibold text-text-sub-600 dark:text-text-soft-400 mb-2 block">
                                            Đối tượng áp dụng 
                                        </label>
                                        <MultiSelect
                                            size="sm"
                                            className="!bg-white"
                                            placeholder="Chọn đối tượng áp dụng"
                                            items={laptopOptions}
                                            selectedKeys={new Set(formState.moduleIds?.map((id) => id.toString()))}
                                            onSelectionChange={(keys) => handleSelectionChange('moduleIds', keys, laptopOptions)}
                                            supportingText={`${formState.moduleIds?.length || 0} đã chọn`}
                                            onReset={() => handleSelectNone('moduleIds')}
                                            onSelectAll={() => handleSelectAll('moduleIds', laptopOptions)}
                                        >
                                            {(item) => (
                                                <MultiSelect.Item id={item.id} textValue={item.label} selectionIndicator="checkbox" selectionIndicatorAlign="left">
                                                    {item.label}
                                                </MultiSelect.Item>
                                            )}
                                        </MultiSelect>
                                    </div>
                                    <div>
                                        <label className="text-label-sm font-semibold text-text-sub-600 dark:text-text-soft-400 mb-2 block">
                                            Người dùng áp dụng
                                        </label>
                                        <MultiSelect
                                            size="sm"
                                            className="!bg-white"
                                            placeholder="Chọn người dùng"
                                            items={userOptions}
                                            selectedKeys={new Set(formState.userIds?.map((id) => id.toString()))}
                                            onSelectionChange={(keys) => handleSelectionChange('userIds', keys, userOptions)}
                                            supportingText={`${formState.userIds?.length || 0} đã chọn`}
                                            onReset={() => handleSelectNone('userIds')}
                                            onSelectAll={() => handleSelectAll('userIds', userOptions)}
                                        >
                                            {(item) => (
                                                <MultiSelect.Item id={item.id} textValue={item.label} selectionIndicator="checkbox" selectionIndicatorAlign="left">
                                                    {item.label}
                                                </MultiSelect.Item>
                                            )}
                                        </MultiSelect>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <aside className="space-y-6">
                        <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-complex dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                            <h3 className="mb-6 flex items-center gap-2 text-label-sm font-bold text-text-strong-950 dark:text-static-white">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary-base" />
                                Tùy chọn khuyến mãi
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400">
                                        Trạng thái
                                    </label>
                                    <div className="relative group">
                                        <Select.Root value={formState.isActive?.toString()} onValueChange={(value) => handleSelectChange('isActive', value)}>
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

                                <div className="space-y-3">
                                    <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400">
                                        Loại khuyến mãi
                                    </label>
                                    <div className="relative group">
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

                                <div className="space-y-3 flex flex-col">
                                    <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400">
                                        Ngày hết hạn <span className="text-error-base">*</span>
                                    </label>
                                    <DatePicker 
                                        value={dateRange}
                                        onChange={handleChangeDate}
                                    />
                                </div>

                                <div className="rounded-12 bg-primary-lighter p-4 dark:bg-primary-alpha-10">
                                    <p className="text-paragraph-xs font-medium text-primary-base">
                                        Lưu ý: Mã khuyến mãi hoạt động sẽ có thể được áp dụng bởi người dùng.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    )
}

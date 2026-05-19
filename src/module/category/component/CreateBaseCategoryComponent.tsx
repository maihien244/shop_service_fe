import { useEffect, useState } from 'react'
import type { CreateBaseCategoryRequest } from '../dto/base-category.dto'
import type { AbstractForm, ValidatorFunction } from '#/utils/validate-form'
import * as Input from '#/components/ui/input'
import * as Select from '#/components/ui/select'
import * as Button from '#/components/ui/button'
import { BaseCategoryService } from '../service/base-category-service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '#/lib/toast/use-toast'
import { X, FolderPlus } from 'lucide-react'

const categoryFormRules: AbstractForm<CreateBaseCategoryRequest> = {
    name: (val) => {
        if (!val) return 'Tên danh mục không được để trống'
        return null
    },
    code: (val) => {
        if (!val) return 'Mã danh mục không được để trống'
        return null
    },
    isActive: (val) => {
        if (val === null || val === undefined) return 'Trạng thái không được để trống'
        return null
    }
}

interface CreateBaseCategoryComponentProps {
    baseCategoryId?: number
    isOpen: boolean
    onClose: () => void
}

export function CreateBaseCategoryComponent({ baseCategoryId, isOpen, onClose }: CreateBaseCategoryComponentProps) {
    const [baseCategoryService] = useState(() => new BaseCategoryService())
    const { toastSuccess, toastError } = useToast()
    const queryClient = useQueryClient()
    const [formState, setFormState] = useState<CreateBaseCategoryRequest>({
        name: '',
        code: '',
        isActive: 1, // Default active
    })

    useEffect(() => {
        if (baseCategoryId) {
            baseCategoryService.getById(baseCategoryId).then((res) => {
                setFormState(res)
            })
        }
    }, [baseCategoryId])

    const [errors, setErrors] = useState<Partial<Record<keyof CreateBaseCategoryRequest, string>>>({})

    const validateField = <K extends keyof CreateBaseCategoryRequest>(field: K, value: CreateBaseCategoryRequest[K]) => {
        const rule = categoryFormRules[field] as ValidatorFunction<CreateBaseCategoryRequest[K], CreateBaseCategoryRequest> | undefined
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
        const newErrors: Partial<Record<keyof CreateBaseCategoryRequest, string>> = {}
        
        for (const key in categoryFormRules) {
            const field = key as keyof CreateBaseCategoryRequest
            const rule = categoryFormRules[field] as ValidatorFunction<any, CreateBaseCategoryRequest> | undefined
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

    const handleInputBlur = (field: keyof CreateBaseCategoryRequest) => () => {
        validateField(field, formState[field])
    }

    const handleInputChange = (field: keyof CreateBaseCategoryRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setFormState(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }
    
    const handleSelectChange = (field: keyof CreateBaseCategoryRequest, value: any) => {
        setFormState(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    const handleClose = () => {
        setFormState({
            name: '',
            code: '',
            isActive: 1,
        })
        setErrors({})
        onClose()
    }

    const createMutation = useMutation({
        mutationFn: (data: CreateBaseCategoryRequest) => baseCategoryService.createBaseCategory(data),
        onSuccess: () => {
            toastSuccess(baseCategoryId ? "Cập nhật danh mục thành công" : "Tạo danh mục thành công")
            queryClient.invalidateQueries({ queryKey: ['base-categories'] })
            handleClose()
        },
        onError: (error) => {
            toastError(baseCategoryId ? "Cập nhật danh mục thất bại" : "Tạo danh mục thất bại")
        },
    })

    const updateMutation = useMutation({
        mutationFn: (data: CreateBaseCategoryRequest) => baseCategoryService.updateBaseCategory(baseCategoryId!, data),
        onSuccess: () => {
            toastSuccess("Cập nhật danh mục thành công")
            queryClient.invalidateQueries({ queryKey: ['base-categories'] })
            handleClose()
        },
        onError: (error) => {
            toastError("Cập nhật danh mục thất bại")
        },
    })

    const handleSubmit = () => {
        if (validateAll()) {
            if (!baseCategoryId) {
                createMutation.mutate(formState)
            } else {
                updateMutation.mutate(formState)
            }
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-bg-white-0/40 backdrop-blur-sm transition-opacity dark:bg-static-black/40" 
                onClick={handleClose}
            />

            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-12 border border-stroke-soft-200 bg-bg-white-0 shadow-modal transition-all dark:border-stroke-sub-300 dark:bg-bg-weak-50 flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stroke-soft-200 px-6 py-4 dark:border-stroke-sub-300 bg-bg-weak-25 dark:bg-bg-surface-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-alpha-10 text-primary-base">
                            <FolderPlus size={20} />
                        </div>
                        <h2 className="text-label-md font-bold text-text-strong-950 dark:text-static-white">
                            {baseCategoryId ? 'Cập nhật danh mục chung' : 'Tạo danh mục chung'}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="group flex h-10 w-10 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 shadow-regular-sm transition-all hover:bg-bg-weak-50 active:scale-95 dark:border-stroke-sub-300 dark:bg-bg-weak-50 dark:text-text-soft-400"
                    >
                        <X size={20} className="transition-transform group-hover:rotate-90" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-bg-white-0 dark:bg-bg-weak-50/50 custom-scrollbar">
                    <form className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-label-sm font-medium text-text-strong-950 dark:text-static-white">
                                Tên danh mục <span className="text-error-base">*</span>
                            </label>
                            <Input.Root hasError={!!errors.name}>
                                <Input.Wrapper>
                                    <Input.Input
                                        placeholder="Nhập tên danh mục"
                                        value={formState.name}
                                        onChange={handleInputChange('name')}
                                        onBlur={handleInputBlur('name')}
                                    />
                                </Input.Wrapper>
                            </Input.Root>
                            {errors.name && <p className="text-label-sm text-error-base">{errors.name}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-label-sm font-medium text-text-strong-950 dark:text-static-white">
                                Mã danh mục <span className="text-error-base">*</span>
                            </label>
                            <Input.Root hasError={!!errors.code}>
                                <Input.Wrapper>
                                    <Input.Input
                                        placeholder="Nhập mã danh mục"
                                        value={formState.code}
                                        onChange={handleInputChange('code')}
                                        onBlur={handleInputBlur('code')}
                                    />
                                </Input.Wrapper>
                            </Input.Root>
                            {errors.code && <p className="text-label-sm text-error-base">{errors.code}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-label-sm font-medium text-text-strong-950 dark:text-static-white">
                                Trạng thái <span className="text-error-base">*</span>
                            </label>
                            <Select.Root
                                value={formState.isActive.toString()}
                                onValueChange={(val) => handleSelectChange('isActive', Number(val))}
                            >
                                <Select.Trigger className={errors.isActive ? 'ring-error-base focus:ring-error-base' : ''}>
                                    <Select.Value placeholder="Chọn trạng thái" />
                                </Select.Trigger>
                                <Select.Content>
                                    <Select.Item value="1">Hoạt động</Select.Item>
                                    <Select.Item value="0">Không hoạt động</Select.Item>
                                </Select.Content>
                            </Select.Root>
                            {errors.isActive && <p className="text-label-sm text-error-base">{errors.isActive}</p>}
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-stroke-soft-200 bg-bg-weak-25 px-6 py-4 dark:border-stroke-sub-300 dark:bg-bg-surface-800">
                    <Button.Root variant="neutral" mode="stroke" type="button" onClick={handleClose}>
                        Hủy
                    </Button.Root>
                    <Button.Root 
                        variant="primary" 
                        mode="filled" 
                        type="button" 
                        onClick={handleSubmit}
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? 'Đang xử lý...' : baseCategoryId ? 'Cập nhật danh mục' : 'Tạo danh mục'}
                    </Button.Root>
                </div>
            </div>
        </div>
    )
}
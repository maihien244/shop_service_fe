import { useEffect, useState } from 'react'
import type { AbstractForm, ValidatorFunction } from '#/utils/validate-form'
import * as Input from '#/components/ui/input'
import * as SelectAlignUi from '#/components/ui/select'
import { Select, type SelectItemType } from "@/components/base/select/select";
import * as Button from '#/components/ui/button'
import { BaseCategoryService } from '../service/base-category-service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '#/lib/toast/use-toast'
import { X, FolderPlus } from 'lucide-react'
import type { CreateCategoryRequest } from '../dto/category.dto'
import { CategoryService } from '../service/category-service'

const categoryFormRules: AbstractForm<CreateCategoryRequest> = {
    name: (val) => {
        if (!val) return 'Tên danh mục không được để trống'
        return null
    },
    code: (val) => {
        if (!val) return 'Mã danh mục không được để trống'
        return null
    },
    baseCodeId: (val) => {
        if (!val) return 'Danh mục cha không được để trống'
        return null
    },
    isActive: (val) => {
        if (val === null || val === undefined) return 'Trạng thái không được để trống'
        return null
    }
}

interface CreateCategoryComponentProps {
    categoryId?: number
    isOpen: boolean
    onClose: () => void
}

export function CreateCategoryComponent({ categoryId, isOpen, onClose }: CreateCategoryComponentProps) {
    const [categoryService] = useState(() => new CategoryService())
    const [baseCategoryService] = useState(() => new BaseCategoryService())
    const [baseCategories, setBaseCategories] = useState<SelectItemType[]>([])
    const [baseNameCt, setBaseNameCt] = useState<string|null>(null)
    const { toastSuccess, toastError } = useToast()
    const queryClient = useQueryClient()
    const [formState, setFormState] = useState<CreateCategoryRequest>({
        name: '',
        code: '',
        isActive: 1, // Default active
        baseCodeId: null
    })

    useEffect(() => {
        if (categoryId) {
            categoryService.getById(categoryId).then((res) => {
                setFormState({
                    name: res.name,
                    code: res.code,
                    isActive: res.isActive,
                    baseCodeId: res.baseCodeId
                })
            })
        }
    }, [categoryId])

    useEffect(() => {
        baseCategoryService.getList(
            {
                "name:ct": baseNameCt!,
                isActive: 1,
            }
        ).then((res) => {
            setBaseCategories(res.results.map((item) => ({
                id: item.id.toString(),
                label: item.name,
            })))
        })
    }, [baseNameCt])


    const [errors, setErrors] = useState<Partial<Record<keyof CreateCategoryRequest, string>>>({})

    const validateField = <K extends keyof CreateCategoryRequest>(field: K, value: CreateCategoryRequest[K]) => {
        const rule = categoryFormRules[field] as ValidatorFunction<CreateCategoryRequest[K], CreateCategoryRequest> | undefined
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
        const newErrors: Partial<Record<keyof CreateCategoryRequest, string>> = {}
        
        for (const key in categoryFormRules) {
            const field = key as keyof CreateCategoryRequest
            const rule = categoryFormRules[field] as ValidatorFunction<any, CreateCategoryRequest> | undefined
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

    const handleInputBlur = (field: keyof CreateCategoryRequest) => () => {
        validateField(field, formState[field])
    }

    const handleInputChange = (field: keyof CreateCategoryRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setFormState(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }
    
    const handleSelectChange = (field: keyof CreateCategoryRequest, value: any) => {
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
            baseCodeId: null
        })
        setErrors({})
        onClose()
    }

    const createMutation = useMutation({
        mutationFn: (data: CreateCategoryRequest) => categoryService.create(data),
        onSuccess: () => {
            toastSuccess(categoryId ? "Cập nhật danh mục thành công" : "Tạo danh mục thành công")
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            handleClose()
        },
        onError: (error) => {
            console.log("🚀 ~ createMutation ~ error:", error)
            toastError(categoryId ? "Cập nhật danh mục thất bại" : "Tạo danh mục thất bại")
        },
    })

    const updateMutation = useMutation({
        mutationFn: (data: CreateCategoryRequest) => categoryService.update(categoryId!, data),
        onSuccess: () => {
            toastSuccess("Cập nhật danh mục thành công")
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            handleClose()
        },
        onError: (error) => {
            toastError("Cập nhật danh mục thất bại")
        },
    })

    const handleSubmit = () => {
        if (validateAll()) {
            if (!categoryId) {
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
                            {categoryId ? 'Cập nhật danh mục' : 'Tạo danh mục'}
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
                                Danh mục chung <span className="text-error-base">*</span>
                            </label>
                            <Select.ComboBox
                                isRequired
                                className="bg-white dark:bg-bg-weak-50"
                                items={baseCategories}
                                value={formState.baseCodeId?.toString()}
                                onChange={(val) => handleSelectChange('baseCodeId', Number(val))}
                                onInputChange={(val) => setBaseNameCt(val)}
                                placeholder="Chọn danh mục chung"
                            >
                                {
                                    (item) => (
                                        <Select.Item id={item.id}>
                                            {item.label}
                                        </Select.Item>
                                    )
                                }
                            </Select.ComboBox>
                            {errors.baseCodeId && <p className="text-label-sm text-error-base">{errors.baseCodeId}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-label-sm font-medium text-text-strong-950 dark:text-static-white">
                                Trạng thái <span className="text-error-base">*</span>
                            </label>
                            <SelectAlignUi.Root
                                value={formState.isActive.toString()}
                                onValueChange={(val) => handleSelectChange('isActive', Number(val))}
                            >
                                <SelectAlignUi.Trigger className={errors.isActive ? 'ring-error-base focus:ring-error-base' : ''}>
                                    <SelectAlignUi.Value placeholder="Chọn trạng thái" />
                                </SelectAlignUi.Trigger>
                                <SelectAlignUi.Content>
                                    <SelectAlignUi.Item value="1">Hoạt động</SelectAlignUi.Item>
                                    <SelectAlignUi.Item value="0">Không hoạt động</SelectAlignUi.Item>
                                </SelectAlignUi.Content>
                            </SelectAlignUi.Root>
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
                        {createMutation.isPending ? 'Đang xử lý...' : categoryId ? 'Cập nhật danh mục' : 'Tạo danh mục'}
                    </Button.Root>
                </div>
            </div>
        </div>
    )
}
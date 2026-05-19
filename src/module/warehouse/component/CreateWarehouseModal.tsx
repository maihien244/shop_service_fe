import { useEffect, useState } from 'react'
import type { CreateWarehouseRequest } from '../dto/warehouse.dto'
import type { AbstractForm, ValidatorFunction } from '#/utils/validate-form'
import * as Input from '#/components/ui/input'
import * as Select from '#/components/ui/select'
import * as Button from '#/components/ui/button'
import { WarehouseService } from '../servcie/warehouse-service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '#/lib/toast/use-toast'
import { X, Warehouse } from 'lucide-react'

const warehouseFormRules: AbstractForm<CreateWarehouseRequest> = {
    name: (val) => {
        if (!val) return 'Tên kho không được để trống'
        return null
    },
    address: (val) => {
        if (!val) return 'Địa chỉ không được để trống'
        return null
    },
    isActive: (val) => {
        if (val === null || val === undefined) return 'Trạng thái không được để trống'
        return null
    }
}

interface CreateWarehouseModalProps {
    warehouseId?: number
    isOpen: boolean
    onClose: () => void
}

export function CreateWarehouseModal({ warehouseId, isOpen, onClose }: CreateWarehouseModalProps) {
    const [warehouseService] = useState(() => new WarehouseService())
    const { toastSuccess, toastError } = useToast()
    const queryClient = useQueryClient()
    const [formState, setFormState] = useState<CreateWarehouseRequest>({
        name: '',
        address: '',
        isActive: 1, // Default active
    })

    const [errors, setErrors] = useState<Partial<Record<keyof CreateWarehouseRequest, string>>>({})

    useEffect(() => {
        if (warehouseId && isOpen) {
            warehouseService.getById(warehouseId).then((res) => {
                setFormState({
                    name: res.name,
                    address: res.address,
                    isActive: res.isActive
                })
            }).catch(() => {
                toastError("Không thể tải thông tin kho")
            })
        }
    }, [warehouseId, isOpen])

    const validateField = <K extends keyof CreateWarehouseRequest>(field: K, value: CreateWarehouseRequest[K]) => {
        const rule = warehouseFormRules[field] as ValidatorFunction<CreateWarehouseRequest[K], CreateWarehouseRequest> | undefined
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
        const newErrors: Partial<Record<keyof CreateWarehouseRequest, string>> = {}
        
        for (const key in warehouseFormRules) {
            const field = key as keyof CreateWarehouseRequest
            const rule = warehouseFormRules[field] as ValidatorFunction<any, CreateWarehouseRequest> | undefined
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

    const handleInputBlur = (field: keyof CreateWarehouseRequest) => () => {
        validateField(field, formState[field])
    }

    const handleInputChange = (field: keyof CreateWarehouseRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setFormState(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }
    
    const handleSelectChange = (field: keyof CreateWarehouseRequest, value: any) => {
        setFormState(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    const handleClose = () => {
        setFormState({
            name: '',
            address: '',
            isActive: 1,
        })
        setErrors({})
        onClose()
    }

    const createMutation = useMutation({
        mutationFn: (data: CreateWarehouseRequest) => warehouseService.create(data),
        onSuccess: () => {
            toastSuccess("Tạo kho thành công")
            queryClient.invalidateQueries({ queryKey: ['warehouses'] })
            handleClose()
        },
        onError: () => {
            toastError("Tạo kho thất bại")
        },
    })

    const updateMutation = useMutation({
        mutationFn: (data: CreateWarehouseRequest) => warehouseService.update(warehouseId!, data),
        onSuccess: () => {
            toastSuccess("Cập nhật thông tin kho thành công")
            queryClient.invalidateQueries({ queryKey: ['warehouses'] })
            handleClose()
        },
        onError: () => {
            toastError("Cập nhật thông tin kho thất bại")
        },
    })

    const handleSubmit = () => {
        if (validateAll()) {
            if (!warehouseId) {
                createMutation.mutate(formState)
            } else {
                updateMutation.mutate(formState)
            }
        }
    }

    if (!isOpen) return null

    const isPending = createMutation.isPending || updateMutation.isPending

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-bg-white-0/40 backdrop-blur-sm transition-opacity dark:bg-static-black/40" 
                onClick={handleClose}
            />

            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-24 border border-stroke-soft-200 bg-bg-white-0 shadow-modal transition-all dark:border-stroke-sub-300 dark:bg-bg-weak-50 flex flex-col animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stroke-soft-200 px-6 py-4 dark:border-stroke-sub-300 bg-bg-weak-25 dark:bg-bg-surface-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-alpha-10 text-primary-base">
                            <Warehouse size={20} />
                        </div>
                        <h2 className="text-label-md font-bold text-text-strong-950 dark:text-static-white">
                            {warehouseId ? 'Cập nhật kho hàng' : 'Thêm kho mới'}
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
                                Tên kho <span className="text-error-base">*</span>
                            </label>
                            <Input.Root hasError={!!errors.name}>
                                <Input.Wrapper className="bg-white">
                                    <Input.Input
                                        placeholder="Nhập tên kho hàng"
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
                                Địa chỉ <span className="text-error-base">*</span>
                            </label>
                            <Input.Root hasError={!!errors.address}>
                                <Input.Wrapper className="bg-white">
                                    <Input.Input
                                        placeholder="Nhập địa chỉ chi tiết kho hàng"
                                        value={formState.address}
                                        onChange={handleInputChange('address')}
                                        onBlur={handleInputBlur('address')}
                                    />
                                </Input.Wrapper>
                            </Input.Root>
                            {errors.address && <p className="text-label-sm text-error-base">{errors.address}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-label-sm font-medium text-text-strong-950 dark:text-static-white">
                                Trạng thái <span className="text-error-base">*</span>
                            </label>
                            <Select.Root
                                value={formState.isActive.toString()}
                                onValueChange={(val) => handleSelectChange('isActive', Number(val))}
                            >
                                <Select.Trigger className={`bg-white ${errors.isActive ? 'ring-error-base focus:ring-error-base' : ''}`}>
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
                        disabled={isPending}
                    >
                        {isPending ? 'Đang xử lý...' : warehouseId ? 'Cập nhật kho' : 'Thêm kho'}
                    </Button.Root>
                </div>
            </div>
        </div>
    )
}

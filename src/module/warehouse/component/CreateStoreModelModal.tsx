import { useState } from 'react'
import type { CreateStoreModelRequest } from '../dto/store-model.dto'
import { StoreModelStatus } from '../dto/store-model.dto'
import * as Select from '#/components/ui/select'
import * as Button from '#/components/ui/button'
import { StoreModelService } from '../servcie/store-model-service'
import { WarehouseService } from '../servcie/warehouse-service'
import { LaptopService } from '#/module/laptop/service/laptop-service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '#/lib/toast/use-toast'
import { X, Import } from 'lucide-react'
import * as Tag from '#/components/ui/tag'

interface CreateStoreModelModalProps {
    isOpen: boolean
    onClose: () => void
}

export function CreateStoreModelModal({ isOpen, onClose }: CreateStoreModelModalProps) {
    const [storeModelService] = useState(() => new StoreModelService())
    const [warehouseService] = useState(() => new WarehouseService())
    const [laptopService] = useState(() => new LaptopService())
    const { toastSuccess, toastError, toastWarning } = useToast()
    const queryClient = useQueryClient()

    // Form states
    const [warehouseId, setWarehouseId] = useState<number | undefined>(undefined)
    const [laptopId, setLaptopId] = useState<number | undefined>(undefined)
    const [status, setStatus] = useState<keyof typeof StoreModelStatus>('NEW')
    const [serialsText, setSerialsText] = useState('')
    const [serialNumbers, setSerialNumber] = useState<string[]>([])
    const [optionId, setOptionId] = useState<number | undefined>(undefined)

    // Validation errors
    const [errors, setErrors] = useState<Partial<Record<'warehouseId' | 'laptopId' | 'serialsText' | 'status' | 'optionId', string>>>({})

    // Fetch active warehouses
    const { data: warehouses } = useQuery({
        queryKey: ['warehouses-lookup'],
        queryFn: () => warehouseService.getList({ size: 100, isActive: 1 }),
        enabled: isOpen
    })

    // Fetch active laptops
    const { data: laptops } = useQuery({
        queryKey: ['laptops-lookup'],
        queryFn: () => laptopService.getList({ size: 100, isActive: 1 }),
        enabled: isOpen
    })

    const { data: options } = useQuery({
        queryKey: ['options-lookup', laptopId],
        queryFn: () => laptopService.getOptionsOfLaptop(laptopId!),
        enabled: isOpen && !!laptopId
    })

    const validateAll = () => {
        let isValid = true
        const newErrors: typeof errors = {}

        if (!warehouseId) {
            newErrors.warehouseId = 'Vui lòng chọn kho hàng'
            isValid = false
        }
        if (!laptopId) {
            newErrors.laptopId = 'Vui lòng chọn sản phẩm laptop'
            isValid = false
        }
        if (!status) {
            newErrors.status = 'Vui lòng chọn trạng thái'
            isValid = false
        }

        if (serialNumbers.length === 0) {
            newErrors.serialsText = 'Vui lòng nhập ít nhất một số Serial'
            isValid = false
        }
        if (!optionId) {
            newErrors.optionId = 'Vui lòng chọn cấu hình sản phẩm'
            isValid = false
        }
        setErrors(newErrors)
        return isValid
    }

    const handleClose = () => {
        setWarehouseId(undefined)
        setLaptopId(undefined)
        setStatus('NEW')
        setSerialsText('')
        setSerialNumber([])
        setErrors({})
        setOptionId(undefined)
        onClose()
    }

    const createMutation = useMutation({
        mutationFn: (data: CreateStoreModelRequest) => storeModelService.create(data),
        onSuccess: () => {
            toastSuccess("Nhập kho sản phẩm thành công")
            queryClient.invalidateQueries({ queryKey: ['store-models'] })
            handleClose()
        },
        onError: () => {
            toastError("Nhập kho sản phẩm thất bại")
        },
    })

    const handleSubmit = () => {
        if (validateAll()) {
            createMutation.mutate({
                warehouseId: warehouseId!,
                laptopId: laptopId!,
                status,
                serialNumbers,
                optionId: optionId!
            })
        }
    }

    const handleInputSerials = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            const values = e.currentTarget.value
            if (values === null || values.length === 0) {
                toastWarning('Giá trị Serial không được để trống')
                return
            }
            const serials = values
                .split('\n')
                .map(s => s.trim())
                .filter(s => s.length > 0)

            if (serialNumbers.some(s => serials.includes(s))) {
                const duplicateSerial = serialNumbers.find(s => serials.includes(s))
                toastWarning(`Serial ${duplicateSerial} đã tồn tại`)
                return
            }
            setSerialNumber((prev) => [...new Set([...prev, ...serials])])
            setSerialsText('')
        }
    }

    if (!isOpen) return null

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
                            <Import size={20} />
                        </div>
                        <h2 className="text-label-md font-bold text-text-strong-950 dark:text-static-white">
                            Nhập kho sản phẩm (Số lượng lớn)
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
                <div className="flex-1 overflow-y-auto p-6 bg-bg-white-0 dark:bg-bg-weak-50/50 custom-scrollbar space-y-6">
                    {/* Warehouse Selection */}
                    <div className="space-y-1.5">
                        <label className="text-label-sm font-medium text-text-strong-950 dark:text-static-white">
                            Kho hàng tiếp nhận <span className="text-error-base">*</span>
                        </label>
                        <Select.Root
                            value={warehouseId !== undefined ? warehouseId.toString() : ''}
                            onValueChange={(val) => {
                                setWarehouseId(Number(val))
                                if (errors.warehouseId) setErrors(prev => ({ ...prev, warehouseId: undefined }))
                            }}
                        >
                            <Select.Trigger className={`bg-white ${errors.warehouseId ? 'ring-error-base focus:ring-error-base' : ''}`}>
                                <Select.Value placeholder="Chọn kho hàng nhận sản phẩm" />
                            </Select.Trigger>
                            <Select.Content>
                                {warehouses?.results.map((w) => (
                                    <Select.Item key={w.id} value={w.id.toString()}>
                                        {w.name}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                        {errors.warehouseId && <p className="text-label-sm text-error-base">{errors.warehouseId}</p>}
                    </div>

                    {/* Laptop Selection */}
                    <div className="space-y-1.5">
                        <label className="text-label-sm font-medium text-text-strong-950 dark:text-static-white">
                            Sản phẩm Laptop <span className="text-error-base">*</span>
                        </label>
                        <Select.Root
                            value={laptopId !== undefined ? laptopId.toString() : ''}
                            onValueChange={(val) => {
                                setLaptopId(Number(val))
                                if (errors.laptopId) setErrors(prev => ({ ...prev, laptopId: undefined }))
                            }}
                        >
                            <Select.Trigger className={`bg-white ${errors.laptopId ? 'ring-error-base focus:ring-error-base' : ''}`}>
                                <Select.Value placeholder="Chọn loại laptop nhập kho" />
                            </Select.Trigger>
                            <Select.Content>
                                {laptops?.results.map((l) => (
                                    <Select.Item key={l.id} value={l.id.toString()}>
                                        {l.name}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                        {errors.laptopId && <p className="text-label-sm text-error-base">{errors.laptopId}</p>}
                    </div>

                    {/* option Selection */}
                    <div className="space-y-1.5">
                        <label className="text-label-sm font-medium text-text-strong-950 dark:text-static-white">
                            Option <span className="text-error-base">*</span>
                        </label>
                        <Select.Root
                            value={optionId !== undefined ? optionId.toString() : ''}
                            onValueChange={(val) => {
                                setOptionId(Number(val))
                                if (errors.laptopId) setErrors(prev => ({ ...prev, laptopId: undefined }))
                            }}
                        >
                            <Select.Trigger className={`bg-white ${errors.laptopId ? 'ring-error-base focus:ring-error-base' : ''}`}>
                                <Select.Value placeholder="Chọn Option laptop" />
                            </Select.Trigger>
                            <Select.Content>
                                {options?.results.map((l) => (
                                    <Select.Item className='w-full' key={l.id} value={l.id.toString()}>
                                        {l.name}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                        {errors.optionId && <p className="text-label-sm text-error-base">{errors.optionId}</p>}
                    </div>

                    {/* Status Selection */}
                    <div className="space-y-1.5">
                        <label className="text-label-sm font-medium text-text-strong-950 dark:text-static-white">
                            Trạng thái ban đầu <span className="text-error-base">*</span>
                        </label>
                        <Select.Root
                            value={status}
                            onValueChange={(val) => {
                                setStatus(val as keyof typeof StoreModelStatus)
                                if (errors.status) setErrors(prev => ({ ...prev, status: undefined }))
                            }}
                        >
                            <Select.Trigger className={`bg-white ${errors.status ? 'ring-error-base focus:ring-error-base' : ''}`}>
                                <Select.Value placeholder="Chọn trạng thái sản phẩm" />
                            </Select.Trigger>
                            <Select.Content>
                                {Object.values(StoreModelStatus).map((item) => (
                                    <Select.Item key={item.value} value={item.value}>
                                        {item.label}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                        {errors.status && <p className="text-label-sm text-error-base">{errors.status}</p>}
                    </div>

                    {/* Serial Numbers Textarea */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-label-sm font-medium text-text-strong-950 dark:text-static-white">
                                Danh sách số Serial <span className="text-error-base">*</span>
                            </label>
                            <span className="text-label-2xs text-text-soft-400">Mỗi số Serial nằm trên 1 dòng riêng biệt</span>
                        </div>
                        {serialNumbers.length > 0 ? (
                            <div className='w-full max-h-[100px] rounded-12 border bg-white outline-none focus:ring-2 font-mono text-label-sm transition-all p-2 flex flex-wrap gap-2 overflow-y-auto'>
                                {serialNumbers.map((serial, index) => (
                                    <Tag.Root key={index} className='px-2 py-1'>
                                        <span>{serial}</span>
                                        <Tag.Icon as={X} onClick={() => setSerialNumber(prev => prev.filter((_, i) => i !== index))} />
                                    </Tag.Root>
                                ))}
                            </div>
                        ) : ''}
                        <textarea
                            className={`w-full min-h-[40px] p-4 rounded-14 border bg-white outline-none focus:ring-2 font-mono text-label-sm transition-all resize-y ${errors.serialsText
                                ? 'border-error-base focus:ring-error-base/20'
                                : 'border-stroke-soft-200 focus:ring-primary-base/20 focus:border-primary-base dark:border-stroke-sub-300 dark:bg-bg-weak-50'
                                }`}
                            placeholder="Ví dụ:&#10;SN-LAPTOP-0001&#10;SN-LAPTOP-0002&#10;SN-LAPTOP-0003"
                            value={serialsText}
                            onChange={(e) => setSerialsText(e.target.value)}
                            onKeyDown={handleInputSerials}
                        />
                        {errors.serialsText && <p className="text-label-sm text-error-base">{errors.serialsText}</p>}
                    </div>
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
                        {createMutation.isPending ? 'Đang nhập kho...' : 'Hoàn tất nhập kho'}
                    </Button.Root>
                </div>
            </div>
        </div>
    )
}

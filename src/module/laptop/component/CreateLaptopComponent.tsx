import { useEffect, useState } from 'react'
import { EditorContent } from '@tiptap/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Save, X } from 'lucide-react'
import { LaptopService } from '../service/laptop-service'
import { type CreateLaptopRequest } from '../dto'
import { MenuBar } from '#/lib/tiptap/menu-bar'
import { getFullHTML, useTiptapEditor } from '#/lib/tiptap/hooks/use-tiptap-editor'
import type { AttachDto } from '#/module/attachs/dto'
import { useToast } from '#/lib/toast/use-toast'
import * as Input from '#/components/ui/input'
import { Select, type SelectItemType } from "@/components/base/select/select"
import * as SelectAlignUi from '#/components/ui/select'
import { FileUploadComponent } from '#/module/file-upload/component/FileUploadComponnet'
import type { AbstractForm, ValidatorFunction } from '#/utils/validate-form'
import { SwiperCardEffect } from '#/components/ui/swiper-card-effect'
import { useSlug } from '#/hooks/use-slug'
import { useSearchCategory } from '#/module/category/hooks/use-search-category'

const laptopService = new LaptopService()

const formRules: AbstractForm<CreateLaptopRequest> = {
    name: (val) => val ? null : 'Tên sản phẩm không được để trống',
    originalPrice: (val) => val > 0 ? null : 'Giá sản phẩm phải lớn hơn 0',
    brandId: (val) => val ? null : 'Vui lòng chọn hãng sản xuất',
    screenSizeId: (val) => val ? null : 'Vui lòng chọn kích thước màn hình',
    ramId: (val) => val ? null : 'Vui lòng chọn dung lượng RAM',
    storageId: (val) => val ? null : 'Vui lòng chọn dung lượng ổ cứng',
    gpuId: (val) => val ? null : 'Vui lòng chọn Card đồ họa (GPU)',
    cpuId: (val) => val ? null : 'Vui lòng chọn Vi xử lý (CPU)',
    screenId: (val) => val ? null : 'Vui lòng chọn màn hình (Độ phân giải)',
    description: (val) => val ? null : 'Vui lòng nhập mô tả',
}

export function CreateLaptopComponent() {
    const navigate = useNavigate()
    const search: any = useSearch({ strict: false })
    const laptopId = search?.laptopId ? Number(search.laptopId) : undefined

    const { toastSuccess, toastError } = useToast()
    const queryClient = useQueryClient()

    const [formState, setFormState] = useState<CreateLaptopRequest>({
        name: '',
        description: '',
        originalPrice: 0,
        brandId: 0,
        screenSizeId: 0,
        ramId: 0,
        storageId: 0,
        gpuId: 0,
        cpuId: 0,
        screenId: 0,
        parentId: undefined,
        isActive: 1,
        attachIds: [],
        slug: '',
    })
    
    const [,setAttachs] = useState<AttachDto[]>([])
    const [thumbnails, setThumbnails] = useState<AttachDto[]>([])
    const [errors, setErrors] = useState<Partial<Record<keyof CreateLaptopRequest, string>>>({})
    const { generateSlug } = useSlug('vi')

    const editor = useTiptapEditor({
        className: 'min-h-[400px] px-6 py-4 text-text-strong-950 dark:text-static-white leading-relaxed',
    })

    // Fetch existing laptop data if edit mode
    useEffect(() => {
        if (laptopId && editor) {
            laptopService.getById(laptopId).then(data => {
                setFormState({
                    name: data.name,
                    description: data.description,
                    originalPrice: data.originalPrice,
                    brandId: data.brandId,
                    screenSizeId: data.screenSizeId,
                    ramId: data.ramId,
                    storageId: data.storageId,
                    gpuId: data.gpuId,
                    cpuId: data.cpuId,
                    screenId: data.screenId,
                    parentId: data.parentId,
                    isActive: data.isActive,
                    attachIds: data.attaches?.map(a => a.id) || [],
                    slug: data.slug,
                })
                editor.commands.setContent(data.description)
                if (data.attaches && data.attaches.length > 0) {
                    setThumbnails(data.attaches)
                }
            })
        }
    }, [laptopId, editor])

    // Load category lookups
    const { options: brandOptions, setInput: setBrandInput } = useSearchCategory({
        baseCode: 'H_SERVICE_BRAND',
        queryKey: ['categories', 'H_SERVICE_BRAND'],
        param: 'name:ct',
    })
    
    const { options: screenOptions, setInput: setScreenInput } = useSearchCategory({
        baseCode: 'H_SERVICE_SCREEN',
        queryKey: ['categories', 'H_SERVICE_SCREEN'],
        param: 'name:ct',
    })

    const { options: screenSizeOptions, setInput: setScreenSizeInput } = useSearchCategory({
        baseCode: 'H_SERVICE_SCREEN_SIZE',
        queryKey: ['categories', 'H_SERVICE_SCREEN_SIZE'],
        param: 'name:ct',
    })

    const { options: ramOptions, setInput: setRamInput } = useSearchCategory({
        baseCode: 'H_SERVICE_RAM',
        queryKey: ['categories', 'H_SERVICE_RAM'],
        param: 'name:ct',
    })

    const { options: storageOptions, setInput: setStorageInput } = useSearchCategory({
        baseCode: 'H_SERVICE_STORAGE',
        queryKey: ['categories', 'H_SERVICE_STORAGE'],
        param: 'name:ct',
    })

    const { options: cpuOptions, setInput: setCpuInput } = useSearchCategory({
        baseCode: 'H_SERVICE_CPU',
        queryKey: ['categories', 'H_SERVICE_CPU'],
        param: 'name:ct',
    })

    const { options: gpuOptions, setInput: setGpuInput } = useSearchCategory({
        baseCode: 'H_SERVCIE_GPU',
        queryKey: ['categories', 'H_SERVCIE_GPU'],
        param: 'name:ct',
    })

    const [ nameParent, setNameParent ] = useState('')
    const { data: parentOptions } = useQuery({
        queryKey: ['laptops'],
        queryFn: () => laptopService.getList({
            'name:ct': nameParent.length > 0 ? nameParent : undefined,
            isActive: 1,
            size: 100
        }).then(r => r.results
            .map(c => ({ id: c.id.toString(), label: c.name } as SelectItemType))
            .filter(c => (laptopId ? c.id !== laptopId?.toString() : true)))
    })

    const validateAll = () => {
        let isValid = true
        const newErrors: Partial<Record<keyof CreateLaptopRequest, string>> = {}
        
        for (const key in formRules) {
            const field = key as keyof CreateLaptopRequest
            const rule = formRules[field] as ValidatorFunction<any, CreateLaptopRequest> | undefined
            const valueToValidate = field === 'description' ? getFullHTML(editor) : formState[field]
            
            if (rule) {
                const error = rule(valueToValidate, formState)
                if (typeof error === 'string') {
                    newErrors[field] = error
                    isValid = false
                }
            }
        }
        setErrors(newErrors)
        return isValid
    }

    const handleInputChange = (field: keyof CreateLaptopRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.type === 'number' ? Number(e.target.value) : e.target.value
        if (field === 'name') {
            const slug = generateSlug(e.target.value)
            setFormState(prev => ({ ...prev, name: e.target.value, slug: slug }))
            if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
            return
        }
        setFormState(prev => ({ ...prev, [field]: value }))
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    const handleSelectChange = (field: keyof CreateLaptopRequest, value: any) => {
        setFormState(prev => ({ ...prev, [field]: Number(value) }))
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    const createMutation = useMutation({
        mutationFn: (data: CreateLaptopRequest) => laptopService.createLaptop(data),
        onSuccess: () => {
            navigate({ to: '/admin/laptops' })
            toastSuccess('Tạo sản phẩm thành công')
            queryClient.invalidateQueries({ queryKey: ['laptops'] })
        },
        onError: () => {
            toastError('Tạo sản phẩm thất bại')
        }
    })

    const updateMutation = useMutation({
        mutationFn: (data: CreateLaptopRequest) => laptopService.updateLaptop(laptopId!, data),
        onSuccess: () => {
            navigate({ to: '/admin/laptops' })
            toastSuccess('Cập nhật sản phẩm thành công')
            queryClient.invalidateQueries({ queryKey: ['laptops'] })
        },
        onError: () => {
            toastError('Cập nhật sản phẩm thất bại')
        }
    })

    const handleSubmit = () => {
        if (!validateAll()) {
            toastError("Vui lòng kiểm tra lại thông tin")
            return
        }

        const dataToSubmit: CreateLaptopRequest = {
            ...formState,
            attachIds: [
                ...thumbnails.map(thumb => thumb.id)
            ],
            description: getFullHTML(editor),
        }

        if (laptopId) {
            updateMutation.mutate(dataToSubmit)
        } else {
            createMutation.mutate(dataToSubmit)
        }
    }

    return (
        <div className="min-h-screen bg-bg-weak-50 transition-colors duration-300 dark:bg-bg-white-0 overflow-hidden">
            <header className="sticky h-20 top-0 z-20 border-b border-stroke-soft-200 bg-bg-white-0/80 backdrop-blur-md dark:border-stroke-sub-300 dark:bg-bg-weak-50/80">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate({ to: '/admin/laptops' })}
                            className="group flex h-10 w-10 items-center justify-center rounded-10 border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 shadow-regular-sm transition-all hover:bg-bg-weak-50 active:scale-95 dark:border-stroke-sub-300 dark:bg-bg-weak-50 dark:text-text-soft-400"
                        >
                            <X size={20} className="transition-transform group-hover:rotate-90" />
                        </button>
                        <div>
                            <h1 className="text-label-md font-bold text-text-strong-950 dark:text-static-white">
                                {laptopId ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm mới'}
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="text-label-2xs font-medium uppercase tracking-wider text-text-soft-400">
                                    Quản lý kho
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSubmit}
                            disabled={createMutation.isPending || updateMutation.isPending}
                            className="flex items-center gap-2 rounded-10 bg-static-black px-6 py-2.5 text-label-sm font-semibold text-static-white shadow-fancy-buttons-neutral transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50 dark:bg-primary-base dark:hover:bg-blue-600 dark:shadow-fancy-buttons-primary"
                        >
                            {createMutation.isPending || updateMutation.isPending ? (
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

            <main className="w-full py-4 overflow-y-auto max-h-[calc(90vh-4rem)]">
                <div className="grid gap-8 lg:grid-cols-[1fr_360px] items-start px-4">
                    {/* Primary Area */}
                    <div className="space-y-8">
                        {/* Title Section */}
                        <div className="overflow-hidden rounded-20 bg-bg-white-0 shadow-complex dark:bg-bg-weak-50">
                            <div className="border-b border-stroke-soft-200 bg-bg-weak-25 px-6 py-4 dark:border-stroke-sub-300 dark:bg-bg-surface-800">
                                <label className="text-label-xs font-bold uppercase tracking-widest text-text-soft-400">
                                    Tên Sản Phẩm
                                </label>
                            </div>
                            <div className="p-4">
                                <Input.Root size='medium' className={errors.name ? 'ring-error-base' : ''}>
                                    <Input.Wrapper>
                                        <Input.Input
                                            value={formState.name}
                                            onChange={handleInputChange('name')}
                                            placeholder='VD: MacBook Pro M3 Max...'
                                            className="font-semibold text-text-strong-950 dark:text-static-white"
                                        />
                                    </Input.Wrapper>
                                </Input.Root>
                                {errors.name && <p className="mt-1 text-label-sm text-error-base">{errors.name}</p>}
                            </div>
                        </div>

                        {/* Editor Section */}
                        <div className="overflow-hidden rounded-20 bg-bg-white-0 shadow-complex-12 dark:bg-bg-weak-50">
                            <MenuBar editor={editor} setAttachRequest={setAttachs} />
                            <div className="bg-bg-white-0 transition-colors dark:bg-bg-weak-50 ">
                                <EditorContent editor={editor} className='max-h-[60vh] overflow-auto'/>
                            </div>
                            {errors.description && <div className="px-6 pb-2"><p className="text-label-sm text-error-base">{errors.description}</p></div>}
                        </div>

                        {/* Technical Specs Section */}
                        <div className="overflow-hidden rounded-20 bg-bg-white-0 shadow-complex dark:bg-bg-weak-50">
                            <div className="border-b border-stroke-soft-200 bg-bg-weak-25 px-6 py-4 dark:border-stroke-sub-300 dark:bg-bg-surface-800">
                                <h3 className="flex items-center gap-2 text-label-xs font-bold uppercase tracking-widest text-text-strong-950 dark:text-static-white">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary-base" />
                                    Thông số kỹ thuật
                                </h3>
                            </div>
                            
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                {/* Price */}
                                <div className="space-y-1.5">
                                    <label className="text-label-sm font-medium text-text-strong-950 dark:text-static-white">
                                        Giá gốc (VNĐ) <span className="text-error-base">*</span>
                                    </label>
                                    <Input.Root size='medium' className={errors.originalPrice ? 'ring-error-base' : ''}>
                                        <Input.Wrapper>
                                            <Input.Input
                                                type="number"
                                                value={formState.originalPrice || ''}
                                                onChange={handleInputChange('originalPrice')}
                                                placeholder='Nhập giá...'
                                            />
                                        </Input.Wrapper>
                                    </Input.Root>
                                    {errors.originalPrice && <p className="text-label-sm text-error-base">{errors.originalPrice}</p>}
                                </div>

                                {/* Brand */}
                                <div className="space-y-1.5">
                                    <label className="text-label-sm font-medium text-text-strong-950 dark:text-static-white">
                                        Hãng sản xuất <span className="text-error-base">*</span>
                                    </label>
                                    <Select.ComboBox
                                        items={brandOptions || []}
                                        value={formState.brandId?.toString()}
                                        onChange={(val) => handleSelectChange('brandId', val)}
                                        onInputChange={setBrandInput}
                                        placeholder="Chọn hãng sản xuất"
                                    >
                                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                    </Select.ComboBox>
                                    {errors.brandId && <p className="text-label-sm text-error-base">{errors.brandId}</p>}
                                </div>

                                {/* CPU */}
                                <div className="space-y-1.5">
                                    <label className="text-label-sm font-medium text-text-strong-950 dark:text-static-white">
                                        Vi xử lý (CPU) <span className="text-error-base">*</span>
                                    </label>
                                    <Select.ComboBox
                                        items={cpuOptions || []}
                                        value={formState.cpuId?.toString()}
                                        onChange={(val) => handleSelectChange('cpuId', val)}
                                        onInputChange={setCpuInput}
                                        placeholder="Chọn CPU"
                                    >
                                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                    </Select.ComboBox>
                                    {errors.cpuId && <p className="text-label-sm text-error-base">{errors.cpuId}</p>}
                                </div>

                                {/* RAM */}
                                <div className="space-y-1.5">
                                    <label className="text-label-sm font-medium text-text-strong-950 dark:text-static-white">
                                        Dung lượng RAM <span className="text-error-base">*</span>
                                    </label>
                                    <Select.ComboBox
                                        items={ramOptions || []}
                                        value={formState.ramId?.toString()}
                                        onChange={(val) => handleSelectChange('ramId', val)}
                                        onInputChange={setRamInput}
                                        placeholder="Chọn RAM"
                                    >
                                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                    </Select.ComboBox>
                                    {errors.ramId && <p className="text-label-sm text-error-base">{errors.ramId}</p>}
                                </div>

                                {/* Storage */}
                                <div className="space-y-1.5">
                                    <label className="text-label-sm font-medium text-text-strong-950 dark:text-static-white">
                                        Ổ cứng lưu trữ <span className="text-error-base">*</span>
                                    </label>
                                    <Select.ComboBox
                                        items={storageOptions || []}
                                        value={formState.storageId?.toString()}
                                        onChange={(val) => handleSelectChange('storageId', val)}
                                        onInputChange={setStorageInput}
                                        placeholder="Chọn ổ cứng"
                                    >
                                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                    </Select.ComboBox>
                                    {errors.storageId && <p className="text-label-sm text-error-base">{errors.storageId}</p>}
                                </div>

                                {/* GPU */}
                                <div className="space-y-1.5">
                                    <label className="text-label-sm font-medium text-text-strong-950 dark:text-static-white">
                                        Card đồ họa (GPU) <span className="text-error-base">*</span>
                                    </label>
                                    <Select.ComboBox
                                        items={gpuOptions || []}
                                        value={formState.gpuId?.toString()}
                                        onChange={(val) => handleSelectChange('gpuId', val)}
                                        onInputChange={setGpuInput}
                                        placeholder="Chọn GPU"
                                    >
                                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                    </Select.ComboBox>
                                    {errors.gpuId && <p className="text-label-sm text-error-base">{errors.gpuId}</p>}
                                </div>

                                {/* Screen */}
                                <div className="space-y-1.5">
                                    <label className="text-label-sm font-medium text-text-strong-950 dark:text-static-white">
                                        Màn hình <span className="text-error-base">*</span>
                                    </label>
                                    <Select.ComboBox
                                        items={screenOptions || []}
                                        value={formState.screenId?.toString()}
                                        onChange={(val) => handleSelectChange('screenId', val)}
                                        onInputChange={setScreenInput}
                                        placeholder="Chọn màn hình"
                                    >
                                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                    </Select.ComboBox>
                                    {errors.screenId && <p className="text-label-sm text-error-base">{errors.screenId}</p>}
                                </div>

                                {/* Screen Size */}
                                <div className="space-y-1.5">
                                    <label className="text-label-sm font-medium text-text-strong-950 dark:text-static-white">
                                        Kích thước màn hình <span className="text-error-base">*</span>
                                    </label>
                                    <Select.ComboBox
                                        items={screenSizeOptions || []}
                                        value={formState.screenSizeId?.toString()}
                                        onChange={(val) => handleSelectChange('screenSizeId', val)}
                                        onInputChange={setScreenSizeInput}
                                        placeholder="Chọn kích thước"
                                    >
                                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                    </Select.ComboBox>
                                    {errors.screenSizeId && <p className="text-label-sm text-error-base">{errors.screenSizeId}</p>}
                                </div>

                                {/* Parent */}
                                <div className="space-y-1.5">
                                    <label className="text-label-sm font-medium text-text-strong-950 dark:text-static-white">
                                        Thuộc cấu hình của <span className="text-error-base">*</span>
                                    </label>
                                    <Select.ComboBox
                                        items={parentOptions || []}
                                        value={formState.parentId?.toString()}
                                        onChange={(val) => handleSelectChange('parentId', val)}
                                        onInputChange={(value) => setNameParent(value)}
                                        placeholder="Chọn cấu hình cha"
                                    >
                                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                    </Select.ComboBox>
                                    {errors.screenSizeId && <p className="text-label-sm text-error-base">{errors.screenSizeId}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <aside className="space-y-6">
                        <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-complex dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                            <h3 className="mb-4 text-label-sm font-bold text-text-strong-950 dark:text-static-white">
                                Ảnh sản phẩm (Tối đa 5 ảnh)
                            </h3>
                            <div className="flex flex-col gap-4">
                                {thumbnails.length > 0 && <SwiperCardEffect images={thumbnails} onRemove={(id) => setThumbnails(prev => prev.filter(img => img.id !== id))} />}
                                <FileUploadComponent setAttachState={(attach) => setThumbnails(prev => [...prev, attach])} />
                            </div>
                        </div>

                        <div className="rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-complex dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                            <h3 className="mb-4 text-label-sm font-bold text-text-strong-950 dark:text-static-white">
                                Cài đặt chung
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-label-sm font-medium text-text-strong-950 dark:text-static-white">
                                        Trạng thái
                                    </label>
                                    <SelectAlignUi.Root value={formState.isActive.toString()} onValueChange={(val) => handleSelectChange('isActive', val)}>
                                        <SelectAlignUi.Trigger>
                                            <SelectAlignUi.Value />
                                        </SelectAlignUi.Trigger>
                                        <SelectAlignUi.Content>
                                            <SelectAlignUi.Item value="1">Hoạt động</SelectAlignUi.Item>
                                            <SelectAlignUi.Item value="0">Không hoạt động</SelectAlignUi.Item>
                                        </SelectAlignUi.Content>
                                    </SelectAlignUi.Root>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    )
}

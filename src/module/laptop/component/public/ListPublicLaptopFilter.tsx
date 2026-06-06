import * as Input from '#/components/ui/input'
import * as Select from '#/components/ui/select'
import { useSearchCategory } from '#/module/category/hooks/use-search-category'
import { SearchLg, FilterLines, RefreshCcw01 } from '@untitledui/icons'
import { useEffect, useState } from 'react'
import type { GetListPublicLaptopParam } from '../../service/public-laptop-service'
import type { Dispatch, SetStateAction } from 'react'
import type { PaginationState } from '@tanstack/react-table'

export type FilterProps = {
    requestParam: GetListPublicLaptopParam
    handleSetRequestParam: (request: GetListPublicLaptopParam) => void
    setPagination: Dispatch<SetStateAction<PaginationState>>
}

export function ListPublicLaptopFilter({ handleSetRequestParam, setPagination }: FilterProps) {
    // Local state filters
    const [searchName, setSearchName] = useState('')
    const [selectedBrand, setSelectedBrand] = useState<string | undefined>(undefined)
    const [selectedCpu, setSelectedCpu] = useState<string | undefined>(undefined)
    const [selectedRam, setSelectedRam] = useState<string | undefined>(undefined)
    const [selectedStorage, setSelectedStorage] = useState<string | undefined>(undefined)
    const [minPrice, setMinPrice] = useState<string | undefined>(undefined)
    const [maxPrice, setMaxPrice] = useState<string | undefined>(undefined)
    const [priceTier, setPriceTier] = useState<string>('all')

    // Sorting state
    const [sortState, setSortState] = useState<string>('createAt,desc')

    // Debounced filters
    const [debouncedSearchName, setDebouncedSearchName] = useState('')
    const [debouncedMinPrice, setDebouncedMinPrice] = useState<string | undefined>(undefined)
    const [debouncedMaxPrice, setDebouncedMaxPrice] = useState<string | undefined>(undefined)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchName(searchName)
            setPagination(prev => ({ ...prev, pageIndex: 0 }))
        }, 400)
        return () => clearTimeout(timer)
    }, [searchName])

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedMinPrice(minPrice)
            setPagination(prev => ({ ...prev, pageIndex: 0 }))
        }, 500)
        return () => clearTimeout(timer)
    }, [minPrice])

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedMaxPrice(maxPrice)
            setPagination(prev => ({ ...prev, pageIndex: 0 }))
        }, 500)
        return () => clearTimeout(timer)
    }, [maxPrice])

    // Load lookup options
    const { options: brandOptions } = useSearchCategory({
        baseCode: 'H_SERVICE_BRAND',
        queryKey: ['categories', 'H_SERVICE_BRAND_PUBLIC'],
        param: 'name:ct',
        isPublic: true
    })
    const { options: cpuOptions } = useSearchCategory({
        baseCode: 'H_SERVICE_CPU',
        queryKey: ['categories', 'H_SERVICE_CPU_PUBLIC'],
        param: 'name:ct',
        isPublic: true
    })
    const { options: ramOptions } = useSearchCategory({
        baseCode: 'H_SERVICE_RAM',
        queryKey: ['categories', 'H_SERVICE_RAM_PUBLIC'],
        param: 'name:ct',
        isPublic: true
    })
    const { options: storageOptions } = useSearchCategory({
        baseCode: 'H_SERVICE_STORAGE',
        queryKey: ['categories', 'H_SERVICE_STORAGE_PUBLIC'],
        param: 'name:ct',
        isPublic: true
    })

    const handleBrandChange = (val: string) => {
        setSelectedBrand(val)
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }
    const handleCpuChange = (val: string) => {
        setSelectedCpu(val)
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }
    const handleRamChange = (val: string) => {
        setSelectedRam(val)
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }
    const handleStorageChange = (val: string) => {
        setSelectedStorage(val)
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }

    // Handle Quick Price Tiers
    const handlePriceTierChange = (tier: string) => {
        setPriceTier(tier)
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
        if (tier === 'under15') {
            setMinPrice('')
            setMaxPrice('15000000')
        } else if (tier === '15to20') {
            setMinPrice('15000000')
            setMaxPrice('20000000')
        } else if (tier === '20to25') {
            setMinPrice('20000000')
            setMaxPrice('25000000')
        } else if (tier === 'over25') {
            setMinPrice('25000000')
            setMaxPrice('')
        } else {
            setMinPrice('')
            setMaxPrice('')
        }
    }

    useEffect(() => {
        console.log('searchName', searchName)
        console.log('minPrice', minPrice)
        console.log('maxPrice', maxPrice)
        console.log('selectedBrand', selectedBrand)
        console.log('selectedCpu', selectedCpu)
        console.log('selectedRam', selectedRam)
        console.log('selectedStorage', selectedStorage)
        console.log('sortState', sortState)
        handleSetRequestParam({
            sort: sortState,
            'name:ct': debouncedSearchName,
            'price:ge': debouncedMinPrice ? Number(debouncedMinPrice) : undefined,
            'price:le': debouncedMaxPrice ? Number(debouncedMaxPrice) : undefined,
            'brandId': selectedBrand === 'all' || !selectedBrand ? undefined : Number(selectedBrand),
            'cpuId': selectedCpu === 'all' || !selectedCpu ? undefined : Number(selectedCpu),
            'ramId': selectedRam === 'all' || !selectedRam ? undefined : Number(selectedRam),
            'storageId': selectedStorage === 'all' || !selectedStorage ? undefined : Number(selectedStorage),
        })
    }, [debouncedSearchName, debouncedMinPrice, debouncedMaxPrice, selectedBrand, selectedCpu, selectedRam, selectedStorage, sortState])

    const handleClearFilters = () => {
        setSearchName('')
        setSelectedBrand('all')
        setSelectedCpu('all')
        setSelectedRam('all')
        setSelectedStorage('all')
        setMinPrice('')
        setMaxPrice('')
        setPriceTier('all')
        setSortState('create_at,desc')
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }

    const sortOptions = [
        { label: 'Phổ biến', value: 'create_at,desc' },
        { label: 'Giá Thấp - Cao', value: 'price,asc' },
        { label: 'Giá Cao - Thấp', value: 'price,desc' },
        { label: 'Mới nhất', value: 'created_at,desc' },
    ]

    const priceTiers = [
        { label: 'Tất cả giá', value: 'all' },
        { label: 'Dưới 15 triệu', value: 'under15' },
        { label: '15 - 20 triệu', value: '15to20' },
        { label: '20 - 25 triệu', value: '20to25' },
        { label: 'Trên 25 triệu', value: 'over25' },
    ]
    return (
        <>
            <section className="space-y-2.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Chọn theo thương hiệu</h3>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                    <button
                        onClick={() => setSelectedBrand('all')}
                        className={`bg-white dark:bg-bg-weak-50 border rounded-xl px-4 py-2.5 flex items-center justify-center font-bold text-xs md:text-sm shadow-sm transition-all duration-200 cursor-pointer shrink-0 ${selectedBrand === 'all'
                            ? 'border-[#d70018] text-[#d70018] ring-1 ring-[#d70018] bg-red-50/5'
                            : 'border-[#e5e7eb] dark:border-stroke-sub-300 text-gray-700 dark:text-text-soft-400 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-bg-surface-800'
                            }`}
                    >
                        Tất cả hãng
                    </button>
                    {brandOptions?.map(brand => (
                        <button
                            key={brand.id}
                            onClick={() => handleBrandChange(brand.id.toString())}
                            className={`bg-white dark:bg-bg-weak-50 border rounded-xl px-4 py-2.5 flex items-center justify-center font-bold text-xs md:text-sm shadow-sm transition-all duration-200 cursor-pointer shrink-0 ${selectedBrand === brand.id
                                ? 'border-[#d70018] text-[#d70018] ring-1 ring-[#d70018] bg-red-50/5'
                                : 'border-[#e5e7eb] dark:border-stroke-sub-300 text-gray-700 dark:text-text-soft-400 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-bg-surface-800'
                                }`}
                        >
                            {brand.label}
                        </button>
                    ))}
                </div>
            </section>
            {/* Filter Pills and Search */}
            <section className="bg-white dark:bg-bg-weak-50 border border-[#e5e7eb] dark:border-stroke-sub-300 p-5 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-stroke-sub-300 pb-3">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-white">
                        <FilterLines size={16} className="text-[#d70018]" />
                        Bộ lọc nâng cao
                    </h3>
                    <button
                        onClick={handleClearFilters}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#d70018] transition-colors cursor-pointer"
                    >
                        <RefreshCcw01 size={13} />
                        Xóa tất cả bộ lọc
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Search Input */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-400 uppercase">Tìm kiếm sản phẩm</label>
                        <Input.Root size="medium">
                            <Input.Wrapper>
                                <Input.Icon as={SearchLg} />
                                <Input.Input
                                    placeholder="Tên sản phẩm..."
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                />
                            </Input.Wrapper>
                        </Input.Root>
                    </div>

                    {/* CPU Select */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-400 uppercase">Bộ vi xử lý (CPU)</label>
                        <Select.Root value={selectedCpu} onValueChange={handleCpuChange}>
                            <Select.Trigger>
                                <Select.Value placeholder="Tất cả CPU" />
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Item value="all">Tất cả CPU</Select.Item>
                                {cpuOptions?.map(opt => (
                                    <Select.Item key={opt.id} value={opt.id.toString()}>{opt.label}</Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                    </div>

                    {/* RAM Select */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-400 uppercase">Bộ nhớ RAM</label>
                        <Select.Root value={selectedRam} onValueChange={handleRamChange}>
                            <Select.Trigger>
                                <Select.Value placeholder="Tất cả RAM" />
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Item value="all">Tất cả RAM</Select.Item>
                                {ramOptions?.map(opt => (
                                    <Select.Item key={opt.id} value={opt.id.toString()}>{opt.label}</Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                    </div>

                    {/* Storage Select */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-400 uppercase">Ổ cứng (SSD)</label>
                        <Select.Root value={selectedStorage} onValueChange={handleStorageChange}>
                            <Select.Trigger>
                                <Select.Value placeholder="Tất cả ổ cứng" />
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Item value="all">Tất cả ổ cứng</Select.Item>
                                {storageOptions?.map(opt => (
                                    <Select.Item key={opt.id} value={opt.id.toString()}>{opt.label}</Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                    </div>
                </div>

                {/* Quick Price Ranges */}
                <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-gray-100 dark:border-stroke-sub-300">
                    <span className="text-[11px] font-bold text-gray-400 uppercase mr-2">Chọn mức giá:</span>
                    {priceTiers.map(tier => (
                        <button
                            key={tier.value}
                            onClick={() => handlePriceTierChange(tier.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 cursor-pointer ${priceTier === tier.value
                                ? 'bg-red-50 dark:bg-red-950/20 border-[#d70018] text-[#d70018]'
                                : 'bg-white dark:bg-bg-weak-50 border-[#e5e7eb] dark:border-stroke-sub-300 text-gray-600 dark:text-text-soft-400 hover:border-gray-400'
                                }`}
                        >
                            {tier.label}
                        </button>
                    ))}

                    {/* Custom Price inputs inside filters */}
                    <div className="ml-auto flex items-center gap-1.5">
                        <Input.Root size="small" className="w-24">
                            <Input.Wrapper>
                                <Input.Input
                                    type="number"
                                    placeholder="Giá Từ"
                                    value={minPrice}
                                    onChange={(e) => {
                                        setMinPrice(e.target.value)
                                        setPriceTier('all')
                                    }}
                                />
                            </Input.Wrapper>
                        </Input.Root>
                        <span className="text-gray-300">-</span>
                        <Input.Root size="small" className="w-24">
                            <Input.Wrapper>
                                <Input.Input
                                    type="number"
                                    placeholder="Đến"
                                    value={maxPrice}
                                    onChange={(e) => {
                                        setMaxPrice(e.target.value)
                                        setPriceTier('all')
                                    }}
                                />
                            </Input.Wrapper>
                        </Input.Root>
                    </div>
                </div>
            </section>

            {/* Catalog Control Row (Sorting and Meta) */}
            <section className="bg-white dark:bg-bg-weak-50 border border-[#e5e7eb] dark:border-stroke-sub-300 p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">

                {/* Sorting pills */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 mr-1">Sắp xếp theo:</span>
                    {sortOptions.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => {
                                setSortState(opt.value)
                                setPagination(prev => ({ ...prev, pageIndex: 0 }))
                            }}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 cursor-pointer ${sortState === opt.value
                                ? 'bg-[#d70018] border-[#d70018] text-white shadow-sm'
                                : 'bg-gray-100 border-[#e5e7eb] text-gray-600 dark:bg-bg-weak-50 dark:border-stroke-sub-300 dark:text-text-soft-400 hover:bg-gray-200'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </section>
        </>
    )
}
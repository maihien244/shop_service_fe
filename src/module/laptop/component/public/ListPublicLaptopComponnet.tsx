import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PublicLaptopService } from '../../service/public-laptop-service'
import { useSearchCategory } from '#/module/category/hooks/use-search-category'
import * as Pagination from '#/components/ui/pagination'
import {
  ChevronLeft,
  ChevronRight,
} from '@untitledui/icons'
import type { GetListPublicLaptopParam } from '../../service/public-laptop-service'
import { ListPublicLaptopFilter } from './ListPublicLaptopFilter'
import { LaptopCard } from './LaptopCard'

export function ListPublicLaptopComponnet() {
  const laptopService = useMemo(() => new PublicLaptopService(), [])

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 15,
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


  const [requestParams, setRequestParams] = useState<GetListPublicLaptopParam>({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    sort: "create_at,desc",
  })

  useEffect(() => {
    setRequestParams(prev => ({
      ...prev,
      page: pagination.pageIndex,
      size: pagination.pageSize,
    }))
  }, [pagination.pageIndex, pagination.pageSize])

  // Mappings for labels
  const cpuMap = useMemo(() => new Map(cpuOptions?.map(o => [Number(o.id), o.label])), [cpuOptions])
  const ramMap = useMemo(() => new Map(ramOptions?.map(o => [Number(o.id), o.label])), [ramOptions])
  const storageMap = useMemo(() => new Map(storageOptions?.map(o => [Number(o.id), o.label])), [storageOptions])

  // Fetch public laptop list
  const { data, isLoading } = useQuery({
    queryKey: [
      'public-laptops',
      pagination.pageIndex,
      pagination.pageSize,
      JSON.stringify(requestParams),
    ],
    queryFn: () => laptopService.getList(requestParams as any)
  })
  // Calculate page count
  const pageCount = data?.total
    ? Math.ceil(data.total / pagination.pageSize)
    : 1

  const handleClearFilters = () => {
    setRequestParams({
      page: 0,
      size: 15,
      sort: "create_at,desc",
    })
  }

  return (
    <div className="min-h-screen bg-neutral-100 text-[#1f2937] dark:bg-bg-white-0 dark:text-static-white transition-colors duration-300">

      {/* Dynamic Header Promo Banners */}
      {/* <section className="bg-white dark:bg-bg-weak-50 border-b border-[#e5e7eb] dark:border-stroke-sub-300 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          <div className="bg-gradient-to-r from-red-600 to-[#d70018] rounded-2xl p-6 text-white flex flex-col justify-center space-y-3 relative overflow-hidden shadow-sm">
            <span className="bg-white/20 uppercase tracking-widest text-[9px] font-extrabold px-2.5 py-1 rounded-md w-fit backdrop-blur-sm">
              TUẦN LỄ LAPTOP CHÍNH HÃNG
            </span>
            <h1 className="text-title-h4 md:text-title-h3 font-black tracking-tight leading-tight select-none">
              GIẢM ĐẾN 30% + ĐỔI ĐIỂM S-STUDENT
            </h1>
            <p className="text-xs md:text-sm text-red-50 max-w-lg font-medium">
              Miễn phí giao hàng toàn quốc. Trả góp 0% lãi suất qua thẻ tín dụng và công ty tài chính. Bảo hành chính hãng lên đến 2 năm.
            </p>
            <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            <div className="bg-[#f0f4f8] dark:bg-bg-surface-850 rounded-xl p-3 border border-blue-200 dark:border-stroke-sub-300 flex items-center gap-3">
              <div className="size-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                Sm
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#1a56db] truncate">Đặc quyền Smember</h4>
                <p className="text-[10px] text-gray-500 dark:text-text-soft-400 mt-0.5 leading-snug">Giảm thêm đến 1% khi mua Laptop</p>
              </div>
            </div>
            <div className="bg-[#eef2ff] dark:bg-bg-surface-850 rounded-xl p-3 border border-purple-200 dark:border-stroke-sub-300 flex items-center gap-3">
              <div className="size-10 rounded-full bg-purple-600/10 flex items-center justify-center text-purple-600 font-bold text-xs shrink-0">
                St
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#4f46e5] truncate">Ưu đãi S-Student</h4>
                <p className="text-[10px] text-gray-500 dark:text-text-soft-400 mt-0.5 leading-snug">Giảm thêm 3% cho học sinh - sinh viên</p>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Main Catalog Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        <ListPublicLaptopFilter
          requestParam={requestParams}
          handleSetRequestParam={(value) => setRequestParams(prev => ({ ...prev, ...value }))}
          setPagination={setPagination}
        />

        {/* Product Cards Grid */}
        {isLoading ? (
          // Skeleton Loader
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-bg-weak-50 rounded-2xl p-3 border border-[#e5e7eb] dark:border-stroke-sub-300 space-y-3.5">
                <div className="w-full aspect-square bg-gray-100 dark:bg-bg-surface-850 rounded-xl" />
                <div className="h-3 bg-gray-100 dark:bg-bg-surface-850 rounded w-1/2" />
                <div className="h-4 bg-gray-100 dark:bg-bg-surface-850 rounded w-5/6" />
                <div className="h-4 bg-gray-100 dark:bg-bg-surface-850 rounded w-1/3" />
                <div className="h-6 bg-gray-100 dark:bg-bg-surface-850 rounded w-full" />
              </div>
            ))}
          </div>
        ) : !data || data.results.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-bg-weak-50 border border-[#e5e7eb] dark:border-stroke-sub-300 rounded-2xl shadow-sm text-center p-8 space-y-4">
            <div className="size-16 rounded-full bg-red-50 dark:bg-red-950/20 text-[#d70018] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="3" rx="2" />
                <line x1="2" x2="22" y1="17" y2="17" />
                <line x1="12" x2="12" y1="17" y2="21" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white">Không tìm thấy Laptop phù hợp</h3>
              <p className="text-xs text-gray-500 dark:text-text-soft-400 max-w-xs mx-auto">
                Hãy thử nới lỏng hoặc đặt lại các bộ lọc tìm kiếm để tìm thấy sản phẩm.
              </p>
            </div>
            <button
              onClick={handleClearFilters}
              className="bg-[#d70018] text-white font-bold text-xs py-2 px-5 rounded-xl shadow hover:bg-red-700 cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          // Main Grid List (CellphoneS Style)
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5">
            {data.results.map((laptop) =>
              <LaptopCard
                key={laptop.id}
                laptop={laptop}
                cpuMap={cpuMap}
                ramMap={ramMap}
                storageMap={storageMap}
              />)
            }
          </div>
        )}

        {/* Pagination Section (CellphoneS style center-justified) */}
        {data && data.total > pagination.pageSize && (
          <div className="pt-8 flex justify-center border-t border-stroke-soft-200 dark:border-stroke-sub-300">
            <Pagination.Root>
              <Pagination.NavButton
                onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
                disabled={pagination.pageIndex === 0}
                className="cursor-pointer"
              >
                <Pagination.NavIcon as={ChevronLeft} />
              </Pagination.NavButton>

              {[...Array(pageCount)].map((_, i) => (
                <Pagination.Item
                  key={i}
                  current={pagination.pageIndex === i}
                  onClick={() => setPagination(prev => ({ ...prev, pageIndex: i }))}
                  className={`cursor-pointer ${pagination.pageIndex === i ? 'ring-1 ring-[#d70018] text-[#d70018] font-bold' : ''}`}
                >
                  {i + 1}
                </Pagination.Item>
              ))}

              <Pagination.NavButton
                onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
                disabled={pagination.pageIndex === pageCount - 1}
                className="cursor-pointer"
              >
                <Pagination.NavIcon as={ChevronRight} />
              </Pagination.NavButton>
            </Pagination.Root>
          </div>
        )}

      </main>

    </div>
  )
}

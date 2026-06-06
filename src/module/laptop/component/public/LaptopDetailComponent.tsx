import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useCart } from '../../../cart/hooks/use-cart'
import { PublicLaptopService } from '../../service/public-laptop-service'
import { useSearchCategory } from '#/module/category/hooks/use-search-category'
import { useFileUrl } from '#/module/attachs/hooks/use-file'
import {
  ChevronRight,
  Star01,
  ShoppingCart01,
  CreditCard02,
  Heart,
  Share06,
  CheckCircle
} from '@untitledui/icons'
import type { LaptopResponse, OptionLaptopResponse } from '../../dto'
import { PublicDiscountService } from '#/module/discounts/service/public-discount-service'
import type { DiscountResponse } from '#/module/discounts/dto'
import { renderLocalTime } from '#/utils/time-format'
import type { WarehouseDto } from '#/module/warehouse/dto/warehouse.dto'
import * as Button from '#/components/ui/button'
import { ShoppingBag } from 'lucide-react'

export type LaptopDetailComponentProps = {
  slug: string
}

export function LaptopDetailComponent({ slug }: LaptopDetailComponentProps) {
  const navigate = useNavigate()
  const { addToCart, invalidateCarts } = useCart()
  const { getFileUrl } = useFileUrl()
  const publicLaptopService = useMemo(() => new PublicLaptopService(), [])
  const publicDiscountService = useMemo(() => new PublicDiscountService(), [])
  const [discounts, setDiscounts] = useState<DiscountResponse[]>([])
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([])

  // Fetch Laptop details
  const { data: laptop, isLoading, error } = useQuery<LaptopResponse>({
    queryKey: ['public-laptop-detail', slug],
    queryFn: () => publicLaptopService.getLaptopBySlug(slug)
  })

  // Selected Option (Variant) state
  const [selectedOption, setSelectedOption] = useState<OptionLaptopResponse | null>(null)

  // Active gallery image keyName
  const [activeImageKey, setActiveImageKey] = useState<string>('')

  // Show full description toggle
  const [showFullDescription, setShowFullDescription] = useState(false)

  // Load lookup categories
  const { options: brandOptions } = useSearchCategory({
    baseCode: 'H_SERVICE_BRAND',
    queryKey: ['categories', 'H_SERVICE_BRAND_PUBLIC'],
    param: 'name:ct',
  })
  const { options: cpuOptions } = useSearchCategory({
    baseCode: 'H_SERVICE_CPU',
    queryKey: ['categories', 'H_SERVICE_CPU_PUBLIC'],
    param: 'name:ct',
  })
  const { options: ramOptions } = useSearchCategory({
    baseCode: 'H_SERVICE_RAM',
    queryKey: ['categories', 'H_SERVICE_RAM_PUBLIC'],
    param: 'name:ct',
  })
  const { options: storageOptions } = useSearchCategory({
    baseCode: 'H_SERVICE_STORAGE',
    queryKey: ['categories', 'H_SERVICE_STORAGE_PUBLIC'],
    param: 'name:ct',
  })
  const { options: gpuOptions } = useSearchCategory({
    baseCode: 'H_SERVICE_GPU',
    queryKey: ['categories', 'H_SERVICE_GPU_PUBLIC'],
    param: 'name:ct',
  })
  const { options: screenOptions } = useSearchCategory({
    baseCode: 'H_SERVICE_SCREEN',
    queryKey: ['categories', 'H_SERVICE_SCREEN_PUBLIC'],
    param: 'name:ct',
  })
  const { options: screenSizeOptions } = useSearchCategory({
    baseCode: 'H_SERVICE_SCREEN_SIZE',
    queryKey: ['categories', 'H_SERVICE_SCREEN_SIZE_PUBLIC'],
    param: 'name:ct',
  })

  // Mappings
  const brandMap = useMemo(() => new Map(brandOptions?.map(o => [Number(o.id), o.label])), [brandOptions])
  const cpuMap = useMemo(() => new Map(cpuOptions?.map(o => [Number(o.id), o.label])), [cpuOptions])
  const ramMap = useMemo(() => new Map(ramOptions?.map(o => [Number(o.id), o.label])), [ramOptions])
  const storageMap = useMemo(() => new Map(storageOptions?.map(o => [Number(o.id), o.label])), [storageOptions])
  const gpuMap = useMemo(() => new Map(gpuOptions?.map(o => [Number(o.id), o.label])), [gpuOptions])
  const screenMap = useMemo(() => new Map(screenOptions?.map(o => [Number(o.id), o.label])), [screenOptions])
  const screenSizeMap = useMemo(() => new Map(screenSizeOptions?.map(o => [Number(o.id), o.label])), [screenSizeOptions])

  // Reset selected option / active image when laptop data changes
  useEffect(() => {
    if (laptop) {
      if (laptop.options && laptop.options.length > 0) {
        setSelectedOption(laptop.options[0])
      } else {
        setSelectedOption(null)
      }

      if (laptop.attaches && laptop.attaches.length > 0) {
        setActiveImageKey(laptop.attaches[0].attachMetadata?.keyName || '')
      }
    }
  }, [laptop])

  useEffect(() => {
    if (laptop?.id) {
      publicDiscountService.getListDiscounts({
        'laptopId:in': [laptop.id]
      }).then((res) => {
        setDiscounts(res.results)
      })
    }
  }, [laptop])

  useEffect(() => {
    if (laptop?.id && selectedOption?.id) {
      publicLaptopService.getStoreModelDtoHasProduct(laptop.id, selectedOption.id).then((res) => {
        setWarehouses(res.results)
      })
    }
  }, [laptop, selectedOption])

  // Update active image when selected option changes (if it has an image)
  useEffect(() => {
    if (selectedOption?.attach?.attachMetadata?.keyName) {
      setActiveImageKey(selectedOption.attach.attachMetadata.keyName)
    }
  }, [selectedOption])

  // Pricing calculations
  const [discountPercent, setDiscountPercent] = useState(0)
  useEffect(() => {
    if (laptop && selectedOption) {
      const originalPrice = Number(selectedOption.price || laptop.originalPrice)
      setDiscountPercent(Math.max(originalPrice - handleCaculationPrice(selectedOption), 0))
    }
  }, [laptop, selectedOption, discounts])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Combined product images list (primary attaches + option images)
  const productImages = useMemo(() => {
    if (!laptop) return []
    const list: { key: string; label: string }[] = []

    // Add primary images
    laptop.attaches?.forEach((att, idx) => {
      if (att.attachMetadata?.keyName) {
        list.push({
          key: att.attachMetadata.keyName,
          label: `Ảnh chính ${idx + 1}`
        })
      }
    })

    return list
  }, [laptop])

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-bg-surface-850 rounded w-1/4" />
        <div className="h-8 bg-gray-200 dark:bg-bg-surface-850 rounded w-1/2" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-square bg-gray-200 dark:bg-bg-surface-850 rounded-2xl" />
            <div className="flex gap-2.5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="size-16 bg-gray-200 dark:bg-bg-surface-850 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="h-6 bg-gray-200 dark:bg-bg-surface-850 rounded w-1/3" />
            <div className="h-12 bg-gray-200 dark:bg-bg-surface-850 rounded w-full" />
            <div className="h-32 bg-gray-200 dark:bg-bg-surface-850 rounded w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !laptop) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Không tìm thấy sản phẩm hoặc xảy ra lỗi</h2>
        <p className="text-sm text-gray-500">Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.</p>
        <Link to="/public/laptops" className="inline-block bg-[#d70018] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow hover:bg-red-700">
          Danh sách Laptop
        </Link>
      </div>
    )
  }

  const brandName = brandMap.get(laptop.brandId) || 'Laptop'

  function handleCaculationPrice(option?: OptionLaptopResponse) {
    if (!option) return laptop?.originalPrice || 0
    let finalPrice = Number(option.price) || 0
    const originalPrice = Number(option.price)
    for (const discount of discounts) {
      let discountValue = 0
      if (discount.type === 'PERCENT') {
        discountValue = finalPrice * (discount.value / 100)
      } else if (discount.type === 'FIXED') {
        discountValue = discount.value
      } else {
        discountValue = 0
      }
      finalPrice = Math.min(finalPrice, originalPrice - discountValue)
      console.group("finalPrice", finalPrice)
      console.log("originalPrice", originalPrice)
      console.log("discountValue", discountValue)
      console.log("discount", discount)
      console.groupEnd()
    }
    return finalPrice
  }

  const handleBuyNow = async () => {
    if (laptop && selectedOption) {
      await handleAddToCart()
      navigate({ to: '/users/carts/' as any })
    }
  }

  const handleAddToCart = async () => {
    if (laptop && selectedOption) {
      const guestDetails = {
        laptopId: laptop.id,
        laptopName: laptop.name,
        laptopSlug: laptop.slug,
        optionName: selectedOption.name,
        price: handleCaculationPrice(selectedOption),
        originalPrice: Number(selectedOption.price || laptop.originalPrice),
        imageKey: selectedOption.attach?.attachMetadata?.keyName || laptop.attaches?.[0]?.attachMetadata?.keyName || '',
        brandName: brandName
      }
      await addToCart({
        optionId: selectedOption.id,
        quantity: 1
      }, guestDetails)
      await invalidateCarts()
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-[#1f2937] dark:bg-bg-white-0 dark:text-static-white transition-colors duration-300">

      {/* Breadcrumb Row */}
      <div className="bg-white dark:bg-bg-weak-50 border-b border-gray-150 dark:border-stroke-sub-300 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <Link to="/" className="hover:text-[#d70018]">Trang chủ</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <Link to="/public/laptops" className="hover:text-[#d70018]">Laptop</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-800 dark:text-white font-bold truncate max-w-xs md:max-w-md">{laptop.name}</span>
        </div>
      </div>

      {/* Main product area */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Product Title Section */}
        <section className="bg-white dark:bg-bg-weak-50 border border-gray-200 dark:border-stroke-sub-300 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-base md:text-xl font-black text-gray-900 dark:text-white leading-tight">
                {laptop.name} {selectedOption ? ` - Cấu hình ${selectedOption.name}` : ''}
              </h1>

              {/* Ratings and meta */}
              <div className="flex flex-wrap items-center gap-3.5 mt-2.5 text-xs text-gray-500">
                <div className="flex items-center gap-0.5 text-yellow-400 font-bold">
                  <Star01 size={14} className="fill-current" />
                  <Star01 size={14} className="fill-current" />
                  <Star01 size={14} className="fill-current" />
                  <Star01 size={14} className="fill-current" />
                  <Star01 size={14} className="fill-current" />
                  <span className="ml-1 text-gray-800 dark:text-white font-extrabold">5.0</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="cursor-pointer hover:text-[#d70018]">20 đánh giá</span>
                <span className="text-gray-300">|</span>
                <span className="cursor-pointer hover:text-[#d70018]">99 Hỏi & Đáp</span>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <button className="flex items-center text-nowrap justify-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-stroke-sub-300 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-bg-surface-800 cursor-pointer">
                <Share06 size={14} />
                Chia sẻ
              </button>
              <button className="flex items-center text-nowrap justify-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-stroke-sub-300 rounded-xl text-xs font-bold hover:text-[#d70018] hover:bg-red-50/20 cursor-pointer">
                <Heart size={14} />
                Yêu thích
              </button>
            </div>
          </div>
        </section>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: Image, Description, Specs */}
          <div className="lg:col-span-7 space-y-6">

            {/* Gallery card */}
            <div className="bg-white dark:bg-bg-weak-50 border border-gray-200 dark:border-stroke-sub-300 rounded-2xl p-5 shadow-sm space-y-5">

              {/* Main Display Image */}
              <div className="aspect-[4/3] max-h-[400px] w-full flex items-center justify-center bg-neutral-50 dark:bg-bg-surface-850 rounded-xl overflow-hidden relative">
                {activeImageKey ? (
                  <img
                    src={getFileUrl(activeImageKey)}
                    alt={laptop.name}
                    className="max-h-[85%] max-w-[85%] object-contain select-none transition-all duration-300"
                  />
                ) : (
                  <span className="text-gray-400 text-sm font-bold">Chưa có hình ảnh</span>
                )}

                {/* 0% Installment badge */}
                <span className="absolute top-4 right-4 bg-blue-600 text-white font-extrabold text-[9px] uppercase px-2 py-0.5 rounded shadow-sm">
                  Trả góp 0%
                </span>
              </div>

              {/* Thumbnails list */}
              {productImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none justify-center">
                  {productImages.map((img) => (
                    <button
                      key={img.key}
                      onClick={() => setActiveImageKey(img.key)}
                      className={`size-16 rounded-lg border-2 p-1 bg-white dark:bg-bg-surface-800 flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200 ${activeImageKey === img.key
                        ? 'border-[#d70018] shadow-sm'
                        : 'border-transparent hover:border-gray-300'
                        }`}
                    >
                      <img
                        src={getFileUrl(img.key)}
                        alt={img.label}
                        className="max-h-full max-w-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CellphoneS style highlighted features & Description */}
            <div className="bg-white dark:bg-bg-weak-50 border border-gray-200 dark:border-stroke-sub-300 rounded-2xl p-5 shadow-sm space-y-5">
              <h2 className="text-sm font-black text-gray-800 dark:text-white border-b border-gray-100 dark:border-stroke-sub-300 pb-3 uppercase tracking-wider">
                Đặc điểm nổi bật (Tính năng chính)
              </h2>

              {/* Highlight points list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs text-gray-700 dark:text-text-soft-400">
                <div className="flex gap-2 items-start">
                  <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
                  <span>Trải nghiệm hiệu năng vượt trội với CPU công nghệ AI tiên tiến nhất.</span>
                </div>
                <div className="flex gap-2 items-start">
                  <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
                  <span>Màn hình tuyệt mỹ chuẩn màu, bảo vệ mắt tối đa khi làm việc lâu dài.</span>
                </div>
                <div className="flex gap-2 items-start">
                  <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
                  <span>Thời lượng pin cực khủng đáp ứng trọn vẹn một ngày dài năng động.</span>
                </div>
                <div className="flex gap-2 items-start">
                  <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
                  <span>Thiết kế mỏng nhẹ, sang trọng bậc nhất, hoàn hảo mọi góc nhìn.</span>
                </div>
              </div>

              {/* HTML Content (Tiptap Editor Content) */}
              {laptop.description && (
                <div className="border-t border-gray-150 dark:border-stroke-sub-300 pt-5 relative">
                  <div
                    className={`prose max-w-none dark:prose-invert text-xs md:text-sm text-gray-700 dark:text-text-soft-400 leading-relaxed overflow-hidden transition-all duration-300 ${showFullDescription ? 'max-h-none' : 'max-h-[350px]'
                      }`}
                    dangerouslySetInnerHTML={{ __html: laptop.description }}
                  />

                  {/* Gradient Fade & Toggle button */}
                  {!showFullDescription && (
                    <div className="absolute bottom-12 left-0 right-0 h-28 bg-gradient-to-t from-white dark:from-bg-weak-50 to-transparent pointer-events-none" />
                  )}

                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="px-6 py-2.5 border border-[#d70018] text-[#d70018] font-bold text-xs rounded-xl shadow-sm hover:bg-[#d70018] hover:text-white transition-all cursor-pointer"
                    >
                      {showFullDescription ? 'Thu gọn bài viết' : 'Xem cấu hình & Đọc chi tiết bài viết'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Technical Specifications detail table */}
            <div className="bg-white dark:bg-bg-weak-50 border border-gray-200 dark:border-stroke-sub-300 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-gray-800 dark:text-white border-b border-gray-100 dark:border-stroke-sub-300 pb-3 uppercase tracking-wider flex items-center gap-2">
                <span className="text-[#d70018]">⚙</span>
                Thông số kỹ thuật chi tiết
              </h2>

              <div className="overflow-hidden border border-gray-150 dark:border-stroke-sub-300 rounded-xl text-xs md:text-sm">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    <tr className="bg-gray-50 dark:bg-bg-surface-850 border-b border-gray-150 dark:border-stroke-sub-300">
                      <td className="p-3 font-bold text-gray-600 dark:text-text-soft-400 w-1/3">Hãng sản xuất</td>
                      <td className="p-3 font-medium">{brandName}</td>
                    </tr>
                    <tr className="border-b border-gray-150 dark:border-stroke-sub-300">
                      <td className="p-3 font-bold text-gray-600 dark:text-text-soft-400">Bộ vi xử lý (CPU)</td>
                      <td className="p-3 font-semibold text-[#d70018]">{cpuMap.get(laptop.cpuId) || 'Chưa cập nhật'}</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-bg-surface-850 border-b border-gray-150 dark:border-stroke-sub-300">
                      <td className="p-3 font-bold text-gray-600 dark:text-text-soft-400">Bộ nhớ trong (RAM)</td>
                      <td className="p-3 font-medium">{ramMap.get(laptop.ramId) || 'Chưa cập nhật'}</td>
                    </tr>
                    <tr className="border-b border-gray-150 dark:border-stroke-sub-300">
                      <td className="p-3 font-bold text-gray-600 dark:text-text-soft-400">Ổ cứng (SSD)</td>
                      <td className="p-3 font-medium">{storageMap.get(laptop.storageId) || 'Chưa cập nhật'}</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-bg-surface-850 border-b border-gray-150 dark:border-stroke-sub-300">
                      <td className="p-3 font-bold text-gray-600 dark:text-text-soft-400">Card đồ họa (GPU)</td>
                      <td className="p-3 font-medium">{gpuMap.get(laptop.gpuId) || 'Chưa cập nhật'}</td>
                    </tr>
                    <tr className="border-b border-gray-150 dark:border-stroke-sub-300">
                      <td className="p-3 font-bold text-gray-600 dark:text-text-soft-400">Kích thước màn hình</td>
                      <td className="p-3 font-medium">{screenSizeMap.get(laptop.screenSizeId) || 'Chưa cập nhật'}</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-bg-surface-850">
                      <td className="p-3 font-bold text-gray-600 dark:text-text-soft-400">Độ phân giải màn hình</td>
                      <td className="p-3 font-medium">{screenMap.get(laptop.screenId) || 'Chưa cập nhật'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Column: Pricing, Options, Promos, CTA Buttons */}
          <div className="lg:col-span-5 space-y-5">

            {/* related products */}
            {laptop.relations && laptop.relations.length > 0 && (
              <div className="bg-white dark:bg-bg-weak-50 border border-gray-200 dark:border-stroke-sub-300 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Các phiên bản của sản phẩm</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {laptop.relations.map((opt) => {
                    const isActive = laptop?.id === opt.id
                    return (
                      <Link
                        key={opt.id}
                        to="/public/laptops/$slug"
                        params={{ slug: opt.slug }}
                        className={`flex flex-row xl:gap-10 md:gap-4 p-3 rounded-xl border text-left justify-start items-center min-h-[76px] cursor-pointer transition-all duration-200 ${isActive
                          ? 'border-[#d70018] bg-red-50/5 ring-1 ring-[#d70018]'
                          : 'border-gray-200 dark:border-stroke-sub-300 hover:border-gray-400'
                          }`}
                      >
                        <div className="flex flex-col items-center justify-center h-full w-full">
                          <span className={`text-xs text-center line-clamp-3 overflow-hidden font-bold ${isActive ? 'text-[#d70018]' : 'text-gray-700 dark:text-white'}`}>
                            {opt.name}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Options selection boxes */}
            {laptop.options && laptop.options.length > 0 && (
              <div className="bg-white dark:bg-bg-weak-50 border border-gray-200 dark:border-stroke-sub-300 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Chọn cấu hình sản phẩm</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {laptop.options.map((opt) => {
                    const isActive = selectedOption?.id === opt.id
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedOption(opt)}
                        className={`flex flex-row xl:gap-10 md:gap-4 p-3 rounded-xl border text-left justify-start items-center min-h-[76px] cursor-pointer transition-all duration-200 ${isActive
                          ? 'border-[#d70018] bg-red-50/5 ring-1 ring-[#d70018]'
                          : 'border-gray-200 dark:border-stroke-sub-300 hover:border-gray-400'
                          }`}
                      >
                        <img src={getFileUrl(opt.attach?.attachMetadata.keyName)} alt={opt.name} className="w-[38px] object-contain" />
                        <div className="flex flex-col items-start justify-center h-full">
                          <span className={`text-xs font-bold block ${isActive ? 'text-[#d70018]' : 'text-gray-700 dark:text-white'}`}>
                            {opt.name}
                          </span>
                          <span className="text-[11px] font-extrabold text-[#d70018] mt-1.5">
                            {formatPrice(handleCaculationPrice(opt))}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Pricing Box */}
            <div className="bg-white dark:bg-bg-weak-50 border border-gray-200 dark:border-stroke-sub-300 rounded-2xl p-5 shadow-sm space-y-3.5">
              <div className="flex items-baseline flex-wrap gap-3 items-center">
                <span className="text-2xl font-black text-[#d70018]">
                  {formatPrice(handleCaculationPrice(selectedOption || undefined))}
                </span>

                {discountPercent > 0 && (
                  <>
                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice(Number(selectedOption?.price || laptop?.originalPrice || 0))}
                    </span>
                    <span className="bg-[#d70018] text-white px-2 py-0.5 rounded-lg text-[10px] font-extrabold shadow-sm">
                      Giảm lên đến {formatPrice(discountPercent)}
                    </span>
                  </>
                )}
              </div>

              <div className="bg-neutral-50 dark:bg-bg-surface-855 p-2.5 rounded-xl border border-dashed border-gray-150 dark:border-stroke-sub-300 text-xs font-semibold text-gray-500 flex items-center justify-between">
                <span>Miễn phí vận chuyển toàn quốc</span>
                <span className="text-green-600">✔ Có hàng</span>
              </div>
            </div>

            {/* Promobox CellphoneS style */}
            <div className="bg-white dark:bg-bg-weak-50 border border-gray-200 dark:border-stroke-sub-300 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-red-50 dark:bg-red-955/20 border-b border-red-100 dark:border-stroke-sub-300 px-4 py-3 flex items-center gap-2">
                <span className="size-5 rounded-full bg-[#d70018] flex items-center justify-center text-white font-extrabold text-[10px]">🎁</span>
                <h3 className="text-xs font-black text-[#d70018] uppercase tracking-wider">Khuyến mãi có thể áp dụng</h3>
              </div>

              <div className="p-4 space-y-3 text-xs leading-relaxed text-gray-700 dark:text-text-soft-400">
                {discounts && discounts.length > 0 ? (
                  discounts.map((disc, idx) => {
                    return (
                      <div key={disc.id} className="flex gap-2 p-2 rounded-lg border border-dashed border-red-200 dark:border-red-900/40 bg-red-50/5 dark:bg-red-950/5 items-start">
                        <span className="text-[#d70018] font-bold shrink-0">{idx + 1}.</span>
                        <div className="space-y-1">
                          <span className="font-bold text-gray-800 dark:text-white">{disc.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400">Mã code:</span>
                            <span className="bg-red-100 dark:bg-red-950 text-[#d70018] px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase border border-red-200 dark:border-red-900/50">
                              {disc.code}
                            </span>
                          </div>
                          {disc.expiryTo && (
                            <p className="text-[10px] text-gray-400 mt-1">Hạn dùng: {renderLocalTime(disc.expiryTo)}</p>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-4 text-gray-400">Không có khuyến mãi nào khả dụng cho sản phẩm này.</div>
                )}
              </div>
            </div>

            {/* Action buttons (CTAs) */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <Button.Root
                  disabled={warehouses.length === 0}
                  onClick={handleBuyNow}
                  className='col-span-2 flex flex-col items-center justify-center h-auto w-full bg-[#d70018] hover:bg-red-700 active:scale-[0.98] text-white py-3.5 rounded-2xl transition-all shadow-md cursor-pointer'
                >
                  <div className='flex flex-col items-center justify-center rounded-2xl hover:bg-red-700'>
                    <span className="text-sm font-black flex items-center gap-2 uppercase tracking-wider">
                      <Button.Icon as={ShoppingCart01} />
                      {warehouses.length === 0 ? 'Đang cập nhật ' : 'MUA NGAY'}
                    </span>
                    <span className="text-[10px] opacity-90 mt-0.5">Giao nhanh 2 giờ hoặc nhận tại cửa hàng</span>
                  </div>
                </Button.Root>

                <Button.Root
                  mode="stroke"
                  variant="error"
                  disabled={warehouses.length === 0}
                  onClick={handleAddToCart}
                  className='flex flex-col items-center justify-center h-auto w-full  active:scale-[0.98] py-3.5 rounded-2xl transition-all shadow-md cursor-pointer'
                >
                  <div className='flex flex-col items-center justify-center rounded-2xl'>
                    <span className="text-sm font-black flex items-center gap-2 uppercase tracking-wider text-wrap">
                      <Button.Icon as={ShoppingBag} />
                      {warehouses.length === 0 ? 'Đang cập nhật ' : 'Thêm vào giỏ hàng'}
                    </span>
                    {/* <span className="text-[10px] opacity-90 mt-0.5">Giao nhanh 2 giờ hoặc nhận tại cửa hàng</span> */}
                  </div>
                </Button.Root>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer">
                  <span className="text-xs font-bold">TRẢ GÓP 0%</span>
                  <span className="text-[9px] opacity-90 mt-0.5">Xét duyệt trực tuyến</span>
                </button>

                <button className="border border-blue-600 hover:bg-blue-50/5 text-blue-600 dark:text-blue-400 py-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer">
                  <span className="text-xs font-bold flex items-center gap-1">
                    <CreditCard02 size={13} />
                    TRẢ GÓP QUA THẺ
                  </span>
                  <span className="text-[9px] opacity-90 mt-0.5">Visa, Mastercard, JCB</span>
                </button>
              </div>
            </div>

            {/* Store check and address list */}
            <div className="bg-white dark:bg-bg-weak-50 border border-gray-200 dark:border-stroke-sub-300 rounded-2xl p-5 shadow-sm space-y-3.5">
              <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider">Xem địa chỉ cửa hàng có sẵn</h4>
              <div className="space-y-2 text-xs text-gray-700 dark:text-text-soft-400">
                {warehouses.length === 0 && (
                  <div className="text-center py-4 text-gray-400">Không có sản phẩm nào khả dụng tại cửa hàng.</div>
                )}
                {warehouses.map((warehouse) => (
                  <div key={warehouse.id} className="flex gap-2 items-center">
                    <span className="size-2 rounded-full bg-green-500" />
                    <span>{warehouse?.name} - {warehouse?.address} (Còn {warehouse?.total} sản phẩm)</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  )
}

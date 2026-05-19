import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Navigation } from 'swiper/modules';
import { X } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/effect-cards';
import 'swiper/css/navigation';
import type { AttachDto } from "#/module/attachs/dto";
import { useFileUrl } from "#/module/attachs/hooks/use-file";

export function SwiperCardEffect({images, onRemove} : {images: AttachDto[], onRemove?: (id: number) => void}) {
    const { getFileUrl } = useFileUrl()
    return (
        <div className="flex items-center justify-center min-h-[160px] p-4">
            <Swiper
                effect="cards"
                grabCursor={true}
                modules={[EffectCards, Navigation]}
                navigation={{
                    prevEl: '.swiper-button-prev',
                    nextEl: '.swiper-button-next',
                }}
                cardsEffect={{
                    slideShadows: true, // Tạo hiệu ứng đổ bóng giữa các lớp bài (Trông thực tế hơn)
                    rotate: true,       // Hơi xoay nhẹ các lá bài phía sau
                    perSlideOffset: 8,  // Khoảng cách thụt lề pixel giữa các lá bài (Mặc định là 8)
                    perSlideRotate: 2,  // Góc xoay (độ) lệch giữa các lá bài phía sau (Mặc định là 2)
                }}
                className="w-48 h-64"
            >
                {images.map((image) => (
                    <SwiperSlide
                        key={image.id}
                        className='flex items-center justify-center text-white 
                                    font-bold text-2xl rounded-2xl 
                                    bg-gradient-to-br from-slate-500 
                                    to-slate-600 shadow-xl relative group'>
                        <div className='w-full h-full flex items-center justify-center'>
                            <img 
                                className="w-3/4 h-auto object-contain" 
                                src={getFileUrl(image.attachMetadata?.keyName || '')} 
                                alt={image.name} />
                        </div>
                        {onRemove && (
                            <button
                                onClick={() => onRemove(image.id!)}
                                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                                title="Xóa ảnh"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    )
}
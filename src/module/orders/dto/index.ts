import type { PaymentType, ShipmentType } from "#/module/cart/dto";
import type { DiscountResponse } from "#/module/discounts/dto";

export interface OrderDto {
  id: number;
  ownerId: number;
  discountId: number | null;
  discount: DiscountResponse | null
  fullName: string;
  phoneNumber: string;
  email: string;
  shipmentType: keyof typeof ShipmentType
  paymentType: keyof typeof PaymentType
  district: string;
  province: string;
  commune: string;
  addressDetail: string;
  total: number;
  createAt: string;
  updateAt: string;
  orderDetails: OrderDetailDto[];
  status: keyof typeof ProcessStatus;
  paymentStatus?: keyof typeof PaymentStatus | null;
}

export interface OrderDetailDto {
  id: number;
  orderId: number;
  name: string;
  laptopSlug?: string;
  laptopName?: string;
  imageKey: string;
  optionId: number;
  quantity: number;
  price?: number;
  serialNumbers?: string[];
}

export const ProcessStatus = {
    MOI : {
        order: 1,
        label: "Đặt hàng thành công",
        value: "MOI",
        colorClass: 'bg-amber-50 text-amber-600 dark:bg-amber-955/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30',
    },
    DANG_CHUAN_BI: {
        order: 2,
        label: "Xác nhận đơn hàng",
        value: "DANG_CHUAN_BI",
        colorClass: 'bg-blue-50 text-blue-600 dark:bg-blue-955/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30',
    },
    DANG_VAN_CHUYEN: {
        order: 3,
        label: "Đang vận chuyển",
        value: "DANG_VAN_CHUYEN",
        colorClass: 'bg-rose-50 text-rose-600 dark:bg-rose-955/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30',
    },
    HOAN_THANH: {
        order: 4,
        label: "Hoàn thành",
        value: "HOAN_THANH",
        colorClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-955/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30',
    },
    HUY: {
        order: 5,
        label: "Hủy",
        value: "HUY",
        colorClass: 'bg-red-50 text-red-600 dark:bg-red-955/30 dark:text-red-400 border border-red-200 dark:border-red-900/30',
    },
}

export const PaymentStatus = {
    COD: {
        label: "Thanh toán khi nhận hàng",
        value: "COD",
        colorClass: 'bg-blue-50 text-blue-600 dark:bg-blue-955/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30',
    },
    NEW: {
        label: "Chưa thanh toán",
        value: "NEW",
        colorClass: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-955/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/30',
    },
    PENDING: {
        label: "Chờ xử lý",
        value: "PENDING",
        colorClass: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-955/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/30',
    },
    FAIL: {
        label: "Thanh toán thất bại",
        value: "FAIL",
        colorClass: 'bg-red-100 text-red-600 dark:bg-red-955/30 dark:text-red-400 border border-red-200 dark:border-red-900/30',
    },
    SUCCESS: {
        label: "Thanh toán thành công",
        value: "SUCCESS",
        colorClass: 'bg-green-100 text-green-600 dark:bg-green-955/30 dark:text-green-400 border border-green-200 dark:border-green-900/30',
    }
}
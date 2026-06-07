export const ReportType = {
    BAO_CAO_DOANH_THU: {
        value: "BAO_CAO_DOANH_THU",
        label: "Báo Cáo Doanh Thu"
    },
    BAO_CAO_TON_KHO: {
        value: "BAO_CAO_TON_KHO",
        label: "Báo Cáo Tồn Kho"
    },
    TON_KHO_HIEN_TAI: {
        value: "TON_KHO_HIEN_TAI",
        label: "Tồn Kho Hiện Tại"
    }
}

export type BaoCaoTonKho = {
    time: string;
    laptopId: number;
    laptopName: string;
    tonKhoDauKy: number;
    nhapHang: number;
    xuatHang: number;
    tonKhoCuoiKy: number;
}
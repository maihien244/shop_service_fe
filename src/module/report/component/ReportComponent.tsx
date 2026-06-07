import { useEffect, useMemo, useState } from "react";
import type { ReportParams } from "../service/report-service";
import { ReportType } from "../dto";
import { BaoCaoDoanhThuComponent } from "./BaoCaoDoanhThuComponent";
import { BaoCaoTonKhoComponent } from "./BaoCaoTonKho";
import { TonKhoHienTaiComponent } from "./TonKhoHienTaiComponent";
import * as Select from '#/components/ui/select';
import * as Input from '#/components/ui/input';
import * as Button from '#/components/ui/button';
import { LoadingComponent } from '#/components/ui/loading';
import { useQuery } from "@tanstack/react-query";
import { WarehouseService } from "#/module/warehouse/servcie/warehouse-service";
import { useNavigate } from "@tanstack/react-router";

export function ReportComponent<T extends ReportParams>({ params }: { params: T }) {
    const navigate = useNavigate();
    const [selectedReportType, setSelectedReportType] = useState<string>(params.type || ReportType.BAO_CAO_DOANH_THU.value);

    // Manage filter inputs locally
    const [selectedFromDate, setSelectedFromDate] = useState<string>(params.fromDate);
    const [selectedToDate, setSelectedToDate] = useState<string>(params.toDate);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>(params?.warehouseId ? Number(params?.warehouseId) : undefined);
    const warehouseService = useMemo(() => new WarehouseService(), []);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Sync input states when route search params (props) change
    useEffect(() => {
        if (params.type) setSelectedReportType(params.type);
        if (params.fromDate) setSelectedFromDate(params.fromDate);
        if (params.toDate) setSelectedToDate(params.toDate);
        setSelectedWarehouseId(params?.warehouseId ? Number(params?.warehouseId) : undefined);
    }, [params]);

    const handleReportTypeChange = (value: string) => {
        setSelectedReportType(value);
        navigate({
            to: ".",
            search: (prev) => ({
                ...prev,
                type: value as keyof typeof ReportType,
            }),
        });
    };

    const handleApplyFilters = () => {
        navigate({
            to: ".",
            search: (prev) => ({
                ...prev,
                type: selectedReportType as keyof typeof ReportType,
                fromDate: selectedFromDate,
                toDate: selectedToDate,
                warehouseId: selectedWarehouseId,
            }),
        });
    };

    const handleSelectedWarehouse = (value: string) => {
        if (value === "all") {
            setSelectedWarehouseId(undefined);
        } else {
            setSelectedWarehouseId(Number(value));
        }
    };

    const renderReport = () => {
        switch (params.type || selectedReportType) {
            case ReportType.BAO_CAO_DOANH_THU.value:
                return (
                    <BaoCaoDoanhThuComponent
                        params={params}
                        setIsLoading={setIsLoading}
                    />
                );
            case ReportType.BAO_CAO_TON_KHO.value:
                return (
                    <BaoCaoTonKhoComponent
                        params={params as any}
                        setIsLoading={setIsLoading}
                    />
                );
            case ReportType.TON_KHO_HIEN_TAI.value:
                return (
                    <TonKhoHienTaiComponent
                        params={params as any}
                        setIsLoading={setIsLoading}
                    />
                );
            default:
                return (
                    <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-stroke-soft-200 bg-bg-weak-25 text-text-sub-600 dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                        Vui lòng chọn một loại báo cáo hợp lệ.
                    </div>
                );
        }
    };

    const { data: warehouses } = useQuery({
        queryKey: ['warehouses-lookup'],
        queryFn: () => warehouseService.getList({ size: 100, isActive: 1 }).then((res) => res?.results ?? []),
    })

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-title-h5 font-bold tracking-tight text-text-strong-950 dark:text-static-white">
                    Báo cáo thống kê
                </h1>
                <p className="text-paragraph-sm text-text-sub-600 dark:text-text-soft-400 mt-1">
                    Xem và theo dõi các báo cáo số liệu hoạt động của cửa hàng.
                </p>
            </div>

            {/* Filter Section */}
            <div className="bg-bg-white-0 dark:bg-bg-weak-50 border border-stroke-soft-200 dark:border-stroke-sub-300 rounded-24 p-6 shadow-regular-sm space-y-4">
                <h2 className="text-label-md font-bold text-text-strong-950 dark:text-static-white">Bộ lọc báo cáo</h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Report Type Select */}
                    <div className="space-y-2.5">
                        <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400">
                            Loại báo cáo
                        </label>
                        <Select.Root value={selectedReportType} onValueChange={handleReportTypeChange}>
                            <Select.Trigger className="w-full">
                                <Select.Value placeholder="Chọn loại báo cáo" />
                            </Select.Trigger>
                            <Select.Content>
                                {Object.values(ReportType).map((type) => (
                                    <Select.Item key={type.value} value={type.value}>
                                        {type.label}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                    </div>

                    {/* From Date Input */}
                    <div className="space-y-2.5">
                        <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400">
                            Từ ngày (Bắt đầu)
                        </label>
                        <Input.Root size="medium">
                            <Input.Wrapper className="px-2">
                                <Input.Input
                                    type="date"
                                    value={selectedFromDate}
                                    onChange={(e) => setSelectedFromDate(e.target.value)}
                                />
                            </Input.Wrapper>
                        </Input.Root>
                    </div>

                    {/* To Date Input */}
                    <div className="space-y-2.5">
                        <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400">
                            Đến ngày (Kết thúc)
                        </label>
                        <Input.Root size="medium">
                            <Input.Wrapper className="px-2">
                                <Input.Input
                                    type="date"
                                    value={selectedToDate}
                                    onChange={(e) => setSelectedToDate(e.target.value)}
                                />
                            </Input.Wrapper>
                        </Input.Root>
                    </div>

                    {/* Warehouse Select */}
                    <div className="space-y-2.5">
                        <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400">
                            Kho hàng
                        </label>
                        <Select.Root value={selectedWarehouseId !== undefined ? selectedWarehouseId.toString() : "all"} onValueChange={(value) => handleSelectedWarehouse(value)}>
                            <Select.Trigger className="w-full">
                                <Select.Value placeholder="Chọn kho hàng" />
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Item value={"all"}>Tất cả kho</Select.Item>
                                {warehouses?.map((warehouse, key) => (
                                    <Select.Item key={key} value={warehouse.id.toString()}>
                                        {warehouse.name}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                    </div>

                    {/* Submit Button */}
                    <Button.Root variant="primary" mode="filled" onClick={handleApplyFilters} className="w-full h-10">
                        Xem báo cáo
                    </Button.Root>
                </div>
            </div>

            {/* Report Display Container */}
            <div className="relative bg-bg-white-0 dark:bg-bg-weak-50 border border-stroke-soft-200 dark:border-stroke-sub-300 rounded-24 p-6 shadow-regular-sm min-h-[350px] flex flex-col justify-center">
                {isLoading && (
                    <div className="absolute inset-0 bg-bg-white-0/70 dark:bg-bg-weak-50/70 z-10 flex items-center justify-center rounded-24">
                        <LoadingComponent />
                    </div>
                )}

                <div className="w-full">
                    {renderReport()}
                </div>
            </div>
        </div>
    );
}
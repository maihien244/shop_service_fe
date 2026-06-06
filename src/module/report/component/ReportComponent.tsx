import { useState } from "react";
import type { ReportParams } from "../service/report-service";
import { ReportType } from "../dto";
import { BaoCaoDoanhThuComponent } from "./BaoCaoDoanhThuComponent";
import * as Select from '#/components/ui/select';
import * as Input from '#/components/ui/input';
import * as Button from '#/components/ui/button';
import { LoadingComponent } from '#/components/ui/loading';

export function ReportComponent({ params }: { params: ReportParams }) {
    const [selectedReportType, setSelectedReportType] = useState<string>(ReportType.BAO_CAO_DOANH_THU.value);

    // Manage filter inputs locally
    const [selectedFromDate, setSelectedFromDate] = useState<string>(params.fromDate);
    const [selectedToDate, setSelectedToDate] = useState<string>(params.toDate);

    // Active parameters for the components to fetch
    const [currentParams, setCurrentParams] = useState<ReportParams>({
        type: selectedReportType as keyof typeof ReportType,
        fromDate: params.fromDate,
        toDate: params.toDate,
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleApplyFilters = () => {
        setCurrentParams({
            type: selectedReportType as keyof typeof ReportType,
            fromDate: selectedFromDate,
            toDate: selectedToDate,
        });
    };

    const renderReport = () => {
        switch (selectedReportType) {
            case ReportType.BAO_CAO_DOANH_THU.value:
                return (
                    <BaoCaoDoanhThuComponent
                        params={currentParams}
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    {/* Report Type Select */}
                    <div className="space-y-2.5">
                        <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400">
                            Loại báo cáo
                        </label>
                        <Select.Root value={selectedReportType} onValueChange={setSelectedReportType}>
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
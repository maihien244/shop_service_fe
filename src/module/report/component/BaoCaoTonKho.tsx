import { Bar, CartesianGrid, ComposedChart, Label, Legend, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltipContent } from "@/components/application/charts/charts-base";
import { useEffect, useMemo, useState } from "react";
import { ReportService, TonKhoReport } from "../service/report-service";
import { useMutation } from "@tanstack/react-query";
import { type BaoCaoTonKho } from "../dto";
import { BarChart2, Table } from "lucide-react";

export type BaoCaoTonKhoProps = {
    params: TonKhoReport
    setIsLoading: (isLoading: boolean) => void
}

export function BaoCaoTonKhoComponent({ params, setIsLoading }: BaoCaoTonKhoProps) {
    const [report, setReport] = useState<BaoCaoTonKho[]>([])
    const [viewMode, setViewMode] = useState<"chart" | "table">("chart")
    const reportService = useMemo(() => new ReportService(), [])

    const reportMutation = useMutation({
        mutationFn: async () => {
            return await reportService.getReport<BaoCaoTonKho[]>(params)
        },
        onSuccess: (data: BaoCaoTonKho[]) => {
            setReport(data || [])
            setIsLoading(false)
        },
        onError: () => {
            setIsLoading(false)
        }
    })

    useEffect(() => {
        setIsLoading(true)
        reportMutation.mutate()
    }, [params])

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return `Tháng ${date.getMonth() + 1} / ${date.getFullYear()}`;
        } catch {
            return dateStr;
        }
    }

    const processedReport = useMemo(() => {
        const laptopGroups: Record<number, typeof report> = {};
        report.forEach((item) => {
            if (!laptopGroups[item.laptopId]) {
                laptopGroups[item.laptopId] = [];
            }
            laptopGroups[item.laptopId].push(item);
        });

        const result: typeof report = [];

        Object.values(laptopGroups).forEach((items) => {
            const sorted = [...items].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

            let lastEndingStock: number | null = null;

            sorted.forEach((item) => {
                let currentBeginning = item.tonKhoDauKy;
                if (lastEndingStock !== null) {
                    currentBeginning = lastEndingStock;
                }
                const currentEnding = currentBeginning + item.nhapHang - item.xuatHang;
                lastEndingStock = currentEnding;

                result.push({
                    ...item,
                    tonKhoDauKy: currentBeginning,
                    tonKhoCuoiKy: currentEnding,
                });
            });
        });

        return result.sort((a, b) => {
            const timeDiff = new Date(a.time).getTime() - new Date(b.time).getTime();
            if (timeDiff !== 0) return timeDiff;
            return a.laptopName.localeCompare(b.laptopName);
        });
    }, [report]);

    const chartData = useMemo(() => {
        const groups: Record<string, {
            time: string;
            nhapHang: number;
            xuatHang: number;
            rawDauKy: number;
        }> = {};

        report.forEach((item) => {
            const monthStr = item.time;
            if (!groups[monthStr]) {
                groups[monthStr] = {
                    time: monthStr,
                    nhapHang: 0,
                    xuatHang: 0,
                    rawDauKy: 0,
                };
            }
            groups[monthStr].nhapHang += item.nhapHang;
            groups[monthStr].xuatHang += item.xuatHang;
            groups[monthStr].rawDauKy += item.tonKhoDauKy;
        });

        const sortedMonths = Object.values(groups).sort(
            (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
        );

        let lastEndingStock: number | null = null;

        return sortedMonths.map((m) => {
            let beginning = m.rawDauKy;
            if (lastEndingStock !== null) {
                beginning = lastEndingStock;
            }
            const ending = beginning + m.nhapHang - m.xuatHang;
            lastEndingStock = ending;

            return {
                time: m.time,
                tonKhoDauKy: beginning,
                nhapHang: m.nhapHang,
                xuatHang: m.xuatHang,
                tonKhoCuoiKy: ending,
            };
        });
    }, [report]);

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* View Mode Switcher */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stroke-soft-200 dark:border-stroke-sub-300 pb-4 gap-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode("chart")}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${viewMode === "chart"
                            ? "bg-utility-brand-600 text-white shadow-soft"
                            : "text-text-sub-600 hover:bg-bg-weak-50 dark:text-text-soft-400 dark:hover:bg-bg-surface-800 border border-stroke-soft-200 dark:border-stroke-sub-300"
                            }`}
                    >
                        <BarChart2 size={16} />
                        Biểu đồ
                    </button>
                    <button
                        onClick={() => setViewMode("table")}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${viewMode === "table"
                            ? "bg-utility-brand-600 text-white shadow-soft"
                            : "text-text-sub-600 hover:bg-bg-weak-50 dark:text-text-soft-400 dark:hover:bg-bg-surface-800 border border-stroke-soft-200 dark:border-stroke-sub-300"
                            }`}
                    >
                        <Table size={16} />
                        Bảng số liệu
                    </button>
                </div>

                <div className="text-sm text-text-sub-600 dark:text-text-soft-400 font-medium">
                    Tổng số sản phẩm: <span className="font-bold text-text-strong-950 dark:text-static-white">{report.length}</span>
                </div>
            </div>

            {/* Content area */}
            {report.length === 0 ? (
                <div className="flex h-60 items-center justify-center rounded-2xl border border-dashed border-stroke-soft-200 bg-bg-weak-25 text-text-sub-600 dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                    Không có dữ liệu tồn kho trong khoảng thời gian này.
                </div>
            ) : viewMode === "chart" ? (
                <div className="h-96 w-full">
                    <ResponsiveContainer initialDimension={{ width: 1, height: 1 }} className="h-full">
                        <ComposedChart
                            data={chartData}
                            margin={{
                                left: 20,
                                right: 12,
                                top: 24,
                                bottom: 24,
                            }}
                            className="text-tertiary [&_.recharts-text]:text-xs"
                        >
                            <CartesianGrid vertical={false} stroke="currentColor" className="text-utility-neutral-100" />

                            <XAxis
                                fill="currentColor"
                                axisLine={false}
                                tickLine={false}
                                tickMargin={12}
                                dataKey="time"
                                tickFormatter={formatDate}
                            >
                                <Label
                                    offset={10}
                                    value="Thời gian"
                                    fill="currentColor"
                                    className="text-xs! font-medium"
                                    position="bottom"
                                />
                            </XAxis>

                            <YAxis
                                fill="currentColor"
                                axisLine={false}
                                tickLine={false}
                                interval="preserveStartEnd"
                                tickFormatter={(value) => Number(value).toString()}
                                width={50}
                            >
                                <Label
                                    value="Số lượng"
                                    fill="currentColor"
                                    className="text-xs! font-medium"
                                    style={{ textAnchor: "middle" }}
                                    angle={-90}
                                    position="left"
                                    offset={-10}
                                />
                            </YAxis>

                            <Tooltip
                                content={<ChartTooltipContent />}
                                formatter={(value, name) => {
                                    return [Number(value).toString(), name];
                                }}
                                labelFormatter={(value) => formatDate(value)}
                                cursor={{
                                    className: "fill-utility-neutral-200/20",
                                }}
                            />

                            <Legend verticalAlign="top" height={36} />

                            <Bar
                                isAnimationActive={false}
                                name="Tồn đầu kỳ"
                                dataKey="tonKhoDauKy"
                                fill="var(--color-utility-neutral-400)"
                                maxBarSize={16}
                                radius={[4, 4, 0, 0]}
                                shape={(props: any) => {
                                    if (props.value === 0) return null;
                                    return <Rectangle {...props} />;
                                }}
                            />

                            <Bar
                                isAnimationActive={false}
                                name="Nhập hàng"
                                dataKey="nhapHang"
                                fill="var(--color-utility-brand-600)"
                                maxBarSize={16}
                                radius={[4, 4, 0, 0]}
                                shape={(props: any) => {
                                    if (props.value === 0) return null;
                                    return <Rectangle {...props} />;
                                }}
                            />

                            <Bar
                                isAnimationActive={false}
                                name="Xuất hàng"
                                dataKey="xuatHang"
                                fill="var(--color-utility-red-500)"
                                maxBarSize={16}
                                radius={[4, 4, 0, 0]}
                                shape={(props: any) => {
                                    if (props.value === 0) return null;
                                    return <Rectangle {...props} />;
                                }}
                            />

                            <Bar
                                isAnimationActive={false}
                                name="Tồn cuối kỳ"
                                dataKey="tonKhoCuoiKy"
                                fill="var(--color-utility-green-600)"
                                maxBarSize={16}
                                radius={[4, 4, 0, 0]}
                                shape={(props: any) => {
                                    if (props.value === 0) return null;
                                    return <Rectangle {...props} />;
                                }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-soft dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-max text-left text-paragraph-sm text-text-strong-950 dark:text-static-white">
                            <thead className="bg-bg-weak-50 dark:bg-bg-surface-800 border-b border-stroke-soft-200 dark:border-stroke-sub-300">
                                <tr>
                                    <th className="px-6 py-4 text-label-xs font-bold uppercase tracking-wider text-text-soft-400">Thời gian</th>
                                    <th className="px-6 py-4 text-label-xs font-bold uppercase tracking-wider text-text-soft-400">Sản phẩm</th>
                                    <th className="px-6 py-4 text-label-xs font-bold uppercase tracking-wider text-text-soft-400 text-right">Tồn đầu kỳ</th>
                                    <th className="px-6 py-4 text-label-xs font-bold uppercase tracking-wider text-text-soft-400 text-right">Nhập trong kỳ</th>
                                    <th className="px-6 py-4 text-label-xs font-bold uppercase tracking-wider text-text-soft-400 text-right">Xuất trong kỳ</th>
                                    <th className="px-6 py-4 text-label-xs font-bold uppercase tracking-wider text-text-soft-400 text-right">Tồn cuối kỳ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stroke-soft-200 dark:divide-stroke-sub-300">
                                {processedReport.map((item, idx) => (
                                    <tr key={`${item.laptopId}-${item.time}-${idx}`} className="transition-colors duration-200 hover:bg-bg-weak-50/50 dark:hover:bg-bg-surface-800/50">
                                        <td className="px-6 py-4 font-medium text-text-sub-600 dark:text-text-soft-400">{formatDate(item.time)}</td>
                                        <td className="px-6 py-4 font-semibold text-text-strong-950 dark:text-static-white">{item.laptopName}</td>
                                        <td className="px-6 py-4 text-right text-text-sub-600 dark:text-text-soft-400">{item.tonKhoDauKy.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right text-utility-brand-600 font-semibold">{item.nhapHang > 0 ? `+${item.nhapHang.toLocaleString()}` : '0'}</td>
                                        <td className="px-6 py-4 text-right text-utility-error-500 font-semibold">{item.xuatHang > 0 ? `-${item.xuatHang.toLocaleString()}` : '0'}</td>
                                        <td className="px-6 py-4 text-right text-utility-success-600 font-bold">{item.tonKhoCuoiKy.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

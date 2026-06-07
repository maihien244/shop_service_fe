import { Bar, BarChart, CartesianGrid, Cell, Label, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useMemo, useState } from "react";
import { ReportService, TonKhoReport } from "../service/report-service";
import { useMutation } from "@tanstack/react-query";
import { BarChart2, Table } from "lucide-react";

export type TonKhoHienTaiProps = {
    params: TonKhoReport;
    setIsLoading: (isLoading: boolean) => void;
};

const ChartTooltipContent = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const valuePayload = payload.find((p: any) => p.dataKey === "value");
        if (valuePayload) {
            const data = valuePayload.payload;
            return (
                <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-regular-md dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                    <p className="text-xs font-bold text-text-strong-950 dark:text-static-white mb-1">{data.name}</p>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
                        <span className="text-xs text-text-sub-600 dark:text-text-soft-400">Số lượng tồn:</span>
                        <span className="text-xs font-bold text-text-strong-950 dark:text-static-white">{data.displayValue}</span>
                    </div>
                </div>
            );
        }
    }
    return null;
};

export function TonKhoHienTaiComponent({ params, setIsLoading }: TonKhoHienTaiProps) {
    const [reportData, setReportData] = useState<Record<string, number>>({});
    const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
    const reportService = useMemo(() => new ReportService(), []);

    const reportMutation = useMutation({
        mutationFn: async () => {
            return await reportService.getReport<Record<string, number>>(params);
        },
        onSuccess: (data: Record<string, number>) => {
            setReportData(data || {});
            setIsLoading(false);
        },
        onError: () => {
            setIsLoading(false);
        }
    });

    useEffect(() => {
        setIsLoading(true);
        reportMutation.mutate();
    }, [params]);

    const chartData = useMemo(() => {
        const entries = Object.entries(reportData || {});
        // Sort descending by stock count
        entries.sort((a, b) => b[1] - a[1]);

        const topLimit = 6;
        const chartItems: { name: string; value: number }[] = [];
        let othersSum = 0;

        entries.forEach(([name, val], index) => {
            if (index < topLimit) {
                chartItems.push({ name, value: val });
            } else {
                othersSum += val;
            }
        });

        if (othersSum > 0) {
            chartItems.push({ name: "Khác", value: othersSum });
        }

        let cumulative = 0;
        const data = chartItems.map((item) => {
            const start = cumulative;
            const value = item.value;
            cumulative += value;

            return {
                name: item.name,
                start,
                value,
                displayValue: value,
                color: item.name === "Khác" ? "var(--color-utility-neutral-400)" : "var(--color-utility-brand-600)",
            };
        });

        if (data.length > 0) {
            data.push({
                name: "Tổng cộng",
                start: 0,
                value: cumulative,
                displayValue: cumulative,
                color: "var(--color-utility-success-600)",
            });
        }

        return data;
    }, [reportData]);

    const tableItems = useMemo(() => {
        const entries = Object.entries(reportData || {});
        entries.sort((a, b) => b[1] - a[1]);
        return entries.map(([name, count]) => ({ name, count }));
    }, [reportData]);

    const totalStock = useMemo(() => {
        return Object.values(reportData || {}).reduce((acc, curr) => acc + curr, 0);
    }, [reportData]);

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
                        Biểu đồ thác nước
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
                    Tổng tồn kho hiện tại: <span className="font-bold text-text-strong-950 dark:text-static-white">{totalStock.toLocaleString()}</span>
                </div>
            </div>

            {/* Content area */}
            {tableItems.length === 0 ? (
                <div className="flex h-60 items-center justify-center rounded-2xl border border-dashed border-stroke-soft-200 bg-bg-weak-25 text-text-sub-600 dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                    Không có sản phẩm nào trong kho hiện tại.
                </div>
            ) : viewMode === "chart" ? (
                <div className="h-96 w-full">
                    <ResponsiveContainer initialDimension={{ width: 1, height: 1 }} className="h-full">
                        <BarChart
                            layout="vertical"
                            data={chartData}
                            margin={{
                                left: 100,
                                right: 24,
                                top: 24,
                                bottom: 24,
                            }}
                            className="text-tertiary [&_.recharts-text]:text-xs"
                        >
                            <CartesianGrid horizontal={false} stroke="currentColor" className="text-utility-neutral-100" />

                            <XAxis
                                type="number"
                                fill="currentColor"
                                axisLine={false}
                                tickLine={false}
                                tickMargin={12}
                            >
                                <Label
                                    offset={10}
                                    value="Số lượng tồn"
                                    fill="currentColor"
                                    className="text-xs! font-medium"
                                    position="bottom"
                                />
                            </XAxis>

                            <YAxis
                                type="category"
                                dataKey="name"
                                fill="currentColor"
                                axisLine={false}
                                tickLine={false}
                                className="whitespace-nowrap"
                                width={300}
                            >
                                <Label
                                    value="Sản phẩm"
                                    fill="currentColor"
                                    className="text-xs! font-medium"
                                    style={{ textAnchor: "middle" }}
                                    angle={-90}
                                    position="left"
                                    offset={30}
                                />
                            </YAxis>

                            <Tooltip content={<ChartTooltipContent />} />

                            {/* Stacked Bars for Waterfall effect */}
                            <Bar dataKey="start" stackId="a" fill="transparent" isAnimationActive={false} />
                            <Bar dataKey="value" stackId="a" isAnimationActive={false} radius={[0, 4, 4, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-soft dark:border-stroke-sub-300 dark:bg-bg-weak-50">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-max text-left text-paragraph-sm text-text-strong-950 dark:text-static-white">
                            <thead className="bg-bg-weak-50 dark:bg-bg-surface-800 border-b border-stroke-soft-200 dark:border-stroke-sub-300">
                                <tr>
                                    <th className="px-6 py-4 text-label-xs font-bold uppercase tracking-wider text-text-soft-400">Sản phẩm</th>
                                    <th className="px-6 py-4 text-label-xs font-bold uppercase tracking-wider text-text-soft-400 text-right">Số lượng tồn hiện tại</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stroke-soft-200 dark:divide-stroke-sub-300">
                                {tableItems.map((item, idx) => (
                                    <tr key={`${item.name}-${idx}`} className="transition-colors duration-200 hover:bg-bg-weak-50/50 dark:hover:bg-bg-surface-800/50">
                                        <td className="px-6 py-4 font-semibold text-text-strong-950 dark:text-static-white">{item.name}</td>
                                        <td className="px-6 py-4 text-right text-utility-brand-600 font-bold">{item.count.toLocaleString()}</td>
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

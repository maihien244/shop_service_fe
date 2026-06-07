import { Bar, CartesianGrid, ComposedChart, Label, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltipContent, selectEvenlySpacedItems } from "@/components/application/charts/charts-base";
import { useEffect, useMemo, useState } from "react";
import { ReportService, type ReportParams } from "../service/report-service";
import { useMutation } from "@tanstack/react-query";

export type BaoCaoDoanhThuProps = {
    params: ReportParams
    setIsLoading: (isLoading: boolean) => void
}

type BaoCaoDoanhThu = {
    date: string
    total: number
}

export function BaoCaoDoanhThuComponent({ params, setIsLoading }: BaoCaoDoanhThuProps) {
    const [report, setReport] = useState<BaoCaoDoanhThu[]>([])
    const reportService = useMemo(() => new ReportService(), [])

    const reportMutation = useMutation({
        mutationFn: async () => {
            return await reportService.getReport<Record<string, any>>(params)
        },
        onSuccess: (data: Record<string, any>) => {
            setReport(() => Object.entries(data).map(([key, value]) => ({
                date: key,
                total: value
            })))
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

    return (
        <div className="flex h-60 flex-col gap-2">
            <ResponsiveContainer initialDimension={{ width: 1, height: 1 }} className="h-full">
                <ComposedChart
                    data={report}
                    margin={{
                        left: 60,
                        right: 12,
                        top: 24,
                        bottom: 18,
                    }}
                    className="text-tertiary [&_.recharts-text]:text-xs"
                >
                    <CartesianGrid vertical={false} stroke="currentColor" className="text-utility-neutral-100" />

                    <XAxis
                        fill="currentColor"
                        axisLine={false}
                        tickLine={false}
                        tickMargin={12}
                        interval="preserveStartEnd"
                        dataKey="date"
                        tickFormatter={(value) => `Tháng ${new Date(value).getMonth() + 1} / ${new Date(value).getFullYear()}`}
                        ticks={selectEvenlySpacedItems(report, 12).map((item) => item.date)}
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
                        tickFormatter={(value) => Number(value).toLocaleString() + " VND"}
                        width={150}
                    >
                        <Label
                            value="Doanh thu (VND)"
                            fill="currentColor"
                            className="text-xs! font-medium"
                            style={{ textAnchor: "middle" }}
                            angle={-90}
                            position="left"
                            offset={0}
                        />
                    </YAxis>

                    <Tooltip
                        content={<ChartTooltipContent />}
                        formatter={(value) => Number(value).toLocaleString() + " VND"}
                        labelFormatter={(value) => {
                            const date = new Date(value);
                            return `Tháng ${date.getMonth() + 1} / ${date.getFullYear()}`;
                        }}
                        cursor={{
                            className: "fill-utility-neutral-200/20",
                        }}
                    />

                    <Bar
                        isAnimationActive={false}
                        className='text-utility-brand-600'
                        name="Doanh thu"
                        dataKey="total"
                        type="monotone"
                        stackId="a"
                        fill="currentColor"
                        maxBarSize={32}
                        radius={[4, 4, 0, 0]}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
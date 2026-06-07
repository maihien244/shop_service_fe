import { ReportComponent } from '#/module/report/component/ReportComponent'
import { ReportType } from '#/module/report/dto'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/dashboard/')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      type: (search.type as keyof typeof ReportType) ?? (ReportType.BAO_CAO_DOANH_THU.value as keyof typeof ReportType),
      fromDate: typeof search.fromDate === 'string' ? search.fromDate : new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0],
      toDate: typeof search.toDate === 'string' ? search.toDate : new Date().toISOString().split('T')[0],
      warehouseId: search.warehouseId ? Number(search.warehouseId) : undefined,
    }
  },
  component: DashboardComponent,
})

function DashboardComponent() {
  const search = Route.useSearch()
  return <ReportComponent params={search} />
}
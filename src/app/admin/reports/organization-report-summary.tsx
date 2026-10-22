import { Card } from '@/components/ui/card'
import type { OrganizationReportSummary } from '@/types/types'

type OrganizationReportSummaryBoxesProps = {
  summary?: OrganizationReportSummary | null
  isLoading?: boolean
}

function displayCount(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—'
  }
  return value.toLocaleString()
}

/**
 * Simple boxed KPI row for motor organization reports.
 * Cancelled only shows when the API includes it (policies).
 */
export function OrganizationReportSummaryBoxes({
  summary,
  isLoading = false,
}: OrganizationReportSummaryBoxesProps) {
  const boxes = [
    { key: 'overall', label: 'Overall', value: summary?.overall },
    { key: 'success', label: 'Success', value: summary?.success },
    { key: 'active', label: 'Active', value: summary?.active },
    { key: 'failed', label: 'Failed', value: summary?.failed },
  ] as const

  const showCancelled = summary != null && summary.cancelled !== undefined

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground" data-testid="report-summary-label">
        {isLoading ? 'Loading summary…' : (summary?.label ?? 'Overall')}
      </p>
      <div
        className={`grid gap-3 sm:grid-cols-2 ${showCancelled ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}
        data-testid="report-summary-boxes"
      >
        {boxes.map((box) => (
          <Card key={box.key} className="shadow-none p-4">
            <p className="text-sm text-muted-foreground">{box.label}</p>
            <p className="text-2xl font-semibold tracking-tight">
              {isLoading ? '…' : displayCount(box.value)}
            </p>
          </Card>
        ))}
        {showCancelled ? (
          <Card className="shadow-none p-4" data-testid="report-summary-cancelled">
            <p className="text-sm text-muted-foreground">Cancelled</p>
            <p className="text-2xl font-semibold tracking-tight">
              {isLoading ? '…' : displayCount(summary?.cancelled)}
            </p>
          </Card>
        ) : null}
      </div>
    </div>
  )
}

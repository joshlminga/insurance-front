/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MotorQuoteFetchDetail, TDialogComponentProps } from '@/types/types'

type Props = TDialogComponentProps<{ data?: MotorQuoteFetchDetail }>

export const MotorQuoteFetchDetailDialog = ({ componentProps }: Props) => {
  const detail = componentProps?.data
  if (!detail) {
    return <div className="text-sm text-muted-foreground">No quote details loaded.</div>
  }

  const customer = detail.customer
  const vehicle = detail.vehicle as Record<string, unknown> | null | undefined
  const cover = detail.cover as Record<string, unknown> | undefined

  return (
    <div className="space-y-4 text-sm max-h-[75vh] overflow-y-auto">
      <div>
        <h2 className="text-lg font-semibold">Quote details</h2>
        <p className="text-muted-foreground">
          {detail.session?.quote_code ?? '—'} · Stage: {detail.last_ended_stage ?? '—'}
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border p-3 space-y-1">
          <div className="font-medium">Customer</div>
          <div>{customer?.name ?? '—'}</div>
          <div className="text-muted-foreground">{customer?.email ?? '—'}</div>
          <div className="text-muted-foreground">{customer?.phone ?? '—'}</div>
        </div>
        <div className="rounded-md border p-3 space-y-1">
          <div className="font-medium">Agency / location</div>
          <div>{detail.agency?.name ?? '—'}</div>
          <div className="text-muted-foreground">
            {detail.processed_by_organization?.name ?? '—'}
          </div>
        </div>
        <div className="rounded-md border p-3 space-y-1">
          <div className="font-medium">Vehicle</div>
          <div>{String(vehicle?.registration_number ?? '—')}</div>
          <div className="text-muted-foreground">{String(vehicle?.chassis_number ?? '')}</div>
          <div className="text-muted-foreground">
            {[vehicle?.make, vehicle?.model, vehicle?.year].filter(Boolean).join(' · ')}
          </div>
        </div>
        <div className="rounded-md border p-3 space-y-1">
          <div className="font-medium">Cover</div>
          <div>{String(cover?.cover_type ?? cover?.covertype_id ?? '—')}</div>
          <div className="text-muted-foreground">{String(cover?.ownership ?? '')}</div>
          {detail.selected_cover && (
            <div className="text-muted-foreground">
              {detail.selected_cover.product_name ?? 'Product'} · rate {detail.selected_cover.rate_id}
            </div>
          )}
        </div>
      </section>

      {detail.kyc && Object.keys(detail.kyc).length > 0 && (
        <section className="rounded-md border p-3">
          <div className="font-medium mb-2">KYC</div>
          <pre className="text-xs whitespace-pre-wrap break-all bg-muted/40 p-2 rounded">
            {JSON.stringify(detail.kyc, null, 2)}
          </pre>
        </section>
      )}

      {Array.isArray(detail.invoices) && detail.invoices.length > 0 && (
        <section className="rounded-md border p-3">
          <div className="font-medium mb-2">Invoices / receipts</div>
          <pre className="text-xs whitespace-pre-wrap break-all bg-muted/40 p-2 rounded">
            {JSON.stringify(detail.invoices, null, 2)}
          </pre>
        </section>
      )}

      {Array.isArray(detail.certificates) && detail.certificates.length > 0 && (
        <section className="rounded-md border p-3">
          <div className="font-medium mb-2">Certificates</div>
          <pre className="text-xs whitespace-pre-wrap break-all bg-muted/40 p-2 rounded">
            {JSON.stringify(detail.certificates, null, 2)}
          </pre>
        </section>
      )}
    </div>
  )
}

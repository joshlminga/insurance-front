/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { MotorQuoteFetchDetail, TDialogComponentProps } from '@/types/types'
import { formatCurrency } from '@/utils/helpers'
import type { ReactNode } from 'react'

type Props = TDialogComponentProps<{ data?: MotorQuoteFetchDetail }>

type InvoiceRow = {
  id?: number
  invoice_number?: string
  plan_type?: string
  installment_number?: number
  total_installments?: number
  installment_amount?: number | string
  gross_premium?: number | string
  due_date?: string | null
  status?: string
  receipts?: ReceiptRow[]
}

type ReceiptRow = {
  id?: number
  receipt_number?: string
  via?: string
  amount?: number | string
  payment_for?: string
  payment_note?: string | null
}

type CertificateRow = {
  id?: number
  invoice_id?: number
  certificate_number?: string | null
  policy_number?: string | null
  transaction_no?: string | null
  registration_number?: string | null
  chassis_number?: string | null
  issued_date?: string | null
  expiry_date?: string | null
  policy_allocation_status?: string | null
}

/** Turn snake_case keys into readable labels (tax_pin → Tax pin). */
const humanizeKey = (key: string) =>
  key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

/** Show KYC values readably — files/URLs as short text, objects as JSON. */
const formatKycValue = (value: unknown): ReactNode => {
  if (value === null || value === undefined || value === '') {
    return '—'
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  if (typeof value === 'number') {
    return String(value)
  }
  if (typeof value === 'string') {
    // Stored document paths/URLs — show filename only
    if (
      value.includes('/') ||
      value.startsWith('http') ||
      /\.(pdf|jpe?g|png|webp|docx?|pptx?)$/i.test(value)
    ) {
      const parts = value.split(/[\\/]/)
      return parts[parts.length - 1] || value
    }
    return value
  }
  if (typeof value === 'object') {
    return (
      <span className="text-xs text-muted-foreground">
        {JSON.stringify(value)}
      </span>
    )
  }
  return String(value)
}

const SectionTable = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) => (
  <section className="rounded-md border p-3 space-y-2">
    <div className="font-medium">{title}</div>
    <div className="overflow-x-auto">{children}</div>
  </section>
)

export const MotorQuoteFetchDetailDialog = ({ componentProps }: Props) => {
  const detail = componentProps?.data
  if (!detail) {
    return <div className="text-sm text-muted-foreground">No quote details loaded.</div>
  }

  const customer = detail.customer
  const vehicle = detail.vehicle as Record<string, unknown> | null | undefined
  const cover = detail.cover as Record<string, unknown> | undefined

  const kycEntries = detail.kyc
    ? Object.entries(detail.kyc).filter(
        ([, value]) => value !== null && value !== undefined && value !== ''
      )
    : []

  const invoices = (detail.invoices ?? []) as InvoiceRow[]

  // Flatten nested receipts so we can show a Receipts table like member account
  const receipts = invoices.flatMap((invoice) =>
    (invoice.receipts ?? []).map((receipt) => ({
      ...receipt,
      invoice_number: invoice.invoice_number,
      invoice_id: invoice.id,
    }))
  )

  const certificates = (detail.certificates ?? []) as CertificateRow[]

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

      {/* KYC — view-only field/value table */}
      {kycEntries.length > 0 && (
        <SectionTable title="KYC">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kycEntries.map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {humanizeKey(key)}
                  </TableCell>
                  <TableCell className="wrap-break-word">
                    {formatKycValue(value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionTable>
      )}

      {/* Invoices — same columns as member cover, no actions */}
      {invoices.length > 0 && (
        <SectionTable title="Invoices">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Installment</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Plan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id ?? invoice.invoice_number}>
                  <TableCell className="font-medium">
                    {invoice.invoice_number ?? '—'}
                  </TableCell>
                  <TableCell>
                    {invoice.installment_number != null &&
                    invoice.total_installments != null
                      ? `${invoice.installment_number} of ${invoice.total_installments}`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {invoice.installment_amount != null
                      ? formatCurrency(invoice.installment_amount)
                      : invoice.gross_premium != null
                        ? formatCurrency(invoice.gross_premium)
                        : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full">
                      {invoice.status ?? '—'}
                    </Badge>
                  </TableCell>
                  <TableCell>{invoice.due_date ?? '—'}</TableCell>
                  <TableCell>{invoice.plan_type ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionTable>
      )}

      {/* Receipts — flattened from invoices, view-only */}
      {receipts.length > 0 && (
        <SectionTable title="Receipts">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt #</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Via</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment for</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow key={receipt.id ?? receipt.receipt_number}>
                  <TableCell className="font-medium">
                    {receipt.receipt_number ?? '—'}
                  </TableCell>
                  <TableCell>{receipt.invoice_number ?? '—'}</TableCell>
                  <TableCell>{receipt.via ?? '—'}</TableCell>
                  <TableCell>
                    {receipt.amount != null
                      ? formatCurrency(receipt.amount)
                      : '—'}
                  </TableCell>
                  <TableCell>{receipt.payment_for ?? '—'}</TableCell>
                  <TableCell className="max-w-[12rem] truncate">
                    {receipt.payment_note || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionTable>
      )}

      {/* Certificates — view-only */}
      {certificates.length > 0 && (
        <SectionTable title="Certificates">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate #</TableHead>
                <TableHead>Policy #</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.map((cert) => (
                <TableRow key={cert.id ?? `${cert.invoice_id}-${cert.certificate_number}`}>
                  <TableCell className="font-medium">
                    {cert.certificate_number ?? '—'}
                  </TableCell>
                  <TableCell>{cert.policy_number ?? '—'}</TableCell>
                  <TableCell>{cert.registration_number ?? '—'}</TableCell>
                  <TableCell>{cert.issued_date ?? '—'}</TableCell>
                  <TableCell>{cert.expiry_date ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full">
                      {cert.policy_allocation_status ?? '—'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionTable>
      )}
    </div>
  )
}

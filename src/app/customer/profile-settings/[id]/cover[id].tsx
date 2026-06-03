/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/dev/core'
import { COVER_STATUS_DISPLAY } from '@/dev/columns/customer/motor/my-covers'
import { UseApiQuery } from '@/hooks/hooks'
import type { MotorUserCoverDetail, MotorUserCoverInvoice, SubmitResponse } from '@/types/types'
import { EPREFIX, EROUTES } from '@/utils/enums'
import { formatCurrency, formatDate } from '@/utils/helpers'
import {
    useMotorDocumentDownload,
} from '@/utils/motor-document-download'
import { ShowToast } from '@/utils/utils'
import { ArrowLeft, FileText, ReceiptText, Shield } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { cn } from '@/lib/utils'

const coversListPath = `/${EPREFIX.CUSTOMER}${EROUTES.COVERS}`

type InfoField = { label: string; value?: ReactNode }

/** Compact grid: "Label : value" with 3–5 items per row on larger screens. */
const CompactInfoGrid = ({
    items,
    className,
}: {
    items: InfoField[]
    className?: string
}) => (
    <ul
        className={cn(
            'grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
            className
        )}
    >
        {items.map(({ label, value }, index) => (
            <li
                key={`${label}-${index}`}
                className="min-w-0 text-sm text-[#111111]"
            >
                <span className="text-[#71717A]">{label}:</span>{' '}
                <span className="font-medium break-words">
                    {value !== undefined && value !== null && value !== ''
                        ? value
                        : '-'}
                </span>
            </li>
        ))}
    </ul>
)

const money = (amount?: number | null, currency = 'Ksh') =>
    amount != null ? `${currency} ${formatCurrency(amount)}` : '-'

const installmentText = (invoice: MotorUserCoverInvoice) =>
    `Installment ${invoice.installment_number} of ${invoice.total_installments}`

const CoverStatusBadge = ({ status }: { status: string }) => {
    const display =
        COVER_STATUS_DISPLAY[status] ?? COVER_STATUS_DISPLAY.failed
    return (
        <Badge className={`rounded-lg font-semibold ${display.className}`}>
            {display.label}
        </Badge>
    )
}

type InvoiceDownloadActionsProps = {
    invoice: MotorUserCoverInvoice
}

/** Per-invoice download buttons (invoice, receipt, certificate when issued). */
const InvoiceDownloadActions = ({ invoice }: InvoiceDownloadActionsProps) => {
    const invoiceId = invoice?.id ? String(invoice.id) : ''

    const invoiceMutation = useMotorDocumentDownload(
        (id) => `document/motor/invoice/${id}`,
        'Invoice'
    )
    const receiptMutation = useMotorDocumentDownload(
        (id) => `document/motor/receipt/${id}`,
        'Receipt'
    )
    const certificateMutation = useMotorDocumentDownload(
        (id) => `dmvic/motor/certificates/${id}`,
        'Certificate'
    )

    const download = (
        mutation: ReturnType<typeof useMotorDocumentDownload>,
        label: string
    ) => {
        if (!invoiceId) {
            ShowToast.error(`No invoice found for ${label}.`)
            return
        }
        mutation.mutate(invoiceId)
    }

    const showCertificate = invoice.cover_status === 'issued'

    return (
        <div className="flex flex-wrap gap-2">
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full text-xs"
                leftIcon={<FileText className="h-3.5 w-3.5" />}
                loading={invoiceMutation.isPending}
                disabled={!invoiceId}
                onClick={() => download(invoiceMutation, 'Invoice')}
            >
                Invoice
            </Button>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full text-xs"
                leftIcon={<ReceiptText className="h-3.5 w-3.5" />}
                loading={receiptMutation.isPending}
                disabled={!invoiceId}
                onClick={() => download(receiptMutation, 'Receipt')}
            >
                Receipt
            </Button>
            {showCertificate ? (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs"
                    leftIcon={<Shield className="h-3.5 w-3.5" />}
                    loading={certificateMutation.isPending}
                    disabled={!invoiceId}
                    onClick={() => download(certificateMutation, 'Certificate')}
                >
                    Certificate
                </Button>
            ) : null}
        </div>
    )
}

const SectionCard = ({
    title,
    children,
}: {
    title: string
    children: ReactNode
}) => (
    <Card className="gap-0 border-[#EAEAEA] py-0 shadow-none">
        <CardHeader className="border-b border-[#EAEAEA] px-5 py-4">
            <CardTitle className="text-base font-semibold text-[#111111]">
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent className="px-5 py-4">{children}</CardContent>
    </Card>
)

export const SingleCoverPage = () => {
    const { id } = useParams<{ id: string }>()

    const { data, isLoading, isError } = UseApiQuery<SubmitResponse>({
        url: `reports/motor/user/covers/${id}`,
        queryOptions: {
            enabled: Boolean(id),
            retry: 1,
        },
    })

    const cover = data?.data as MotorUserCoverDetail | undefined
    const vehicle = cover?.vehicle
    const coverDates = cover?.cover_dates
    const benefits = cover?.benefits ?? []
    const invoices = cover?.invoices ?? []

    if (!id) {
        return (
            <section className="rounded-xl border border-[#EAEAEA] bg-white p-5 sm:p-8">
                <p className="text-sm text-destructive">Missing cover id.</p>
                <Link
                    to={coversListPath}
                    className="mt-4 inline-flex items-center text-sm font-medium text-[#BF162E] hover:underline"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to My Covers
                </Link>
            </section>
        )
    }

    return (
        <section>
            <div className="rounded-xl border border-[#EAEAEA] bg-white p-5 sm:p-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <Link
                            to={coversListPath}
                            className="mb-3 inline-flex items-center text-sm font-medium text-[#71717A] hover:text-[#BF162E]"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to My Covers
                        </Link>
                        <h2 className="text-lg font-bold text-[#111111] sm:text-xl">
                            Cover Details
                        </h2>
                        {cover?.quote_code ? (
                            <p className="mt-1 text-sm text-[#71717A]">
                                {cover.quote_code}
                            </p>
                        ) : null}
                    </div>
                </div>

                {isLoading ? (
                    <p className="text-sm text-[#71717A]">Loading cover details...</p>
                ) : isError || !cover ? (
                    <p className="text-sm text-destructive">
                        Unable to load cover details. Please try again later.
                    </p>
                ) : (
                    <div className="space-y-5">
                        <SectionCard title="Policy & Parties">
                            <CompactInfoGrid
                                items={[
                                    { label: 'Purchase ID', value: cover.purchase_id },
                                    { label: 'Quote Code', value: cover.quote_code },
                                    { label: 'Product', value: cover.product },
                                    { label: 'Cover Type', value: cover.cover_type },
                                    { label: 'Covering', value: cover.covering },
                                    { label: 'Vehicle Use', value: cover.vehicle_use },
                                    { label: 'Insurer', value: cover.provider?.name },
                                    { label: 'Broker', value: cover.agency?.name },
                                ]}
                            />
                        </SectionCard>

                        <SectionCard title="Vehicle">
                            <CompactInfoGrid
                                items={[
                                    {
                                        label: 'Registration',
                                        value: vehicle?.registration_number,
                                    },
                                    {
                                        label: 'Chassis',
                                        value: vehicle?.chassis_number,
                                    },
                                    {
                                        label: 'Engine',
                                        value: vehicle?.engine_number,
                                    },
                                    { label: 'Make', value: vehicle?.make },
                                    { label: 'Model', value: vehicle?.model },
                                    { label: 'Body Type', value: vehicle?.body_type },
                                    { label: 'Color', value: vehicle?.color },
                                    { label: 'Year', value: vehicle?.year },
                                    {
                                        label: 'Seats',
                                        value:
                                            vehicle?.seats ??
                                            vehicle?.number_of_passengers,
                                    },
                                    {
                                        label: 'Cubic Capacity',
                                        value: vehicle?.cubic_capacity,
                                    },
                                    { label: 'Tonnage', value: vehicle?.tonnage },
                                    {
                                        label: 'Valuated Value',
                                        value: money(
                                            cover.vehicle_valuated_value,
                                            cover.currency
                                        ),
                                    },
                                ]}
                            />
                        </SectionCard>

                        <SectionCard title="Premium & Dates">
                            <CompactInfoGrid
                                items={[
                                    {
                                        label: 'Total Premium',
                                        value: money(
                                            cover.total_premium,
                                            cover.currency
                                        ),
                                    },
                                    {
                                        label: 'Start Date',
                                        value: formatDate(coverDates?.start_date),
                                    },
                                    {
                                        label: 'Issued Date',
                                        value: formatDate(coverDates?.issued_date),
                                    },
                                    {
                                        label: 'Expiry Date',
                                        value: formatDate(coverDates?.expiry_date),
                                    },
                                    {
                                        label: 'End Date',
                                        value: formatDate(coverDates?.end_date),
                                    },
                                ]}
                            />
                            {benefits.length > 0 ? (
                                <div className="mt-4 border-t border-[#EAEAEA] pt-4">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#71717A]">
                                        Benefits
                                    </p>
                                    <CompactInfoGrid
                                        items={benefits.map((benefit) => ({
                                            label: benefit.name,
                                            value: formatCurrency(benefit.premium),
                                        }))}
                                    />
                                </div>
                            ) : null}
                        </SectionCard>

                        <SectionCard title="Invoices">
                            {invoices.length === 0 ? (
                                <p className="text-sm text-[#71717A]">
                                    No invoices for this cover.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Invoice #</TableHead>
                                                <TableHead>Installment</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Payment</TableHead>
                                                <TableHead>Overdue</TableHead>
                                                <TableHead>Cover Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {invoices.map((invoice) => (
                                                <TableRow key={invoice.id}>
                                                    <TableCell className="font-medium">
                                                        {invoice.invoice_number}
                                                    </TableCell>
                                                    <TableCell>
                                                        {installmentText(invoice)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatCurrency(
                                                            invoice.installment_amount
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {invoice.payment_status}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                invoice.is_overdue
                                                                    ? 'border-red-200 bg-red-50 text-red-800'
                                                                    : 'border-green-200 bg-green-50 text-green-800'
                                                            }
                                                        >
                                                            {invoice.is_overdue
                                                                ? 'Yes'
                                                                : 'No'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <CoverStatusBadge
                                                            status={
                                                                invoice.cover_status
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <InvoiceDownloadActions
                                                            invoice={invoice}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </SectionCard>
                    </div>
                )}
            </div>
        </section>
    )
}

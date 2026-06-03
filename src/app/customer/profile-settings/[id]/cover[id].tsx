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

/** Compact grid: "Label : value" — max 4 items per row. */
const CompactInfoGrid = ({
    items,
    className,
}: {
    items: InfoField[]
    className?: string
}) => (
    <ul
        className={cn(
            'grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-4',
            className
        )}
    >
        {items.map(({ label, value }, index) => (
            <li
                key={`${label}-${index}`}
                className="min-w-0 text-sm text-[#111111]"
            >
                <span className="font-medium text-[#C20C0C]">{label}:</span>{' '}
                <span className="break-words text-foreground">
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

const blackDocButtonClass =
    'rounded-full bg-neutral-900 text-white text-xs hover:bg-black border-0'

const redDocButtonClass =
    'rounded-full bg-[#C20C0C]/90 text-white text-xs hover:bg-[#C20C0C] border-0'

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
                size="sm"
                className={blackDocButtonClass}
                leftIcon={<FileText className="h-3.5 w-3.5" />}
                loading={invoiceMutation.isPending}
                disabled={!invoiceId}
                onClick={() => download(invoiceMutation, 'Invoice')}
            >
                View Invoice
            </Button>
            <Button
                type="button"
                size="sm"
                className={blackDocButtonClass}
                leftIcon={<ReceiptText className="h-3.5 w-3.5" />}
                loading={receiptMutation.isPending}
                disabled={!invoiceId}
                onClick={() => download(receiptMutation, 'Receipt')}
            >
                View Receipt
            </Button>
            {showCertificate ? (
                <Button
                    type="button"
                    size="sm"
                    className={redDocButtonClass}
                    leftIcon={<Shield className="h-3.5 w-3.5" />}
                    loading={certificateMutation.isPending}
                    disabled={!invoiceId}
                    onClick={() => download(certificateMutation, 'Certificate')}
                >
                    View Certificate
                </Button>
            ) : null}
        </div>
    )
}

const SectionCard = ({
    title,
    titleAccent,
    children,
}: {
    title: string
    /** Word highlighted in brand red (like KYC "Info") */
    titleAccent?: string
    children: ReactNode
}) => (
    <div className="rounded-2xl border border-[#ADABAB]/35 bg-white/95 p-3 shadow-sm sm:p-5">
        <div className="flex flex-col gap-0.5 pb-3">
            <h3 className="text-base font-semibold sm:text-lg text-[#111111]">
                {titleAccent ? (
                    <>
                        {title}{' '}
                        <span className="text-[#C20C0C]">{titleAccent}</span>
                    </>
                ) : (
                    <span>{title}</span>
                )}
            </h3>
        </div>
        {children}
    </div>
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
        <section className="w-full mx-auto bg-transparent">
            <div className="rounded-2xl border border-[#ADABAB]/50 bg-linear-to-b from-white to-neutral-50/90 p-4 shadow-sm sm:p-6">
                <div className="mb-5 w-full pb-2">
                    <Link
                        to={coversListPath}
                        className="mb-3 inline-flex items-center text-sm font-medium text-[#71717A] hover:text-[#C20C0C]"
                    >
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to My Covers
                    </Link>
                    <h1 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">
                        Cover <span className="text-[#C20C0C]">Details</span>
                    </h1>
                    {cover?.quote_code ? (
                        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                            {cover.quote_code}
                        </p>
                    ) : null}
                </div>

                {isLoading ? (
                    <p className="text-sm text-[#71717A]">Loading cover details...</p>
                ) : isError || !cover ? (
                    <p className="text-sm text-destructive">
                        Unable to load cover details. Please try again later.
                    </p>
                ) : (
                    <div className="mt-5 space-y-5">
                        <SectionCard title="Policy &" titleAccent="Parties">
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

                        <SectionCard title="Premium &" titleAccent="Dates">
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
                                        label: 'Issued Date',
                                        value: formatDate(coverDates?.issued_date),
                                    },
                                    {
                                        label: 'Expiry Date',
                                        value: formatDate(coverDates?.expiry_date),
                                    },
                                ]}
                            />
                            {benefits.length > 0 ? (
                                <div className="mt-4 border-t border-[#ADABAB]/35 pt-4">
                                    <p className="mb-2 text-sm font-semibold text-[#111111]">
                                        <span className="text-[#C20C0C]">Benefits</span>
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

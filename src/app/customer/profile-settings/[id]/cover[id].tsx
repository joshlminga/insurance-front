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
import { UseApiQuery } from '@/hooks/hooks'
import type {
    MotorUserCoverDetail,
    MotorUserCoverInvoice,
    SubmitResponse,
    TravelUserCoverDetail,
    TravelUserCoverInvoice,
    TFilterOptions,
    TPaginationFilters
} from '@/types/types'
import { EPREFIX, EROUTES } from '@/utils/enums'
import { formatCurrency, formatDate, installmentText } from '@/utils/helpers'
import {
    useDocumentDownload,
    useMotorDocumentDownload,
} from '@/utils/motor-document-download'
import { ShowToast } from '@/utils/utils'
import { ArrowLeft, FileText, ReceiptText, ScrollText, Shield } from 'lucide-react'
import { useReducer, type ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { COVER_STATUS_DISPLAY, EMETHODS, FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import {
    COVER_PRODUCT_PARAM,
    COVER_PRODUCTS,
    resolveCoverProduct,
} from '@/utils/customer-covers'

const coversListPath = `/${EPREFIX.CUSTOMER}${EROUTES.COVERS}`

type InfoField = { label: string; value?: ReactNode }

/** Compact grid: "Label : value" - max 4 items per row. */
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
                <span className="wrap-break-word text-foreground">
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


/** Receipt exists only after payment is completed. */
const isInvoicePaid = (invoice: MotorUserCoverInvoice) => {
    const paymentStatus = invoice.payment_status?.toLowerCase()
    const status = invoice.status?.toLowerCase()
    return paymentStatus === 'paid' || status === 'paid'
}

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

/** Per-invoice download buttons (invoice always; receipt when paid; certificate when issued). */
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

    const showReceipt = isInvoicePaid(invoice)
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
            {showReceipt ? (
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
            ) : null}
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

const SectionCard = ({ title, titleAccent, children, }: {
    title: string
    titleAccent?: string
    children: ReactNode
}) => (
    <div className="rounded-2xl border border-[#ADABAB]/35 bg-white/95 p-3 shadow-none sm:p-5">
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

/** Travel invoice row actions: invoice always; receipt / policy / embassy when paid. */
const TravelInvoiceDownloadActions = ({
    invoice,
    purchaseId,
}: {
    invoice: TravelUserCoverInvoice
    purchaseId: number
}) => {
    const invoiceId = invoice?.id ? String(invoice.id) : ''
    const invoiceMutation = useMotorDocumentDownload(
        (id) => `document/travel/invoice/${id}`,
        'Invoice'
    )
    const receiptMutation = useDocumentDownload({
        url: () => `document/travel/receipt/${purchaseId}`,
        label: 'Receipt',
        method: EMETHODS.POST,
    })
    const embassyMutation = useDocumentDownload({
        url: () => `document/travel/embassy-letter/${purchaseId}`,
        label: 'Embassy Letter',
        method: EMETHODS.POST,
    })
    const scheduleMutation = useDocumentDownload({
        url: () => `document/travel/policy-schedule/${purchaseId}`,
        label: 'Policy Schedule',
        method: EMETHODS.POST,
    })

    const paid =
        invoice.payment_status?.toLowerCase() === 'paid' ||
        invoice.status?.toLowerCase() === 'paid'

    return (
        <div className="flex flex-wrap gap-2">
            <Button
                type="button"
                size="sm"
                className={blackDocButtonClass}
                leftIcon={<FileText className="h-3.5 w-3.5" />}
                loading={invoiceMutation.isPending}
                disabled={!invoiceId}
                onClick={() => {
                    if (!invoiceId) {
                        ShowToast.error('No invoice found for Invoice.')
                        return
                    }
                    invoiceMutation.mutate(invoiceId)
                }}
            >
                View Invoice
            </Button>
            {paid ? (
                <>
                    <Button
                        type="button"
                        size="sm"
                        className={blackDocButtonClass}
                        leftIcon={<ReceiptText className="h-3.5 w-3.5" />}
                        loading={receiptMutation.isPending}
                        onClick={() =>
                            receiptMutation.mutate({ target_invoice_id: Number(invoiceId) })
                        }
                    >
                        View Receipt
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        className={redDocButtonClass}
                        leftIcon={<Shield className="h-3.5 w-3.5" />}
                        loading={embassyMutation.isPending}
                        onClick={() => embassyMutation.mutate()}
                    >
                        Embassy Letter
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        className={redDocButtonClass}
                        leftIcon={<ScrollText className="h-3.5 w-3.5" />}
                        loading={scheduleMutation.isPending}
                        onClick={() => scheduleMutation.mutate()}
                    >
                        Policy Schedule
                    </Button>
                </>
            ) : null}
        </div>
    )
}

/** Detail sections for a Travel cover (trip, travellers, invoices + downloads). */
const TravelCoverSections = ({ cover }: { cover: TravelUserCoverDetail }) => {
    const trip = cover.trip
    const invoices = cover.invoices ?? []
    const travelers = cover.travelers ?? []
    const purchaseId = cover.purchase_id

    return (
        <div className="mt-5 space-y-5">
            <SectionCard title="Policy &" titleAccent="Parties">
                <CompactInfoGrid
                    items={[
                        { label: 'Product', value: cover.product },
                        { label: 'Plan', value: cover.plan },
                        { label: 'Insurer', value: cover.provider?.name },
                        { label: 'Plan Name', value: cover.provider?.product_name },
                    ]}
                />
            </SectionCard>

            <SectionCard title="Trip">
                <CompactInfoGrid
                    items={[
                        { label: 'From', value: trip?.departure_country?.name },
                        { label: 'Destination', value: trip?.destination?.name },
                        { label: 'Departure', value: formatDate(trip?.departure_date ?? '') },
                        { label: 'Return', value: formatDate(trip?.return_date ?? '') },
                        { label: 'Trip Days', value: trip?.total_trip_days },
                        { label: 'Trip Type', value: trip?.type_of_trip },
                        { label: 'Travel As', value: trip?.travel_as },
                        { label: 'Travellers', value: trip?.travelers_count },
                    ]}
                />
                {travelers.length > 0 ? (
                    <div className="mt-4 border-t border-[#ADABAB]/35 pt-4">
                        <p className="mb-2 text-sm font-semibold text-[#C20C0C]">Travellers</p>
                        <CompactInfoGrid
                            items={travelers.map((traveler, index) => ({
                                label: `Traveller ${index + 1}`,
                                value: [traveler.first_name, traveler.middle_name, traveler.surname]
                                    .filter(Boolean)
                                    .join(' '),
                            }))}
                        />
                    </div>
                ) : null}
            </SectionCard>

            <SectionCard title="Premium &" titleAccent="Dates">
                <CompactInfoGrid
                    items={[
                        { label: 'Total Premium', value: money(cover.total_premium, cover.currency) },
                        { label: 'Cover Start', value: formatDate(cover.cover_dates?.start_date ?? '') },
                        { label: 'Cover End', value: formatDate(cover.cover_dates?.end_date ?? '') },
                    ]}
                />
            </SectionCard>

            <SectionCard title="Invoices">
                {invoices.length === 0 ? (
                    <p className="text-sm text-[#71717A]">No invoices for this cover.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Cover Status</TableHead>
                                    <TableHead>Documents</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                                        <TableCell>{formatCurrency(invoice.installment_amount)}</TableCell>
                                        <TableCell>{invoice.payment_status}</TableCell>
                                        <TableCell>{formatDate(invoice.due_date)}</TableCell>
                                        <TableCell>
                                            <CoverStatusBadge status={invoice.cover_status} />
                                        </TableCell>
                                        <TableCell>
                                            <TravelInvoiceDownloadActions
                                                invoice={invoice}
                                                purchaseId={purchaseId}
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
    )
}

export const SingleCoverPage = () => {
    const { id } = useParams<{ id: string }>()
    // ?product=travel (set by the My Covers list) chooses which report API to call.
    const [searchParams] = useSearchParams()
    const product = resolveCoverProduct(searchParams.get(COVER_PRODUCT_PARAM))
    const listPath = `${coversListPath}?${COVER_PRODUCT_PARAM}=${product}`
    const [filter] = useReducer(
        ReusableReducer<TPaginationFilters & TFilterOptions>,
        { ...FILTEROPTIONS, page: 1, pageSize: 15 }
    );
    // const optionsDispatcherDebounce = useDebounce({
    //     debounceCallback: optionsDispatcher,
    // });
    const { data, isLoading, isError } = UseApiQuery<SubmitResponse>({
        url: COVER_PRODUCTS[product].detailUrl(id ?? ''),
        params: {
            page: filter?.page,
            pageSize: filter.pageSize,
            term: filter.term,
        },
        queryOptions: {
            enabled: !!id,
            retry: 3,
        },
    })
    const cover = data?.data as (MotorUserCoverDetail & TravelUserCoverDetail) | undefined
    const vehicle = cover?.vehicle
    const coverDates = cover?.cover_dates
    const benefits = cover?.benefits ?? []
    const invoices = cover?.invoices ?? []

    //  const invoiceId = invoice?.id ? String(invoice.id) : ''
    // const invoiceMutation = useMotorDocumentDownload(
    //     (id) => `document/motor/invoice/${id}`,
    //     'Invoice'
    // )
    // const receiptMutation = useMotorDocumentDownload(
    //     (id) => `document/motor/receipt/${id}`,
    //     'Receipt'
    // )
    // const certificateMutation = useMotorDocumentDownload(
    //     (id) => `dmvic/motor/certificates/${id}`,
    //     'Certificate'
    // )

    // const download = (
    //     mutation: ReturnType<typeof useMotorDocumentDownload>,
    //     label: string
    // ) => {
    //     if (!invoiceId) {
    //         ShowToast.error(`No invoice found for ${label}.`)
    //         return
    //     }
    //     mutation.mutate(invoiceId)
    // }

    // const ActionsHandlerMapping: SingleActionsHandler<any>[] = [
    //     {
    //         label: "View Invoice",
    //         onSelect: (data) => {
    //             invoiceMutation(data)
    //         },
    //     },
    //     {
    //         label: "View Receipt",
    //         onSelect: (data) => {
    //             // handleDialogContextSwitch({
    //             //   componentProps: { data: rowData, refetch },
    //             //   Component: ViewOrganizationLocationModal,
    //             // })
    //         },
    //     },
    //     {
    //         label: "View Certificate",
    //         onSelect: (data) => {
    //             // handleDialogContextSwitch({
    //             //   componentProps: { data: rowData, refetch },
    //             //   Component: ViewOrganizationLocationModal,
    //             // })
    //         },
    //     },
    // ];

    if (!id) {
        return (
            <section className="rounded-xl border border-[#EAEAEA] bg-white p-5 sm:p-8">
                <p className="text-sm text-destructive">Missing cover id.</p>
                <Link
                    to={listPath}
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
            <div className="rounded-xl border border-[#EAEAEA] bg-white p-5 sm:p-8">
                <div className="mb-5 w-full pb-2">
                    <Link
                        to={listPath}
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
                ) : product === 'travel' ? (
                    <TravelCoverSections cover={cover as TravelUserCoverDetail} />
                ) : (
                    <div className="mt-5 space-y-5">
                        <SectionCard title="Policy &" titleAccent="Parties">
                            <CompactInfoGrid
                                items={[
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
                                            cover?.total_premium,
                                            cover.currency
                                        ),
                                    },
                                    {
                                        label: 'Issued Date',
                                        value: formatDate(coverDates?.issued_date ?? ''),
                                    },
                                    {
                                        label: 'Expiry Date',
                                        value: formatDate(coverDates?.expiry_date ?? ''),
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
                                            label: benefit?.name,
                                            value: formatCurrency(benefit?.premium ?? ''),
                                        }))}
                                    />
                                </div>
                            ) : null}
                        </SectionCard>

                        <SectionCard title="Invoices">
                            {/* <CustomBaseTable
                                {...{
                                    onPageChange: (page) =>
                                        optionsDispatcher({
                                            payload: { page },
                                            type: 'page',
                                        }),
                                    OtherToolsProps: {
                                        onChange: (data: any) =>
                                            optionsDispatcherDebounce({
                                                payload: { term: data },
                                                type: 'term',
                                            }),
                                        placeholder: 'Search',
                                        includeFilter: true,
                                    },
                                    columns: MyInvoiceColumns,
                                    // columns: [
                                    //     ...MyInvoiceColumns,
                                    //     ActionColumn({
                                    //         ActionsHandlerMapping,
                                    //         layout: 'horizontal'
                                    //     }),
                                    // ],
                                    data: invoices ?? [],
                                    pageCount: 1,
                                    title: '',
                                    showPagination: false,
                                    setPageSize: (pageSize) =>
                                        optionsDispatcher({
                                            payload: { pageSize },
                                            type: 'pageSize',
                                        }),
                                    pageSize: data?.pagination?.per_page ?? 10,
                                    page: data?.pagination?.current_page ?? 1,
                                    isLoading: isLoading,
                                }}
                            /> */}
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
                                                            }>
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

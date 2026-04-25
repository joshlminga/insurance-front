/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import {
    Button,
    CustomDialogComponent,
    EmptyState,
    ReusableCard,
    ReusablePagination,
    ReusableSelect,
    SkeletonCard
} from '@/dev/core'
import { useCustomDialogContextFactory } from '@/hooks'
import type {
    BenefitGroup,
    CustomerVerificationDetailsProps,
    MotorBenefitOption,
    SubmitResponse,
    TFilterOptions,
    TPaginationFilters
} from '@/types/types'
import { EPREFIX, EROUTES } from '@/utils/enums'
import { ArrowLeftCircle, ArrowRightCircle, Plus } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import type { FieldValues, Path } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { Link, useLocation } from 'react-router-dom'
import { QuotePreviewPage } from './qoute-preview/page'
import { UseAuth } from '@/stores/auth-store'
import { usePurchaseStepper } from '@/hooks/use-purchase-stepper'
import {
    EMETHODS,
    FILTEROPTIONS,
    MOTOR_QUOTE_SESSION_STORAGE_KEY,
    PURCHASE_SESSION_STORAGE_KEY,
    ReusableReducer
} from '@/utils/constatnts'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { formatCurrency } from '@/lib/format'
import { serializeMotorPremiumParams } from '@/lib/motor-premium-params'
import { ShowToast } from '@/utils/utils'
import { extractErrorMessage } from '@/utils/helpers'
import { PostComparisonPage } from './comparisons/[id]/page'

const BENEFIT_SELECT_NONE = '__none__'

function benefitGroupFormKey(groupLabel: string): string {
    const slug =
        groupLabel
            .trim()
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '') || 'Other'
    return `benefit_${slug}`
}

function benefitOptionLabel(item: MotorBenefitOption): string {
    const base =
        item.name ??
        item.label ??
        (item.reference ? `Ref ${item.reference}` : null) ??
        `Benefit ${item.id}`
    return String(base)
}


export const QuotationsPage: React.FC<CustomerVerificationDetailsProps> = ({
    goToNextStep,
    goToPrevStep,
}) => {
    const MAX_COMPARISONS = 3
    const [quoteSessionId, setQuoteSessionId] = useState<number | null>(null)
    const [selectedQuotes, setSelectedQuotes] = useState<{ product_id: string | number; rate_id: string | number }[]>([])
    const [purchasingRateId, setPurchasingRateId] = useState<string | number | null>(null)
    const [appliedBenefitIds, setAppliedBenefitIds] = useState<number[]>([])

    const benefitForm = useForm<FieldValues>({ defaultValues: {} })
    const { isAuthenticated } = UseAuth()
    const location = useLocation()
    const { currentStep } = usePurchaseStepper('motor')

    const [filter, optionsDispatcher] = useReducer(
        ReusableReducer<TPaginationFilters & TFilterOptions>,
        { ...FILTEROPTIONS, page: 1, pageSize: 8 }
    )

    const { handleDialogContextSwitch, dialogContent, dialogOpen } =
        useCustomDialogContextFactory<{
            refetch?: () => Promise<any>
            data?: any
            goToNextStep?: CustomerVerificationDetailsProps['goToNextStep']
            onDownload?: () => void
        }>()

    useEffect(() => {
        const storedSessionId = Number(sessionStorage.getItem(MOTOR_QUOTE_SESSION_STORAGE_KEY))
        if (Number.isFinite(storedSessionId) && storedSessionId > 0) {
            setQuoteSessionId(storedSessionId)
        } else {
            setQuoteSessionId(null)
        }
    }, [])

    useEffect(() => {
        setAppliedBenefitIds([])
    }, [quoteSessionId])

    const premiumUrl = useMemo(
        () => (quoteSessionId ? `quotation/motor/${quoteSessionId}/premium` : ''),
        [quoteSessionId]
    )

    const premiumQueryParams = useMemo(
        () => ({
            page: filter.page,
            per_page: filter.pageSize,
            sort_by: 'created_at',
            direction: 'asc' as const,
            ...(appliedBenefitIds.length > 0 ? { benefit_ids: appliedBenefitIds } : {}),
        }),
        [filter.page, filter.pageSize, appliedBenefitIds]
    )

    const { data, isPending, isFetching } = UseApiQuery<SubmitResponse>({
        url: premiumUrl,
        params: premiumQueryParams as Record<string, unknown>,
        config: {
            paramsSerializer: serializeMotorPremiumParams,
        },
        queryOptions: {
            enabled: !!quoteSessionId && !!premiumUrl,
        },
    })

    const quotationItems = data?.data?.results ?? []
    const benefitsAvailable = (data?.data?.benefits?.available ?? []) as MotorBenefitOption[]
    const benefitsSelected = (data?.data?.benefits?.selected ?? []) as MotorBenefitOption[]
    const benefitsListed = (data?.data?.benefits?.listed ?? []) as MotorBenefitOption[]

    const benefitGroups = useMemo<BenefitGroup[]>(() => {
        const map = new Map<string, MotorBenefitOption[]>()
        for (const item of benefitsAvailable) {
            const g = String(item.group ?? 'Other').trim() || 'Other'
            if (!map.has(g)) map.set(g, [])
            map.get(g)!.push(item)
        }
        return Array.from(map.entries())
            .map(([group, items]) => ({
                group,
                items: [...items].sort((a, b) => a.id - b.id),
            }))
            .sort((a, b) => a.group.localeCompare(b.group))
    }, [benefitsAvailable])

    const benefitGroupsResetKey = useMemo(
        () =>
            benefitGroups
                .map(
                    ({ group, items }) =>
                        `${group}:${[...items.map((i) => i.id)].sort((a, b) => a - b).join(',')}`
                )
                .join('|'),
        [benefitGroups]
    )

    useEffect(() => {
        if (benefitGroups.length === 0) return
        const next: FieldValues = {}
        for (const { group } of benefitGroups) {
            next[benefitGroupFormKey(group)] = BENEFIT_SELECT_NONE
        }
        benefitForm.reset(next)
    }, [benefitGroupsResetKey])

    const currentPage = data?.pagination?.current_page ?? filter.page
    const lastPage = data?.pagination?.last_page ?? 1

    const applyBenefitSelections = useCallback(() => {
        const values = benefitForm.getValues()
        const ids: number[] = []
        for (const { group } of benefitGroups) {
            const key = benefitGroupFormKey(group)
            const raw = values[key]
            if (raw == null || raw === '' || raw === BENEFIT_SELECT_NONE) continue
            const n = Number(raw)
            if (Number.isFinite(n)) ids.push(n)
        }
        if (ids.length === 0) {
            ShowToast.error('Choose at least one add-on from the dropdowns, then tap Add benefit.')
            return
        }
        setAppliedBenefitIds(ids)
        ShowToast.success('Recalculating premiums with your add-ons…')
    }, [benefitForm, benefitGroups])

    const isQuoteSelected = useCallback(
        (rateId: string | number) => selectedQuotes.some((q) => q.rate_id === rateId),
        [selectedQuotes]
    )

    const toggleQuoteSelection = useCallback(
        (productId: string | number, rateId: string | number) => {
            setSelectedQuotes((prev) => {
                const exists = prev.some((q) => q.rate_id === rateId)
                if (exists) return prev.filter((q) => q.rate_id !== rateId)
                if (prev.length >= MAX_COMPARISONS) {
                    ShowToast.error(`You can select a maximum of ${MAX_COMPARISONS} quotations to compare.`)
                    return prev
                }
                return [...prev, { product_id: productId, rate_id: rateId }]
            })
        },
        []
    )

    const submitPurchaseMutation = UseApiMutation<SubmitResponse, any>({
        url: `purchase/motor/${quoteSessionId}`,
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (data) => {
                setPurchasingRateId(null)
                const purchaseId = data?.data?.purchase_id
                if (purchaseId === undefined) {
                    ShowToast.error("Purchase session could not be initialized. Please try again.")
                    return
                }
                sessionStorage.setItem(PURCHASE_SESSION_STORAGE_KEY, String(purchaseId))
                goToNextStep?.();
                ShowToast.success(data?.message ?? "Purchase started");
            },
            onError: (error: unknown) => {
                setPurchasingRateId(null)
                const message = extractErrorMessage(error);
                ShowToast.error(message || "Purchase failed!");
            },
        },
    });

    const onPurchase = (productId: number | string, rateId: number | string) => {
        if (!quoteSessionId) {
            ShowToast.error("No active quote session found.")
            return
        }
        setPurchasingRateId(rateId)
        submitPurchaseMutation.mutate({
            'product_id': productId,
            'rate_id': rateId,
        })
    }

    const submitComparisonMutation = UseApiMutation<SubmitResponse, any>({
        url: `document/motor/comparison/${quoteSessionId}`,
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (data) => {
                handleDialogContextSwitch({
                    componentProps: {
                        data,
                        onDownload: () => onComparison(true),
                    },
                    Component: PostComparisonPage,
                })
                ShowToast.success(data?.message ?? "Comparison generated");
            },
            onError: (error: unknown) => {
                const message = extractErrorMessage(error);
                ShowToast.error(message || "Purchase failed!");
            },
            retry: 3,
        },
    });

    const submitComparisonDownloadMutation = UseApiMutation<Blob, any>({
        url: `document/motor/comparison/${quoteSessionId}`,
        method: EMETHODS.POST,
        config: {
            responseType: 'blob',
        },
        mutationOptions: {
            onSuccess: (data) => {
                const blob = new Blob([data], { type: 'application/pdf' })
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `comparison-${quoteSessionId}.pdf`
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(url)
                ShowToast.success("Comparison PDF downloaded")
            },
            onError: (error: unknown) => {
                const message = extractErrorMessage(error);
                ShowToast.error(message || "Download failed!");
            },
        },
    });

    const onComparison = (isDownload = false) => {
        if (!quoteSessionId) {
            ShowToast.error("No active quote session found.")
            return
        }
        if (selectedQuotes.length < 2) {
            ShowToast.error("Select at least 2 quotations to compare.")
            return
        }
        const payload = {
            is_download: isDownload,
            products: selectedQuotes,
        }
        if (isDownload) {
            submitComparisonDownloadMutation.mutate(payload)
        } else {
            submitComparisonMutation.mutate(payload)
        }
    }

    return (
        <div className="space-y-6">
            {!quoteSessionId && (
                <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <strong>Quote session not found.</strong> Go back to Vehicle Details and submit again.
                </div>
            )}
            <section className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-5 sm:px-6 sm:py-6">
                <h2 className="mb-1 text-lg font-semibold text-gray-900">Additional benefits</h2>
                <p className="mb-4 text-sm text-gray-500">
                    Each group lists add-ons returned for this quote. Pick one option per group (or leave
                    &quot;No add-on&quot;), then add them to your premium calculation.
                </p>
                <hr className="mb-5" />
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                    {!quoteSessionId ? null : isPending && !data && benefitGroups.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Loading benefit options…</p>
                    ) : benefitGroups.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No optional benefits are available for this quote yet.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {benefitGroups.map(({ group, items }) => {
                                const fieldName = benefitGroupFormKey(group)
                                const options = [
                                    { value: BENEFIT_SELECT_NONE, label: 'No add-on' },
                                    ...items.map((item) => ({
                                        value: String(item.id),
                                        label: benefitOptionLabel(item),
                                    })),
                                ]
                                return (
                                    <ReusableSelect
                                        key={group}
                                        control={benefitForm.control}
                                        name={fieldName as Path<FieldValues>}
                                        label={group}
                                        placeholder={`Choose in ${group}`}
                                        options={options}
                                        disabled={isFetching}
                                        triggerClassName="border-[#ADABAB]"
                                    />
                                )
                            })}
                        </div>
                    )}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Button
                            type="button"
                            className="flex w-full items-center gap-1.5 rounded border border-[#0CC2581F] bg-[#C7EED5] px-4 py-2 text-sm font-medium text-[#43A047] hover:bg-[#C7EED5]/90 sm:w-auto"
                            leftIcon={<Plus className="h-4 w-4" />}
                            onClick={applyBenefitSelections}
                            disabled={
                                !quoteSessionId ||
                                benefitGroups.length === 0 ||
                                isFetching
                            }>
                            Add benefit
                        </Button>
                        <Button
                            type="button"
                            className="flex w-full items-center gap-1.5 rounded bg-[#C20C0C]/80 px-5 py-2 text-sm font-medium text-white hover:bg-[#C20C0C] sm:ml-auto sm:w-auto"
                            onClick={() => onComparison(false)}
                            loading={submitComparisonMutation.isPending || submitComparisonDownloadMutation.isPending}
                            disabled={selectedQuotes.length < 2}>
                            Generate Comparison {selectedQuotes.length > 0 && `(${selectedQuotes.length}/${MAX_COMPARISONS})`}
                        </Button>
                    </div>
                    {/* {appliedBenefitIds.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                            Active add-on IDs sent to pricing: {appliedBenefitIds.join(', ')} — adjust
                            dropdowns and tap <strong>Add benefit</strong> again to update.
                        </p>
                    )} */}
                </form>
            </section>
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-gray-900">Quote Comparison</h2>
                        {selectedQuotes.length > 0 && (
                            <span className="rounded-full bg-[#C20C0C]/10 px-2.5 py-0.5 text-xs font-medium text-[#C20C0C]">
                                {selectedQuotes.length}/{MAX_COMPARISONS} selected
                            </span>
                        )}
                    </div>
                    {isFetching && (
                        <span className="animate-pulse text-xs text-gray-400">
                            Fetching premium quotations…
                        </span>
                    )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
                    {isPending && !data
                        ? Array.from({ length: filter.pageSize }).map((_, i) => (
                            <SkeletonCard key={`skeleton-${i}`} />
                        ))
                        : quotationItems.length === 0
                            ? <EmptyState />
                            : quotationItems.map((item: any, itemIndex: number) => (
                                <ReusableCard
                                    selected={isQuoteSelected(item?.rate_id)}
                                    onChange={() => toggleQuoteSelection(item?.product?.id, item?.rate_id)}
                                    key={item?.id ?? `quotation-${itemIndex}`}
                                    header={{
                                        type: 'image',
                                        src: item?.product?.organization?.logo,
                                        alt: item?.product?.organization?.name ?? 'Insurer logo',
                                    }}
                                    rootClassName=""
                                    footerClassName="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between"
                                    footer={
                                        <>
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    handleDialogContextSwitch({
                                                        componentProps: { data: item, goToNextStep },
                                                        Component: QuotePreviewPage,
                                                    })
                                                }
                                                className="w-full rounded-md border border-[#D9D9D9] bg-[#C20C0C] px-4 py-2 text-sm font-medium text-white hover:bg-[#C20C0C]/90 lg:w-auto">
                                                Get Quote
                                            </Button>
                                            {isAuthenticated ? (
                                                <Button
                                                    type="button"
                                                    onClick={() => onPurchase(item?.product?.id, item?.rate_id)}
                                                    loading={submitPurchaseMutation.isPending && purchasingRateId === item?.rate_id}
                                                    disabled={submitPurchaseMutation.isPending && purchasingRateId !== item?.rate_id}
                                                    className="w-full rounded-md border border-[#D9D9D9] bg-[#0CC258] px-4 py-2 text-sm font-medium text-white hover:bg-[#0CC258]/90 lg:w-auto">
                                                    Purchase Cover
                                                </Button>
                                            ) : (
                                                <Link
                                                    to={`/${EPREFIX.AUTH}${EROUTES.SIGNUP}`}
                                                    state={{
                                                        returnTo: location.pathname,
                                                        stepperStep: currentStep,
                                                    }}
                                                    className="w-full lg:w-auto">
                                                    <Button
                                                        type="button"
                                                        className="w-full rounded-md border border-[#D9D9D9] bg-[#0CC258] px-4 py-2 text-sm font-medium text-white hover:bg-[#0CC258]/90 lg:w-auto">
                                                        Purchase Cover
                                                    </Button>
                                                </Link>
                                            )}
                                        </>
                                    }>
                                    <div className="space-y-1.5 px-1">
                                        <div className="flex justify-between gap-2">
                                            <span className="text-xs text-gray-500 sm:text-sm">
                                                Basic Premium
                                            </span>
                                            <span className="text-xs font-medium text-gray-900 sm:text-sm">
                                                {formatCurrency(item?.calculated_premium?.basic_premium)}
                                            </span>
                                        </div>
                                        {/* Benefits Place Holders (Excess Protector,Political Violence & Terrorism,Personal Accident) */}
                                        <div className="flex justify-between gap-2">
                                            <span className="text-xs text-gray-500 sm:text-sm">
                                                Excess Protector
                                            </span>
                                            <span className="text-xs font-medium text-gray-900 sm:text-sm">
                                                demo
                                            </span>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                            <span className="text-xs text-gray-500 sm:text-sm">
                                                Political Violence & Terrorism
                                            </span>
                                            <span className="text-xs font-medium text-gray-900 sm:text-sm">
                                                demo
                                            </span>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                            <span className="text-xs text-gray-500 sm:text-sm">
                                                Personal Accident
                                            </span>
                                            <span className="text-xs font-medium text-gray-900 sm:text-sm">
                                                demo
                                            </span>
                                        </div>

                                        {/* Duty */}
                                        <div className="flex justify-between gap-2">    
                                            <span className="text-xs text-gray-500 sm:text-sm">
                                                PHCF, TL & Stamp Duty
                                            </span>
                                            <span className="text-xs font-medium text-gray-900 sm:text-sm">
                                                {formatCurrency(item?.calculated_premium?.total_duty)}
                                            </span>
                                        </div>


                                        <div className="flex justify-between gap-2 border-t border-b border-gray-200 pt-2">
                                            <span className="text-xs text-gray-500 font-bold sm:text-sm ">
                                                Total Premium
                                            </span>
                                       
                                            <span className="text-xs font-semibold text-[#C20C0C] sm:text-sm">
                                                {formatCurrency(item?.calculated_premium?.total_premium)}
                                            </span>
                                        </div>
                                    </div>
                                </ReusableCard>
                            ))}
                </div>
            </section>

            <CardFooter className="flex flex-col items-center justify-between gap-3 px-0 pt-2 sm:flex-row">
                <Button
                    type="button"
                    className="w-full rounded-full border border-[#C20C0C] bg-transparent px-5 py-2 text-sm font-medium text-[#C20C0C] hover:bg-[#C20C0C]/10 sm:w-auto"
                    leftIcon={<ArrowLeftCircle className="h-4 w-4" />}
                    onClick={() => goToPrevStep?.()}>
                    Previous
                </Button>
                <ReusablePagination
                    currentPage={currentPage}
                    pageCount={lastPage}
                    totalPages={lastPage}
                    onPageChange={(nextPage) =>
                        optionsDispatcher({ type: 'page', payload: { page: nextPage } })
                    }
                    disabled={isFetching}
                />
                <Button
                    type="button"
                    className="hidden w-full rounded-full bg-[#C20C0C]/80 px-5 py-2 text-sm font-medium text-white hover:bg-[#C20C0C] sm:w-auto"
                    rightIcon={<ArrowRightCircle className="h-4 w-4" />}
                    disabled>
                    Next
                </Button>
            </CardFooter>
            <CustomDialogComponent
                {...{ handleDialogContextSwitch, dialogOpen }}
                className="w-[95vw] p-4 sm:max-w-fit sm:w-auto sm:p-6">
                {dialogContent?.Component && (
                    <dialogContent.Component
                        {...{
                            componentProps: dialogContent.componentProps,
                            handleDialogContextSwitch,
                        }}
                    />
                )}
            </CustomDialogComponent>
        </div>
    )
}

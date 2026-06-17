/* eslint-disable @typescript-eslint/no-unused-vars */

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
    SendDocumentsViaEmail,
    SkeletonCard
} from '@/dev/core'
import { useCustomDialogContextFactory } from '@/hooks'
import type {
    BenefitGroup,
    MotorBenefitOption,
    SelectedQuoteEntry,
    SubmitResponse,
    TFilterOptions,
    TPaginationFilters
} from '@/types/types'
import { ArrowLeftCircle, ArrowRightCircle, X } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useReducer, useState, useRef } from 'react'
import type { FieldValues, Path } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { AdminMotorQuotePreviewPage } from './qoute-preview/page'
import {
    BENEFIT_SELECT_NONE,
    EMETHODS,
    FILTEROPTIONS,
    MAX_COMPARISONS,
    MOTOR_QUOTE_SESSION_STORAGE_KEY,
    PURCHASE_SESSION_STORAGE_KEY,
    VEHICLE_DETAILS_SESSION_STORAGE_KEY,
    VEHICLE_OWNERSHIP_SESSION_STORAGE_KEY,
    ReusableReducer
} from '@/utils/constatnts'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { formatCurrency } from '@/lib/format'
import { serializeMotorPremiumParams } from '@/lib/motor-premium-params'
import { ShowToast } from '@/utils/utils'
import { 
    benefitGroupFormKey, 
    benefitIdsEqual, 
    benefitOptionLabel, 
    collectBenefitIdsFromValues, 
    extractErrorMessage, 
    resolveListedBenefitValue 
} from '@/utils/helpers'
import { AdminMotorPostComparisonPage } from './comparisons/[id]/page'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import type { AdminMotorStepProps } from '../admin-step-props'
import { buildAdminShareDialogProps } from '../admin-step-props'



export const AdminMotorQuotationsPage: React.FC<AdminMotorStepProps> = ({
    goToNextStep,
    goToPrevStep,
    missingSessionBackLabel = 'Motor Quotations',
    defaultCustomerContact,
}) => {
    const [quoteSessionId, setQuoteSessionId] = useState<number | null>(null)
    const [selectedQuotes, setSelectedQuotes] = useState<SelectedQuoteEntry[]>([])
    const [purchasingRateId, setPurchasingRateId] = useState<string | number | null>(null)
    const [appliedBenefitIds, setAppliedBenefitIds] = useState<number[]>([])
    const [value, setValue] = useState([0, 100])

    const benefitForm = useForm<FieldValues>({ defaultValues: {} })

    const shareDialogProps = useMemo(
        () => buildAdminShareDialogProps(defaultCustomerContact),
        [defaultCustomerContact]
    )

    const [filter, optionsDispatcher] = useReducer(
        ReusableReducer<TPaginationFilters & TFilterOptions>,
        { ...FILTEROPTIONS, page: 1, pageSize: 8 }
    )

    const { handleDialogContextSwitch, dialogContent, dialogOpen } =
        useCustomDialogContextFactory<{
            refetch?: () => Promise<any>
            data?: any
            goToNextStep?: AdminMotorStepProps['goToNextStep']
            onDownload?: () => void
            products?: { product_id: string | number; rate_id: string | number }[]
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

    const { data, isPending, isFetching, refetch: refetchPremium } = UseApiQuery<SubmitResponse>({
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
    const benefitsListed = (data?.data?.benefits?.listed ?? []) as MotorBenefitOption[]
    const selectedBenefitIds = useMemo(() => {
        const raw = (data?.data?.benefits?.selected ?? []) as any[]
        const ids = raw
            .map((s) => {
                if (s == null) return null
                if (typeof s === 'number' || typeof s === 'string') return Number(s)
                return Number(s?.id ?? s?.benefit_id)
            })
            .filter((n) => Number.isFinite(n)) as number[]
        return new Set<number>(ids)
    }, [data?.data?.benefits?.selected])

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

    const hasInitializedBenefitFormRef = useRef(false)
    const skipBenefitAutoApplyRef = useRef(true)
    const watchedBenefitValues = benefitForm.watch()

    useEffect(() => {
        if (benefitGroups.length === 0) return
        if (hasInitializedBenefitFormRef.current) return
        const next: FieldValues = {}
        for (const { group } of benefitGroups) {
            next[benefitGroupFormKey(group)] = BENEFIT_SELECT_NONE
        }
        benefitForm.reset(next)
        hasInitializedBenefitFormRef.current = true
        skipBenefitAutoApplyRef.current = true
    }, [benefitGroupsResetKey, benefitForm, benefitGroups])

    const applyBenefitIdsFromFormValues = useCallback(
        (values: FieldValues) => {
            const ids = collectBenefitIdsFromValues(values, benefitGroups)
            if (benefitIdsEqual(ids, appliedBenefitIds)) return

            if (ids.length === 0) {
                setAppliedBenefitIds([])
                return
            }
            setAppliedBenefitIds(ids)
        },
        [benefitGroups, appliedBenefitIds]
    )

    useEffect(() => {
        if (!quoteSessionId || benefitGroups.length === 0) return
        if (!hasInitializedBenefitFormRef.current) return
        if (skipBenefitAutoApplyRef.current) {
            skipBenefitAutoApplyRef.current = false
            return
        }
        applyBenefitIdsFromFormValues(benefitForm.getValues())
    }, [watchedBenefitValues, quoteSessionId, benefitGroups.length, applyBenefitIdsFromFormValues, benefitForm])

    const currentPage = data?.pagination?.current_page ?? filter.page
    const lastPage = data?.pagination?.last_page ?? 1

    const selectedQuotesDisplay = useMemo(() => {
        return selectedQuotes.map((sel) => {
            const item = quotationItems.find(
                (q: any) => String(q?.rate_id) === String(sel.rate_id)
            )
            return {
                ...sel,
                insurerName:
                    sel.insurerName ??
                    item?.product?.organization?.name ??
                    'Insurer',
                logo: sel.logo ?? item?.product?.organization?.logo,
                totalPremium:
                    sel.totalPremium ??
                    formatCurrency(item?.calculated_premium?.total_premium),
            }
        })
    }, [selectedQuotes, quotationItems])

    const isQuoteSelected = useCallback(
        (rateId: string | number) =>
            selectedQuotes.some((q) => String(q.rate_id) === String(rateId)),
        [selectedQuotes]
    )

    const toggleQuoteSelection = useCallback(
        (productId: string | number, rateId: string | number, item?: any) => {
            setSelectedQuotes((prev) => {
                const exists = prev.some((q) => String(q.rate_id) === String(rateId))
                if (exists) return prev.filter((q) => String(q.rate_id) !== String(rateId))
                if (prev.length >= MAX_COMPARISONS) {
                    ShowToast.error(`You can select a maximum of ${MAX_COMPARISONS} quotations to compare.`)
                    return prev
                }
                return [
                    ...prev,
                    {
                        product_id: productId,
                        rate_id: rateId,
                        insurerName: item?.product?.organization?.name ?? 'Insurer',
                        logo: item?.product?.organization?.logo,
                        totalPremium: formatCurrency(
                            item?.calculated_premium?.total_premium
                        ),
                    },
                ]
            })
        },
        []
    )

    const removeSelectedQuote = useCallback((rateId: string | number) => {
        setSelectedQuotes((prev) =>
            prev.filter((q) => String(q.rate_id) !== String(rateId))
        )
    }, [])

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
                const vehicleInfo = data?.data?.vehicle_info
                sessionStorage.setItem(PURCHASE_SESSION_STORAGE_KEY, String(purchaseId))
                sessionStorage.setItem(VEHICLE_DETAILS_SESSION_STORAGE_KEY, vehicleInfo ? JSON.stringify(vehicleInfo) : "")
                sessionStorage.setItem(VEHICLE_OWNERSHIP_SESSION_STORAGE_KEY, String(data?.data?.ownership))
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
                        products: selectedQuotes,
                        goToNextStep,
                        ...shareDialogProps,
                    },
                    Component: AdminMotorPostComparisonPage,
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
                const blob = new Blob([data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const width = 1000;
                const height = 900;
                const left = (window.screen.width / 2) - (width / 2);
                const top = (window.screen.height / 2) - (height / 2);
                const popup = window.open(
                    url,
                    'PDF Preview',
                    `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
                );
                if (!popup) {
                    ShowToast.error("Popup blocked!");
                }
            },
            onError: (error: unknown) => {
                const message = extractErrorMessage(error);
                ShowToast.error(message || "Failed to generate preview!");
            },
        },
    });

    const onComparison = (isDownload = false, isSendViaEmail = false) => {
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
            is_send_via_email: isSendViaEmail,
            products: selectedQuotes,
        }
        if (isDownload) {
            submitComparisonDownloadMutation.mutate(payload)

            if (isSendViaEmail) {
                handleDialogContextSwitch({
                    componentProps: {
                        data: {
                            quote_type: 'comparison',
                            products: selectedQuotes,
                        },
                        ...shareDialogProps,
                    },
                    Component: SendDocumentsViaEmail,
                })
            }
        } else {
            submitComparisonMutation.mutate(payload)
        }
    }

    return (
        <div className="space-y-6">
            {!quoteSessionId && (
                <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <strong>Quote session not found.</strong> Go back to {missingSessionBackLabel} and
                    submit again.
                </div>
            )}

            <div className='2xl:flex gap-2'>
                <section className="hidden w-72 shrink-0 px-4 py-5 sm:px-6 sm:py-6 2xl:flex 2xl:flex-col">
                    <div className="grid gap-2 mb-5">
                        <Label htmlFor="search">Search by Insurer</Label>
                        <Input
                            id="search"
                            name="search"
                            type="text"
                            placeholder="Enter insurer name..."
                            className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                        />
                    </div>
                    <h2 className="mb-1 text-lg font-semibold text-gray-900">Additional benefits</h2>
                    <hr className="mb-5" />
                    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                        {!quoteSessionId ? null : isPending && !data && benefitGroups.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Loading benefit options…</p>
                        ) : benefitGroups.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No optional benefits are available for this quote yet.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-1 xl:grid-cols-1">
                                {benefitGroups.map(({ group, items }) => {
                                    const fieldName = benefitGroupFormKey(group)
                                    const options = [
                                        { value: BENEFIT_SELECT_NONE, label: '-- none --' },
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
                    </form>
                    <hr className="mb-5" />
                    <h2 className="mb-1 text-lg font-semibold text-gray-900">Price Range</h2>
                    <div className="mx-auto grid w-full max-w-xs gap-3">
                        <div className="flex items-center justify-between gap-2">
                            <Label htmlFor="slider-demo-temperature">Price</Label>
                            <span className="text-sm text-muted-foreground">
                                {value.join(", ")}
                            </span>
                        </div>
                        <Slider
                            id="slider-demo-temperature"
                            value={value}
                            onValueChange={setValue}
                            min={0}
                            max={100}
                            step={0.1}
                        />
                    </div>
                </section>

                <section className="flex-1 min-w-0 space-y-4 px-4 py-5 sm:px-6 sm:py-6">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Quote Comparison
                                </h2>
                                {selectedQuotes.length > 0 && (
                                    <span className="rounded-full bg-[#C20C0C]/10 px-2.5 py-0.5 text-xs font-medium text-[#C20C0C]">
                                        {selectedQuotes.length}/{MAX_COMPARISONS} selected
                                    </span>
                                )}
                            </div>

                            {selectedQuotesDisplay.length > 0 && (
                                <div
                                    className="flex flex-wrap gap-2"
                                    role="list"
                                    aria-label="Selected quotations for comparison">
                                    {selectedQuotesDisplay.map((quote) => (
                                        <div
                                            key={String(quote.rate_id)}
                                            role="listitem"
                                            className="inline-flex max-w-full items-center gap-2 rounded-lg border border-[#C20C0C]/25 bg-[#C20C0C]/5 py-1.5 pl-2 pr-1.5 text-sm shadow-sm">
                                            <div className="flex min-w-0 flex-col leading-tight">
                                                <span className="truncate font-medium text-gray-900 max-w-40 sm:max-w-48">
                                                    {quote.insurerName}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeSelectedQuote(quote.rate_id)}
                                                className="shrink-0 rounded-full p-1 text-gray-500 transition-colors hover:bg-[#C20C0C]/15 hover:text-[#C20C0C]"
                                                aria-label={`Remove ${quote.insurerName} from comparison`}
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                            {isFetching && (
                                <span className="animate-pulse text-xs text-gray-400">
                                    Fetching premium quotations…
                                </span>
                            )}
                            <Button
                                type="button"
                                className="rounded bg-[#C20C0C]/80 px-5 py-2 text-sm font-medium text-white hover:bg-[#C20C0C] sm:w-auto"
                                onClick={() => onComparison(false)}
                                loading={
                                    submitComparisonMutation.isPending ||
                                    submitComparisonDownloadMutation.isPending
                                }
                                disabled={selectedQuotes.length < 2}>
                                Generate Comparison
                                {selectedQuotes.length > 0 &&
                                    ` (${selectedQuotes.length}/${MAX_COMPARISONS})`}
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 sm:gap-6">
                        {isPending && !data
                            ? Array.from({ length: filter.pageSize }).map((_, i) => (
                                <SkeletonCard key={`skeleton-${i}`} />
                            ))
                            : quotationItems.length === 0
                                ? <EmptyState />
                                : quotationItems.map((item: any, itemIndex: number) => (
                                    <ReusableCard
                                        selected={isQuoteSelected(item?.rate_id)}
                                        onChange={() =>
                                            toggleQuoteSelection(
                                                item?.product?.id,
                                                item?.rate_id,
                                                item
                                            )
                                        }
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
                                                            componentProps: {
                                                                data: item,
                                                                goToNextStep,
                                                                ...shareDialogProps,
                                                            },
                                                            Component: AdminMotorQuotePreviewPage,
                                                        })
                                                    }
                                                    className="w-full rounded-md border border-[#D9D9D9] bg-[#C20C0C] px-4 py-2 text-sm font-medium text-white hover:bg-[#C20C0C]/90 lg:w-auto">
                                                    Get Quote
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    type="button"
                                                    onClick={() => onPurchase(item?.product?.id, item?.rate_id)}
                                                    loading={submitPurchaseMutation.isPending && purchasingRateId === item?.rate_id}
                                                    disabled={submitPurchaseMutation.isPending && purchasingRateId !== item?.rate_id}
                                                    className=" w-full lg:w-auto border-[#C20C0C] bg-[#FFF5F5] text-[#C20C0C] hover:bg-[#C20C0C] hover:text-white focus-visible:ring-[#C20C0C]/30">
                                                    Purchase Cover
                                                </Button>
                                            </>
                                        }>
                                        <div className="space-y-1.5 px-1">
                                            <div className="flex justify-between gap-2">
                                                <span className="text-xs text-gray-500 sm:text-sm">
                                                    Basic Premium
                                                </span>
                                                <span className="text-xs font-medium text-gray-900 sm:text-sm">
                                                    {formatCurrency(item?.calculated_premium?.vehicle_premium)}
                                                </span>
                                            </div>
                                            {benefitsListed.map((benefit) => {
                                                const label =
                                                    (benefit?.name ?? benefit?.label ?? '').trim() ||
                                                    `Benefit ${benefit?.id}`
                                                const resolved = resolveListedBenefitValue(item, benefit.id)
                                                const isSelectedInRequest = selectedBenefitIds.has(Number(benefit.id))
                                                const badgeClassName =
                                                    resolved.status === 'compulsory'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : resolved.status === 'inclusive' || resolved.status === 'selected'
                                                            ? 'bg-green-100 text-green-700'
                                                            : resolved.status === 'no'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-gray-100 text-gray-600'
                                                return (
                                                    <div key={benefit.id} className="flex justify-between gap-2">
                                                        <span
                                                            className={[
                                                                'text-xs sm:text-sm',
                                                                isSelectedInRequest ? 'font-medium text-green-700' : 'text-gray-500',
                                                            ].join(' ')}>
                                                            {label}
                                                        </span>
                                                        <span
                                                            className={[
                                                                'inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium',
                                                                badgeClassName,
                                                            ].join(' ')}>
                                                            {resolved.text}
                                                        </span>
                                                    </div>
                                                )
                                            })}

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
            </div>

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

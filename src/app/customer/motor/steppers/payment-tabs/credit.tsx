import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Checkbox } from '@/components/ui/checkbox'
import { ReuseableInput } from '@/dev/core'
import { UseApiQuery } from '@/hooks/hooks'
import type { CreditSummaryResponse } from '@/types/types'
import type { PaymentFormInput } from '@/types/schema'
import {
    CREDIT_SUMMARY_API_ENABLED,
    CREDIT_SUMMARY_URL,
    INVOICE_SESSION_STORAGE_KEY,
} from '@/utils/constatnts'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { PaymentAmountSummary } from './payment-amount-summary'

const formatCreditValue = (value: string | number | undefined) => {
    if (value === undefined || value === null || value === '') return ''
    const num = Number(value)
    if (Number.isFinite(num)) {
        return num.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
    return String(value)
}

export const CreditTabPage: React.FC = () => {
    const { control, setValue } = useFormContext<PaymentFormInput>()

    const [purchaseSessionId, setPurchaseSessionId] = React.useState<string | null>(null)

    React.useEffect(() => {
        const stored = sessionStorage.getItem(INVOICE_SESSION_STORAGE_KEY)
        setPurchaseSessionId(stored ? String(stored) : null)
    }, [])

    const creditQuery = UseApiQuery<CreditSummaryResponse>({
        url: CREDIT_SUMMARY_URL,
        params: purchaseSessionId ? { purchase_session_id: purchaseSessionId } : undefined,
        queryOptions: {
            enabled: CREDIT_SUMMARY_API_ENABLED && !!purchaseSessionId,
            retry: 1,
        },
    })

    React.useEffect(() => {
        if (!creditQuery.data) return
        const payload = creditQuery.data.data ?? creditQuery.data
        setValue('available_credit', formatCreditValue(payload.available_credit))
        setValue('unsettled_credit', formatCreditValue(payload.unsettled_credit))
        setValue('unsettled_credit_limit', formatCreditValue(payload.unsettled_credit_limit))
    }, [creditQuery.data, setValue])

    return (
        <div className="w-full">
            <div className="mx-auto">
                <FieldGroup>
                    <PaymentAmountSummary label="You will Pay:" />

                    {creditQuery.isLoading && CREDIT_SUMMARY_API_ENABLED ? (
                        <p className="mt-4 text-sm text-black/70">Loading credit info…</p>
                    ) : null}

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <ReuseableInput
                            className="w-full h-10 rounded-sm border border-black/30 bg-white text-black"
                            control={control}
                            name="available_credit"
                            label="Available Credit"
                            disabled
                        />
                        <ReuseableInput
                            className="w-full h-10 rounded-sm border border-black/30 bg-white text-black"
                            control={control}
                            name="unsettled_credit"
                            label="Unsettled Credit"
                            disabled
                        />
                        <ReuseableInput
                            className="w-full h-10 rounded-sm border border-black/30 bg-white text-black"
                            control={control}
                            name="unsettled_credit_limit"
                            label="Unsettled Credit Limit"
                            disabled
                        />
                    </div>

                    <div className="mt-4 w-full rounded-lg border border-black/20 bg-white shadow-sm p-3 space-y-3">
                        <p className="text-sm text-black/80">
                            <span className="font-semibold uppercase text-[#BF162E]">Notice:</span>{' '}
                            You will be responsible for recovering funds for this transaction.
                        </p>

                        <Controller
                            name="credit_acknowledged"
                            control={control}
                            rules={{
                                validate: (value) =>
                                    value === true || 'You must acknowledge the credit terms to proceed',
                            }}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="credit_acknowledged"
                                            checked={field.value === true}
                                            onCheckedChange={(checked) => field.onChange(checked === true)}
                                            className="mt-0.5 border-[#BF162E] data-[state=checked]:bg-[#BF162E] data-[state=checked]:border-[#BF162E]"
                                            aria-required
                                        />
                                        <label
                                            htmlFor="credit_acknowledged"
                                            className="cursor-pointer text-sm text-black/80 leading-relaxed"
                                        >
                                            Yes, I am aware of the task &quot;proceed with credit option&quot;
                                            <span className="ml-1 text-[#BF162E]">*</span>
                                        </label>
                                    </div>
                                    {fieldState.error && (
                                        <FieldError className="mt-2 text-xs text-[#BF162E]">
                                            {fieldState.error.message}
                                        </FieldError>
                                    )}
                                </Field>
                            )}
                        />
                    </div>
                </FieldGroup>
            </div>
        </div>
    )
}

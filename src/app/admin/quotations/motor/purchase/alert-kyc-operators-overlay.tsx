import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from '@/components/ui/multi-select'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { EMETHODS, PURCHASE_SESSION_STORAGE_KEY } from '@/utils/constatnts'
import { EROUTES } from '@/utils/enums'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import type { SubmitResponse } from '@/types/types'

type KycOperator = {
  id: number
  name: string
  email: string
}

type KycOperatorsPayload = {
  quote_code?: string
  operators?: KycOperator[]
}

const readPurchaseSessionId = () => {
  if (typeof window === 'undefined') return null
  const value = sessionStorage.getItem(PURCHASE_SESSION_STORAGE_KEY)?.trim()
  return value || null
}

/**
 * Full-screen dim overlay (same scrim as ActionWaitOverlay) for staff who
 * reached motor KYC without permission to submit it. They pick specific
 * operators to email instead of filling the form.
 */
export function AlertKycOperatorsOverlay() {
  const navigate = useNavigate()
  const purchaseId = readPurchaseSessionId()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sentCount, setSentCount] = useState<number | null>(null)

  const { data, isLoading, isError } = UseApiQuery<SubmitResponse>({
    url: `purchase/motor/${purchaseId}/kyc-operators`,
    queryKey: ['purchase-motor-kyc-operators', purchaseId],
    queryOptions: {
      enabled: Boolean(purchaseId),
      retry: false,
    },
  })

  const payload = (data?.data ?? {}) as KycOperatorsPayload
  const operators = useMemo(
    () => (Array.isArray(payload.operators) ? payload.operators : []),
    [payload.operators],
  )
  const quoteCode = payload.quote_code?.trim() || null

  const alertMutation = UseApiMutation<
    SubmitResponse,
    { user_ids: number[] }
  >({
    url: `purchase/motor/${purchaseId}/alert-kyc`,
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (response) => {
        const count = Number(response?.data?.sent_count ?? 0)
        setSentCount(Number.isFinite(count) ? count : 0)
        ShowToast.success(
          response?.message || 'KYC operators have been alerted.',
        )
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const canSend =
    Boolean(purchaseId) &&
    operators.length > 0 &&
    selectedIds.length > 0 &&
    !alertMutation.isPending

  const handleSend = () => {
    if (!canSend) return

    alertMutation.mutate({
      user_ids: selectedIds.map((id) => Number(id)),
    })
  }

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-kyc-operators-title"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4"
    >
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-950">
        <h2
          id="alert-kyc-operators-title"
          className="text-lg font-semibold text-foreground"
        >
          Alert Operator to Finish KYC Process
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You do not have permission to complete KYC for this quotation
          {quoteCode ? (
            <>
              {' '}
              (<span className="font-medium text-foreground">{quoteCode}</span>)
            </>
          ) : null}
          . Select colleagues who can continue from KYC.
        </p>

        {sentCount !== null ? (
          <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
            Alert queued for {sentCount} operator{sentCount === 1 ? '' : 's'}.
            They can open the quotation from Find motor quotation and resume
            KYC.
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label>Operators with KYC permission</Label>
            <MultiSelect
              values={selectedIds}
              onValuesChange={setSelectedIds}
            >
              <MultiSelectTrigger
                className="w-full rounded-[5px] border border-[#ADABAB]"
                disabled={operators.length === 0 || alertMutation.isPending}
              >
                <MultiSelectValue placeholder="Select operators…" />
              </MultiSelectTrigger>
              <MultiSelectContent className="z-[110]">
                <MultiSelectGroup>
                  {operators.map((operator) => (
                    <MultiSelectItem
                      key={operator.id}
                      value={String(operator.id)}
                    >
                      {operator.name} ({operator.email})
                    </MultiSelectItem>
                  ))}
                </MultiSelectGroup>
              </MultiSelectContent>
            </MultiSelect>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading operators…
            </p>
          ) : null}

          {isError ? (
            <p className="text-sm text-destructive">
              Could not load operators for this location.
            </p>
          ) : null}

          {!isLoading && !isError && operators.length === 0 ? (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              No one at this location can finish KYC right now. Ask an admin to
              grant motor KYC and quotation fetch access.
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(EROUTES.MOTOR_QUOTATION_RESULTS)}
          >
            Back to rates
          </Button>
          <Button
            type="button"
            disabled={!canSend}
            onClick={handleSend}
          >
            {alertMutation.isPending ? 'Sending…' : 'Send alert'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

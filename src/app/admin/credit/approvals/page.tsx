/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from "@/components/shared"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ActionColumn } from "@/dev/columns"
import { CustomDialogComponent } from "@/dev/core"
import { CustomBaseTable, SearchTools } from "@/dev/table"
import { CreditApprovalsColumns } from "@/dev/columns/admin/credit/approvals"
import { CREDIT_URLS } from "@/app/admin/credit/credit-query"
import { useCustomDialogContextFactory, useDebounce } from "@/hooks"
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks"
import type {
  CreditApprovalQueueItem,
  SingleActionsHandler,
  SubmitResponse,
  TPaginationFilters,
  TFilterOptions,
} from "@/types/types"
import { EMETHODS, FILTEROPTIONS, ReusableReducer } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { useReducer, useState } from "react"
import RejectApprovalModal from "./modals/reject"

export function CreditApprovalsPage() {
  const [approveTarget, setApproveTarget] = useState<CreditApprovalQueueItem | null>(null)

  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: 15 }
  )

  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  const { handleDialogContextSwitch, dialogContent, dialogOpen } =
    useCustomDialogContextFactory<{
      refetch?: () => Promise<any>
      transactionId?: number
    }>()

  const { data, isLoading, refetch } = UseApiQuery<SubmitResponse>({
    url: CREDIT_URLS.approvals,
    params: {
      page: filter.page,
      pageSize: filter.pageSize,
      term: filter.term,
    },
    queryOptions: {
      enabled: true,
    },
  })

  const approveMutation = UseApiMutation<SubmitResponse, { transactionId: number }>({
    url: ({ transactionId }) => CREDIT_URLS.approvalApprove(transactionId),
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Transaction approved")
        setApproveTarget(null)
        refetch()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const getTransactionId = (row: CreditApprovalQueueItem) =>
    row.credit_transaction?.id ?? row.credit_transaction_id

  const ActionsHandlerMapping: SingleActionsHandler<CreditApprovalQueueItem>[] = [
    {
      label: "Approve",
      conditional: (row) => row.status === "pending",
      onSelect: (row) => setApproveTarget(row),
    },
    {
      label: "Reject",
      conditional: (row) => row.status === "pending",
      onSelect: (row) => {
        const transactionId = getTransactionId(row)
        if (!transactionId) return
        handleDialogContextSwitch({
          Component: RejectApprovalModal,
          componentProps: { transactionId, refetch },
        })
      },
    },
  ]

  const approvals: CreditApprovalQueueItem[] =
    data?.data?.approvals ??
    data?.data?.credit_approval_queue ??
    data?.data?.data ??
    (Array.isArray(data?.data) ? data.data : [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Approvals"
        description="Review and approve credit spending requests from your team."
      />

      <CustomBaseTable
        onPageChange={(page) => optionsDispatcher({ payload: { page }, type: "page" })}
        OtherToolsProps={{
          onChange: (term: string) =>
            optionsDispatcherDebounce({ payload: { term }, type: "term" }),
          placeholder: "Search approvals",
          includeFilter: true,
        }}
        columns={[...CreditApprovalsColumns, ActionColumn({ ActionsHandlerMapping })]}
        OtherTools={SearchTools}
        data={approvals}
        pageCount={data?.data?.pagination?.last_page ?? data?.pagination?.last_page ?? 1}
        pageSize={filter.pageSize}
        page={filter.page}
        isLoading={isLoading}
        showPagination
      />

      <CustomDialogComponent
        handleDialogContextSwitch={handleDialogContextSwitch}
        dialogOpen={dialogOpen}
        dialogContent={dialogContent}
      />

      <AlertDialog open={Boolean(approveTarget)} onOpenChange={() => setApproveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve credit spend?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deduct credit from the agent&apos;s available balance once approved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const transactionId = approveTarget ? getTransactionId(approveTarget) : null
                if (transactionId) {
                  approveMutation.mutate({ transactionId })
                }
              }}
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default CreditApprovalsPage

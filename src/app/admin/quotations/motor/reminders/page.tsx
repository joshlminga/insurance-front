/**
 * Motor cover-expiry reminders — who gets email + scheduled/sent log.
 *
 * API (assumed; align with backend when merged):
 * - GET/PATCH quotation/motor/reminders/settings
 * - GET quotation/motor/reminders?status=&page=&per_page=
 *
 * Permissions: quotation-motor.read to view, quotation-motor.advance to save settings.
 */
import { Can } from '@/auth/CanAccess'
import { PageHeader } from '@/components/shared'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Button, ReusableSelect } from '@/dev/core'
import { CustomBaseTable } from '@/dev/table'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import type { SubmitResponse, TPaginationFilters } from '@/types/types'
import { EMETHODS, FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { EROUTES } from '@/utils/enums'
import { extractErrorMessage } from '@/utils/helpers'
import {
  MOTOR_REMINDERS_API,
  MOTOR_REMINDER_STATUS_FILTERS,
  formatReminderMilestone,
  type MotorReminderListRow,
  type MotorReminderSettings,
} from '@/utils/motor-reminders'
import { ShowToast } from '@/utils/utils'
import { ColumnDef } from '@tanstack/table-core'
import { useEffect, useMemo, useReducer, useState } from 'react'
import { useForm } from 'react-hook-form'

type ReminderFilters = TPaginationFilters & { status?: string }

type SettingsFormValues = {
  status: string
}

const reminderColumns: ColumnDef<MotorReminderListRow>[] = [
  {
    accessorKey: 'quote_code',
    header: () => <div>Quote code</div>,
    cell: ({ row }) => (
      <div className="font-medium">{row.original.quote_code ?? '—'}</div>
    ),
  },
  {
    accessorKey: 'registration',
    header: () => <div>Registration</div>,
    cell: ({ row }) => <div>{row.original.registration ?? '—'}</div>,
  },
  {
    accessorKey: 'recipient',
    header: () => <div>Recipient</div>,
    cell: ({ row }) => {
      const recipient = row.original.recipient ?? '—'
      return (
        <div className="space-y-0.5">
          <div className="capitalize">{recipient}</div>
          {row.original.email ? (
            <div className="text-xs text-muted-foreground">{row.original.email}</div>
          ) : null}
        </div>
      )
    },
  },
  {
    id: 'milestone',
    header: () => <div>Milestone</div>,
    cell: ({ row }) => (
      <div>
        {formatReminderMilestone(row.original.days_before, row.original.milestone)}
      </div>
    ),
  },
  {
    accessorKey: 'scheduled_for',
    header: () => <div>Scheduled for</div>,
    cell: ({ row }) => (
      <div>{row.original.scheduled_for?.slice(0, 10) ?? '—'}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: () => <div>Status</div>,
    cell: ({ row }) => {
      const status = (row.original.status ?? '—').toLowerCase()
      const badgeClass =
        status === 'sent'
          ? 'border-transparent bg-emerald-100 text-emerald-800'
          : status === 'failed'
            ? 'border-transparent bg-red-100 text-red-800'
            : status === 'skipped'
              ? 'border-transparent bg-slate-100 text-slate-700'
              : status === 'pending'
                ? 'border-transparent bg-amber-100 text-amber-900'
                : 'border-transparent bg-slate-100 text-slate-800'
      return (
        <Badge className={`rounded-full capitalize ${badgeClass}`}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'sent_at',
    header: () => <div>Sent at</div>,
    cell: ({ row }) => {
      const sentAt = row.original.sent_at
      if (!sentAt) return <div>—</div>
      // Show date + time if present
      return <div className="text-sm">{sentAt.replace('T', ' ').slice(0, 19)}</div>
    },
  },
]

function readReminderSettings(payload: unknown): MotorReminderSettings {
  const root = (payload as { data?: unknown } | undefined)?.data ?? payload
  const record = (root ?? {}) as Record<string, unknown>
  return {
    notify_agent: Boolean(record.notify_agent ?? true),
    notify_customer: Boolean(record.notify_customer ?? true),
  }
}

function readReminderRows(payload: unknown): {
  rows: MotorReminderListRow[]
  lastPage: number
  currentPage: number
  perPage: number
} {
  const body = payload as {
    data?: unknown
    pagination?: {
      last_page?: number
      current_page?: number
      per_page?: number
    }
  } | undefined

  const data = body?.data
  // Laravel paginator may nest under data.data, or return a plain array
  let rows: MotorReminderListRow[] = []
  if (Array.isArray(data)) {
    rows = data as MotorReminderListRow[]
  } else if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    rows = (data as { data: MotorReminderListRow[] }).data
  }

  const nestedPagination =
    data && typeof data === 'object' && !Array.isArray(data)
      ? (data as {
          last_page?: number
          current_page?: number
          per_page?: number
        })
      : undefined

  return {
    rows,
    lastPage: body?.pagination?.last_page ?? nestedPagination?.last_page ?? 1,
    currentPage: body?.pagination?.current_page ?? nestedPagination?.current_page ?? 1,
    perPage: body?.pagination?.per_page ?? nestedPagination?.per_page ?? 10,
  }
}

export function AdminMotorRemindersPage() {
  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<ReminderFilters>,
    { ...FILTEROPTIONS, page: 1, pageSize: 10, status: 'all' },
  )

  const statusForm = useForm<SettingsFormValues>({
    defaultValues: { status: 'all' },
  })
  const status = statusForm.watch('status')

  const [notifyAgent, setNotifyAgent] = useState(true)
  const [notifyCustomer, setNotifyCustomer] = useState(true)

  const settingsQuery = UseApiQuery<SubmitResponse>({
    url: MOTOR_REMINDERS_API.settings,
    queryKey: [MOTOR_REMINDERS_API.settings],
    queryOptions: { retry: 1 },
  })

  useEffect(() => {
    if (!settingsQuery.data) return
    const settings = readReminderSettings(settingsQuery.data)
    setNotifyAgent(settings.notify_agent)
    setNotifyCustomer(settings.notify_customer)
  }, [settingsQuery.data])

  const saveSettings = UseApiMutation<SubmitResponse, MotorReminderSettings>({
    url: MOTOR_REMINDERS_API.settings,
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || 'Reminder settings saved')
        void settingsQuery.refetch()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error) || 'Failed to save settings')
      },
    },
  })

  const listParams = useMemo(() => {
    const params: Record<string, string | number> = {
      page: filter.page,
      per_page: filter.pageSize,
    }
    if (status && status !== 'all') {
      params.status = status
    }
    return params
  }, [filter.page, filter.pageSize, status])

  const listQuery = UseApiQuery<SubmitResponse>({
    url: MOTOR_REMINDERS_API.list,
    queryKey: [MOTOR_REMINDERS_API.list, listParams],
    params: listParams,
    queryOptions: { retry: 1 },
  })

  const { rows, lastPage, currentPage, perPage } = readReminderRows(listQuery.data)

  // Status filter change: jump back to first page of results
  useEffect(() => {
    optionsDispatcher({ payload: { page: 1 }, type: 'page' })
  }, [status])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cover expiry reminders"
        description="Choose who receives motor cover-expiry emails, and review scheduled or sent reminders."
        actions={[
          { label: 'Find quotation', variant: 'outline', href: EROUTES.MOTOR_QUOTATION_FETCH },
          { label: 'New quotation', variant: 'outline', href: EROUTES.MOTORQUOTATIONS },
        ]}
      />

      {/* Who gets emailed — global switches */}
      <section className="rounded-2xl border border-[#ADABAB]/35 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold sm:text-lg">Email recipients</h2>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          These switches apply when a paid invoice has reminders enabled on the invoice step.
        </p>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
            <div className="flex items-center gap-3">
              <Switch
                id="notify-agent"
                checked={notifyAgent}
                onCheckedChange={setNotifyAgent}
                disabled={settingsQuery.isLoading || saveSettings.isPending}
              />
              <Label htmlFor="notify-agent" className="cursor-pointer text-sm font-medium">
                Notify agent
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="notify-customer"
                checked={notifyCustomer}
                onCheckedChange={setNotifyCustomer}
                disabled={settingsQuery.isLoading || saveSettings.isPending}
              />
              <Label htmlFor="notify-customer" className="cursor-pointer text-sm font-medium">
                Notify customer
              </Label>
            </div>
          </div>

          <Can permission="quotation-motor.advance">
            <Button
              type="button"
              className="rounded-full bg-[#C20C0C]/90 hover:bg-[#C20C0C]"
              loading={saveSettings.isPending}
              onClick={() =>
                saveSettings.mutate({
                  notify_agent: notifyAgent,
                  notify_customer: notifyCustomer,
                })
              }
            >
              Save settings
            </Button>
          </Can>
        </div>

        {settingsQuery.isError ? (
          <p className="mt-3 text-sm text-red-600">
            {extractErrorMessage(settingsQuery.error)
              || 'Could not load reminder settings. The API route may not be live yet.'}
          </p>
        ) : null}
      </section>

      {/* Read-only schedule formats from product rules */}
      <section className="rounded-2xl border border-[#ADABAB]/35 bg-neutral-50/80 p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-neutral-900">Reminder schedule (read-only)</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground sm:text-sm">
          <li>
            <span className="font-medium text-neutral-800">Yearly cover</span>
            {' '}(more than 30 days): emails at 60, 30, 14, 7, and 1 day(s) before expiry, plus on the expiry day.
          </li>
          <li>
            <span className="font-medium text-neutral-800">1-month cover</span>
            {' '}(30 days or less): weekly from cover start until the final week, then 7 days, 1 day, and expiry.
          </li>
        </ul>
      </section>

      {/* Scheduled / sent log */}
      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold sm:text-lg">Reminder log</h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Rows are created when an invoice with reminders enabled is marked paid.
            </p>
          </div>
          <div className="w-full sm:w-56">
            <ReusableSelect
              control={statusForm.control}
              name="status"
              label="Status"
              options={MOTOR_REMINDER_STATUS_FILTERS.map((option) => ({ ...option }))}
            />
          </div>
        </div>

        <CustomBaseTable
          onPageChange={(page) =>
            optionsDispatcher({ payload: { page }, type: 'page' })
          }
          OtherToolsProps={{
            onChange: () => undefined,
          }}
          columns={reminderColumns}
          data={rows}
          pageCount={lastPage}
          title="Cover reminders"
          showPagination
          setPageSize={(pageSize) =>
            optionsDispatcher({ payload: { pageSize, page: 1 }, type: 'pageSize' })
          }
          pageSize={perPage || filter.pageSize}
          page={currentPage || filter.page}
          isLoading={listQuery.isLoading}
          isError={listQuery.isError}
        />
      </section>
    </div>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { ORGANIZATION_REPORTS_ORG_STORAGE_KEY } from '@/app/admin/reports/organization-reports-org'
import { OrganizationReportSummaryBoxes } from '@/app/admin/reports/organization-report-summary'
import { useOrganizationReportExport } from '@/app/admin/reports/use-organization-report-export'
import { useCan } from '@/auth/useCan'
import { useBypassOrgLocation } from '@/auth/use-bypass-org-location'
import { BypassOrgLocationPicker, EmptyState, PageHeader } from '@/components/shared'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ActionColumn } from '@/dev/columns'
import { CustomDialogComponent, ReusableSingleSelectApiInput } from '@/dev/core'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useCustomDialogContextFactory, useDebounce } from '@/hooks'
import { UseApiQuery } from '@/hooks/hooks'
import apiClient from '@/lib/api-client'
import type {
  SingleActionsHandler,
  SubmitResponse,
  TDialogComponentProps,
  TFilterOptions,
  TPaginationFilters,
} from '@/types/types'
import { EORGANIZATIONTYPES, FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import type { ColumnDef } from '@tanstack/table-core'
import { Building2, Download, Eye } from 'lucide-react'
import { useMemo, useReducer, type ComponentType } from 'react'

type ExtraFilterField = {
  key: string
  label: string
  placeholder?: string
  type?: 'text' | 'date' | 'number'
}

type OrganizationReportPageProps = {
  title: string
  description: string
  /** API path under /api/v1, e.g. reports/customers */
  listUrl: string
  exportUrl: string
  exportFilename: string
  /** RBAC module key, e.g. report-customer */
  moduleKey: string
  columns: ColumnDef<any>[]
  extraFilters?: ExtraFilterField[]
  searchPlaceholder?: string
  /** Show Overall / Success / Active / Failed boxes from API summary */
  showSummary?: boolean
  /** Show searchable By Agent filter when the user has module.aggregate */
  showAgentFilter?: boolean
  /**
   * Show searchable insurer dropdown (organization id).
   * Empty selection = all insurers. Sends filter.insurer_id to list/export.
   */
  showInsurerFilter?: boolean
  /**
   * Optional row preview: build a GET URL from the list row
   * (e.g. reports/motor/quotations/${row.id}). When set with DetailDialog,
   * adds a View action that opens the dialog with the fetched payload.
   */
  detailUrl?: (row: any) => string
  /** Dialog component — same shape as listed quotation fetch dialogs */
  DetailDialog?: ComponentType<TDialogComponentProps<{ data?: any }>>
}

/**
 * Shared filter + table + Excel export shell for organization reports.
 * Uses X-Organization-Location-Id so Super Admin can pick a branch.
 */
export function OrganizationReportPage({
  title,
  description,
  listUrl,
  exportUrl,
  exportFilename,
  moduleKey,
  columns,
  extraFilters = [],
  searchPlaceholder = 'Search…',
  showSummary = false,
  showAgentFilter = false,
  showInsurerFilter = false,
  detailUrl,
  DetailDialog,
}: OrganizationReportPageProps) {
  const { canModuleAction } = useCan()
  const canExport = canModuleAction(moduleKey, 'export')
  // Only users with aggregate can search other agents; others are forced to themselves on the API
  const canAggregate = canModuleAction(moduleKey, 'aggregate')
  const showAgentPicker = showAgentFilter && canAggregate
  const { exportReport, isExporting } = useOrganizationReportExport()

  const {
    isBypass,
    selectedLocationId,
    setLocationId,
    orgContextHeaders,
    canFetch,
    allowedLocationIds,
  } = useBypassOrgLocation(ORGANIZATION_REPORTS_ORG_STORAGE_KEY)

  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions & Record<string, string>>,
    { ...FILTEROPTIONS, page: 1, pageSize: 10 }
  )
  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  // Same dialog factory as listed quotation reports (View opens full quote detail)
  const { handleDialogContextSwitch, dialogContent, dialogOpen } =
    useCustomDialogContextFactory<{ data?: any }>()

  // Only wire View when both a detail URL builder and dialog component are provided
  const canOpenDetail = Boolean(detailUrl && DetailDialog)

  const listParams = useMemo(() => {
    const params: Record<string, string | number | undefined> = {
      page: filter.page,
      per_page: filter.pageSize,
      term: filter.term || undefined,
      sort_by: 'id',
      direction: 'desc',
      date_from: (filter as any).date_from || undefined,
      date_to: (filter as any).date_to || undefined,
    }

    // Agent filter only when the user can see organization-wide totals
    if (showAgentPicker) {
      const agentId = (filter as any).agent_id
      if (agentId !== undefined && agentId !== null && String(agentId).trim() !== '') {
        params.agent_id = String(agentId).trim()
      }
    }

    // Insurer dropdown sends organization id (empty = all insurers)
    if (showInsurerFilter) {
      const insurerId = (filter as any).insurer_id
      if (insurerId !== undefined && insurerId !== null && String(insurerId).trim() !== '') {
        params.insurer_id = String(insurerId).trim()
      }
    }

    for (const field of extraFilters) {
      // agent_id / insurer_id are handled by the searchable pickers above
      if (field.key === 'agent_id' || field.key === 'insurer_id') {
        continue
      }
      const value = (filter as any)[field.key]
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params[field.key] = String(value).trim()
      }
    }

    return params
  }, [filter, extraFilters, showAgentPicker, showInsurerFilter])

  const { data, isLoading, isError } = UseApiQuery<SubmitResponse>({
    url: listUrl,
    queryKey: [listUrl, listParams, selectedLocationId || null],
    params: listParams,
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    queryOptions: { enabled: canFetch },
  })

  // Fetch full quote (or other) detail via report-scoped show endpoint, then open dialog
  const openDetail = async (row: any) => {
    if (!detailUrl || !DetailDialog) {
      return
    }
    try {
      const response = await apiClient.get<SubmitResponse>(detailUrl(row), {
        headers: orgContextHeaders,
      })
      handleDialogContextSwitch({
        componentProps: {
          data: {
            ...(response.data?.data as Record<string, unknown>),
            // Keep list row id on the payload (matches listed motor fetch dialog)
            id: row.id,
          },
        },
        Component: DetailDialog,
      })
    } catch (error) {
      ShowToast.error(extractErrorMessage(error) || 'Failed to load details')
    }
  }

  // Append View action when preview is enabled (same pattern as listed quotation reports)
  const detailActions: SingleActionsHandler<any>[] = canOpenDetail
    ? [
        {
          label: 'View',
          icon: Eye,
          onSelect: (row) => {
            void openDetail(row)
          },
        },
      ]
    : []
  const tableColumns = canOpenDetail
    ? [...columns, ActionColumn({ ActionsHandlerMapping: detailActions })]
    : columns

  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        description={description}
        actions={
          canExport
            ? [
                {
                  label: isExporting ? 'Exporting…' : 'Export to Excel',
                  icon: Download,
                  variant: 'outline',
                  disabled: !canFetch || isExporting,
                  className:
                    'border-black text-black hover:bg-black hover:text-white',
                  onClick: () =>
                    void exportReport({
                      url: exportUrl,
                      filename: exportFilename,
                      params: listParams,
                      headers: orgContextHeaders,
                    }),
                },
              ]
            : undefined
        }
      />

      {isBypass ? (
        <Card className="shadow-none p-4">
          <BypassOrgLocationPicker
            value={selectedLocationId}
            onChange={setLocationId}
            allowedLocationIds={allowedLocationIds}
            hint="Report rows are scoped to the selected organization location."
          />
        </Card>
      ) : null}

      {!canFetch ? (
        <EmptyState
          icon={Building2}
          title="Select an organization location"
          description="Choose a branch to load this report."
        />
      ) : (
        <>
          {showSummary ? (
            <OrganizationReportSummaryBoxes
              summary={data?.summary}
              isLoading={isLoading && !data?.summary}
            />
          ) : null}

          <Card className="p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label htmlFor="date_from">Date from</Label>
                <Input
                  id="date_from"
                  type="date"
                  value={(filter as any).date_from ?? ''}
                  onChange={(e) =>
                    optionsDispatcher({
                      type: 'UPDATE',
                      payload: { date_from: e.target.value, page: 1 },
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date_to">Date to</Label>
                <Input
                  id="date_to"
                  type="date"
                  value={(filter as any).date_to ?? ''}
                  onChange={(e) =>
                    optionsDispatcher({
                      type: 'UPDATE',
                      payload: { date_to: e.target.value, page: 1 },
                    })
                  }
                />
              </div>
              {showAgentPicker ? (
                <div className="space-y-1.5" data-testid="report-agent-filter">
                  <ReusableSingleSelectApiInput
                    url="reports/motor/agents"
                    label="By Agent"
                    placeholder="All agents"
                    searchPlaceholder="Search agent…"
                    value={(filter as any).agent_id ? String((filter as any).agent_id) : ''}
                    onChange={(value) =>
                      optionsDispatcher({
                        type: 'UPDATE',
                        payload: {
                          agent_id: value ? String(value) : '',
                          page: 1,
                        },
                      })
                    }
                    config={orgContextHeaders ? { headers: orgContextHeaders } : undefined}
                    labelKey="name"
                    valueKey="id"
                  />
                </div>
              ) : null}
              {showInsurerFilter ? (
                <div className="space-y-1.5" data-testid="report-insurer-filter">
                  <ReusableSingleSelectApiInput
                    url="organization-location"
                    queryParams={{ organization_type: EORGANIZATIONTYPES.INSURER }}
                    label="Insurer"
                    placeholder="All insurers"
                    searchPlaceholder="Search insurer…"
                    emptyMessage="No insurers found"
                    // valueKey = organization id (API FiltersReportInsurer expects that)
                    valueKey="organization_id"
                    labelKey="organization_name"
                    value={
                      (filter as any).insurer_id
                        ? String((filter as any).insurer_id)
                        : ''
                    }
                    onChange={(value) =>
                      optionsDispatcher({
                        type: 'UPDATE',
                        payload: {
                          // Empty string = all insurers (clearable)
                          insurer_id: value ? String(value) : '',
                          page: 1,
                        },
                      })
                    }
                  />
                  {/* Clear selection so the user can go back to “all insurers” */}
                  {(filter as any).insurer_id ? (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                      onClick={() =>
                        optionsDispatcher({
                          type: 'UPDATE',
                          payload: { insurer_id: '', page: 1 },
                        })
                      }
                    >
                      Clear insurer
                    </button>
                  ) : null}
                </div>
              ) : null}
              {extraFilters.map((field) => {
                if (field.key === 'agent_id' || field.key === 'insurer_id') {
                  return null
                }
                return (
                  <div key={field.key} className="space-y-1.5">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <Input
                      id={field.key}
                      type={field.type ?? 'text'}
                      placeholder={field.placeholder}
                      value={(filter as any)[field.key] ?? ''}
                      onChange={(e) =>
                        optionsDispatcher({
                          type: 'UPDATE',
                          payload: { [field.key]: e.target.value, page: 1 },
                        })
                      }
                    />
                  </div>
                )
              })}
            </div>
          </Card>

          <CustomBaseTable
            onPageChange={(page) =>
              optionsDispatcher({ payload: { page }, type: 'page' })
            }
            OtherToolsProps={{
              onChange: (term: string) =>
                optionsDispatcherDebounce({ payload: { term }, type: 'term' }),
              placeholder: searchPlaceholder,
              includeFilter: true,
            }}
            columns={tableColumns}
            OtherTools={SearchTools}
            data={data?.data ?? []}
            pageCount={data?.pagination?.last_page ?? filter.page}
            title={title}
            showPagination
            setPageSize={(pageSize) =>
              optionsDispatcher({ payload: { pageSize }, type: 'pageSize' })
            }
            pageSize={data?.pagination?.per_page ?? filter.pageSize}
            page={data?.pagination?.current_page ?? filter.page}
            isLoading={isLoading}
            isError={isError}
          />
        </>
      )}

      {/* Preview dialog — same shell as listed quotation reports */}
      {canOpenDetail ? (
        <CustomDialogComponent
          handleDialogContextSwitch={handleDialogContextSwitch}
          dialogOpen={dialogOpen}
          className="sm:max-w-3xl w-[95vw] p-4 sm:p-6"
        >
          {dialogContent?.Component && (
            <dialogContent.Component
              componentProps={dialogContent.componentProps}
              handleDialogContextSwitch={handleDialogContextSwitch}
            />
          )}
        </CustomDialogComponent>
      ) : null}
    </div>
  )
}

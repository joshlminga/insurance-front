/* eslint-disable @typescript-eslint/no-explicit-any */
import { ORGANIZATION_REPORTS_ORG_STORAGE_KEY } from '@/app/admin/reports/organization-reports-org'
import { useOrganizationReportExport } from '@/app/admin/reports/use-organization-report-export'
import { useCan } from '@/auth/useCan'
import { useBypassOrgLocation } from '@/auth/use-bypass-org-location'
import { BypassOrgLocationPicker, EmptyState, PageHeader } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useDebounce } from '@/hooks'
import { UseApiQuery } from '@/hooks/hooks'
import type { SubmitResponse, TFilterOptions, TPaginationFilters } from '@/types/types'
import { FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import type { ColumnDef } from '@tanstack/table-core'
import { Building2, Download } from 'lucide-react'
import { useMemo, useReducer } from 'react'

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
}: OrganizationReportPageProps) {
  const { canModuleAction } = useCan()
  const canExport = canModuleAction(moduleKey, 'export')
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

    for (const field of extraFilters) {
      const value = (filter as any)[field.key]
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params[field.key] = String(value).trim()
      }
    }

    return params
  }, [filter, extraFilters])

  const { data, isLoading, isError } = UseApiQuery<SubmitResponse>({
    url: listUrl,
    queryKey: [listUrl, listParams, selectedLocationId || null],
    params: listParams,
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    queryOptions: { enabled: canFetch },
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title={title} description={description} />
        {canExport && (
          <Button
            type="button"
            variant="outline"
            disabled={!canFetch || isExporting}
            onClick={() =>
              void exportReport({
                url: exportUrl,
                filename: exportFilename,
                params: listParams,
                headers: orgContextHeaders,
              })
            }
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting…' : 'Export Excel'}
          </Button>
        )}
      </div>

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
              {extraFilters.map((field) => (
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
              ))}
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
            columns={columns}
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
    </div>
  )
}

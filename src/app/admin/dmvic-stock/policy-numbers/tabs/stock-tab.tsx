/* eslint-disable @typescript-eslint/no-explicit-any */
import { useBypassOrgLocation } from '@/auth/use-bypass-org-location'
import { useCan } from '@/auth/useCan'
import { MODULES } from '@/auth/module-keys'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ActionColumn } from '@/dev/columns'
import { DmvicStockColumns } from '@/dev/columns/admin/dmvic-stock'
import { ReuseableSelectInsurerInput } from '@/dev/core'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useDebounce } from '@/hooks'
import { UseApiQuery } from '@/hooks/hooks'
import type {
  DmvicBrokerStockRow,
  SingleActionsHandler,
  SubmitResponse,
  TFilterOptions,
  TPaginationFilters,
} from '@/types/types'
import {
  DMVIC_CERTIFICATE_TYPES,
  FILTEROPTIONS,
  ReusableReducer,
} from '@/utils/constatnts'
import { EROUTES } from '@/utils/enums'
import { useReducer } from 'react'
import { useNavigate } from 'react-router-dom'
import { DMVIC_STOCK_ORG_STORAGE_KEY } from '../../dmvic-stock-org'

export type PoliciesStockStatus = 'in_stock' | 'out_of_stock'

type PoliciesFilters = TPaginationFilters &
  TFilterOptions & {
    insurer_location_id?: string
    type_of_certificate?: string
  }

type PoliciesStockTabProps = {
  /** Maps to API stock_status: in_stock (stock > 0) or out_of_stock (stock = 0). */
  stockStatus: PoliciesStockStatus
  title: string
}

/**
 * Shared Policies list body — insurer + certificate filters + stock_status from the tab.
 */
export default function PoliciesStockTab({
  stockStatus,
  title,
}: PoliciesStockTabProps) {
  const navigate = useNavigate()
  const { canModuleAction } = useCan()
  const canRead = canModuleAction(MODULES.DMVIC_STOCK, 'read')

  const {
    selectedLocationId,
    orgContextHeaders,
    canFetch,
  } = useBypassOrgLocation(DMVIC_STOCK_ORG_STORAGE_KEY)

  const STOCK_PAGE_SIZE = 10

  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<PoliciesFilters>,
    {
      ...FILTEROPTIONS,
      page: 1,
      pageSize: STOCK_PAGE_SIZE,
      insurer_location_id: '',
      type_of_certificate: '',
    },
  )
  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  const insurerLocationId = filter.insurer_location_id?.trim() || undefined
  const certificateType = filter.type_of_certificate?.trim() || undefined

  const { data, isLoading, isError } = UseApiQuery<SubmitResponse>({
    url: 'dmvic/stocks',
    queryKey: [
      'dmvic/stocks/policies',
      stockStatus,
      filter,
      selectedLocationId || null,
    ],
    params: {
      page: filter.page,
      sort_by: 'id',
      direction: 'desc',
      term: filter.term || undefined,
      insurer_location_id: insurerLocationId || undefined,
      type_of_certificate: certificateType || undefined,
      stock_status: stockStatus,
    },
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    queryOptions: { enabled: canFetch },
  })

  const hasActiveFilters = Boolean(insurerLocationId || certificateType)

  const clearFilters = () => {
    optionsDispatcher({
      type: 'UPDATE',
      payload: {
        insurer_location_id: '',
        type_of_certificate: '',
        page: 1,
      },
    })
  }

  const ActionsHandlerMapping: SingleActionsHandler<DmvicBrokerStockRow>[] = [
    {
      label: 'Open rules',
      onSelect: (row) => navigate(`${EROUTES.DMVIC_STOCK}/${row.id}`),
      conditional: () => canRead,
    },
  ]

  return (
    <div className="space-y-4">
      <Card className="shadow-none p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-end">
          <ReuseableSelectInsurerInput
            label="Insurer + Location"
            placeholder="e.g. Britam Kenya"
            value={filter.insurer_location_id ?? ''}
            onChange={(value) =>
              optionsDispatcher({
                type: 'UPDATE',
                payload: {
                  insurer_location_id: String(value ?? ''),
                  page: 1,
                },
              })
            }
          />

          <div className="space-y-2">
            <Label htmlFor={`type_of_certificate_${stockStatus}`}>
              Certificate Type
            </Label>
            <Select
              // Empty filter = "all"; Radix needs a real value, so we use __all__.
              value={filter.type_of_certificate || '__all__'}
              onValueChange={(value) =>
                optionsDispatcher({
                  type: 'UPDATE',
                  payload: {
                    type_of_certificate: value === '__all__' ? '' : value,
                    page: 1,
                  },
                })
              }
            >
              <SelectTrigger id={`type_of_certificate_${stockStatus}`}>
                <SelectValue placeholder="All certificate types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All certificate types</SelectItem>
                {DMVIC_CERTIFICATE_TYPES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Button
              type="button"
              variant="outline"
              disabled={!hasActiveFilters}
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          </div>
        </div>
      </Card>

      <div className="w-full">
        <CustomBaseTable
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
            columns: [
              ...DmvicStockColumns,
              ActionColumn({ ActionsHandlerMapping }),
            ],
            OtherTools: SearchTools,
            data: data?.data ?? [],
            pageCount: data?.pagination?.last_page ?? 1,
            title,
            showPagination: true,
            setPageSize: (pageSize) =>
              optionsDispatcher({
                payload: { pageSize },
                type: 'pageSize',
              }),
            pageSize: data?.pagination?.per_page ?? STOCK_PAGE_SIZE,
            page: data?.pagination?.current_page ?? filter.page,
            isLoading: isLoading,
            isError: isError,
          }}
        />
      </div>
    </div>
  )
}

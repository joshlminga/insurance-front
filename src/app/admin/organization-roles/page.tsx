/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAbilities } from "@/auth/useAbilities"
import {
  isPlatformSuperAdmin,
  uniqueScopedLocationIds,
} from "@/auth/org-context"
import { PageHeader } from "@/components/shared"
import { ActionColumn } from "@/dev/columns"
import { OrganizationRolesOrgsColumns } from "@/dev/columns/admin/organization-roles-orgs"
import { CustomBaseTable, SearchTools } from "@/dev/table"
import { useDebounce } from "@/hooks"
import { UseApiQuery } from "@/hooks/hooks"
import { SingleActionsHandler, SubmitResponse, TFilterOptions, TPaginationFilters } from "@/types/types"
import { FILTEROPTIONS, ReusableReducer } from "@/utils/constatnts"
import { EROUTES } from "@/utils/enums"
import { useEffect, useMemo, useReducer } from "react"
import { useNavigate } from "react-router-dom"

import { extractOrgLocationsFromResponse, getOrgLocationId } from "./role-utils"

const OrganizationRolesPage = () => {
  const navigate = useNavigate()
  const { abilities, locationOptions } = useAbilities()
  const scopedLocationIds = useMemo(
    () => uniqueScopedLocationIds(abilities),
    [abilities],
  )
  const skipOrgPicker =
    !isPlatformSuperAdmin(abilities) && scopedLocationIds.length === 1

  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: 15 }
  )

  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  useEffect(() => {
    if (!skipOrgPicker) return
    const locationId = scopedLocationIds[0] ?? locationOptions[0]?.locationId
    if (!locationId) return
    navigate(`${EROUTES.ORGANIZATION_ROLES}/${locationId}`, { replace: true })
  }, [skipOrgPicker, scopedLocationIds, locationOptions, navigate])

  const { data, isLoading, isError } = UseApiQuery<SubmitResponse>({
    url: "organization-location",
    params: {
      page: filter.page,
      pageSize: filter.pageSize,
      term: filter.term,
    },
    queryOptions: {
      enabled: !skipOrgPicker,
    },
  })

  const ActionsHandlerMapping: SingleActionsHandler<any>[] = [
    {
      label: "View Roles",
      onSelect: (rowData) => {
        const orgLocationId = getOrgLocationId(rowData)
        if (!orgLocationId) return
        navigate(`${EROUTES.ORGANIZATION_ROLES}/${orgLocationId}`)
      },
      conditional: (rowData) => Boolean(getOrgLocationId(rowData)),
    },
  ]

  const rawTableData = extractOrgLocationsFromResponse(data)
  const tableData =
    !isPlatformSuperAdmin(abilities) && scopedLocationIds.length > 0
      ? rawTableData.filter((row: any) => {
          const id = Number(getOrgLocationId(row))
          return scopedLocationIds.includes(id)
        })
      : rawTableData

  if (skipOrgPicker) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Loading organizations...
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Organization Roles"
        description="Select an organization to manage its roles and permissions"
      />

      <div className="w-full">
        <CustomBaseTable
          {...{
            onPageChange: (page) =>
              optionsDispatcher({
                payload: { page },
                type: "page",
              }),
            OtherToolsProps: {
              onChange: (term: any) =>
                optionsDispatcherDebounce({
                  payload: { term },
                  type: "term",
                }),
              placeholder: "Search organizations",
              includeFilter: true,
            },
            columns: [
              ...OrganizationRolesOrgsColumns,
              ActionColumn({ ActionsHandlerMapping }),
            ],
            OtherTools: SearchTools,
            data: tableData,
            pageCount:
              (data as any)?.data?.pagination?.last_page ??
              (data as any)?.pagination?.last_page ??
              1,
            title: "Organizations",
            showPagination: true,
            setPageSize: (pageSize) =>
              optionsDispatcher({
                payload: { pageSize },
                type: "pageSize",
              }),
            pageSize:
              (data as any)?.data?.pagination?.per_page ??
              (data as any)?.pagination?.per_page ??
              10,
            page:
              (data as any)?.data?.pagination?.current_page ??
              (data as any)?.pagination?.current_page ??
              1,
            isLoading,
            isError,
          }}
        />
      </div>
    </div>
  )
}

export default OrganizationRolesPage

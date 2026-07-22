/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAbilities } from "@/auth/useAbilities"
import { PageHeader } from "@/components/shared"
import { ActionColumn } from "@/dev/columns"
import { OrganizationRolesOrgsColumns } from "@/dev/columns/admin/organization-roles-orgs"
import { CustomBaseTable, SearchTools } from "@/dev/table"
import { useDebounce } from "@/hooks"
import { UseApiQuery } from "@/hooks/hooks"
import { SingleActionsHandler, SubmitResponse, TFilterOptions, TPaginationFilters } from "@/types/types"
import { FILTEROPTIONS, ReusableReducer } from "@/utils/constatnts"
import { EROUTES } from "@/utils/enums"
import { useEffect, useReducer } from "react"
import { useNavigate } from "react-router-dom"

import {
  extractOrgLocationsFromResponse,
  getOrgLocationId,
} from "../organization-roles/role-utils"

/**
 * Landing page: pick which organization's members to manage.
 * If the logged-in user belongs to exactly one scoped location (from
 * abilities.scopes), skip the picker and go straight to that members table.
 */
const OrganizationMembersPage = () => {
  const navigate = useNavigate()
  const { locationOptions } = useAbilities()

  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: 15 }
  )

  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  // Single scoped location → skip the picker (replace history so Back doesn't loop)
  useEffect(() => {
    if (locationOptions.length !== 1) return

    const locationId = locationOptions[0]?.locationId
    if (!locationId) return

    navigate(`${EROUTES.ORGANIZATION_MEMBERS}/${locationId}`, { replace: true })
  }, [locationOptions, navigate])

  // Full organizations list for the picker table (scoped by user permission on the API)
  const { data, isLoading, isError } = UseApiQuery<SubmitResponse>({
    url: "organization-location",
    params: {
      page: filter.page,
      pageSize: filter.pageSize,
      term: filter.term,
    },
    queryOptions: {
      enabled: locationOptions.length !== 1,
    },
  })

  const ActionsHandlerMapping: SingleActionsHandler<any>[] = [
    {
      label: "View Members",
      onSelect: (rowData) => {
        const orgLocationId = getOrgLocationId(rowData)
        if (!orgLocationId) return
        navigate(`${EROUTES.ORGANIZATION_MEMBERS}/${orgLocationId}`)
      },
      conditional: (rowData) => Boolean(getOrgLocationId(rowData)),
    },
  ]

  const tableData = extractOrgLocationsFromResponse(data)

  // Avoid a flash of the picker while redirecting for single-scope users
  if (locationOptions.length === 1) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Loading organizations...
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Organization Members"
        description="Select an organization to manage its members"
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

export default OrganizationMembersPage

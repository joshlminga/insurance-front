/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAbilities } from "@/auth/useAbilities"
import { PageHeader } from "@/components/shared"
import { ActionColumn } from "@/dev/columns"
import { 
  OrganizationRolesOrgsColumns 
} from "@/dev/columns/admin/organization-roles-orgs"
import { 
  CustomBaseTable, 
  SearchTools 
} from "@/dev/table"
import { useDebounce } from "@/hooks"
import { UseApiQuery } from "@/hooks/hooks"
import { 
  SingleActionsHandler, 
  SubmitResponse, 
  TFilterOptions,
   TPaginationFilters 
  } from "@/types/types"
import { FILTEROPTIONS, ReusableReducer } from "@/utils/constatnts"
import { EROUTES } from "@/utils/enums"
import { useEffect, useReducer } from "react"
import { useNavigate } from "react-router-dom"

import {
  extractOrgLocationsFromResponse,
  getOrgLocationId,
} from "../organization-roles/role-utils"

const OrganizationMembersPage = () => {
  const navigate = useNavigate()
  const { locationOptions, isBypass } = useAbilities()
  // Only non-bypass users with exactly one scoped location skip the org picker
  const skipOrgPicker = !isBypass && locationOptions.length === 1

  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: 15 }
  )

  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  // Single scoped non-bypass location → skip picker (replace so Back does not loop)
  useEffect(() => {
    if (!skipOrgPicker) return
    const locationId = locationOptions[0]?.locationId
    if (!locationId) return
    navigate(`${EROUTES.ORGANIZATION_MEMBERS}/${locationId}`, { replace: true })
  }, [skipOrgPicker, locationOptions, navigate])

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
      label: "View Users",
      onSelect: (rowData) => {
        const orgLocationId = getOrgLocationId(rowData)
        if (!orgLocationId) return
        navigate(`${EROUTES.ORGANIZATION_MEMBERS}/${orgLocationId}`)
      },
      conditional: (rowData) => !!(getOrgLocationId(rowData)),
    },
  ]
  const tableData = extractOrgLocationsFromResponse(data)
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
            pageCount:data?.data?.pagination?.last_page ?? 1,
            title: "Organizations",
            showPagination: true,
            setPageSize: (pageSize) =>
              optionsDispatcher({
                payload: { pageSize },
                type: "pageSize",
              }),
            pageSize:data?.data?.pagination?.per_page ?? filter?.pageSize,
            page:data?.data?.pagination?.current_page ?? filter?.page,
            isLoading,
            isError,
          }}
        />
      </div>
    </div>
  )
}

export default OrganizationMembersPage

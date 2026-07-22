/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from "@/components/shared"
import { ActionColumn } from "@/dev/columns"
import { OrganizationRolesOrgsColumns } from "@/dev/columns/admin/organization-roles-orgs"
import { CustomBaseTable, SearchTools } from "@/dev/table"
import { useDebounce } from "@/hooks"
import { UseApiQuery } from "@/hooks/hooks"
import { SingleActionsHandler, SubmitResponse, TFilterOptions, TPaginationFilters } from "@/types/types"
import { FILTEROPTIONS, ReusableReducer } from "@/utils/constatnts"
import { EROUTES } from "@/utils/enums"
import { useReducer } from "react"
import { useNavigate } from "react-router-dom"

import { extractOrgLocationsFromResponse, getOrgLocationId } from "./role-utils"

const OrganizationRolesPage = () => {
  const navigate = useNavigate()

  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: 15 }
  )

  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  const { data, isLoading, isError } = UseApiQuery<SubmitResponse>({
    url: "organization-location",
    params: {
      page: filter.page,
      pageSize: filter.pageSize,
      term: filter.term,
    },
    queryOptions: {
      enabled: true,
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

  const tableData = extractOrgLocationsFromResponse(data)

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

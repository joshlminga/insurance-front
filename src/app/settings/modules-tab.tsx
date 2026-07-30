import { Fragment, useMemo, useState } from "react"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UseApiQuery } from "@/hooks/hooks"
import { useDebounce } from "@/hooks"
import type { RbacModule, RbacModulesCatalogData } from "@/types/rbac-modules"
import type { SubmitResponse } from "@/types/types"

type RbacModulesCatalogResponse = Omit<SubmitResponse, "data"> & {
  data: RbacModulesCatalogData
}

interface ModulesTabProps {
  enabled: boolean
}

const PAGE_SIZE = 10

export function ModulesTab({ enabled }: ModulesTabProps) {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [expandedModuleKey, setExpandedModuleKey] = useState<string | null>(null)

  const debouncedSearchHandler = useDebounce<string>({
    debounceCallback: setDebouncedSearch,
  })

  const { data, isLoading, isError, refetch } = UseApiQuery<RbacModulesCatalogResponse>({
    url: "rbac-modules/catalog",
    params: {
      modules: debouncedSearch || undefined,
    },
    queryOptions: {
      enabled,
      staleTime: 5 * 60 * 1000,
    },
  })

  const modules = useMemo<RbacModule[]>(() => {
    const list = data?.data?.modules ?? []
    return [...list].sort((a, b) => a.label.localeCompare(b.label))
  }, [data?.data?.modules])
  const totalPages = Math.ceil(modules.length / PAGE_SIZE)
  const currentPage = totalPages > 0 ? Math.min(page, totalPages) : 1

  const paginatedModules = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE
    return modules.slice(startIndex, startIndex + PAGE_SIZE)
  }, [modules, currentPage])

  const handleSearchChange = (value: string) => {
    const trimmedValue = value.trim()
    setSearch(value)
    setPage(1)
    setExpandedModuleKey(null)
    debouncedSearchHandler(trimmedValue)
  }

  const toggleExpandedModule = (moduleKey: string) => {
    setExpandedModuleKey((currentKey) => (currentKey === moduleKey ? null : moduleKey))
  }

  const firstVisibleRow = modules.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0
  const lastVisibleRow = Math.min(currentPage * PAGE_SIZE, modules.length)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modules</CardTitle>
        <CardDescription>
          View RBAC modules and the permissions attached to each module.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by module slug (e.g. user or user,rbac)"
            value={search}
            onChange={(event) => handleSearchChange(event.currentTarget.value)}
            className="pl-9"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Group</TableHead>
                <TableHead className="text-right">Permissions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 4 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-sm text-muted-foreground">Error fetching modules.</p>
                      <Button variant="outline" size="sm" onClick={() => refetch()}>
                        Retry
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedModules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No modules found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedModules.map((module) => {
                  const isExpanded = expandedModuleKey === module.key

                  return (
                    <Fragment key={module.key}>
                      <TableRow
                        onClick={() => toggleExpandedModule(module.key)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ChevronDown
                              className={`h-4 w-4 text-muted-foreground transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                            <span className="font-medium">{module.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{module.key}</TableCell>
                        <TableCell>{module.group}</TableCell>
                        <TableCell className="text-right">{module.actions.length}</TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow key={`${module.key}-actions`} className="bg-muted/30 hover:bg-muted/30">
                          <TableCell colSpan={4} className="p-4">
                            <div className="rounded-md border bg-background">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Permission ID</TableHead>
                                    <TableHead>Action Key</TableHead>
                                    <TableHead>Description</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {module.actions.length === 0 ? (
                                    <TableRow>
                                      <TableCell colSpan={3} className="h-16 text-center text-muted-foreground">
                                        No permissions found for this module
                                      </TableCell>
                                    </TableRow>
                                  ) : (
                                    module.actions.map((action) => (
                                      <TableRow key={`${module.key}-${action.permission_id}`}>
                                        <TableCell>{action.permission_id}</TableCell>
                                        <TableCell className="font-mono text-xs">{action.key}</TableCell>
                                        <TableCell className="whitespace-normal">{action.description}</TableCell>
                                      </TableRow>
                                    ))
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {modules.length > 0 ? `${firstVisibleRow}-${lastVisibleRow} of ${modules.length}` : "0 results"}
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPage(1)}
              disabled={currentPage === 1 || totalPages === 0}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || totalPages === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-sm">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPage(totalPages)}
              disabled={currentPage >= totalPages || totalPages === 0}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

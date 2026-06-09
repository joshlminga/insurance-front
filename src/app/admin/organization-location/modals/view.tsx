/* eslint-disable @typescript-eslint/no-explicit-any */
import { DetailGrid, DetailItem } from "@/components/shared"
import { Badge } from "@/components/ui/badge"
import { UseApiQuery } from "@/hooks/hooks"
import { SubmitResponse } from "@/types/types"

const getLocationId = (location: Record<string, any>) =>
  location?.organization_location_id ?? location?.organizationLocationId ?? location?.id

const normalizeLogoUrl = (logoUrlOrPath?: string | null) => {
  if (!logoUrlOrPath) return ""
  if (/^https?:\/\//i.test(logoUrlOrPath)) return logoUrlOrPath
  const base = import.meta.env.VITE_BASE_URL
  return base ? `${base}/${logoUrlOrPath}` : logoUrlOrPath
}

export const ViewOrganizationLocationModal = ({
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: any
}) => {
  const locationId = getLocationId(componentProps?.data ?? {})

  const { data, isLoading } = UseApiQuery<SubmitResponse>({
    url: `organization-location/${locationId}`,
    queryOptions: {
      enabled: Boolean(locationId),
    },
  })

  const location = (data as any)?.data?.location ?? componentProps?.data ?? {}
  const country = location?.country ?? {}
  const meta = location?.meta ?? {}

  const isDefault = Boolean(location?.is_default)
  const isActive = Boolean(location?.is_active)
  const logoValue = location?.logo_url ?? meta?.logo_url ?? meta?.logo ?? location?.logo
  const logoUrl = normalizeLogoUrl(logoValue)
  const products = Array.isArray(location?.products) ? location.products : []

  return (
    <div className="w-full min-w-[600px] max-w-[860px] space-y-6 p-6">
      <div className="border-b pb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Organization Location Details</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View organization location profile and metadata.
          </p>
        </div>
      </div>

      {!locationId ? (
        <div className="text-sm text-destructive">
          Unable to load organization location details: missing organization location id.
        </div>
      ) : isLoading ? (
        <div className="text-sm text-muted-foreground">
          Loading organization location details...
        </div>
      ) : (
        <>
          <DetailGrid columns={2}>
            <DetailItem
              label="Organization"
              value={location?.organization_name ?? location?.organization?.name ?? "N/A"}
            />
            <DetailItem label="Domain" value={location?.domain ?? "N/A"} />
            <DetailItem label="Country" value={country?.name ?? "N/A"} />
            <DetailItem label="Initials" value={meta?.initials ?? location?.initials ?? "-"} />
            <DetailItem
              label="Default"
              value={
                <Badge
                  className={`rounded-full text-white ${isDefault ? "bg-cyan-500" : "bg-red-500"}`}
                >
                  {isDefault ? "Default" : "Non-default"}
                </Badge>
              }
            />
            <DetailItem
              label="Status"
              value={
                <Badge
                  className={`rounded-full text-white ${isActive ? "bg-green-500" : "bg-red-500"}`}
                >
                  {isActive ? "Active" : "Inactive"}
                </Badge>
              }
            />
            <DetailItem label="Slug" value={location?.slug ?? "N/A"} />
            <DetailItem
              label="Logo"
              value={
                logoUrl ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={logoUrl}
                      className="h-20 w-20 rounded border object-contain bg-white"
                    />
                  </div>
                ) : (
                  "-"
                )
              }
            />
          </DetailGrid>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Products</h3>
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">-</p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="px-3 py-2 font-medium">Product</th>
                      <th className="px-3 py-2 font-medium">Public</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((item: any, index: number) => {
                      const productIsActive = Boolean(item?.is_active)
                      const isPublic = Boolean(item?.access_public)

                      return (
                        <tr key={`${item?.product ?? "product"}-${index}`} className="border-b last:border-b-0">
                          <td className="px-3 py-2">{item?.product ?? "N/A"}</td>
                          <td className="px-3 py-2">
                            <Badge
                              className={`rounded-full text-white ${isPublic ? "bg-blue-500" : "bg-slate-500"}`}
                            >
                              {isPublic ? "Yes" : "No"}
                            </Badge>
                          </td>
                          <td className="px-3 py-2">
                            <Badge
                              className={`rounded-full text-white ${productIsActive ? "bg-green-500" : "bg-red-500"}`}
                            >
                              {productIsActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ViewOrganizationLocationModal


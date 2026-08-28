import type { QueryClient } from "@tanstack/react-query"
import type { SubmitResponse } from "@/types/types"

export function getOrganizationLocationShowUrl(locationId: string | number) {
  return `organization-location/${locationId}`
}

export function getOrganizationLocationShowQueryKey(locationId: string | number) {
  return [getOrganizationLocationShowUrl(locationId), undefined] as const
}

export function getOrganizationLocationFromResponse(response: unknown) {
  const payload = response as SubmitResponse
  return payload?.data?.location ?? payload?.data?.organization_location ?? null
}

export function isOrganizationLocationMutationSuccess(response: unknown) {
  const payload = response as SubmitResponse
  if (payload?.success === false || payload?.success === "false") return false

  const { success } = payload ?? {}
  if (typeof success === "boolean") return success
  if (typeof success === "string") {
    return success.toLowerCase() === "true" || success === "1"
  }

  return true
}

/** Update show/view query cache from update response, or refetch show when location is missing. */
export async function refreshOrganizationLocationShowCache(
  queryClient: QueryClient,
  locationId: string | number,
  response: SubmitResponse,
  refetchShow?: () => Promise<unknown>
) {
  const queryKey = getOrganizationLocationShowQueryKey(locationId)

  if (getOrganizationLocationFromResponse(response)) {
    queryClient.setQueryData(queryKey, response)
    return
  }

  if (refetchShow) {
    await refetchShow()
    return
  }

  await queryClient.invalidateQueries({ queryKey: [...queryKey], exact: true })
}

export function isOrganizationLocationProductActive(product: {
  is_active?: boolean
  product_status?: boolean
}) {
  if (typeof product?.is_active === "boolean") return product.is_active
  if (typeof product?.product_status === "boolean") return product.product_status
  return Boolean(product?.is_active ?? product?.product_status ?? true)
}

/** Refetch only the paginated organization-location list (not show/detail queries). */
export async function refreshOrganizationLocationList(queryClient: QueryClient) {
  await queryClient.invalidateQueries({
    predicate: (query) => query.queryKey[0] === "organization-location",
  })
}

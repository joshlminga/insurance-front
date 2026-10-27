/* eslint-disable @typescript-eslint/no-explicit-any */
import { DetailGrid, DetailItem } from "@/components/shared"
import { Badge } from "@/components/ui/badge"
import { CardFooter } from "@/components/ui/card"
import { Button } from "@/dev/core"
import { UseApiQuery } from "@/hooks/hooks"
import { SubmitResponse } from "@/types/types"
import { EPREFIX } from "@/utils/enums"
import { formatDate } from "@/utils/helpers"
import { ArrowUpRight } from "lucide-react"

const yesNoLabel = (value: unknown) =>
  value === true || value === "true" ? "Yes" : "No"

export const ViewTravelProductModal = ({ handleDialogContextSwitch, componentProps }: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: any
}) => {
  const productId = componentProps?.data?.id
  const { data, isLoading } = UseApiQuery<SubmitResponse>({
    url: `products/travel/${productId}`,
    queryOptions: {
      enabled: Boolean(productId),
    },
  })

  const product = data?.data?.product ?? componentProps?.data ?? {}
  const baseLocation = product?.base_location ?? {}
  const organization = product?.organization ?? {}
  const currency = product?.currency ?? {}
  const targets: any[] = Array.isArray(product?.targets) ? product.targets : []
  const coverages: any[] = Array.isArray(product?.coverages) ? product.coverages : []
  const hasRules = product?.has_rules === true || product?.has_rules === "true"
  const isPublic = product?.for_public === true || product?.for_public === "true"
  const customRules: Array<{ key?: string; value?: string | null }> = Array.isArray(
    product?.custom_rules
  )
    ? product.custom_rules
    : []

  return (
    <div className="w-full min-w-[600px] max-w-[760px] max-h-[85vh] overflow-y-auto p-6 space-y-6">
      <div className="border-b pb-3 space-y-3">
        <div>
          <h2 className="text-xl font-semibold">Travel Product Details</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View the insurer, who can see this product, and whether it uses insurer APIs.
          </p>
        </div>
        {productId ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              leftIcon={<ArrowUpRight />}
              onClick={() => {
                const path = `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/travel-rates/${productId}`
                window.open(path, "_blank", "noopener,noreferrer")
              }}>
              View Rates
            </Button>
            <Button
              type="button"
              variant="outline"
              leftIcon={<ArrowUpRight />}
              onClick={() => {
                const path = `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/travel-benefits/${productId}`
                window.open(path, "_blank", "noopener,noreferrer")
              }}>
              View Benefits
            </Button>
          </div>
        ) : null}
      </div>

      {!productId ? (
        <div className="text-sm text-destructive">Unable to load product details: missing product id.</div>
      ) : isLoading ? (
        <div className="text-sm text-muted-foreground">Loading product details...</div>
      ) : (
        <div className="space-y-6">
          <DetailGrid columns={2}>
            <DetailItem label="Product Name" value={product?.name ?? "N/A"} />
            <DetailItem label="Office Name" value={product?.officename ?? "N/A"} />
            <DetailItem
              label="Insurer"
              value={organization?.name ?? baseLocation?.organization_name ?? "N/A"}
            />
            <DetailItem
              label="Public / Private"
              value={
                <Badge className={`rounded-full text-white ${isPublic ? "bg-blue-600" : "bg-slate-600"}`}>
                  {isPublic ? "Public" : "Private"}
                </Badge>
              }
            />
            <DetailItem label="Levy Applied" value={yesNoLabel(product?.levy_applied)} />
            <DetailItem
              label="Currency"
              value={currency?.code ?? currency?.name ?? "N/A"}
            />
            <DetailItem label="Start Date" value={formatDate(product?.start_date)} />
            <DetailItem label="Expiry Date" value={formatDate(product?.expiry_date)} />
            <DetailItem
              label="Status"
              value={
                <Badge className={`rounded-full text-white ${product?.is_active ? "bg-green-500" : "bg-red-500"}`}>
                  {product?.is_active ? "Active" : "Inactive"}
                </Badge>
              }
            />
            <DetailItem label="Has Rules" value={hasRules ? "Yes" : "No"} />
            {hasRules ? (
              <DetailItem label="Quotation API" value={yesNoLabel(product?.quotation_api)} />
            ) : null}
            {hasRules ? (
              <DetailItem label="Policy API" value={yesNoLabel(product?.policy_api)} />
            ) : null}
            {hasRules ? (
              <DetailItem label="Payment API" value={yesNoLabel(product?.payment_api)} />
            ) : null}
            {hasRules ? (
              <DetailItem label="Certificate API" value={yesNoLabel(product?.certificate_api)} />
            ) : null}
          </DetailGrid>

          {hasRules ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Custom rules</p>
              {customRules.length === 0 ? (
                <p className="text-sm text-muted-foreground">No custom rules set.</p>
              ) : (
                <DetailGrid columns={2}>
                  {customRules.map((rule, index) => (
                    <DetailItem
                      key={`${rule?.key ?? "rule"}-${index}`}
                      label={rule?.key ?? "Key"}
                      value={rule?.value != null && rule.value !== "" ? String(rule.value) : "—"}
                    />
                  ))}
                </DetailGrid>
              )}
            </div>
          ) : null}

          {!isPublic ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Target Organizations</p>
              {targets.length === 0 ? (
                <p className="text-sm text-muted-foreground">No target organizations mapped.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {targets.map((target, index) => (
                    <Badge key={target?.organization_location_id ?? index} variant="outline" className="rounded-full">
                      {target?.targeted_organization_name ?? target?.organization_name ?? "N/A"}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Coverages</p>
            {coverages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No coverages attached.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {coverages.map((coverage, index) => (
                  <Badge key={coverage?.id ?? index} variant="outline" className="rounded-full">
                    {coverage?.coverage_name ?? "Coverage"} · {coverage?.bound_type ?? "N/A"}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <CardFooter className="px-0 pt-2">
        <Button
          type="button"
          className="rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
          onClick={() => handleDialogContextSwitch({ state: false })}>
          Close
        </Button>
      </CardFooter>
    </div>
  )
}

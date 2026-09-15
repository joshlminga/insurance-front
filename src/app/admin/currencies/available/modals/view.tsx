/* eslint-disable @typescript-eslint/no-explicit-any */
import { DetailGrid, DetailItem } from "@/components/shared"
import { Badge } from "@/components/ui/badge"
import { CardFooter } from "@/components/ui/card"
import { Button } from "@/dev/core"
import { UseApiQuery } from "@/hooks/hooks"
import type { SubmitResponse } from "@/types/types"

export function ViewCurrencyModal({
  componentProps,
  handleDialogContextSwitch,
}: {
  componentProps?: any
  handleDialogContextSwitch: (context?: any) => void
}) {
  const currencyId = componentProps?.data?.id
  const { data, isLoading } = UseApiQuery<SubmitResponse>({
    url: `atu/multicurrency/currencies/${currencyId}`,
    queryOptions: {
      enabled: Boolean(currencyId),
    },
  })

  const currency = data?.data ?? {}
  const rateMode =
    currency?.rate_mode ?? (currency?.is_auto ? "Auto" : "Manual")
  const status =
    currency?.status ?? (currency?.is_active ? "Active" : "Inactive")
  const isActive = status === "Active" || currency?.is_active === true

  return (
    <div className="w-full min-w-[min(100%,36rem)] max-w-xl p-2 sm:p-4 space-y-5">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Currency Details</h2>
        <p className="text-sm text-muted-foreground mt-1">
          View currency rate, type, and status information.
        </p>
      </div>

      {!currencyId ? (
        <div className="text-sm text-destructive">
          Unable to load currency: missing id.
        </div>
      ) : isLoading ? (
        <div className="text-sm text-muted-foreground">Loading currency…</div>
      ) : (
        <DetailGrid columns={2}>
          <DetailItem label="ID" value={currency?.id ?? "—"} />
          <DetailItem label="Code" value={currency?.code ?? "—"} />
          <DetailItem label="Symbol" value={currency?.symbol ?? "—"} />
          <DetailItem label="Name" value={currency?.name ?? "—"} />
          <DetailItem label="Rate" value={currency?.rate ?? "—"} />
          <DetailItem label="Type" value={rateMode} />
          <DetailItem
            label="Fee"
            value={
              currency?.fee === null || currency?.fee === undefined
                ? "—"
                : currency.fee
            }
          />
          <DetailItem label="Country" value={currency?.country ?? "—"} />
          <DetailItem
            label="Default"
            value={currency?.is_default ? "Yes" : "No"}
          />
          <DetailItem
            label="Status"
            value={
              <Badge
                className={`rounded-lg font-semibold ${
                  isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {status}
              </Badge>
            }
          />
        </DetailGrid>
      )}

      <CardFooter className="px-0 pt-2">
        <Button
          type="button"
          className="rounded-md border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
          onClick={() => handleDialogContextSwitch({})}
        >
          Close
        </Button>
      </CardFooter>
    </div>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge"
import { Button } from "@/dev/core"
import type { ReactNode } from "react"

const joinNames = (zones: unknown): string => {
  if (!Array.isArray(zones) || zones.length === 0) return "—"
  return zones
    .map((zone) => {
      const row = zone as { name?: string | null }
      return row?.name?.trim() || ""
    })
    .filter(Boolean)
    .join(", ")
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="text-sm">{value}</div>
    </div>
  )
}

export const ViewTravelCoverageModal = ({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: any
}) => {
  const row = componentProps?.data ?? {}
  const isActive = Boolean(row?.is_active)

  return (
    <div className="w-full min-w-150 max-w-150 p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Travel Coverage Details</h2>
        <p className="text-sm text-muted-foreground mt-1">Read-only view of this coverage.</p>
      </div>

      <div className="grid gap-4">
        <DetailItem label="Name" value={row?.name || "—"} />
        <DetailItem label="Description" value={row?.description || "—"} />
        <DetailItem
          label="Status"
          value={
            <Badge
              className={`rounded-lg font-semibold ${
                isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          }
        />
        <DetailItem label="Continents" value={joinNames(row?.continents)} />
        <DetailItem label="Included Countries" value={joinNames(row?.included_countries)} />
        <DetailItem label="Exclude Countries" value={joinNames(row?.exclude_countries)} />
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          className="rounded-sm border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
          onClick={() => handleDialogContextSwitch({})}>
          Close
        </Button>
      </div>
    </div>
  )
}

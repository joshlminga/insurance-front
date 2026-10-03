/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Travel comparison preview dialog.
 * Card layout: logo → product name → Days / Basic / Levies / Total.
 */
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button, EmptyState } from '@/dev/core'
import { cn } from '@/lib/utils'
import type { premiumPreview } from '@/types/types'
import { ArrowDown } from 'lucide-react'
import React from 'react'

export const PostComparisonPage: React.FC<premiumPreview> = ({
  componentProps,
}) => {
  const comparisons: any[] = componentProps?.data?.data?.comparison ?? []
  const comparisonCount = comparisons.length
  const gridCols =
    comparisonCount === 1
      ? 'grid-cols-1'
      : comparisonCount === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : comparisonCount === 3
          ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-2 px-3 text-2xl font-bold">
        Travel Quotation Comparisons
      </h1>

      {comparisons.length === 0 ? (
        <EmptyState />
      ) : (
        <div className={cn('grid gap-6', gridCols)}>
          {comparisons.map((item, idx) => {
            const breakdown = item.breakdown ?? {}
            const productName =
              item.product_name ||
              breakdown['Cover / Product'] ||
              breakdown['Cover/Product'] ||
              breakdown['Product'] ||
              ''
            const days =
              breakdown['Number of Days'] ??
              breakdown['Days'] ??
              breakdown['Trip Days'] ??
              '—'
            const basicPremium = breakdown['Basic Premium'] ?? '—'
            // Combined levies total from API; fall back if older payloads lack Levies.
            const levies =
              breakdown['Levies'] ??
              breakdown['PHCF, TL & Stamp Duty'] ??
              '—'
            const totalPremium =
              breakdown['Gross Premium'] ??
              breakdown['Total Premium'] ??
              '—'

            return (
              <Card
                key={`${item.rate_id ?? idx}-${idx}`}
                className="border border-[#ADABAB] shadow-none"
              >
                <CardHeader className="items-center justify-center space-y-1.5 px-3 pb-2 pt-3">
                  <div className="flex h-12 w-full max-w-[7rem] items-center justify-center">
                    {item.insuerer_logo || item.insurer_logo ? (
                      <img
                        src={item.insuerer_logo ?? item.insurer_logo}
                        alt={item.insurer_name ?? 'Insurer'}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-center text-xs font-semibold text-gray-900">
                        {item.insurer_name ?? 'Insurer'}
                      </span>
                    )}
                  </div>
                  {productName ? (
                    <p className="line-clamp-2 px-1 text-center text-[11px] font-medium leading-tight text-gray-800">
                      {productName}
                    </p>
                  ) : null}
                </CardHeader>

                <CardContent className="space-y-3 px-3 pb-3">
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-muted-foreground">Number of Days</span>
                    <span className="text-right font-medium">{days}</span>

                    <span className="text-muted-foreground">Basic Premium</span>
                    <span className="text-right font-medium">{basicPremium}</span>

                    <span className="text-muted-foreground">Levies</span>
                    <span className="text-right font-medium">{levies}</span>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 text-sm font-semibold">
                    <span>Total Premium</span>
                    <span className="text-right text-[#C20C0C]">{totalPremium}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <CardFooter className="flex flex-col gap-3 px-0 sm:flex-row sm:justify-end">
        <Button
          type="button"
          className="w-full bg-[#C20C0C] hover:bg-[#C20C0C]/70 sm:w-auto"
          leftIcon={<ArrowDown />}
          onClick={() => componentProps?.onDownload?.()}
        >
          Download Comparison
        </Button>
      </CardFooter>
    </div>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  ReusableSelect,
  ReuseableSelectInsurerInput,
} from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { EditDmvicStockSchema } from '@/types/form-schema'
import type { EditDmvicStockFormValues } from '@/types/schema'
import type { SubmitResponse } from '@/types/types'
import { DMVIC_CERTIFICATE_TYPES, dmvicCertificateTypeLabel, PRODUCT_TYPES } from '@/utils/constatnts'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useEffect } from 'react'
import type { DmvicBrokerStockRow } from '../dmvic-stock-query'
import { DMVIC_STOCK_URLS } from '../dmvic-stock-query'

/** Edit stock metadata — remaining stock count is read-only (managed by rules/allocations). */
export function EditDmvicStockModal({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: {
    refetch?: () => Promise<any>
    data?: DmvicBrokerStockRow
  }
}) {
  const stock = componentProps?.data

  const form = useForm<EditDmvicStockFormValues>({
    resolver: zodResolver(EditDmvicStockSchema),
    defaultValues: {
      organization_location_id: '',
      product_type: 'Motor',
      type_of_certificate: '',
    },
  })

  useEffect(() => {
    if (!stock) {
      return
    }
    form.reset({
      organization_location_id: String(stock.organization_location_id ?? ''),
      product_type: stock.product_type ?? 'Motor',
      type_of_certificate: stock.type_of_certificate ?? '',
    })
  }, [stock, form])

  const submitMutation = UseApiMutation<
    SubmitResponse,
    Record<string, unknown> & { id: number }
  >({
    url: ({ id }) => DMVIC_STOCK_URLS.update(id),
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (data) => {
        ShowToast.success(data.message || 'DMVIC stock updated successfully')
        componentProps?.refetch?.()
        handleDialogContextSwitch({ refetch: true })
      },
      onError: (error: unknown) => {
        ShowToast.error(extractErrorMessage(error) || 'Failed to update stock')
      },
    },
  })

  const onSubmit = (data: EditDmvicStockFormValues) => {
    if (!stock?.id) {
      return
    }
    submitMutation.mutate({
      id: stock.id,
      organization_location_id: Number(data.organization_location_id),
      product_type: data.product_type,
      type_of_certificate: data.type_of_certificate,
    })
  }

  return (
    <div className="w-full min-w-150 max-w-175 p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Edit DMVIC Stock</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Remaining stock ({stock?.stock ?? 0}) is updated when you add rules or issue
          certificates — it cannot be edited here.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <Controller
          control={form.control}
          name="organization_location_id"
          render={({ field }) => (
            <ReuseableSelectInsurerInput
              label="Insurer Organization Location"
              required
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <ReusableSelect
          control={form.control}
          name="product_type"
          label="Product Type"
          options={[...PRODUCT_TYPES]}
        />

        <ReusableSelect
          control={form.control}
          name="type_of_certificate"
          label="Certificate Type"
          options={[...DMVIC_CERTIFICATE_TYPES]}
        />

        <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          Certificate type on file:{' '}
          <span className="font-medium text-foreground">
            {dmvicCertificateTypeLabel(stock?.type_of_certificate)}
          </span>
          {' · '}
          Remaining: <span className="font-medium text-foreground">{stock?.stock ?? 0}</span>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => handleDialogContextSwitch({})}>
            Cancel
          </Button>
          <Button type="submit" loading={submitMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  ReusableSelect,
  ReuseableInput,
  ReuseableSelectInsurerInput,
} from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { CreateDmvicStockSchema } from '@/types/form-schema'
import type { CreateDmvicStockFormValues } from '@/types/schema'
import type { SubmitResponse } from '@/types/types'
import { DMVIC_CERTIFICATE_TYPES, EMETHODS, PRODUCT_TYPES } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { DMVIC_STOCK_URLS } from '../dmvic-stock-query'

/**
 * Create a DMVIC stock row (office + certificate type).
 * Remaining certificate count is updated when a policy-number rule is added.
 */
export function CreateDmvicStockModal({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: { refetch?: () => Promise<any> }
}) {
  const form = useForm<CreateDmvicStockFormValues>({
    resolver: zodResolver(CreateDmvicStockSchema),
    defaultValues: {
      organization_location_id: '',
      product_type: 'Motor',
      type_of_certificate: '',
      stock: 2,
    },
  })

  const submitMutation = UseApiMutation<SubmitResponse, Record<string, unknown>>({
    url: DMVIC_STOCK_URLS.create,
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data) => {
        ShowToast.success(data.message || 'DMVIC stock created successfully')
        form.reset()
        componentProps?.refetch?.()
        handleDialogContextSwitch({ refetch: true })
      },
      onError: (error: unknown) => {
        ShowToast.error(extractErrorMessage(error) || 'Failed to create stock')
      },
    },
  })

  const onSubmit = (data: CreateDmvicStockFormValues) => {
    submitMutation.mutate({
      organization_location_id: Number(data.organization_location_id),
      product_type: data.product_type,
      type_of_certificate: data.type_of_certificate,
      stock: data.stock,
    })
  }

  return (
    <div className="w-full min-w-150 max-w-175 p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Add DMVIC Stock</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Register certificate inventory for an insurer office. Add a policy-number rule on the
          stock detail page to seed certificates and numbering.
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

        <ReuseableInput
          control={form.control}
          name="stock"
          type="number"
          label="Initial stock count (min 2)"
          className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => handleDialogContextSwitch({})}>
            Cancel
          </Button>
          <Button type="submit" loading={submitMutation.isPending}>
            Create Stock
          </Button>
        </div>
      </form>
    </div>
  )
}

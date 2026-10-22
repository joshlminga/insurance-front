/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  ReusableSelect,
  ReuseableSelectInsurerInput,
} from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { CreateDmvicStockSchema } from '@/types/form-schema'
import type {
  CreateDmvicStockFormInput,
  CreateDmvicStockFormValues
} from '@/types/schema'
import type { SubmitResponse } from '@/types/types'
import {
  DMVIC_CERTIFICATE_TYPES,
  EMETHODS, PRODUCT_TYPES
} from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

export function CreateDmvicStockModal({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: {
    refetch?: () => Promise<any>
    /** Broker org header from the page picker (X-Organization-Location-Id). */
    orgContextHeaders?: Record<string, string>
  }
}) {
  const orgContextHeaders = componentProps?.orgContextHeaders

  const form = useForm<
    CreateDmvicStockFormInput,
    unknown,
    CreateDmvicStockFormValues
  >({
    resolver: zodResolver(CreateDmvicStockSchema),
    defaultValues: {
      insurer_location_id: '',
      product_type: '',
      type_of_certificate: '',
    },
  })

  const submitMutation = UseApiMutation<SubmitResponse, Record<string, unknown>>({
    url: 'dmvic/stocks',
    method: EMETHODS.POST,
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
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
    // Broker org is NOT in the body — API takes it from X-Organization-Location-Id.
    // Stock is not sent. The API sets the starting count.
    submitMutation.mutate({
      insurer_location_id: Number(data.insurer_location_id),
      product_type: data.product_type,
      type_of_certificate: data.type_of_certificate,
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
          name="insurer_location_id"
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

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleDialogContextSwitch({})}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={submitMutation.isPending}>
            Create Stock
          </Button>
        </div>
      </form>
    </div>
  )
}

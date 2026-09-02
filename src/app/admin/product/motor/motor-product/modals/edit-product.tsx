/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from '@/components/ui/input'
import { 
  Button, 
  ReusableSelect, 
  ReusableSingleSelectApiInput,
  ReuseableInput,
} from '@/dev/core'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { EditProductSchema } from '@/types/form-schema'
import { EditProductFormValues } from '@/types/schema'
import { SubmitResponse } from '@/types/types'
import { 
  ACCESSLEVELSOPTIONS, 
  EMETHODS, 
  EORGANIZATIONTYPES,
  TARGET_AUDIENCE_OPTIONS 
} from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { buildMotorProductFormData } from './build-motor-product-form-data'
import {
  getInsurerSelectedOption,
  getTargetOrganizationSelectedOption,
  mapProductToEditFormValues,
} from './motor-product-form-utils'

export const EditProductModal = ({ handleDialogContextSwitch, componentProps }: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: any
}) => {
  const productId = componentProps?.data?.id

  const { data: showData, isLoading: isLoadingProduct } = UseApiQuery<SubmitResponse>({
    url: `products/motor/${productId}`,
    queryOptions: {
      enabled: Boolean(productId),
    },
  })

  const productData = useMemo(
    () => (showData as any)?.data?.product ?? componentProps?.data ?? {},
    [showData, componentProps?.data]
  )

  const selectedInsurerOption = useMemo(
    () => getInsurerSelectedOption(productData),
    [productData]
  )

  const selectedOrganizationOption = useMemo(
    () => getTargetOrganizationSelectedOption(productData),
    [productData]
  )

  const existingBrochures = Array.isArray(productData?.meta?.brochure)
    ? productData.meta.brochure
    : []

  const [brochureInputs, setBrochureInputs] = useState<Array<{ id: number, file?: File }>>([
    { id: Date.now() },
  ])

  const form = useForm<EditProductFormValues>({
    resolver: zodResolver(EditProductSchema),
    defaultValues: mapProductToEditFormValues(productData),
  })

  useEffect(() => {
    if (productData?.id) {
      form.reset(mapProductToEditFormValues(productData))
    }
  }, [productData, form])

  const syncBrochures = (inputs: Array<{ id: number, file?: File }>) => {
    const files = inputs
      .map((item) => item.file)
      .filter((file): file is File => Boolean(file))
    form.setValue("brochure", files, { shouldValidate: true })
  }

  const handleAddBrochureInput = () => {
    setBrochureInputs((prev) => [...prev, { id: Date.now() + Math.random() }])
  }

  const handleRemoveBrochureInput = (id: number) => {
    setBrochureInputs((prev) => {
      const next = prev.filter((item) => item.id !== id)
      const safeNext = next.length ? next : [{ id: Date.now() + Math.random() }]
      syncBrochures(safeNext)
      return safeNext
    })
  }

  const handleBrochureFileChange = (id: number, file?: File) => {
    setBrochureInputs((prev) => {
      const next = prev.map((item) => item.id === id ? { ...item, file } : item)
      syncBrochures(next)
      return next
    })
  }

  const submitMutation = UseApiMutation<SubmitResponse, FormData>({
    url: `products/motor/${productId}`,
    method: EMETHODS.POST,
    config: {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
    mutationOptions: {
      onSuccess: (data) => {
        ShowToast.success(data.message || "Submitted successfully!")
        form.reset()
        setBrochureInputs([{ id: Date.now() }])
        componentProps?.refetch?.()
        handleDialogContextSwitch({ refetch: true })
      },
      onError: (error: unknown) => {
        const message = extractErrorMessage(error)
        ShowToast.error(message || "Submission failed!")
      },
    },
  })

  const onSubmit = (data: EditProductFormValues) => {
    submitMutation.mutate(buildMotorProductFormData(data))
  }

  if (!productId) {
    return (
      <div className="w-full min-w-150 max-w-150 p-6">
        <p className="text-sm text-destructive">Unable to edit product: missing product id.</p>
      </div>
    )
  }

  if (isLoadingProduct) {
    return (
      <div className="w-full min-w-150 max-w-150 p-6">
        <p className="text-sm text-muted-foreground">Loading product details...</p>
      </div>
    )
  }

  return (
    <div className="w-full min-w-150 max-w-150 p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">
          Edit Motor Product
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the details below to edit an existing motor product.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <Controller
          control={form.control}
          name="organization_location_id"
          render={({ field }) => (
            <ReusableSingleSelectApiInput
              url="organization-location"
              queryParams={{ organization_type: EORGANIZATIONTYPES.INSURER }}
              value={field.value}
              onChange={field.onChange}
              valueKey="organization_location_id"
              labelKey="organization_name"
              label="Organization Location"
              required
              placeholder="Select insurer..."
              searchPlaceholder="Search insurer..."
              emptyMessage="No insurers found"
              selectedOption={
                selectedInsurerOption?.value ? selectedInsurerOption : undefined
              }
            />
          )}
        />
        <ReuseableInput
          control={form.control}
          name="name"
          label="Product Motor Name"
         className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
        />
        <ReuseableInput
          control={form.control}
          name="officename"
          label="Office Name"
         className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
        />
        <ReuseableInput
          control={form.control}
          name="description"
          type="textarea"
          label="Product Motor Description"
         className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
        />
        <ReusableSelect
          control={form.control}
          name="access"
          label="Access Level"
          options={ACCESSLEVELSOPTIONS}
        />
        <ReusableSelect
          control={form.control}
          name="for_public"
          label="Public Product (Accessible by All)"
          options={TARGET_AUDIENCE_OPTIONS}
        />
        <ReuseableInput
          control={form.control}
          name="start_date"
          label="Start Date"
          type="date"
         className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
        />
        <ReuseableInput
          control={form.control}
          name="expiry_date"
          label="Expiry Date"
          type="date"
         className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
        />
        <div className="space-y-2">
          <label className="text-sm font-medium">Attach Brochures</label>
          {existingBrochures.length ? (
            <p className="text-xs text-muted-foreground">
              Existing brochures: {existingBrochures.length}. Uploading new file(s) will append/update based on backend behavior.
            </p>
          ) : null}
          {brochureInputs.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <Input
                type="file"
                accept=".pdf,.csv,.xls,.xlsx,.docx,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="flex h-10 w-full 
                                rounded-[5px] border border-[#ADABAB] 
                                bg-transparent px-3 py-2 text-sm file:mr-3 
                                file:rounded file:border-0 file:bg-muted file:px-3 file:py-1"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  handleBrochureFileChange(item.id, file)
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 w-10 p-0"
                onClick={handleAddBrochureInput}>
                +
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={brochureInputs.length === 1}
                className="h-10 w-10 p-0"
                onClick={() => handleRemoveBrochureInput(item.id)}>
                -
              </Button>
            </div>
          ))}
          {form.watch("brochure")?.length ? (
            <p className="text-xs text-muted-foreground">
              {form.watch("brochure").length} file{form.watch("brochure").length === 1 ? "" : "s"} selected
            </p>
          ) : null}
          {form.formState.errors.brochure?.message ? (
            <p className="text-sm text-red-500">{form.formState.errors.brochure?.message}</p>
          ) : null}
        </div>
        <Controller
          control={form.control}
          name="organization_location_ids"
          render={({ field }) => (
            <ReusableSingleSelectApiInput
              url="organization-location"
              queryParams={{ exclude_organization_type: EORGANIZATIONTYPES.INSURER }}
              value={field.value}
              onChange={field.onChange}
              valueKey="organization_location_id"
              labelKey="organization_name"
              label="Organization Locations"
              required
              placeholder="Select organization..."
              searchPlaceholder="Search organization..."
              emptyMessage="No organizations found"
              selectedOption={
                selectedOrganizationOption?.value
                  ? selectedOrganizationOption
                  : undefined
              }
            />
          )}
        />
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2 px-0">
          <Button
            type="button"
            className="w-full sm:w-auto rounded-sm border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
            onClick={() => handleDialogContextSwitch({})}>
            Cancel
          </Button>

          <Button
            type="submit"
            className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-sm hover:bg-[#C20C0C]"
            loading={submitMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}

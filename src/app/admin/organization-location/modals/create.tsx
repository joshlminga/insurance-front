/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  Button, 
  ReuseableInput, 
  ReuseableSingleSelectCountriesInput, 
  ReuseableSingleSelectOrganizationInput 
} from "@/dev/core"
import { UseApiMutation } from "@/hooks/hooks"
import { OrganizationLocationCreateSchema } from "@/types/form-schema"
import { OrganizationLocationCreateFormValues } from "@/types/schema"
import { SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import {
  appendProductsToFormData,
  DEFAULT_ORG_LOCATION_PRODUCT_CREATE_ROW,
} from "../organization-location-products"
import { OrganizationLocationProductsField } from "./products-field"

export const CreateOrganizationLocationModal = ({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: any
}) => {

  const form = useForm<OrganizationLocationCreateFormValues>({
    resolver: zodResolver(OrganizationLocationCreateSchema),
    defaultValues: {
      organization_id: "",
      initials: "",
      country_id: "",
      logo: undefined,
      product: [{ ...DEFAULT_ORG_LOCATION_PRODUCT_CREATE_ROW }],
    },
  })

  const submitMutation = UseApiMutation<SubmitResponse, FormData>({
    url: "organization-location",
    method: EMETHODS.POST,
    config: {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
    mutationOptions: {
      onSuccess: (data) => {
        ShowToast.success(data.message || "Submitted successfully!")
        form.reset({
          organization_id: "",
          initials: "",
          country_id: "",
          logo: undefined,
          product: [{ ...DEFAULT_ORG_LOCATION_PRODUCT_CREATE_ROW }],
        })
        componentProps?.refetch?.()
        handleDialogContextSwitch({ refetch: true })
      },
      onError: (error: unknown) => {
        const message = extractErrorMessage(error)
        ShowToast.error(message || "Submission failed!")
      },
    },
  })

  const onSubmit = (data: OrganizationLocationCreateFormValues) => {
    const formData = new FormData()
    formData.append("organization_id", String(data.organization_id))
    if (data.initials && String(data.initials).trim().length > 0) {
      formData.append("initials", String(data.initials))
    }
    formData.append("country_id", String(data.country_id))
    if (data.logo instanceof File) {
      formData.append("logo", data.logo)
    }
    appendProductsToFormData(formData, data.product ?? [])
    submitMutation.mutate(formData)
  }

  return (
    <div className="w-full min-w-150 max-w-175 p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Add Organization Location</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the details below to register a new organization location.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <Controller
          control={form.control}
          name="organization_id"
          render={({ field }) => (
            <ReuseableSingleSelectOrganizationInput
              label="Organization"
              required
              value={String(field.value ?? "")}
              onChange={field.onChange}
            />
          )}
        />

        <ReuseableInput
          control={form.control}
          name="initials"
          label="Initials"
          className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
        />

        <Controller
          control={form.control}
          name="country_id"
          render={({ field }) => (
            <ReuseableSingleSelectCountriesInput
              label="Country"
              required
              value={String(field.value ?? "")}
              onChange={field.onChange}
            />
          )}
        />

        <ReuseableInput
          control={form.control}
          name="logo"
          type="file"
          label="Logo"
          className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
        />

        <OrganizationLocationProductsField
          control={form.control}
          name="product"
        />

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2 px-0">
          <Button
            type="button"
            className="w-full sm:w-auto rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
            onClick={() => handleDialogContextSwitch({})}>
            Cancel
          </Button>

          <Button
            type="submit"
            className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-sm hover:bg-[#C20C0C]"
            loading={submitMutation.isPending}
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateOrganizationLocationModal

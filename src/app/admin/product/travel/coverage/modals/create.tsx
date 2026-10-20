/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ReusableApiMultiSelect, ReuseableInput } from "@/dev/core"
import { UseApiMutation } from "@/hooks/hooks"
import { TravelCoverageSchema } from "@/types/form-schema"
import type { TravelCoverageFormValues } from "@/types/schema"
import { SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import {
  buildTravelCoveragePayload,
  emptyTravelCoverageFormValues,
} from "../coverage-form-utils"

const geoListQuery = { per_page: 100, is_active: true }

export const CreateTravelCoverageModal = ({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: any
}) => {
  const form = useForm<TravelCoverageFormValues>({
    resolver: zodResolver(TravelCoverageSchema),
    defaultValues: emptyTravelCoverageFormValues(),
  })

  const submitMutation = UseApiMutation<SubmitResponse, ReturnType<typeof buildTravelCoveragePayload>>({
    url: "travel/coverage",
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data) => {
        ShowToast.success(data.message || "Coverage created successfully")
        form.reset()
        componentProps?.refetch?.()
        handleDialogContextSwitch({ refetch: true })
      },
      onError: (error: unknown) => {
        ShowToast.error(extractErrorMessage(error) || "Create failed")
      },
    },
  })

  const onSubmit = (values: TravelCoverageFormValues) => {
    submitMutation.mutate(buildTravelCoveragePayload(values))
  }

  return (
    <div className="w-full min-w-150 max-w-150 p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Create Travel Coverage</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Name the coverage and pick continents. Countries are optional includes or excludes.
        </p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <ReuseableInput
          control={form.control}
          name="name"
          label="Coverage Name"
          required
          className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
        />
        <ReuseableInput
          control={form.control}
          name="description"
          type="textarea"
          label="Description"
          className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
        />

        {/* Continents = geo taxonomies with no parent; required by the API */}
        <Controller
          control={form.control}
          name="continents"
          render={({ field }) => (
            <ReusableApiMultiSelect
              url="taxonomies/geo/continent"
              queryParams={geoListQuery}
              value={field.value ?? []}
              onChange={field.onChange}
              label="Continents"
              required
              placeholder="Select continents..."
              searchPlaceholder="Search continents..."
              emptyMessage="No continents found"
            />
          )}
        />
        {form.formState.errors.continents?.message ? (
          <p className="text-sm text-red-500">{form.formState.errors.continents.message}</p>
        ) : null}

        <Controller
          control={form.control}
          name="included_countries"
          render={({ field }) => (
            <ReusableApiMultiSelect
              url="taxonomies/geo/country"
              queryParams={geoListQuery}
              value={field.value ?? []}
              onChange={field.onChange}
              label="Included Countries (optional)"
              placeholder="Select countries to include..."
              searchPlaceholder="Search countries..."
              emptyMessage="No countries found"
            />
          )}
        />

        <Controller
          control={form.control}
          name="exclude_countries"
          render={({ field }) => (
            <ReusableApiMultiSelect
              url="taxonomies/geo/country"
              queryParams={geoListQuery}
              value={field.value ?? []}
              onChange={field.onChange}
              label="Exclude Countries (optional)"
              placeholder="Select countries to exclude..."
              searchPlaceholder="Search countries..."
              emptyMessage="No countries found"
            />
          )}
        />
        {form.formState.errors.exclude_countries?.message ? (
          <p className="text-sm text-red-500">
            {form.formState.errors.exclude_countries.message}
          </p>
        ) : null}

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
            Save
          </Button>
        </div>
      </form>
    </div>
  )
}

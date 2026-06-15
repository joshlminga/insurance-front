/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from "@/components/ui/card"
import {
  Button,
  ReuseableInput,
  ReuseableSingleSelectCountriesInput,
} from "@/dev/core"
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks"
import { OrganizationLocationEditSchema } from "@/types/form-schema"
import { OrganizationLocationEditFormValues } from "@/types/schema"
import { SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useState } from "react"
import { Controller, Resolver, useForm } from "react-hook-form"

import {
  appendProductsToFormData,
  mapApiProductsToEditRows,
} from "../organization-location-products"
import {
  getOrganizationLocationFromResponse,
  isOrganizationLocationMutationSuccess,
  refreshOrganizationLocationList,
  refreshOrganizationLocationShowCache,
} from "../organization-location-query"
import { OrganizationLocationProductsField } from "./products-field"

const getLocationId = (location: Record<string, any>) =>
  location?.organization_location_id ?? location?.organizationLocationId ?? location?.id

export const EditOrganizationLocationModal = ({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: {
    data?: Record<string, any>
    refetch?: () => Promise<any>
  }
}) => {
  const locationId = getLocationId(componentProps?.data ?? {})

  const queryClient = useQueryClient()

  const { data: showData, refetch: refetchShow } = UseApiQuery<SubmitResponse>({
    url: `organization-location/${locationId}`,
    queryOptions: { enabled: Boolean(locationId) },
  })

  const location = useMemo(
    () => (showData as any)?.data?.location ?? componentProps?.data ?? {},
    [showData, componentProps?.data]
  )

  const countryId = String(location?.country?.id ?? location?.country_id ?? "")
  const initials = String(location?.meta?.initials ?? location?.initials ?? "")
  const productRows = useMemo(
    () => mapApiProductsToEditRows(location?.products),
    [location?.products]
  )

  const form = useForm<OrganizationLocationEditFormValues>({
    resolver: zodResolver(
      OrganizationLocationEditSchema
    ) as Resolver<OrganizationLocationEditFormValues>,
    defaultValues: {
      initials,
      country_id: countryId,
      logo: undefined,
      product: productRows,
    },
  })

  useEffect(() => {
    form.reset({
      initials,
      country_id: countryId,
      logo: undefined,
      product: productRows,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initials, countryId, productRows])

  const [removeLogo, setRemoveLogo] = useState(false)

  const updateMutation = UseApiMutation<SubmitResponse, FormData>({
    url: `organization-location/${locationId}`,
    method: EMETHODS.POST,
    config: {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
    mutationOptions: {
      onSuccess: async (response) => {
        if (!isOrganizationLocationMutationSuccess(response)) {
          ShowToast.error(
            response?.message || "Organization location update failed"
          )
          return
        }

        if (locationId) {
          await refreshOrganizationLocationShowCache(
            queryClient,
            locationId,
            response,
            refetchShow
          )

          const updatedLocation = getOrganizationLocationFromResponse(response)

          if (updatedLocation) {
            form.reset({
              initials: String(
                updatedLocation?.meta?.initials ?? updatedLocation?.initials ?? ""
              ),
              country_id: String(
                updatedLocation?.country?.id ?? updatedLocation?.country_id ?? ""
              ),
              logo: undefined,
              product: mapApiProductsToEditRows(updatedLocation?.products),
            })
            setRemoveLogo(false)
          }
        }

        ShowToast.success(
          response?.message || "Organization location updated successfully"
        )
        await refreshOrganizationLocationList(queryClient)
        await componentProps?.refetch?.()
        handleDialogContextSwitch({})
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const onSubmit = (data: OrganizationLocationEditFormValues) => {
    if (!locationId) {
      ShowToast.error(
        "Unable to update organization location: missing organization location id"
      )
      return
    }

    const formData = new FormData()
    formData.append("country_id", String(data.country_id))
    formData.append("initials", String(data.initials ?? ""))

    if (removeLogo) {
      formData.append("logo", "")
    } else if (data.logo instanceof File) {
      formData.append("logo", data.logo)
    }

    appendProductsToFormData(formData, data.product ?? [])
    updateMutation.mutate(formData)
  }

  return (
    <div className="w-full min-w-[600px] max-w-[700px] p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Edit Organization Location</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update country, initials, and logo for this organization location.
        </p>
      </div>

      {!locationId && (
        <div className="text-sm text-destructive">
          Unable to load organization location details: missing organization location id.
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
          name="initials"
          label="Initials"
          className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
        />

        <div className="flex items-center gap-2">
          <input
            id="removeLogo"
            type="checkbox"
            checked={removeLogo}
            onChange={(e) => {
              const next = e.target.checked
              setRemoveLogo(next)
              if (next) {
                form.setValue("logo", undefined as any, { shouldValidate: true })
              }
            }}
          />
          <label htmlFor="removeLogo" className="text-sm">
            Remove logo
          </label>
        </div>

        <ReuseableInput
          control={form.control}
          name="logo"
          type="file"
          label="Logo"
          disabled={removeLogo}
          className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
        />

        <OrganizationLocationProductsField
          control={form.control}
          name="product"
          showStatus
        />

        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 mt-2 px-0">
          <Button
            type="button"
            className="w-full sm:w-auto rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
            onClick={() => handleDialogContextSwitch({})}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
            disabled={!locationId || updateMutation.isPending}
            loading={updateMutation.isPending}
          >
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </div>
  )
}

export default EditOrganizationLocationModal


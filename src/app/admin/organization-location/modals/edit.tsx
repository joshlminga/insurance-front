/* eslint-disable @typescript-eslint/no-explicit-any */
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
import apiClient from "@/lib/api-client"
import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useRef, useState } from "react"
import { Controller, Resolver, useForm } from "react-hook-form"

import type { OrganizationLocationMotorRuleRow } from "../organization-location-motor-rules"

import {
  appendProductsToFormData,
  mapApiProductsToEditRows,
  toProductTypeValue,
} from "../organization-location-products"
import {
  buildMotorRulesSyncPayload,
  findMotorLocationProductId,
  mapApiMotorRulesToRows,
} from "../organization-location-motor-rules"
import {
  getOrganizationLocationFromResponse,
  isOrganizationLocationMutationSuccess,
  refreshOrganizationLocationList,
  refreshOrganizationLocationShowCache,
} from "../organization-location-query"
import { OrganizationLocationMotorRulesField } from "./motor-rules-field"
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

  const motorLocationProductId = useMemo(
    () => findMotorLocationProductId(location?.products),
    [location?.products]
  )

  const motorRuleRows = useMemo(() => {
    const motorProduct = (location?.products ?? []).find(
      (row: { product?: string }) =>
        toProductTypeValue(row.product ?? "") === "Motor"
    )
    return mapApiMotorRulesToRows(motorProduct?.motor_rules)
  }, [location?.products])

  const form = useForm<OrganizationLocationEditFormValues>({
    resolver: zodResolver(
      OrganizationLocationEditSchema
    ) as Resolver<OrganizationLocationEditFormValues>,
    defaultValues: {
      initials,
      country_id: countryId,
      logo: undefined,
      product: productRows,
      motor_rules: motorRuleRows,
    },
  })

  const watchedProducts = form.watch("product")
  const hasMotorProduct = useMemo(
    () =>
      (watchedProducts ?? []).some(
        (row) => toProductTypeValue(String(row?.product ?? "")) === "Motor"
      ),
    [watchedProducts]
  )

  useEffect(() => {
    form.reset({
      initials,
      country_id: countryId,
      logo: undefined,
      product: productRows,
      motor_rules: motorRuleRows,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initials, countryId, productRows, motorRuleRows])

  const pendingMotorRulesRef = useRef<OrganizationLocationMotorRuleRow[]>([])
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
            const nextMotorId = findMotorLocationProductId(updatedLocation?.products)

            // Sync motor rules using the rules the user just submitted
            if (nextMotorId) {
              try {
                await apiClient.patch(
                  `organization-location/${locationId}/products/${nextMotorId}/motor-rules`,
                  {
                    rules: buildMotorRulesSyncPayload(pendingMotorRulesRef.current),
                  }
                )
                await refetchShow()
              } catch (error) {
                ShowToast.error(extractErrorMessage(error))
              }
            }

            const refreshedMotorProduct = (
              (showData as any)?.data?.location?.products ??
              updatedLocation?.products ??
              []
            ).find(
              (row: { product?: string }) =>
                toProductTypeValue(row.product ?? "") === "Motor"
            )

            form.reset({
              initials: String(
                updatedLocation?.meta?.initials ?? updatedLocation?.initials ?? ""
              ),
              country_id: String(
                updatedLocation?.country?.id ?? updatedLocation?.country_id ?? ""
              ),
              logo: undefined,
              product: mapApiProductsToEditRows(updatedLocation?.products),
              motor_rules: mapApiMotorRulesToRows(
                refreshedMotorProduct?.motor_rules ?? pendingMotorRulesRef.current
              ),
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
    pendingMotorRulesRef.current = (data.motor_rules ??
      []) as OrganizationLocationMotorRuleRow[]
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
          className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
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
          className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
        />

        <OrganizationLocationProductsField
          control={form.control}
          name="product"
          showStatus
        />

        <OrganizationLocationMotorRulesField
          control={form.control}
          name="motor_rules"
          locationId={locationId}
          locationProductId={motorLocationProductId}
          enabled={hasMotorProduct}
        />

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2 px-0">
          <Button
            type="button"
            className="w-full sm:w-auto rounded-sm border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
            onClick={() => handleDialogContextSwitch({})}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-sm hover:bg-[#C20C0C]"
            disabled={!locationId || updateMutation.isPending}
            loading={updateMutation.isPending}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}

export default EditOrganizationLocationModal

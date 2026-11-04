/* eslint-disable @typescript-eslint/no-explicit-any */
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button, ReusableSelect, SearchableCommandSelect } from '@/dev/core'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { UpsertDmvicOrganizationSettingSchema } from '@/types/form-schema'
import type {
  UpsertDmvicOrganizationSettingFormInput,
  UpsertDmvicOrganizationSettingFormValues,
} from '@/types/schema'
import type { DmvicOrganizationSettingRow, SubmitResponse } from '@/types/types'
import { EMETHODS, PRODUCT_TYPES } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'

/**
 * Create or update one product setting for the broker org in the page header.
 * is_self=true → use this org's own DMVIC stock/tokens.
 * is_self=false → use another organization's (e.g. Acentria for LOLC).
 */
export function UpsertDmvicOrganizationSettingModal({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: {
    refetch?: () => Promise<any>
    data?: DmvicOrganizationSettingRow
    orgContextHeaders?: Record<string, string>
    /** Current broker location — exclude from "use DMVIC of" list. */
    currentOrganizationLocationId?: number | null
  }
}) {
  const existing = componentProps?.data
  const orgContextHeaders = componentProps?.orgContextHeaders
  const currentOrgId = componentProps?.currentOrganizationLocationId

  const form = useForm<
    UpsertDmvicOrganizationSettingFormInput,
    unknown,
    UpsertDmvicOrganizationSettingFormValues
  >({
    resolver: zodResolver(UpsertDmvicOrganizationSettingSchema),
    defaultValues: {
      product: existing?.product ?? '',
      is_self: existing?.is_self ?? true,
      use_dmvic_of_organization_id: existing?.use_dmvic_of_organization_id
        ? String(existing.use_dmvic_of_organization_id)
        : '',
    },
  })

  const isSelf = useWatch({ control: form.control, name: 'is_self' })

  // Search other organization locations for the "use DMVIC of" field.
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data: orgData, isLoading, isFetching } = UseApiQuery<SubmitResponse>({
    url: 'organization-location',
    params: {
      direction: 'asc',
      per_page: 100,
      term: debouncedSearch || undefined,
    },
    queryOptions: {
      enabled: !isSelf,
      placeholderData: (previousData) => previousData,
      staleTime: 1000 * 60 * 5,
    },
  })

  const orgOptions = (orgData?.data ?? [])
    .filter((org: any) => Number(org?.organization_location_id) !== Number(currentOrgId))
    .map((org: any) => ({
      value: String(org?.organization_location_id),
      label: `${org?.organization_name ?? 'Org'}${org?.country?.name ? ` (${org.country.name})` : ''}`,
    }))

  // Prefill selected label when editing a delegated row.
  const selectedDelegateOption =
    existing?.use_dmvic_of_organization && existing.use_dmvic_of_organization_id
      ? {
          value: String(existing.use_dmvic_of_organization_id),
          label: existing.use_dmvic_of_organization.organization_name ?? String(existing.use_dmvic_of_organization_id),
        }
      : undefined

  const submitMutation = UseApiMutation<SubmitResponse, Record<string, unknown>>({
    url: 'dmvic/settings',
    method: EMETHODS.POST,
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    mutationOptions: {
      onSuccess: (data) => {
        ShowToast.success(data.message || 'DMVIC setting saved')
        componentProps?.refetch?.()
        handleDialogContextSwitch({ refetch: true })
      },
      onError: (error: unknown) => {
        ShowToast.error(extractErrorMessage(error) || 'Failed to save setting')
      },
    },
  })

  const onSubmit = (data: UpsertDmvicOrganizationSettingFormValues) => {
    submitMutation.mutate({
      product: data.product,
      is_self: data.is_self,
      use_dmvic_of_organization_id: data.is_self
        ? null
        : Number(data.use_dmvic_of_organization_id),
    })
  }

  return (
    <div className="w-full min-w-150 max-w-175 p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">
          {existing ? 'Edit DMVIC Setting' : 'Add DMVIC Setting'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose whether this organization uses its own DMVIC stock and tokens for a product,
          or another organization&apos;s (for example partners using Acentria).
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <ReusableSelect
          control={form.control}
          name="product"
          label="Product"
          options={[...PRODUCT_TYPES]}
          disabled={Boolean(existing)}
        />

        <Controller
          control={form.control}
          name="is_self"
          render={({ field }) => (
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="is_self">Use own DMVIC</Label>
                <p className="text-xs text-muted-foreground">
                  Off means certificates use another organization&apos;s stock and tokens.
                </p>
              </div>
              <Switch
                id="is_self"
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked)
                  if (checked) {
                    form.setValue('use_dmvic_of_organization_id', '', { shouldValidate: true })
                  }
                }}
              />
            </div>
          )}
        />

        {!isSelf ? (
          <Controller
            control={form.control}
            name="use_dmvic_of_organization_id"
            render={({ field }) => (
              <div className="space-y-2">
                <Label>
                  Use DMVIC of organization
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <SearchableCommandSelect
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  options={orgOptions}
                  placeholder="Select organization location..."
                  searchPlaceholder="Search organization..."
                  emptyMessage="No organizations found"
                  isLoading={isLoading}
                  isFetching={isFetching}
                  onSearchChange={setSearch}
                  selectedOption={selectedDelegateOption}
                />
                {form.formState.errors.use_dmvic_of_organization_id?.message ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.use_dmvic_of_organization_id.message}
                  </p>
                ) : null}
              </div>
            )}
          />
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleDialogContextSwitch({})}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitMutation.isPending}>
            {submitMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  )
}

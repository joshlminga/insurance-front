import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Button, ReusableSelect, ReusableSingleSelectApiInput, ReuseableInput } from '@/dev/core'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { UseAuth } from '@/stores/auth-store'
import type { SubmitResponse } from '@/types/types'
import {
  addCalendarDays,
  CLAIM_NOTE_WORD_LIMIT,
  CLAIMS_API,
  countWords,
  normalizeClaimTypes,
  readCreatedClaim,
  readCreatedTypeId,
  slotsForClaimType,
  type PolicySnapshot,
} from '@/utils/claims'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { ClaimGateBanners, claimFieldClass, ReadOnlyField } from '../claim-ui'
import {
  claimTypeSchema,
  makeClaimRegisterSchema,
  type ClaimRegisterValues,
  type ClaimTypeValues,
} from '../claims-schema'

const fileAccept = '.pdf,.jpg,.jpeg,.png,.heic,.doc,.docx'

/**
 * Step 2 of register. react-hook-form holds the fields (like $_POST).
 * zodResolver runs the checks in claims-schema before submit.
 * Files sit in component state and go out as FormData, same as organization logo upload.
 */
export function ClaimRegisterForm({
  policy,
  orgContextHeaders,
  onBack,
  onCreated,
}: {
  policy: PolicySnapshot
  /** Super-admin location header so create/types/handlers stay in the same org. */
  orgContextHeaders?: Record<string, string>
  onBack: () => void
  onCreated: (result: { claimNumber: string; uuid: string | null }) => void
}) {
  const orgConfig = orgContextHeaders ? { headers: orgContextHeaders } : undefined
  const { user } = UseAuth()
  const [showNewType, setShowNewType] = useState(false)
  const [files, setFiles] = useState<Record<string, File | null>>({})
  const appliedType = useRef<string | null>(null)

  const schema = useMemo(
    () => makeClaimRegisterSchema({ issuedDate: policy.issuedDate, expiryDate: policy.expiryDate }),
    [policy.issuedDate, policy.expiryDate],
  )

  const form = useForm<ClaimRegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyRegisterValues(policy, user?.id),
  })

  const typeForm = useForm<ClaimTypeValues>({
    resolver: zodResolver(claimTypeSchema),
    defaultValues: { name: '', default_tat_days: '14' },
  })

  const typesQuery = UseApiQuery<SubmitResponse>({
    url: CLAIMS_API.types,
    queryKey: ['claims/types', orgContextHeaders?.['X-Organization-Location-Id'] ?? null],
    config: orgConfig,
  })
  const types = normalizeClaimTypes(typesQuery.data)

  const claimTypeId = useWatch({ control: form.control, name: 'claim_type_id' })
  const note = useWatch({ control: form.control, name: 'note' }) ?? ''
  const tatDays = useWatch({ control: form.control, name: 'tat_days' })
  const notified = useWatch({ control: form.control, name: 'notified_to_organization_date' })
  const lossDate = useWatch({ control: form.control, name: 'loss_date' })
  const documentMode = useWatch({ control: form.control, name: 'document_mode' })
  const words = countWords(note)
  const selectedType = types.find((type) => type.id === claimTypeId)
  const slots = slotsForClaimType(policy.documents, selectedType?.name ?? '', claimTypeId || null)
  const duePreview = notified && /^\d+$/.test(tatDays || '')
    ? addCalendarDays(notified, Number(tatDays))
    : null

  useEffect(() => {
    appliedType.current = null
    form.reset(emptyRegisterValues(policy, user?.id))
    setFiles({})
    // Only when the cover (or the signed-in user) changes — not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [policy.certificateId, user?.id])

  useEffect(() => {
    if (!claimTypeId || appliedType.current === claimTypeId) return
    const match = types.find((type) => type.id === claimTypeId)
    if (!match) return
    appliedType.current = claimTypeId
    form.setValue('tat_days', String(match.defaultTatDays), { shouldValidate: true })
  }, [claimTypeId, types, form])

  const createType = UseApiMutation<SubmitResponse, { name: string; default_tat_days: number }>({
    url: CLAIMS_API.types,
    method: EMETHODS.POST,
    config: orgConfig,
    mutationOptions: {
      onSuccess: async (response) => {
        ShowToast.success(response.message || 'Claim type added')
        const createdId = readCreatedTypeId(response)
        await typesQuery.refetch()
        if (createdId) {
          appliedType.current = null
          form.setValue('claim_type_id', createdId, { shouldValidate: true })
        }
        typeForm.reset({ name: '', default_tat_days: '14' })
        setShowNewType(false)
      },
      onError: (error) => ShowToast.error(extractErrorMessage(error)),
    },
  })

  const registerClaim = UseApiMutation<SubmitResponse, FormData>({
    url: CLAIMS_API.claims,
    method: EMETHODS.POST,
    config: {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(orgContextHeaders ?? {}),
      },
    },
    mutationOptions: {
      onSuccess: (response) => {
        const created = readCreatedClaim(response)
        ShowToast.success(response.message || 'Claim registered')
        onCreated({
          claimNumber: created.claimNumber || 'Claim saved',
          uuid: created.uuid,
        })
      },
      onError: (error) => ShowToast.error(extractErrorMessage(error)),
    },
  })

  const onSubmit = (values: ClaimRegisterValues) => {
    if (values.document_mode === 'have_documents') {
      const missing = slots.filter((slot) => slot.mandatory && !slot.found && !files[slot.key])
      if (missing.length) {
        ShowToast.error(`Upload: ${missing.map((slot) => slot.label).join(', ')}`)
        return
      }
    }
    registerClaim.mutate(buildClaimFormData(values, policy.certificateId, files))
  }

  const vehicleOptions = policy.vehicles.map((vehicle) => ({
    value: vehicle.id,
    label: vehicle.label,
  }))

  return (
    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <ClaimGateBanners banners={policy.banners} />

      <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-3">
        <ReadOnlyField label="Registration" value={policy.registration} />
        <ReadOnlyField label="Policy number" value={policy.policyNumber} />
        <ReadOnlyField label="Certificate number" value={policy.certificateNumber} />
        <ReadOnlyField label="Insured" value={policy.customerName} />
        <ReadOnlyField label="Insurer" value={policy.insurerName} />
        <ReadOnlyField label="Cover" value={policy.coverType} />
        <ReadOnlyField label="Cover from" value={policy.issuedDate} />
        <ReadOnlyField label="Cover to" value={policy.expiryDate} />
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Claim Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4 grid gap-4 md:grid-cols-2">
          <ReuseableInput
            control={form.control}
            name="claimant_name"
            label="Claimant"
            className={claimFieldClass}
            required
          />
          <ReuseableInput
            control={form.control}
            name="claimant_email"
            label="Claimant email"
            type="email"
            className={claimFieldClass}
            required
          />
          <ReuseableInput
            control={form.control}
            name="claimant_phone"
            label="Claimant phone"
            className={claimFieldClass}
            required
          />
          <div>
            <Controller
              control={form.control}
              name="reported_by_user_id"
              render={({ field }) => (
                <ReusableSingleSelectApiInput
                  url={CLAIMS_API.handlers}
                  value={field.value}
                  onChange={field.onChange}
                  label="Reported by"
                  required
                  labelKey="name"
                  valueKey="id"
                  placeholder="Select a user"
                  config={orgConfig}
                />
              )}
            />
            {form.formState.errors.reported_by_user_id && (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.reported_by_user_id.message}</p>
            )}
          </div>
          <div>
            <Controller
              control={form.control}
              name="handler_id"
              render={({ field }) => (
                <ReusableSingleSelectApiInput
                  url={CLAIMS_API.handlers}
                  value={field.value}
                  onChange={field.onChange}
                  label="Handler"
                  required
                  labelKey="name"
                  valueKey="id"
                  placeholder="Select a handler"
                  config={orgConfig}
                />
              )}
            />
            {form.formState.errors.handler_id && (
              <p className="mt-1 text-sm text-red-500">{form.formState.errors.handler_id.message}</p>
            )}
          </div>
          <ReusableSelect
            control={form.control}
            name="category"
            label="Category"
            options={[{ value: 'general', label: 'General' }]}
            disabled
          />
          <ReusableSelect
            control={form.control}
            name="claim_type_id"
            label="Claim type"
            placeholder="Select a claim type"
            options={types.map((type) => ({ value: type.id, label: type.name }))}
            required
          />
          <div className="flex items-end">
            <Button type="button" variant="outline" onClick={() => setShowNewType((open) => !open)}>
              {showNewType ? 'Close new type' : 'Add new claim type'}
            </Button>
          </div>

          {showNewType && (
            <div className="grid gap-3 rounded-lg border p-4 md:col-span-2 md:grid-cols-[1fr_10rem_auto] md:items-end">
              <ReuseableInput
                control={typeForm.control}
                name="name"
                label="New type name"
                className={claimFieldClass}
                required
              />
              <ReuseableInput
                control={typeForm.control}
                name="default_tat_days"
                label="TAT days"
                type="number"
                min="1"
                className={claimFieldClass}
                required
              />
              <Button
                type="button"
                disabled={createType.isPending}
                onClick={typeForm.handleSubmit((values) => {
                  createType.mutate({
                    name: values.name.trim(),
                    default_tat_days: Number(values.default_tat_days),
                  })
                })}
              >
                {createType.isPending ? 'Saving…' : 'Save type'}
              </Button>
            </div>
          )}

          <div>
            <ReuseableInput
              control={form.control}
              name="tat_days"
              label="TAT (days)"
              type="number"
              min="1"
              className={claimFieldClass}
              required
            />
            {duePreview && (
              <p className="mt-1 text-sm text-muted-foreground">
                Expected by {duePreview}. The server stores the real due date.
              </p>
            )}
          </div>
          <ReuseableInput
            control={form.control}
            name="claimed_amount"
            label="Claimed amount"
            type="number"
            min="0"
            step="0.01"
            className={claimFieldClass}
            required
          />
          <ReusableSelect
            control={form.control}
            name="vehicle_id"
            label="Vehicle"
            placeholder="Select a vehicle"
            options={vehicleOptions}
            disabled={vehicleOptions.length <= 1}
            required
          />
          <ReuseableInput
            control={form.control}
            name="loss_date"
            label="Date of loss"
            type="date"
            min={policy.issuedDate ?? undefined}
            max={policy.expiryDate ?? undefined}
            className={claimFieldClass}
            required
          />
          <ReuseableInput
            control={form.control}
            name="notified_to_organization_date"
            label="Date notified to organization"
            type="date"
            min={lossDate || undefined}
            className={claimFieldClass}
            required
          />
          <ReuseableInput
            control={form.control}
            name="notified_to_insurer_date"
            label="Date notified to insurer (optional)"
            type="date"
            min={notified || undefined}
            className={claimFieldClass}
          />
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label htmlFor="claim-note">Note</Label>
            <Textarea
              id="claim-note"
              rows={5}
              className="rounded-[5px] border border-[#ADABAB]"
              {...form.register('note')}
            />
            <p className={words > CLAIM_NOTE_WORD_LIMIT ? 'text-sm text-red-600' : 'text-sm text-muted-foreground'}>
              {words} / {CLAIM_NOTE_WORD_LIMIT} words
            </p>
            {form.formState.errors.note && (
              <p className="text-sm text-red-500">{form.formState.errors.note.message}</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-4 flex flex-col gap-4">
          <Controller
            control={form.control}
            name="document_mode"
            render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-3">
                <Label className="flex items-center gap-2 font-normal">
                  <RadioGroupItem value="have_documents" />
                  I have documents
                </Label>
                <Label className="flex items-center gap-2 font-normal">
                  <RadioGroupItem value="no_documents" />
                  I do not have documents
                </Label>
              </RadioGroup>
            )}
          />

          {documentMode === 'no_documents' && (
            <p className="text-sm text-muted-foreground">
              The claim will be saved as Document Pending so the notification date is kept.
            </p>
          )}

          {documentMode === 'have_documents' && slots.map((slot) => (
            <div key={slot.key} className="grid gap-2 rounded-lg border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{slot.label}</p>
                {slot.mandatory && <span className="text-xs text-red-600">Required</span>}
                {slot.found && <span className="text-xs text-emerald-700">Found on the policy</span>}
              </div>
              {slot.hint && <p className="text-sm text-muted-foreground">{slot.hint}</p>}
              {slot.downloadUrl && (
                <a className="text-sm text-primary underline" href={slot.downloadUrl} target="_blank" rel="noreferrer">
                  Open file already on the cover
                </a>
              )}
              <input
                type="file"
                accept={fileAccept}
                className="text-sm"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null
                  setFiles((current) => ({ ...current, [slot.key]: file }))
                }}
              />
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back to Search
        </Button>
        <Button type="submit" disabled={registerClaim.isPending}>
          {registerClaim.isPending ? 'Saving…' : 'Register claim'}
        </Button>
      </div>
    </form>
  )
}

function emptyRegisterValues(
  policy: PolicySnapshot,
  userId?: number,
): ClaimRegisterValues {
  return {
    vehicle_id: policy.selectedVehicleId ?? '',
    claimant_name: policy.customerName ?? '',
    claimant_email: policy.customerEmail ?? '',
    claimant_phone: policy.customerPhone ?? '',
    reported_by_user_id: userId ? String(userId) : '',
    handler_id: '',
    category: 'general',
    claim_type_id: '',
    tat_days: '',
    claimed_amount: '',
    loss_date: '',
    notified_to_organization_date: '',
    notified_to_insurer_date: '',
    note: '',
    document_mode: 'have_documents',
  }
}

function buildClaimFormData(
  values: ClaimRegisterValues,
  certificateId: string,
  files: Record<string, File | null>,
): FormData {
  const formData = new FormData()
  formData.append('certificate_id', certificateId)
  formData.append('vehicle_id', values.vehicle_id)
  formData.append('claimant_name', values.claimant_name.trim())
  formData.append('claimant_email', values.claimant_email.trim())
  formData.append('claimant_phone', values.claimant_phone.trim())
  formData.append('reported_by_user_id', values.reported_by_user_id)
  formData.append('handler_id', values.handler_id)
  formData.append('category', 'general')
  formData.append('claim_type_id', values.claim_type_id)
  formData.append('tat_days', values.tat_days)
  formData.append('claimed_amount', values.claimed_amount)
  formData.append('loss_date', values.loss_date)
  formData.append('notified_to_organization_date', values.notified_to_organization_date)
  if (values.notified_to_insurer_date) {
    formData.append('notified_to_insurer_date', values.notified_to_insurer_date)
  }
  formData.append('note', values.note ?? '')
  formData.append('document_mode', values.document_mode)
  if (values.document_mode === 'have_documents') {
    Object.entries(files).forEach(([key, file]) => {
      if (file) formData.append(`files[${key}]`, file)
    })
  }
  return formData
}

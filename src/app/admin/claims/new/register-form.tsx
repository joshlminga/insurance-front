import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import {
  ClaimGateBanners,
  ClaimGrid,
  ClaimSurface,
  claimFieldClass,
  ReadOnlyField,
} from '../claim-ui'
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
    <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <ClaimGateBanners banners={policy.banners} />

      {/* Read-only cover snapshot — three tiles per row on desktop */}
      <ClaimSurface>
        <h2 className="mb-4 text-base font-semibold">Policy snapshot</h2>
        <ClaimGrid>
          <ReadOnlyField label="Registration" value={policy.registration} />
          <ReadOnlyField label="Policy number" value={policy.policyNumber} />
          <ReadOnlyField label="Certificate number" value={policy.certificateNumber} />
          <ReadOnlyField label="Insured" value={policy.customerName} />
          <ReadOnlyField label="Insurer" value={policy.insurerName} />
          <ReadOnlyField label="Cover" value={policy.coverType} />
          <ReadOnlyField label="Cover from" value={policy.issuedDate} />
          <ReadOnlyField label="Cover to" value={policy.expiryDate} />
        </ClaimGrid>
      </ClaimSurface>

      <Tabs defaultValue="details" className="flex flex-col gap-4">
        <TabsList className="w-fit rounded-full bg-muted/60 p-1">
          <TabsTrigger value="details" className="rounded-full">Claim Details</TabsTrigger>
          <TabsTrigger value="documents" className="rounded-full">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-0 flex flex-col gap-4">
          {/* Parties: who is claiming and who handles it */}
          <ClaimSurface>
            <h2 className="mb-4 text-base font-semibold">Parties</h2>
            <div className="grid gap-4 md:grid-cols-2">
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
            </div>
          </ClaimSurface>

          {/* Classification: type, TAT, category, vehicle, amount */}
          <ClaimSurface>
            <h2 className="mb-4 text-base font-semibold">Classification</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <ReusableSelect
                control={form.control}
                name="category"
                label="Category"
                options={[{ value: 'general', label: 'General' }]}
                disabled
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <ReusableSelect
                    control={form.control}
                    name="claim_type_id"
                    label="Claim type"
                    placeholder="Select a claim type"
                    options={types.map((type) => ({ value: type.id, label: type.name }))}
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 rounded-xl"
                  onClick={() => setShowNewType(true)}
                >
                  Add new claim type
                </Button>
              </div>
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
            </div>
          </ClaimSurface>

          {/* Loss & dates + note */}
          <ClaimSurface>
            <h2 className="mb-4 text-base font-semibold">Loss & dates</h2>
            <div className="grid gap-4 md:grid-cols-2">
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
                  className="rounded-xl border border-border/70"
                  {...form.register('note')}
                />
                <p className={words > CLAIM_NOTE_WORD_LIMIT ? 'text-sm text-red-600' : 'text-sm text-muted-foreground'}>
                  {words} / {CLAIM_NOTE_WORD_LIMIT} words
                </p>
                {form.formState.errors.note && (
                  <p className="text-sm text-red-500">{form.formState.errors.note.message}</p>
                )}
              </div>
            </div>
          </ClaimSurface>
        </TabsContent>

        <TabsContent value="documents" className="mt-0 flex flex-col gap-4">
          <Controller
            control={form.control}
            name="document_mode"
            render={({ field }) => (
              <ClaimGrid className="md:grid-cols-2 xl:grid-cols-2">
                {/* Choice cards — like radio buttons, but bigger */}
                <button
                  type="button"
                  onClick={() => field.onChange('have_documents')}
                  className={`rounded-2xl border p-5 text-left transition-colors ${
                    field.value === 'have_documents'
                      ? 'border-foreground/20 bg-card shadow-sm ring-1 ring-foreground/10'
                      : 'border-border/50 bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="sr-only">
                    <RadioGroupItem value="have_documents" />
                  </RadioGroup>
                  <p className="font-semibold">I have documents</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Upload the files required for this claim type.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange('no_documents')}
                  className={`rounded-2xl border p-5 text-left transition-colors ${
                    field.value === 'no_documents'
                      ? 'border-foreground/20 bg-card shadow-sm ring-1 ring-foreground/10'
                      : 'border-border/50 bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <p className="font-semibold">I do not have documents</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Saves as Document Pending so the notification date is kept.
                  </p>
                </button>
              </ClaimGrid>
            )}
          />

          {documentMode === 'no_documents' && (
            <p className="text-sm text-muted-foreground">
              The claim will be saved as Document Pending so the notification date is kept.
            </p>
          )}

          {documentMode === 'have_documents' && (
            <ClaimGrid>
              {slots.map((slot) => (
                <ClaimSurface key={slot.key} padding="sm" className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{slot.label}</p>
                    {slot.mandatory && <span className="text-xs font-semibold text-red-600">Required</span>}
                    {slot.found && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                        On policy
                      </span>
                    )}
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
                </ClaimSurface>
              ))}
            </ClaimGrid>
          )}
        </TabsContent>
      </Tabs>

      {/* Bottom action bar — stays visible while scrolling long forms */}
      <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap gap-2 rounded-2xl border border-border/40 bg-card/95 p-4 shadow-sm backdrop-blur">
        <Button type="button" variant="outline" className="rounded-xl" onClick={onBack}>
          Back to Search
        </Button>
        <Button type="submit" className="rounded-xl" disabled={registerClaim.isPending}>
          {registerClaim.isPending ? 'Saving…' : 'Register claim'}
        </Button>
      </div>

      {/* Add claim type popup — keeps the main page clean */}
      <Dialog open={showNewType} onOpenChange={setShowNewType}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add claim type</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
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
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowNewType(false)}>
                Cancel
              </Button>
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
          </div>
        </DialogContent>
      </Dialog>
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

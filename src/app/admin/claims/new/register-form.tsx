import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button, ReusableSelect, ReusableSingleSelectApiInput, ReuseableInput } from '@/dev/core'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { cn } from '@/lib/utils'
import { UseAuth } from '@/stores/auth-store'
import type { SubmitResponse } from '@/types/types'
import {
  addCalendarDays,
  CLAIM_NOTE_WORD_LIMIT,
  CLAIMS_API,
  countWords,
  earliestClaimNotificationDate,
  formatClaimDisplayDate,
  normalizeClaimTypes,
  readCreatedClaim,
  readCreatedTypeId,
  slotsForClaimType,
  todayInNairobi,
  type PolicySnapshot,
} from '@/utils/claims'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, FileUp, Upload } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
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

/** Shared 12-col row: three fields at 4/4/4 on desktop. */
const row344 = 'grid gap-4 md:grid-cols-12'

/** One third of a 12-col row. */
const col4 = 'min-w-0 md:col-span-4'

/**
 * Common TAT choices shown as "14 days" instead of a bare number.
 * Staff can still pick another value if the type default is not in the list —
 * we merge the current tat_days into the options.
 */
const TAT_DAY_OPTIONS = [7, 14, 21, 30] as const

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
  /** Step 2 opens in a popup after claim details pass validation. */
  const [docsOpen, setDocsOpen] = useState(false)
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
  const today = todayInNairobi()
  const noticeMin = earliestClaimNotificationDate(lossDate || null, today)
  const lossMax = (() => {
    const expiry = policy.expiryDate?.slice(0, 10)
    if (expiry && expiry < today) return expiry
    return today
  })()
  const organizationLabel = policy.organizationName?.trim() || 'organization'
  const insurerLabel = policy.insurerName?.trim() || 'insurer'

  useEffect(() => {
    appliedType.current = null
    form.reset(emptyRegisterValues(policy, user?.id))
    setFiles({})
    setDocsOpen(false)
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

  /** Validate claim details first, then open the documents step popup. */
  const continueToDocuments = async () => {
    const ok = await form.trigger([
      'vehicle_id',
      'claimant_name',
      'claimant_email',
      'claimant_phone',
      'reported_by_user_id',
      'handler_id',
      'category',
      'claim_type_id',
      'tat_days',
      'claimed_amount',
      'loss_date',
      'notified_to_organization_date',
      'notified_to_insurer_date',
      'note',
    ])
    if (ok) {
      setDocsOpen(true)
    }
  }

  const vehicleOptions = policy.vehicles.map((vehicle) => ({
    value: vehicle.id,
    label: vehicle.label,
  }))

  // TAT select shows "14 days" labels; include the current value if it is not in the list.
  const tatSelectOptions = useMemo(() => {
    const days = new Set<number>([...TAT_DAY_OPTIONS])
    const current = Number(tatDays)
    if (Number.isFinite(current) && current >= 1) {
      days.add(current)
    }
    return [...days]
      .sort((a, b) => a - b)
      .map((day) => ({
        value: String(day),
        label: day === 1 ? '1 day' : `${day} days`,
      }))
  }, [tatDays])

  return (
    <>
      <form className="flex flex-col gap-5" onSubmit={(event) => event.preventDefault()} noValidate>
        <ClaimGateBanners banners={policy.banners} />

        {/* Read-only cover snapshot — three tiles per row on desktop */}
        <ClaimSurface>
          <h2 className="mb-4 text-base font-semibold">Policy snapshot</h2>
          <ClaimGrid>
            <ReadOnlyField label="Registration" value={policy.registration} />
            <ReadOnlyField label="Policy number" value={policy.policyNumber} />
            <ReadOnlyField label="Certificate number" value={policy.certificateNumber} />
          <ReadOnlyField label="Insured" value={policy.customerName} />
          <ReadOnlyField label="Organization" value={policy.organizationName} />
          <ReadOnlyField label="Insurer" value={policy.insurerName} />
          <ReadOnlyField label="Cover" value={policy.coverType} />
            <ReadOnlyField label="Cover from" value={formatClaimDisplayDate(policy.issuedDate)} />
            <ReadOnlyField label="Cover to" value={formatClaimDisplayDate(policy.expiryDate)} />
          </ClaimGrid>
        </ClaimSurface>

        {/* Step 1 — claim details on the main form */}
        <div className="flex flex-col gap-4">
          <div className="flex items-baseline gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
              1
            </span>
            <div>
              <h2 className="text-base font-semibold">Claim details</h2>
              <p className="text-sm text-muted-foreground">Parties, classification, and loss dates.</p>
            </div>
          </div>

          {/* Parties: two rows of 4/4/4 */}
          <ClaimSurface>
            <h2 className="mb-4 text-base font-semibold">Parties</h2>
            <div className="flex flex-col gap-4">
              <div className={row344}>
                <div className={col4}>
                  <ReuseableInput
                    control={form.control}
                    name="claimant_name"
                    label="Claimant"
                    className={claimFieldClass}
                    required
                  />
                </div>
                <div className={col4}>
                  <ReuseableInput
                    control={form.control}
                    name="claimant_email"
                    label="Claimant email"
                    type="email"
                    className={claimFieldClass}
                    required
                  />
                </div>
                <div className={col4}>
                  <ReuseableInput
                    control={form.control}
                    name="claimant_phone"
                    label="Claimant phone"
                    className={claimFieldClass}
                    required
                  />
                </div>
              </div>
              <div className={row344}>
                <div className={col4}>
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
                <div className={col4}>
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
            </div>
          </ClaimSurface>

          {/* Classification: two rows of 4/4/4; TAT shows "14 days" */}
          <ClaimSurface>
            <h2 className="mb-4 text-base font-semibold">Classification</h2>
            <div className="flex flex-col gap-4">
              <div className={row344}>
                <div className={col4}>
                  <ReusableSelect
                    control={form.control}
                    name="category"
                    label="Category"
                    options={[{ value: 'general', label: 'General' }]}
                    disabled
                  />
                </div>
                <div className={col4}>
                  <ReusableSelect
                    control={form.control}
                    name="claim_type_id"
                    label="Claim type"
                    placeholder="Select a claim type"
                    options={types.map((type) => ({ value: type.id, label: type.name }))}
                    required
                  />
                  <button
                    type="button"
                    className="mt-1.5 text-sm font-medium text-primary underline-offset-2 hover:underline"
                    onClick={() => setShowNewType(true)}
                  >
                    Add new claim type
                  </button>
                </div>
                <div className={col4}>
                  <ReusableSelect
                    control={form.control}
                    name="tat_days"
                    label="Expected TAT"
                    placeholder="Select turnaround"
                    options={tatSelectOptions}
                    required
                  />
                  {duePreview && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Expected by {formatClaimDisplayDate(duePreview)}.
                    </p>
                  )}
                </div>
              </div>
              <div className={row344}>
                <div className={col4}>
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
                <div className={col4}>
                  <ReuseableInput
                    control={form.control}
                    name="claimed_amount"
                    label="Claimed amount"
                    thousandsSeparator
                    min="0"
                    step="0.01"
                    className={claimFieldClass}
                    required
                  />
                </div>
              </div>
            </div>
          </ClaimSurface>

          {/* Loss & dates: one 4/4/4 row for dates, then full-width note */}
          <ClaimSurface>
            <h2 className="mb-4 text-base font-semibold">Loss & dates</h2>
            <div className="flex flex-col gap-4">
              <div className={row344}>
                <div className={col4}>
                  <ReuseableInput
                    control={form.control}
                    name="loss_date"
                    label="Date of loss"
                    type="date"
                    min={policy.issuedDate ?? undefined}
                    max={lossMax}
                    className={claimFieldClass}
                    required
                  />
                </div>
                <div className={col4}>
                  <ReuseableInput
                    control={form.control}
                    name="notified_to_organization_date"
                    label={`Date notified to ${organizationLabel}`}
                    type="date"
                    min={noticeMin}
                    className={claimFieldClass}
                    required
                  />
                </div>
                <div className={col4}>
                  <ReuseableInput
                    control={form.control}
                    name="notified_to_insurer_date"
                    label={`Date notified to ${insurerLabel}`}
                    type="date"
                    min={notified && notified > noticeMin ? notified : noticeMin}
                    className={claimFieldClass}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
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
        </div>

        {/* Step 1 actions — documents open in the next-step popup */}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="rounded-xl" onClick={onBack}>
            Back to Search
          </Button>
          <Button type="button" className="rounded-xl" onClick={() => void continueToDocuments()}>
            Continue to documents
          </Button>
        </div>
      </form>

      {/* Step 2 — documents popup */}
      <Dialog open={docsOpen} onOpenChange={setDocsOpen}>
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden bg-white p-0 sm:max-w-3xl">
          <DialogHeader className="border-b border-border/60 bg-white px-6 py-4">
            <DialogTitle className="flex items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                2
              </span>
              Documents
            </DialogTitle>
            <p className="pl-10 text-sm text-muted-foreground">
              Choose whether you have files, then click each upload box.
            </p>
          </DialogHeader>

          <div className="flex flex-col gap-5 overflow-y-auto bg-white px-6 py-5">
            {/* Mode switch sits on an explicit white panel */}
            <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
              <p className="mb-3 text-sm font-medium text-foreground">Do you have documents?</p>
              <Controller
                control={form.control}
                name="document_mode"
                render={({ field }) => (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => field.onChange('have_documents')}
                      className={cn(
                        'rounded-xl border bg-white p-4 text-left transition-colors',
                        field.value === 'have_documents'
                          ? 'border-foreground/30 ring-2 ring-foreground/10'
                          : 'border-border hover:border-foreground/20',
                      )}
                    >
                      <p className="font-semibold">I have documents</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Show upload boxes for this claim type.
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange('no_documents')}
                      className={cn(
                        'rounded-xl border bg-white p-4 text-left transition-colors',
                        field.value === 'no_documents'
                          ? 'border-foreground/30 ring-2 ring-foreground/10'
                          : 'border-border hover:border-foreground/20',
                      )}
                    >
                      <p className="font-semibold">I do not have documents</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Saves as Document Pending so the notification date is kept.
                      </p>
                    </button>
                  </div>
                )}
              />
            </div>

            {documentMode === 'no_documents' && (
              <div className="rounded-xl border border-border/60 bg-white px-4 py-3 text-sm text-muted-foreground">
                No uploads needed now. The claim will be saved as Document Pending.
              </div>
            )}

            {documentMode === 'have_documents' && (
              <ClaimGrid>
                {slots.map((slot) => (
                  <ClaimUploadSlot
                    key={slot.key}
                    label={slot.label}
                    mandatory={slot.mandatory}
                    found={slot.found}
                    hint={slot.hint}
                    downloadUrl={slot.downloadUrl}
                    file={files[slot.key] ?? null}
                    onFileChange={(file) => {
                      setFiles((current) => ({ ...current, [slot.key]: file }))
                    }}
                  />
                ))}
              </ClaimGrid>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border/60 bg-white px-6 py-4">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setDocsOpen(false)}>
              Back to details
            </Button>
            <Button
              type="button"
              className="rounded-xl"
              disabled={registerClaim.isPending}
              onClick={form.handleSubmit(onSubmit)}
            >
              {registerClaim.isPending ? 'Saving…' : 'Register claim'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
    </>
  )
}

/**
 * Big clickable upload box so staff do not hunt for a tiny file input.
 * The real <input type="file"> stays hidden; the label opens it.
 */
function ClaimUploadSlot({
  label,
  mandatory,
  found,
  hint,
  downloadUrl,
  file,
  onFileChange,
}: {
  label: string
  mandatory: boolean
  found: boolean
  hint?: string | null
  downloadUrl?: string | null
  file: File | null
  onFileChange: (file: File | null) => void
}) {
  const inputId = useId()
  const selected = Boolean(file)

  return (
    <ClaimSurface padding="sm" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium">{label}</p>
        {mandatory && <span className="text-xs font-semibold text-red-600">Required</span>}
        {found && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
            On policy
          </span>
        )}
      </div>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      {downloadUrl && (
        <a className="text-sm text-primary underline" href={downloadUrl} target="_blank" rel="noreferrer">
          Open file already on the cover
        </a>
      )}

      <input
        id={inputId}
        type="file"
        accept={fileAccept}
        className="sr-only"
        onChange={(event) => {
          onFileChange(event.target.files?.[0] ?? null)
        }}
      />

      <label
        htmlFor={inputId}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors',
          selected
            ? 'border-emerald-300 bg-emerald-50/70 text-emerald-950'
            : 'border-border bg-muted/30 text-foreground hover:border-foreground/30 hover:bg-muted/50',
        )}
      >
        {selected ? (
          <CheckCircle2 className="size-7 shrink-0 text-emerald-700" aria-hidden />
        ) : (
          <Upload className="size-7 shrink-0 text-muted-foreground" aria-hidden />
        )}
        <span className="text-sm font-semibold">
          {selected ? 'Click to replace file' : 'Click to upload'}
        </span>
        <span className="max-w-full truncate text-xs text-muted-foreground">
          {selected ? file!.name : 'PDF, JPG, PNG, HEIC, DOC, DOCX · max 10 MB'}
        </span>
        {!selected && (
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-background px-3 py-1.5 text-xs font-medium shadow-sm">
            <FileUp className="size-3.5" aria-hidden />
            Choose file
          </span>
        )}
      </label>
    </ClaimSurface>
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
  formData.append('notified_to_insurer_date', values.notified_to_insurer_date)
  formData.append('note', values.note ?? '')
  formData.append('document_mode', values.document_mode)
  if (values.document_mode === 'have_documents') {
    Object.entries(files).forEach(([key, file]) => {
      if (file) formData.append(`files[${key}]`, file)
    })
  }
  return formData
}

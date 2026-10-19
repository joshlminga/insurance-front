import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { UseAuth } from '@/stores/auth-store'
import type { SubmitResponse } from '@/types/types'
import {
    CLAIM_NOTE_WORD_LIMIT,
    CUSTOMER_CLAIMS_API,
    countWords,
    formatClaimDisplayDate,
    normalizeClaimTypes,
    normalizePolicy,
    normalizePolicyHit,
    readCreatedClaim,
    slotsForClaimType,
    todayInNairobi,
    type PolicySearchHit,
    type PolicySnapshot,
} from '@/utils/claims'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { useMemo, useState, type ReactNode } from 'react'

/** Same look as the other plain inputs on this page (native <select>). */
const selectClass =
    'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'

const fileAccept = '.pdf,.jpg,.jpeg,.png,.heic,.doc,.docx'

type ClaimFormValues = {
    vehicleId: string
    claimTypeId: string
    lossDate: string
    claimedAmount: string
    phone: string
    note: string
    documentMode: 'have_documents' | 'no_documents'
}

/**
 * "File a claim" popup for the customer portal.
 *
 * Step 1: pick one of YOUR issued motor covers (GET claims/me/policies).
 * Step 2: fill the short form and POST claims/me.
 *
 * The API only ever returns covers that belong to the signed-in customer, so there is
 * no org picker, handler, TAT or notification-date field like the admin form has.
 */
export function FileClaimDialog({
    open,
    onOpenChange,
    onCreated,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    /** Called after the API saved the claim, so the page can reload its list. */
    onCreated: () => void
}) {
    // useState is like a variable that re-renders the page when you change it.
    const [certificateId, setCertificateId] = useState<string | null>(null)

    const close = (next: boolean) => {
        if (!next) setCertificateId(null)
        onOpenChange(next)
    }

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {certificateId ? 'File a claim' : 'Choose the cover to claim on'}
                    </DialogTitle>
                </DialogHeader>

                {certificateId ? (
                    <ClaimForm
                        certificateId={certificateId}
                        onBack={() => setCertificateId(null)}
                        onCreated={() => {
                            onCreated()
                            close(false)
                        }}
                    />
                ) : (
                    <CoverPicker onPick={setCertificateId} />
                )}
            </DialogContent>
        </Dialog>
    )
}

/** Step 1 — list of the customer's issued motor covers, with a small search box. */
function CoverPicker({ onPick }: { onPick: (certificateId: string) => void }) {
    const [term, setTerm] = useState('')

    const { data, isLoading } = UseApiQuery<SubmitResponse>({
        url: CUSTOMER_CLAIMS_API.policies,
        params: { term: term.trim() || undefined },
    })

    // The API returns { data: [ ...covers ] }; keep the raw row too so we can show its status label.
    const covers = ((data?.data as unknown[]) ?? [])
        .map((raw) => ({
            hit: normalizePolicyHit(raw),
            statusLabel: (raw as { status_label?: string })?.status_label ?? null,
        }))
        .filter((item): item is { hit: PolicySearchHit; statusLabel: string | null } => item.hit !== null)

    return (
        <div className="flex flex-col gap-4">
            <Input
                placeholder="Search by registration or policy number"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
            />

            {isLoading && <p className="text-sm text-muted-foreground">Loading your covers…</p>}

            {!isLoading && covers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    No issued motor covers found on your account.
                </p>
            )}

            <ul className="flex flex-col gap-3">
                {covers.map(({ hit, statusLabel }) => (
                    <li
                        key={hit.certificateId}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 p-4"
                    >
                        <div className="min-w-0">
                            <p className="font-semibold">{hit.registration ?? 'Vehicle'}</p>
                            <p className="text-sm text-muted-foreground">
                                Policy {hit.policyNumber ?? '—'}
                                {hit.insurerName ? ` · ${hit.insurerName}` : ''}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Cover until {formatClaimDisplayDate(hit.coverTo)}
                                {statusLabel ? ` · ${statusLabel}` : ''}
                            </p>
                        </div>
                        <Button type="button" size="sm" onClick={() => onPick(hit.certificateId)}>
                            File claim
                        </Button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

/** Step 2 — slim claim form for the chosen cover. */
function ClaimForm({
    certificateId,
    onBack,
    onCreated,
}: {
    certificateId: string
    onBack: () => void
    onCreated: () => void
}) {
    const { user } = UseAuth()

    const policyQuery = UseApiQuery<SubmitResponse>({
        url: CUSTOMER_CLAIMS_API.policy(certificateId),
    })
    const policy = normalizePolicy(policyQuery.data)
    const claimTypes = normalizeClaimTypes(policyQuery.data)

    if (policyQuery.isLoading) {
        return <p className="text-sm text-muted-foreground">Loading cover…</p>
    }
    if (!policy) {
        return (
            <div className="flex flex-col gap-3">
                <p className="text-sm text-red-600">We could not load this cover.</p>
                <Button type="button" variant="outline" onClick={onBack}>Back</Button>
            </div>
        )
    }

    return (
        <ClaimFormFields
            // key makes React start with fresh state if another cover is chosen
            key={policy.certificateId}
            policy={policy}
            claimTypes={claimTypes}
            defaultPhone={user?.phone ?? policy.customerPhone ?? ''}
            onBack={onBack}
            onCreated={onCreated}
        />
    )
}

function ClaimFormFields({
    policy,
    claimTypes,
    defaultPhone,
    onBack,
    onCreated,
}: {
    policy: PolicySnapshot
    claimTypes: { id: string; name: string }[]
    defaultPhone: string
    onBack: () => void
    onCreated: () => void
}) {
    const [values, setValues] = useState<ClaimFormValues>({
        vehicleId: policy.selectedVehicleId ?? '',
        claimTypeId: '',
        lossDate: '',
        claimedAmount: '',
        phone: defaultPhone,
        note: '',
        documentMode: 'have_documents',
    })
    const [files, setFiles] = useState<Record<string, File | null>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Update one field: setField('note', 'hello')
    const setField = <K extends keyof ClaimFormValues>(key: K, value: ClaimFormValues[K]) =>
        setValues((current) => ({ ...current, [key]: value }))

    const selectedType = claimTypes.find((type) => type.id === values.claimTypeId)
    const slots = useMemo(
        () => slotsForClaimType(policy.documents, selectedType?.name ?? '', values.claimTypeId || null),
        [policy.documents, selectedType?.name, values.claimTypeId],
    )

    // Loss date must be today or earlier, and inside the cover period.
    const today = todayInNairobi()
    const expiry = policy.expiryDate?.slice(0, 10)
    const lossMax = expiry && expiry < today ? expiry : today
    const lossMin = policy.issuedDate?.slice(0, 10)

    const createClaim = UseApiMutation<SubmitResponse, FormData>({
        url: CUSTOMER_CLAIMS_API.claims,
        method: EMETHODS.POST,
        config: { headers: { 'Content-Type': 'multipart/form-data' } },
        mutationOptions: {
            onSuccess: (response) => {
                const created = readCreatedClaim(response)
                ShowToast.success(`Claim ${created.claimNumber ?? ''} received`.trim())
                onCreated()
            },
            onError: (error) => ShowToast.error(extractErrorMessage(error)),
        },
    })

    /** Returns an object of field -> message. Empty object means the form is valid. */
    const validate = (): Record<string, string> => {
        const found: Record<string, string> = {}
        if (policy.vehicles.length > 1 && !values.vehicleId) found.vehicleId = 'Choose a vehicle'
        if (!values.claimTypeId) found.claimTypeId = 'Choose a claim type'
        if (!values.lossDate) found.lossDate = 'Enter the date of loss'
        else if (values.lossDate > lossMax) found.lossDate = 'Date of loss cannot be after today or the cover end'
        else if (lossMin && values.lossDate < lossMin) found.lossDate = 'Date of loss must be inside the cover period'
        if (!values.phone.trim()) found.phone = 'Enter a phone number'
        if (values.claimedAmount && !(Number(values.claimedAmount.replace(/,/g, '')) >= 0)) {
            found.claimedAmount = 'Enter a valid amount'
        }
        if (countWords(values.note) > CLAIM_NOTE_WORD_LIMIT) {
            found.note = `Note is limited to ${CLAIM_NOTE_WORD_LIMIT} words`
        }
        return found
    }

    const onSubmit = () => {
        const found = validate()
        setErrors(found)
        if (Object.keys(found).length) return

        if (values.documentMode === 'have_documents') {
            const missing = slots.filter((slot) => slot.mandatory && !slot.found && !files[slot.key])
            if (missing.length) {
                ShowToast.error(`Upload: ${missing.map((slot) => slot.label).join(', ')}`)
                return
            }
        }

        // FormData is how a browser sends text fields + files together (like a PHP file-upload form).
        const body = new FormData()
        body.append('certificate_id', policy.certificateId)
        if (values.vehicleId) body.append('vehicle_id', values.vehicleId)
        body.append('claim_type_id', values.claimTypeId)
        body.append('loss_date', values.lossDate)
        body.append('claimant_phone', values.phone.trim())
        body.append('claimed_amount', values.claimedAmount.replace(/,/g, ''))
        body.append('note', values.note)
        body.append('document_mode', values.documentMode)
        if (values.documentMode === 'have_documents') {
            Object.entries(files).forEach(([key, file]) => {
                if (file) body.append(`files[${key}]`, file)
            })
        }
        createClaim.mutate(body)
    }

    const words = countWords(values.note)
    const hasCoverWarning = policy.banners.some((banner) => banner.status === 'fail')

    return (
        <form className="flex flex-col gap-4" onSubmit={(event) => event.preventDefault()} noValidate>
            <div className="rounded-xl bg-muted/40 p-4 text-sm">
                <p className="font-semibold">{policy.registration ?? 'Vehicle'}</p>
                <p className="text-muted-foreground">
                    Policy {policy.policyNumber ?? '—'} · Cover {formatClaimDisplayDate(policy.issuedDate)} to{' '}
                    {formatClaimDisplayDate(policy.expiryDate)}
                </p>
            </div>

            {hasCoverWarning && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                    There is an issue with this cover (for example unpaid premium). You can still file the claim,
                    but it may be put on hold until the issue is resolved.
                </p>
            )}

            {policy.vehicles.length > 1 && (
                <Field label="Vehicle" error={errors.vehicleId}>
                    <select
                        className={selectClass}
                        value={values.vehicleId}
                        onChange={(event) => setField('vehicleId', event.target.value)}
                    >
                        <option value="">Select a vehicle</option>
                        {policy.vehicles.map((vehicle) => (
                            <option key={vehicle.id} value={vehicle.id}>{vehicle.label}</option>
                        ))}
                    </select>
                </Field>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <Field label="Claim type" error={errors.claimTypeId}>
                    <select
                        className={selectClass}
                        value={values.claimTypeId}
                        onChange={(event) => setField('claimTypeId', event.target.value)}
                    >
                        <option value="">Select a claim type</option>
                        {claimTypes.map((type) => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Date of loss" error={errors.lossDate}>
                    <Input
                        type="date"
                        min={lossMin}
                        max={lossMax}
                        value={values.lossDate}
                        onChange={(event) => setField('lossDate', event.target.value)}
                    />
                </Field>

                <Field label="Contact phone" error={errors.phone}>
                    <Input
                        value={values.phone}
                        onChange={(event) => setField('phone', event.target.value)}
                    />
                </Field>

                <Field label="Estimated amount (optional)" error={errors.claimedAmount}>
                    <Input
                        inputMode="decimal"
                        placeholder="0.00"
                        value={values.claimedAmount}
                        onChange={(event) => setField('claimedAmount', event.target.value)}
                    />
                </Field>
            </div>

            <Field label={`What happened? (${words}/${CLAIM_NOTE_WORD_LIMIT} words)`} error={errors.note}>
                <Textarea
                    rows={4}
                    value={values.note}
                    onChange={(event) => setField('note', event.target.value)}
                />
            </Field>

            <Field label="Documents">
                <select
                    className={selectClass}
                    value={values.documentMode}
                    onChange={(event) => setField('documentMode', event.target.value as ClaimFormValues['documentMode'])}
                >
                    <option value="have_documents">I have documents to upload now</option>
                    <option value="no_documents">I will send documents later</option>
                </select>
            </Field>

            {values.documentMode === 'have_documents' && (
                <div className="grid gap-3 md:grid-cols-2">
                    {slots.map((slot) => (
                        <div key={slot.key} className="rounded-xl border border-border/60 p-3">
                            <Label className="mb-1 flex items-center gap-2">
                                {slot.label}
                                {slot.mandatory && !slot.found && (
                                    <span className="text-xs font-semibold text-red-600">Required</span>
                                )}
                                {slot.found && (
                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                                        On policy
                                    </span>
                                )}
                            </Label>
                            {slot.hint && !slot.found && (
                                <p className="mb-2 text-xs text-muted-foreground">{slot.hint}</p>
                            )}
                            <Input
                                type="file"
                                accept={fileAccept}
                                onChange={(event) =>
                                    setFiles((current) => ({
                                        ...current,
                                        [slot.key]: event.target.files?.[0] ?? null,
                                    }))
                                }
                            />
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-between gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onBack} disabled={createClaim.isPending}>
                    Back
                </Button>
                <Button type="button" onClick={onSubmit} disabled={createClaim.isPending}>
                    {createClaim.isPending ? 'Submitting…' : 'Submit claim'}
                </Button>
            </div>
        </form>
    )
}

/** Label + input + error text, so every field above stays short. */
function Field({
    label,
    error,
    children,
}: {
    label: string
    error?: string
    children: ReactNode
}) {
    return (
        <div className="flex min-w-0 flex-col gap-1.5">
            <Label>{label}</Label>
            {children}
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    )
}

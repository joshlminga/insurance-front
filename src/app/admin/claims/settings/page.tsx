import { useBypassOrgLocation } from '@/auth/use-bypass-org-location'
import { BypassOrgLocationPicker, EmptyState, PageHeader } from '@/components/shared'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Button, ReuseableSelectInsurerInput, ReusableSelect, ReuseableInput } from '@/dev/core'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import type { SubmitResponse } from '@/types/types'
import {
  CLAIMS_API,
  normalizeRequirements,
  normalizeSettingsInsurer,
  normalizeTemplates,
  normalizeClaimTypes,
} from '@/utils/claims'
import { EMETHODS } from '@/utils/constatnts'
import { EROUTES } from '@/utils/enums'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  ClaimGrid,
  ClaimSurface,
  claimFieldClass,
  claimsPageClass,
} from '../claim-ui'
import { CLAIMS_ORG_STORAGE_KEY } from '../claims-org'
import { requirementSchema, templateSchema, type RequirementValues, type TemplateValues } from '../claims-schema'

/**
 * Claims settings: insurer inbox, the documents a claim expects, and email wording.
 * Insurer email uses GET/PATCH claims/settings (not a separate insurers route).
 */
export function ClaimsSettingsPage() {
  const {
    isBypass,
    selectedLocationId,
    setLocationId,
    orgContextHeaders,
    canFetch,
  } = useBypassOrgLocation(CLAIMS_ORG_STORAGE_KEY)

  return (
    <div className={claimsPageClass}>
      <PageHeader
        title="Claims settings"
        description="Insurer email, document requirements, and email templates for motor claims."
        actions={[
          { label: 'Motor search', variant: 'outline', href: EROUTES.CLAIMS },
          { label: 'All claims', variant: 'outline', href: EROUTES.CLAIMS_LIST },
        ]}
      />

      {isBypass ? (
        <ClaimSurface padding="sm">
          <BypassOrgLocationPicker
            value={selectedLocationId}
            onChange={setLocationId}
            hint="Settings are scoped to the selected organization location."
          />
        </ClaimSurface>
      ) : null}

      {!canFetch ? (
        <EmptyState
          icon={Building2}
          title="Select an organization location"
          description="Choose an organization above before editing claims settings."
        />
      ) : (
        <Tabs defaultValue="insurers">
          <TabsList className="rounded-full bg-muted/60 p-1">
            <TabsTrigger value="insurers" className="rounded-full">Insurer email</TabsTrigger>
            <TabsTrigger value="documents" className="rounded-full">Document requirements</TabsTrigger>
            <TabsTrigger value="templates" className="rounded-full">Email templates</TabsTrigger>
          </TabsList>
          <TabsContent value="insurers" className="mt-4">
            <InsurerEmailSettings orgContextHeaders={orgContextHeaders} />
          </TabsContent>
          <TabsContent value="documents" className="mt-4">
            <DocumentRequirementSettings orgContextHeaders={orgContextHeaders} />
          </TabsContent>
          <TabsContent value="templates" className="mt-4">
            <EmailTemplateSettings orgContextHeaders={orgContextHeaders} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function InsurerEmailSettings({
  orgContextHeaders,
}: {
  orgContextHeaders?: Record<string, string>
}) {
  const orgConfig = orgContextHeaders ? { headers: orgContextHeaders } : undefined
  const [insurerId, setInsurerId] = useState('')
  const [claimsEmail, setClaimsEmail] = useState('')

  const query = UseApiQuery<SubmitResponse>({
    url: CLAIMS_API.settings,
    params: { insurer_organization_id: insurerId || undefined },
    config: orgConfig,
    queryOptions: { enabled: Boolean(insurerId) },
  })

  useEffect(() => {
    if (!insurerId) {
      setClaimsEmail('')
      return
    }
    const contact = normalizeSettingsInsurer(query.data)
    setClaimsEmail(contact?.claimsEmail ?? '')
  }, [query.data, insurerId])

  const save = UseApiMutation<SubmitResponse, {
    insurer_organization_id: number
    claims_email: string
  }>({
    url: CLAIMS_API.settings,
    method: EMETHODS.PATCH,
    config: orgConfig,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || 'Claims email saved')
        void query.refetch()
      },
      onError: (error) => ShowToast.error(extractErrorMessage(error)),
    },
  })

  return (
    <ClaimSurface>
      <form
        className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end"
        onSubmit={(event) => {
          event.preventDefault()
          if (!insurerId) {
            ShowToast.error('Choose an insurer first.')
            return
          }
          save.mutate({
            insurer_organization_id: Number(insurerId),
            claims_email: claimsEmail.trim(),
          })
        }}
      >
        <ReuseableSelectInsurerInput
          value={insurerId}
          onChange={setInsurerId}
          label="Insurer"
          required
          placeholder="Select insurer..."
        />
        <div className="flex flex-col gap-1">
          <Label htmlFor="claims-email">Claims email</Label>
          <input
            id="claims-email"
            type="email"
            className={claimFieldClass}
            value={claimsEmail}
            disabled={!insurerId || query.isFetching}
            onChange={(event) => setClaimsEmail(event.target.value)}
            placeholder={insurerId ? 'claims@insurer.example' : 'Select an insurer first'}
          />
        </div>
        <Button type="submit" className="rounded-xl" disabled={save.isPending || !insurerId}>
          {save.isPending ? 'Saving…' : 'Save'}
        </Button>
        {query.isError && (
          <p className="md:col-span-3 text-sm text-red-600">{extractErrorMessage(query.error)}</p>
        )}
      </form>
    </ClaimSurface>
  )
}

function DocumentRequirementSettings({
  orgContextHeaders,
}: {
  orgContextHeaders?: Record<string, string>
}) {
  const orgConfig = orgContextHeaders ? { headers: orgContextHeaders } : undefined
  const requirementsQuery = UseApiQuery<SubmitResponse>({
    url: CLAIMS_API.requirements,
    config: orgConfig,
  })
  const typesQuery = UseApiQuery<SubmitResponse>({
    url: CLAIMS_API.types,
    config: orgConfig,
  })
  const requirements = normalizeRequirements(requirementsQuery.data)
  const types = normalizeClaimTypes(typesQuery.data)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [templateFile, setTemplateFile] = useState<File | null>(null)
  const [exampleFile, setExampleFile] = useState<File | null>(null)

  const form = useForm<RequirementValues>({
    resolver: zodResolver(requirementSchema),
    defaultValues: {
      label: '',
      description: '',
      is_mandatory: true,
      allows_multiple: false,
      applicable_claim_type_ids: [],
    },
  })

  const resetForm = () => {
    setEditingId(null)
    setTemplateFile(null)
    setExampleFile(null)
    form.reset({
      label: '',
      description: '',
      is_mandatory: true,
      allows_multiple: false,
      applicable_claim_type_ids: [],
    })
  }

  const openCreate = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEdit = (requirement: (typeof requirements)[number]) => {
    setEditingId(requirement.id)
    setTemplateFile(null)
    setExampleFile(null)
    form.reset({
      label: requirement.label,
      description: requirement.description,
      is_mandatory: requirement.mandatory,
      allows_multiple: requirement.allowsMultiple,
      applicable_claim_type_ids: requirement.claimTypeIds,
    })
    setDialogOpen(true)
  }

  const save = UseApiMutation<SubmitResponse, FormData>({
    // POST so PHP can read the files. _method=PATCH is added when editing.
    url: editingId ? CLAIMS_API.requirement(editingId) : CLAIMS_API.requirements,
    method: EMETHODS.POST,
    config: {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(orgContextHeaders ?? {}),
      },
    },
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || 'Requirement saved')
        resetForm()
        setDialogOpen(false)
        void requirementsQuery.refetch()
      },
      onError: (error) => ShowToast.error(extractErrorMessage(error)),
    },
  })

  const remove = UseApiMutation<SubmitResponse, { id: string }>({
    url: (variables) => CLAIMS_API.requirement(variables.id),
    method: EMETHODS.DELETE,
    config: orgConfig,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || 'Requirement removed')
        void requirementsQuery.refetch()
      },
      onError: (error) => ShowToast.error(extractErrorMessage(error)),
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button type="button" className="rounded-xl" onClick={openCreate}>
          Add requirement
        </Button>
      </div>

      {requirements.length === 0 && (
        <ClaimSurface padding="sm">
          <p className="text-sm text-muted-foreground">No document requirements yet.</p>
        </ClaimSurface>
      )}

      <ClaimGrid>
        {requirements.map((requirement) => (
          <ClaimSurface key={requirement.id} className="flex h-full flex-col gap-3">
            <div>
              <p className="font-semibold">{requirement.label}</p>
              {requirement.description && (
                <p className="mt-1 text-sm text-muted-foreground">{requirement.description}</p>
              )}
              <p className="mt-2 text-sm text-muted-foreground">
                {requirement.mandatory ? 'Mandatory' : 'Optional'}
                {requirement.allowsMultiple ? ' · Multiple files' : ''}
                {requirement.claimTypeIds.length
                  ? ` · ${requirement.claimTypeIds.length} claim type(s)`
                  : ' · All claim types'}
              </p>
            </div>
            <div className="mt-auto flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() => openEdit(requirement)}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                disabled={remove.isPending}
                onClick={() => remove.mutate({ id: requirement.id })}
              >
                Delete
              </Button>
            </div>
          </ClaimSurface>
        ))}
      </ClaimGrid>

      {/* Create / edit requirement in a dialog — keeps the tab as a card grid */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit requirement' : 'Add requirement'}</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-3 py-2"
            onSubmit={form.handleSubmit((values) => {
              const formData = new FormData()
              formData.append('label', values.label.trim())
              formData.append('description', values.description ?? '')
              formData.append('is_mandatory', values.is_mandatory ? '1' : '0')
              formData.append('allows_multiple', values.allows_multiple ? '1' : '0')
              if (editingId) formData.append('_method', 'PATCH')
              values.applicable_claim_type_ids.forEach((id) => {
                formData.append('applicable_claim_type_ids[]', id)
              })
              if (templateFile) formData.append('template', templateFile)
              if (exampleFile) formData.append('example', exampleFile)
              save.mutate(formData)
            })}
          >
            <ReuseableInput control={form.control} name="label" label="Label" className={claimFieldClass} required />
            <ReuseableInput control={form.control} name="description" label="Description" className={claimFieldClass} />
            <Controller
              control={form.control}
              name="is_mandatory"
              render={({ field }) => (
                <Label className="flex items-center gap-2 font-normal">
                  <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                  Mandatory
                </Label>
              )}
            />
            <Controller
              control={form.control}
              name="allows_multiple"
              render={({ field }) => (
                <Label className="flex items-center gap-2 font-normal">
                  <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                  Allow more than one file
                </Label>
              )}
            />
            <div className="grid gap-2">
              <p className="text-sm font-medium">Claim types</p>
              <p className="text-xs text-muted-foreground">Leave all unticked to apply this document to every type.</p>
              {types.map((type) => (
                <Controller
                  key={type.id}
                  control={form.control}
                  name="applicable_claim_type_ids"
                  render={({ field }) => (
                    <Label className="flex items-center gap-2 font-normal">
                      <Checkbox
                        checked={field.value.includes(type.id)}
                        onCheckedChange={(checked) => {
                          const next = checked
                            ? [...field.value, type.id]
                            : field.value.filter((id) => id !== type.id)
                          field.onChange(next)
                        }}
                      />
                      {type.name}
                    </Label>
                  )}
                />
              ))}
            </div>
            <Label className="grid gap-1 text-sm font-medium">
              Template file
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(event) => setTemplateFile(event.target.files?.[0] ?? null)} />
            </Label>
            <Label className="grid gap-1 text-sm font-medium">
              Example file
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(event) => setExampleFile(event.target.files?.[0] ?? null)} />
            </Label>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm() }}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? 'Saving…' : 'Save requirement'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmailTemplateSettings({
  orgContextHeaders,
}: {
  orgContextHeaders?: Record<string, string>
}) {
  const orgConfig = orgContextHeaders ? { headers: orgContextHeaders } : undefined
  const query = UseApiQuery<SubmitResponse>({
    url: CLAIMS_API.templates,
    config: orgConfig,
  })
  const templates = normalizeTemplates(query.data)
  const form = useForm<TemplateValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: { type: '', subject: '', body: '' },
  })
  const selectedType = form.watch('type')
  const selected = templates.find((template) => template.type === selectedType)

  // Copy the saved subject/body only when the clerk picks a different template.
  useEffect(() => {
    const match = templates.find((template) => template.type === selectedType)
    if (!match) return
    form.setValue('subject', match.subject)
    form.setValue('body', match.body)
    // templates is rebuilt each render; selectedType is the real trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType])

  const save = UseApiMutation<SubmitResponse, { type: string; subject: string; body: string }>({
    url: (variables) => CLAIMS_API.template(variables.type),
    method: EMETHODS.PATCH,
    config: orgConfig,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || 'Template saved')
        void query.refetch()
      },
      onError: (error) => ShowToast.error(extractErrorMessage(error)),
    },
  })

  return (
    <ClaimSurface>
      <form
        className="grid gap-3"
        onSubmit={form.handleSubmit((values) => {
          if (!values.type) return
          save.mutate({ type: values.type, subject: values.subject, body: values.body })
        })}
      >
        <ReusableSelect
          control={form.control}
          name="type"
          label="Template"
          placeholder="Select a template"
          options={templates.map((template) => ({ value: template.type, label: template.label }))}
        />
        {selected?.placeholders.length ? (
          <p className="text-sm text-muted-foreground">Placeholders: {selected.placeholders.join(', ')}</p>
        ) : null}
        <ReuseableInput control={form.control} name="subject" label="Subject" className={claimFieldClass} required />
        <div className="flex flex-col gap-1">
          <Label htmlFor="template-body">Body</Label>
          <Textarea id="template-body" rows={10} className="rounded-xl" {...form.register('body')} />
          {form.formState.errors.body && (
            <p className="text-sm text-red-500">{form.formState.errors.body.message}</p>
          )}
        </div>
        <Button type="submit" className="w-fit rounded-xl" disabled={save.isPending || !selectedType}>
          {save.isPending ? 'Saving…' : 'Save override'}
        </Button>
      </form>
    </ClaimSurface>
  )
}

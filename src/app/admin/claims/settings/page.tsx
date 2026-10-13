import { PageHeader } from '@/components/shared'
import { Checkbox } from '@/components/ui/checkbox'
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
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { claimFieldClass } from '../claim-ui'
import { requirementSchema, templateSchema, type RequirementValues, type TemplateValues } from '../claims-schema'

/**
 * Claims settings: insurer inbox, the documents a claim expects, and email wording.
 * Insurer email uses GET/PATCH claims/settings (not a separate insurers route).
 */
export function ClaimsSettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Claims settings"
        description="Insurer email, document requirements, and email templates for motor claims."
        actions={[{ label: 'All claims', variant: 'outline', href: EROUTES.CLAIMS }]}
      />
      <Tabs defaultValue="insurers">
        <TabsList>
          <TabsTrigger value="insurers">Insurer email</TabsTrigger>
          <TabsTrigger value="documents">Document requirements</TabsTrigger>
          <TabsTrigger value="templates">Email templates</TabsTrigger>
        </TabsList>
        <TabsContent value="insurers" className="mt-4">
          <InsurerEmailSettings />
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <DocumentRequirementSettings />
        </TabsContent>
        <TabsContent value="templates" className="mt-4">
          <EmailTemplateSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InsurerEmailSettings() {
  const [insurerId, setInsurerId] = useState('')
  const [claimsEmail, setClaimsEmail] = useState('')

  const query = UseApiQuery<SubmitResponse>({
    url: CLAIMS_API.settings,
    params: { insurer_organization_id: insurerId || undefined },
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
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || 'Claims email saved')
        void query.refetch()
      },
      onError: (error) => ShowToast.error(extractErrorMessage(error)),
    },
  })

  return (
    <form
      className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
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
      <Button type="submit" disabled={save.isPending || !insurerId}>
        {save.isPending ? 'Saving…' : 'Save'}
      </Button>
      {query.isError && (
        <p className="md:col-span-3 text-sm text-red-600">{extractErrorMessage(query.error)}</p>
      )}
    </form>
  )
}

function DocumentRequirementSettings() {
  const requirementsQuery = UseApiQuery<SubmitResponse>({
    url: CLAIMS_API.requirements,
  })
  const typesQuery = UseApiQuery<SubmitResponse>({
    url: CLAIMS_API.types,
  })
  const requirements = normalizeRequirements(requirementsQuery.data)
  const types = normalizeClaimTypes(typesQuery.data)
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

  const save = UseApiMutation<SubmitResponse, FormData>({
    // POST so PHP can read the files. _method=PATCH is added when editing.
    url: editingId ? CLAIMS_API.requirement(editingId) : CLAIMS_API.requirements,
    method: EMETHODS.POST,
    config: { headers: { 'Content-Type': 'multipart/form-data' } },
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || 'Requirement saved')
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
        void requirementsQuery.refetch()
      },
      onError: (error) => ShowToast.error(extractErrorMessage(error)),
    },
  })

  const remove = UseApiMutation<SubmitResponse, { id: string }>({
    url: (variables) => CLAIMS_API.requirement(variables.id),
    method: EMETHODS.DELETE,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || 'Requirement removed')
        void requirementsQuery.refetch()
      },
      onError: (error) => ShowToast.error(extractErrorMessage(error)),
    },
  })

  return (
    <div className="grid gap-4">
      <form
        className="grid gap-3 rounded-lg border bg-card p-4"
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
        <h2 className="text-lg font-semibold">{editingId ? 'Edit requirement' : 'Add requirement'}</h2>
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
        <div className="flex gap-2">
          <Button type="submit" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save requirement'}</Button>
          {editingId && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingId(null)
                form.reset({
                  label: '',
                  description: '',
                  is_mandatory: true,
                  allows_multiple: false,
                  applicable_claim_type_ids: [],
                })
              }}
            >
              Cancel edit
            </Button>
          )}
        </div>
      </form>

      <div className="flex flex-col gap-2">
        {requirements.map((requirement) => (
          <div key={requirement.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-4">
            <div>
              <p className="font-medium">{requirement.label}</p>
              <p className="text-sm text-muted-foreground">
                {requirement.mandatory ? 'Mandatory' : 'Optional'}
                {requirement.allowsMultiple ? ' · Multiple files' : ''}
                {requirement.claimTypeIds.length ? ` · ${requirement.claimTypeIds.length} claim type(s)` : ' · All claim types'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingId(requirement.id)
                  form.reset({
                    label: requirement.label,
                    description: requirement.description,
                    is_mandatory: requirement.mandatory,
                    allows_multiple: requirement.allowsMultiple,
                    applicable_claim_type_ids: requirement.claimTypeIds,
                  })
                }}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={remove.isPending}
                onClick={() => remove.mutate({ id: requirement.id })}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmailTemplateSettings() {
  const query = UseApiQuery<SubmitResponse>({
    url: CLAIMS_API.templates,
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
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || 'Template saved')
        void query.refetch()
      },
      onError: (error) => ShowToast.error(extractErrorMessage(error)),
    },
  })

  return (
    <form
      className="grid gap-3 rounded-lg border bg-card p-4"
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
        <Textarea id="template-body" rows={10} {...form.register('body')} />
        {form.formState.errors.body && (
          <p className="text-sm text-red-500">{form.formState.errors.body.message}</p>
        )}
      </div>
      <Button type="submit" disabled={save.isPending || !selectedType}>
        {save.isPending ? 'Saving…' : 'Save override'}
      </Button>
    </form>
  )
}

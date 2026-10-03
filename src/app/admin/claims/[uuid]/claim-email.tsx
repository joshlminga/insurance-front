import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button, ReusableSelect, ReuseableInput } from '@/dev/core'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import type { SubmitResponse } from '@/types/types'
import {
  CLAIMS_API,
  normalizeTemplates,
  readEmailPreview,
  type ClaimDetail,
  type ClaimEmailLog,
} from '@/utils/claims'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { claimFieldClass } from '../claim-ui'

const emailSchema = z.object({
  template: z.string().min(1, 'Choose a template'),
  notify_customer: z.boolean(),
  notify_handler: z.boolean(),
  notify_insurer: z.boolean(),
  extra_email: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
})

type EmailValues = z.infer<typeof emailSchema>

/**
 * Pick a template, preview the message, then send.
 * The insurer tick stays off when that insurer has no claims email.
 * A typed address can still be added.
 */
export function ClaimEmail({
  claim,
  logs,
  preferredTemplate,
  onSent,
}: {
  claim: ClaimDetail
  logs: ClaimEmailLog[]
  preferredTemplate: string | null
  onSent: () => void
}) {
  const form = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      template: '',
      notify_customer: Boolean(claim.customerEmail),
      notify_handler: false,
      notify_insurer: false,
      extra_email: '',
      subject: '',
      body: '',
    },
  })

  const templatesQuery = UseApiQuery<SubmitResponse>({
    url: CLAIMS_API.templates,
    params: { product: 'Motor' },
  })
  const templates = normalizeTemplates(templatesQuery.data)
  const selectedType = form.watch('template')
  const selected = templates.find((template) => template.type === selectedType)
  const appliedHint = useRef<string | null>(null)

  useEffect(() => {
    if (!preferredTemplate || appliedHint.current === preferredTemplate) return
    const match = templates.find((template) => (
      template.type === preferredTemplate || template.type.includes(preferredTemplate)
    ))
    if (!match) return
    appliedHint.current = preferredTemplate
    form.setValue('template', match.type)
  }, [preferredTemplate, templates, form])

  const preview = UseApiMutation<SubmitResponse, EmailValues>({
    url: CLAIMS_API.emailPreview(claim.uuid),
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (response) => {
        const next = readEmailPreview(response)
        if (!next) {
          ShowToast.error('Preview did not return a subject and body.')
          return
        }
        form.setValue('subject', next.subject)
        form.setValue('body', next.body)
        if (next.warnings.length) ShowToast.error(next.warnings.join('\n'))
      },
      onError: (error) => ShowToast.error(extractErrorMessage(error)),
    },
  })

  const send = UseApiMutation<SubmitResponse, EmailValues>({
    url: CLAIMS_API.emailSend(claim.uuid),
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || 'Email sent')
        onSent()
      },
      onError: (error) => ShowToast.error(extractErrorMessage(error)),
    },
  })

  const payload = (values: EmailValues) => ({
    ...values,
    recipients: values.extra_email?.trim() ? [values.extra_email.trim()] : [],
    notify_insurer: Boolean(claim.insurerClaimsEmail) && values.notify_insurer,
  })

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <form className="grid content-start gap-3 rounded-lg border bg-card p-4">
        <h2 className="text-lg font-semibold">Email</h2>
        <ReusableSelect
          control={form.control}
          name="template"
          label="Template"
          placeholder="Select a template"
          options={templates.map((template) => ({ value: template.type, label: template.label }))}
          required
        />
        {selected?.placeholders?.length ? (
          <p className="text-sm text-muted-foreground">
            Placeholders: {selected.placeholders.join(', ')}
          </p>
        ) : null}
        <Controller
          control={form.control}
          name="notify_customer"
          render={({ field }) => (
            <Label className="flex items-center gap-2 font-normal">
              <Checkbox
                checked={field.value}
                disabled={!claim.customerEmail}
                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
              />
              Customer {claim.customerEmail ? `(${claim.customerEmail})` : '(no email on the claim)'}
            </Label>
          )}
        />
        <Controller
          control={form.control}
          name="notify_handler"
          render={({ field }) => (
            <Label className="flex items-center gap-2 font-normal">
              <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
              Handler {claim.handlerEmail ? `(${claim.handlerEmail})` : ''}
            </Label>
          )}
        />
        {claim.insurerClaimsEmail ? (
          <Controller
            control={form.control}
            name="notify_insurer"
            render={({ field }) => (
              <Label className="flex items-center gap-2 font-normal">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                />
                Insurer ({claim.insurerClaimsEmail})
              </Label>
            )}
          />
        ) : (
          <div className="grid gap-1">
            <Label className="flex items-center gap-2 font-normal text-muted-foreground">
              <Checkbox checked={false} disabled />
              Insurer
            </Label>
            <p className="text-sm text-amber-700">
              This insurer has no claims email, so the insurer tick stays off. Type an address below if you still need to send one.
            </p>
          </div>
        )}
        <ReuseableInput
          control={form.control}
          name="extra_email"
          label="Also send to"
          placeholder="name@example.com"
          className={claimFieldClass}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={preview.isPending}
            onClick={form.handleSubmit((values) => preview.mutate(payload(values)))}
          >
            {preview.isPending ? 'Previewing…' : 'Preview'}
          </Button>
          <Button
            type="button"
            disabled={send.isPending || !form.watch('subject')}
            onClick={form.handleSubmit((values) => send.mutate(payload(values)))}
          >
            {send.isPending ? 'Sending…' : 'Send'}
          </Button>
        </div>
        <ReuseableInput control={form.control} name="subject" label="Subject" className={claimFieldClass} />
        <div className="flex flex-col gap-1">
          <Label htmlFor="email-body">Body</Label>
          <Textarea id="email-body" rows={8} {...form.register('body')} />
        </div>
      </form>

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
        <h2 className="text-lg font-semibold">Sent emails</h2>
        {logs.length === 0 && <p className="text-sm text-muted-foreground">No emails sent yet.</p>}
        {logs.map((log) => (
          <div key={log.id} className="border-b pb-3 last:border-b-0">
            <p className="font-medium">{log.subject}</p>
            <p className="text-sm text-muted-foreground">{log.recipients || '—'}</p>
            <p className="text-xs text-muted-foreground">{[log.status, log.at].filter(Boolean).join(' · ')}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

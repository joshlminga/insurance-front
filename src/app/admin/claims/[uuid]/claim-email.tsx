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
import { ClaimSurface, claimFieldClass } from '../claim-ui'

const emailSchema = z.object({
  template: z.string().min(1, 'Choose a template'),
  notify_customer: z.boolean(),
  notify_handler: z.boolean(),
  notify_insurer: z.boolean(),
  extra_email: z.string().optional(),
  cc_email: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  offer_amount: z.string().optional(),
})

type EmailValues = z.infer<typeof emailSchema>

type EmailSendPayload = {
  template: string
  to: string[]
  cc: string[]
  subject: string
  body: string
  attachment_ids: number[]
  offer_amount?: string
}

type EmailPreviewPayload = {
  template: string
  offer_amount?: string
}

/**
 * Pick a template, preview the message, then send.
 * The insurer tick stays off when that insurer has no claims email.
 * A typed address can still be added.
 */
export function ClaimEmail({
  claim,
  logs,
  preferredTemplate,
  orgContextHeaders,
  onSent,
}: {
  claim: ClaimDetail
  logs: ClaimEmailLog[]
  preferredTemplate: string | null
  orgContextHeaders?: Record<string, string>
  onSent: () => void
}) {
  const orgConfig = orgContextHeaders ? { headers: orgContextHeaders } : undefined
  const form = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      template: '',
      notify_customer: Boolean(claim.customerEmail),
      notify_handler: false,
      notify_insurer: false,
      extra_email: '',
      cc_email: '',
      subject: '',
      body: '',
      offer_amount: '',
    },
  })

  const templatesQuery = UseApiQuery<SubmitResponse>({
    url: CLAIMS_API.templates,
    config: orgConfig,
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

  const preview = UseApiMutation<SubmitResponse, EmailPreviewPayload>({
    url: CLAIMS_API.emailPreview(claim.uuid),
    method: EMETHODS.POST,
    config: orgConfig,
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

  const send = UseApiMutation<SubmitResponse, EmailSendPayload>({
    url: CLAIMS_API.emails(claim.uuid),
    method: EMETHODS.POST,
    config: orgConfig,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || 'Email sent')
        onSent()
      },
      onError: (error) => ShowToast.error(extractErrorMessage(error)),
    },
  })

  const buildRecipients = (values: EmailValues): string[] => {
    const to: string[] = []
    if (values.notify_customer && claim.customerEmail) to.push(claim.customerEmail)
    if (values.notify_handler && claim.handlerEmail) to.push(claim.handlerEmail)
    if (values.notify_insurer && claim.insurerClaimsEmail) to.push(claim.insurerClaimsEmail)
    if (values.extra_email?.trim()) to.push(values.extra_email.trim())
    return [...new Set(to)]
  }

  const buildCc = (values: EmailValues): string[] => {
    const cc = values.cc_email?.trim()
    return cc ? [cc] : []
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Email composer stays as a card — subject/body inputs are necessary */}
      <ClaimSurface className="grid content-start gap-3 break-inside-avoid">
        <form className="grid content-start gap-3" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">Email</h2>
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
        <ReuseableInput
          control={form.control}
          name="cc_email"
          label="CC"
          placeholder="optional@example.com"
          className={claimFieldClass}
        />
        {selectedType === 'settlement_offer' && (
          <ReuseableInput
            control={form.control}
            name="offer_amount"
            label="Offer amount"
            className={claimFieldClass}
          />
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={preview.isPending}
            onClick={form.handleSubmit((values) => preview.mutate({
              template: values.template,
              offer_amount: values.offer_amount?.trim() || undefined,
            }))}
          >
            {preview.isPending ? 'Previewing…' : 'Preview'}
          </Button>
          <Button
            type="button"
            disabled={send.isPending || !form.watch('subject')}
            onClick={form.handleSubmit((values) => {
              const to = buildRecipients(values)
              if (!to.length) {
                ShowToast.error('Choose at least one recipient.')
                return
              }
              if (!values.subject?.trim() || !values.body?.trim()) {
                ShowToast.error('Preview the email first, or enter a subject and body.')
                return
              }
              send.mutate({
                template: values.template,
                to,
                cc: buildCc(values),
                subject: values.subject.trim(),
                body: values.body.trim(),
                attachment_ids: [],
                offer_amount: values.offer_amount?.trim() || undefined,
              })
            })}
          >
            {send.isPending ? 'Sending…' : 'Send'}
          </Button>
        </div>
        <ReuseableInput control={form.control} name="subject" label="Subject" className={claimFieldClass} />
        <div className="flex flex-col gap-1">
          <Label htmlFor="email-body">Body</Label>
          <Textarea id="email-body" rows={8} className="rounded-xl" {...form.register('body')} />
        </div>
        </form>
      </ClaimSurface>

      <ClaimSurface className="flex break-inside-avoid flex-col gap-3">
        <h2 className="text-base font-semibold">Sent emails</h2>
        {logs.length === 0 && <p className="text-sm text-muted-foreground">No emails sent yet.</p>}
        {logs.map((log) => (
          <div key={log.id} className="rounded-xl border border-border/40 bg-muted/20 px-3 py-2">
            <p className="font-medium">{log.subject}</p>
            <p className="text-sm text-muted-foreground">{log.recipients || '—'}</p>
            <p className="text-xs text-muted-foreground">{[log.status, log.at].filter(Boolean).join(' · ')}</p>
          </div>
        ))}
      </ClaimSurface>
    </div>
  )
}

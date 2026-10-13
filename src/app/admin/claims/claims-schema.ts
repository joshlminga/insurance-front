import { z } from 'zod'
import {
  CLAIM_NOTE_WORD_LIMIT,
  CLAIM_NOTIFICATION_GAP_DAYS,
  countWords,
  earliestClaimNotificationDate,
  todayInNairobi,
} from '@/utils/claims'

// Same job as a Laravel Form Request: check the fields before we call the API.

export const claimSearchSchema = z.object({
  term: z.string().trim().min(2, 'Enter at least 2 characters'),
})

export type ClaimSearchValues = z.infer<typeof claimSearchSchema>

export function makeClaimRegisterSchema(bounds: {
  issuedDate?: string | null
  expiryDate?: string | null
}) {
  return z.object({
    vehicle_id: z.string().min(1, 'Choose a vehicle'),
    claimant_name: z.string().trim().min(1, 'Enter the claimant'),
    claimant_email: z.string().trim().email('Enter a valid email'),
    claimant_phone: z.string().trim().min(1, 'Enter a phone number'),
    reported_by_user_id: z.string().min(1, 'Choose who reported the claim'),
    handler_id: z.string().min(1, 'Choose a handler'),
    category: z.string().min(1),
    claim_type_id: z.string().min(1, 'Choose a claim type'),
    tat_days: z
      .string()
      .regex(/^\d+$/, 'Enter TAT days')
      .refine((value) => Number(value) >= 1, 'TAT must be at least 1 day'),
    claimed_amount: z
      .string()
      .trim()
      .min(1, 'Enter the claimed amount')
      .refine((value) => Number(value.replace(/,/g, '')) > 0, 'Amount must be greater than 0'),
    loss_date: z.string().min(1, 'Enter the date of loss'),
    notified_to_organization_date: z.string().min(1, 'Enter the date notified to the organization'),
    notified_to_insurer_date: z.string().min(1, 'Enter the date notified to the insurer'),
    note: z
      .string()
      .refine(
        (value) => countWords(value) <= CLAIM_NOTE_WORD_LIMIT,
        `Note is limited to ${CLAIM_NOTE_WORD_LIMIT} words`,
      ),
    document_mode: z.enum(['have_documents', 'no_documents']),
  }).superRefine((data, ctx) => {
    const today = todayInNairobi()
    const loss = data.loss_date
    const notified = data.notified_to_organization_date
    const insurer = data.notified_to_insurer_date
    const gapLabel = CLAIM_NOTIFICATION_GAP_DAYS === 1
      ? '1 day'
      : `${CLAIM_NOTIFICATION_GAP_DAYS} days`
    const earliest = earliestClaimNotificationDate(loss, today)

    // Loss may be in the past, but not in the future.
    if (loss && loss > today) {
      ctx.addIssue({
        code: 'custom',
        message: 'Date of loss cannot be in the future',
        path: ['loss_date'],
      })
    }

    const issued = bounds.issuedDate?.slice(0, 10)
    const expiry = bounds.expiryDate?.slice(0, 10)
    if (loss && issued && loss < issued) {
      ctx.addIssue({
        code: 'custom',
        message: 'Date of loss must be inside the cover period',
        path: ['loss_date'],
      })
    }
    if (loss && expiry && loss > expiry) {
      ctx.addIssue({
        code: 'custom',
        message: 'Date of loss must be inside the cover period',
        path: ['loss_date'],
      })
    }

    // Notification: today or later, and at least gap days after loss (future OK).
    if (notified && notified < earliest) {
      ctx.addIssue({
        code: 'custom',
        message: `Must be on or after ${earliest} (today or later, and at least ${gapLabel} after the date of loss)`,
        path: ['notified_to_organization_date'],
      })
    }
    if (insurer && insurer < earliest) {
      ctx.addIssue({
        code: 'custom',
        message: `Must be on or after ${earliest} (today or later, and at least ${gapLabel} after the date of loss)`,
        path: ['notified_to_insurer_date'],
      })
    }
    if (insurer && notified && insurer < notified) {
      ctx.addIssue({
        code: 'custom',
        message: 'Insurer notification cannot be before the organization was notified',
        path: ['notified_to_insurer_date'],
      })
    }
  })
}

export type ClaimRegisterValues = z.infer<ReturnType<typeof makeClaimRegisterSchema>>

export const claimTypeSchema = z.object({
  name: z.string().trim().min(2, 'Enter the type name'),
  default_tat_days: z
    .string()
    .regex(/^\d+$/, 'Enter TAT days')
    .refine((value) => Number(value) >= 1, 'TAT must be at least 1 day'),
})

export type ClaimTypeValues = z.infer<typeof claimTypeSchema>

export const requirementSchema = z.object({
  label: z.string().trim().min(2, 'Enter a label'),
  description: z.string().optional(),
  is_mandatory: z.boolean(),
  allows_multiple: z.boolean(),
  applicable_claim_type_ids: z.array(z.string()),
})

export type RequirementValues = z.infer<typeof requirementSchema>

export const templateSchema = z.object({
  type: z.string().min(1, 'Choose a template'),
  subject: z.string().trim().min(1, 'Enter a subject'),
  body: z.string().trim().min(1, 'Enter the email body'),
})

export type TemplateValues = z.infer<typeof templateSchema>

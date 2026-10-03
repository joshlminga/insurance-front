import { z } from 'zod'
import { CLAIM_NOTE_WORD_LIMIT, countWords, todayInNairobi } from '@/utils/claims'

// Same job as a Laravel Form Request: check the fields before we call the API.

export const claimSearchSchema = z.object({
  mode: z.enum(['registration', 'policy_number', 'certificate_number', 'customer']),
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
    reported_by_user_id: z.string().min(1, 'Choose who reported the claim'),
    handler_id: z.string().min(1, 'Choose a handler'),
    category: z.string().min(1),
    claim_type_id: z.string().min(1, 'Choose a claim type'),
    expected_tat_days: z
      .string()
      .regex(/^\d+$/, 'Enter TAT days')
      .refine((value) => Number(value) >= 1, 'TAT must be at least 1 day'),
    claimed_amount: z
      .string()
      .trim()
      .min(1, 'Enter the claimed amount')
      .refine((value) => Number(value.replace(/,/g, '')) > 0, 'Amount must be greater than 0'),
    date_of_loss: z.string().min(1, 'Enter the date of loss'),
    date_notified_to_organization: z.string().min(1, 'Enter the date notified to the organization'),
    date_notified_to_insurer: z.string().optional(),
    note: z
      .string()
      .refine(
        (value) => countWords(value) <= CLAIM_NOTE_WORD_LIMIT,
        `Note is limited to ${CLAIM_NOTE_WORD_LIMIT} words`,
      ),
    document_mode: z.enum(['have', 'none']),
  }).superRefine((data, ctx) => {
    const today = todayInNairobi()
    const loss = data.date_of_loss
    const notified = data.date_notified_to_organization
    const insurer = data.date_notified_to_insurer?.trim() ?? ''

    const rejectFuture = (field: string, value: string) => {
      if (value && value > today) {
        ctx.addIssue({
          code: 'custom',
          message: 'Date cannot be in the future',
          path: [field],
        })
      }
    }

    rejectFuture('date_of_loss', loss)
    rejectFuture('date_notified_to_organization', notified)
    if (insurer) rejectFuture('date_notified_to_insurer', insurer)

    const issued = bounds.issuedDate?.slice(0, 10)
    const expiry = bounds.expiryDate?.slice(0, 10)
    if (loss && issued && loss < issued) {
      ctx.addIssue({
        code: 'custom',
        message: 'Date of loss must be inside the cover period',
        path: ['date_of_loss'],
      })
    }
    if (loss && expiry && loss > expiry) {
      ctx.addIssue({
        code: 'custom',
        message: 'Date of loss must be inside the cover period',
        path: ['date_of_loss'],
      })
    }
    if (loss && notified && notified < loss) {
      ctx.addIssue({
        code: 'custom',
        message: 'Notification cannot be before the date of loss',
        path: ['date_notified_to_organization'],
      })
    }
    if (insurer && notified && insurer < notified) {
      ctx.addIssue({
        code: 'custom',
        message: 'Insurer notification cannot be before the organization was notified',
        path: ['date_notified_to_insurer'],
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
  mandatory: z.boolean(),
  allows_multiple: z.boolean(),
  claim_type_ids: z.array(z.string()),
})

export type RequirementValues = z.infer<typeof requirementSchema>

export const templateSchema = z.object({
  type: z.string().min(1, 'Choose a template'),
  subject: z.string().trim().min(1, 'Enter a subject'),
  body: z.string().trim().min(1, 'Enter the email body'),
})

export type TemplateValues = z.infer<typeof templateSchema>

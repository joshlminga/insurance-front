import type { CustomerVerificationDetailsProps } from '@/types/types'

export type AdminMotorCustomerContact = {
    email?: string
    name?: string
    phone?: string
}

/** Props for admin motor steps after quotation results. */
export type AdminMotorStepProps = CustomerVerificationDetailsProps & {
    defaultCustomerContact?: AdminMotorCustomerContact
}

export const ADMIN_EMAIL_DIALOG_PROPS = {
    requireRecipientEmail: true,
} as const

export function buildAdminShareDialogProps(contact?: AdminMotorCustomerContact) {
    return {
        requireRecipientEmail: true as const,
        defaultEmail: contact?.email,
        defaultCustomerContact: contact,
    }
}

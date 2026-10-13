import type { CustomerVerificationDetailsProps } from '@/types/types'

export type AdminTravelCustomerContact = {
    email?: string
    name?: string
    phone?: string
}

/** Props for admin travel steps after quotation results. */
export type AdminTravelStepProps = CustomerVerificationDetailsProps & {
    defaultCustomerContact?: AdminTravelCustomerContact
}

export function buildAdminTravelShareDialogProps(contact?: AdminTravelCustomerContact) {
    return {
        requireRecipientEmail: true as const,
        defaultEmail: contact?.email,
        defaultCustomerContact: contact,
    }
}

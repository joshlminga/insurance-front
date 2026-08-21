import { AdminMotorInvoicePayment } from "@/app/admin/quotations/motor/steppers/invoice-payment";
import { AdminMotorPaymentOptions } from "@/app/admin/quotations/motor/steppers/payment-options";
import { KycInfo } from "@/app/customer/motor/steppers/kyc-info";
import { SuccessPurchase } from "@/app/customer/motor/steppers/success-purchase";

export const PURCHASE_STEPS = [
    { 
        title: 'KYC', 
        Component: KycInfo 
    },
    { 
        title: 'Invoice', 
        Component: AdminMotorInvoicePayment 
    },
    { 
        title: 'Payment', 
        Component: AdminMotorPaymentOptions 
    },
    { 
        title: 'Success', 
        Component: SuccessPurchase 
    },
] as const
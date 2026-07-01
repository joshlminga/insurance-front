import type z from "zod";
import {
    CustomerDetailsSchema,
    OTPVerificationSchema,
    VehicleDetailsSchema,
    AdminMotorQuotationSchema,
    LoginSchema,
    SignUpSchema,
    KycSchema,
    MotorKycSchema,
    InvoicePaymentSchema,
    PaymentDetailsSchema,
    ResendOtpPayloadSchema,
    OrganizationSchema,
    OrganizationEditSchema,
    UsersSchema,
    AddLocationSchema,
    EditLocationSchema,
    OrganizationLocationCreateSchema,
    OrganizationLocationEditSchema,
    CreateCoverTypeSchema,
    CreateProductSchema,
    EditProductSchema,
    UpdateProfileSchema,
    UpdatePasswordSchema,
    CreateCoveringSchema,
    CreateVehicleClassesSchema,
    CreateVehicleUsesSchema,
    CreateMotorAddonBenefitsSchema,
    CreateMotorDetailedBenefitsSchema,
    CreateMotorTonageSchema,
    CreateMotorProductRatesSchema,
    CreateMotorRateBenefitsSchema,
    CreateMotorRateExcessBenefitsSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
    SendViaEmailSchema,
    SendMessageSchema,
    ContactUsSchema,
    RoleCreateSchema,
    RoleEditSchema
} from "./form-schema";

export type CustomerFormValues = z.infer<typeof CustomerDetailsSchema>
export type OTPFormValues = z.infer<typeof OTPVerificationSchema>
export type ResendOTPFormValues = z.infer<typeof ResendOtpPayloadSchema>
export type VehicleFormValues = z.infer<typeof VehicleDetailsSchema>
export type AdminMotorQuotationFormValues = z.infer<typeof AdminMotorQuotationSchema>
export type LoginFormValues = z.infer<typeof LoginSchema>
export type SignUpFormValues = z.infer<typeof SignUpSchema>
export type ForgotPasswordValues = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof ResetPasswordSchema>;
export type KycFormValues = z.infer<typeof KycSchema>
export type MotorKycFormValues = z.infer<typeof MotorKycSchema>
export type InvoicePaymentFormValues = z.infer<typeof InvoicePaymentSchema>
export type PaymentFormValues = z.infer<typeof PaymentDetailsSchema>

/** Flat form shape for react-hook-form (all payment-method fields in one object) */
export type PaymentFormInput = {
  payment_method: "mpesa" | "card" | "pesapal" | "paypal" | "credit" | "cash"
  payment_plans?: string
  first_installment?: string
  second_installment?: string
  third_installment?: string
  invoice_id?: string
  phone_number?: string
  amount?: number
  mpesa_transaction_code?: string
  card_provider?: "paystack" | "pesapal" | "dpo"
  pesapal_email?: string
  paypal_email?: string
  available_credit?: string
  unsettled_credit?: string
  unsettled_credit_limit?: string
  credit_acknowledged?: boolean
  payment_proof_receipt?: File
}

export type OrganizationFormValues = z.infer<typeof OrganizationSchema>
export type OrganizationEditFormValues = z.infer<typeof OrganizationEditSchema>
export type UsersFormValues = z.infer<typeof UsersSchema>
export type AddLocationFormValues = z.infer<typeof AddLocationSchema>
export type EditLocationFormValues = z.infer<typeof EditLocationSchema>
export type OrganizationLocationCreateFormValues = z.infer<typeof OrganizationLocationCreateSchema>
export type OrganizationLocationEditFormValues = z.infer<typeof OrganizationLocationEditSchema>
export type CreateCoverTypeFormValues = z.infer<typeof CreateCoverTypeSchema>
export type MotorCreateCoveringFormValues = z.infer<typeof CreateCoveringSchema>
export type CreateVehicleClassesFormValues = z.infer<typeof CreateVehicleClassesSchema>
export type CreateVehicleUsesFormValues = z.infer<typeof CreateVehicleUsesSchema>
export type CreateMotorAddonBenefitsFormValues = z.infer<typeof CreateMotorAddonBenefitsSchema>
export type CreateMotorDetailedBenefitsFormValues = z.infer<typeof CreateMotorDetailedBenefitsSchema>
export type CreateMotorTonageFormValues = z.infer<typeof CreateMotorTonageSchema>
export type CreateMotorProductRatesFormValues = z.infer<typeof CreateMotorProductRatesSchema>
export type CreateMotorRateBenefitsInputValues = z.input<typeof CreateMotorRateBenefitsSchema>
export type CreateMotorRateBenefitsFormValues = z.infer<typeof CreateMotorRateBenefitsSchema>
export type CreateMotorRateExcessBenefitsFormValues = z.infer<typeof CreateMotorRateExcessBenefitsSchema>
export type CreateProductFormValues = z.infer<typeof CreateProductSchema>
export type EditProductFormValues = z.infer<typeof EditProductSchema>

export type UpdateProfileFormValues = z.infer<typeof UpdateProfileSchema>
export type UpdatePasswordFormValues = z.infer<typeof UpdatePasswordSchema>
export type SendViaEmailFormValues = z.infer<typeof SendViaEmailSchema>
export type SendMessageValues = z.infer<typeof SendMessageSchema>


export type SendContactUsMessageValues = z.infer<typeof ContactUsSchema>
export type RoleCreateFormValues = z.infer<typeof RoleCreateSchema>
export type RoleEditFormValues = z.infer<typeof RoleEditSchema>
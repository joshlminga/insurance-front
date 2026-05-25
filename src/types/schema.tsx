import type z from "zod";
import {
    CustomerDetailsSchema,
    OTPVerificationSchema,
    VehicleDetailsSchema,
    LoginSchema,
    SignUpSchema,
    KycSchema,
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
    ContactUsSchema
} from "./form-schema";

export type CustomerFormValues = z.infer<typeof CustomerDetailsSchema>
export type OTPFormValues = z.infer<typeof OTPVerificationSchema>
export type ResendOTPFormValues = z.infer<typeof ResendOtpPayloadSchema>
export type VehicleFormValues = z.infer<typeof VehicleDetailsSchema>
export type LoginFormValues = z.infer<typeof LoginSchema>
export type SignUpFormValues = z.infer<typeof SignUpSchema>
export type ForgotPasswordValues = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof ResetPasswordSchema>;
export type KycFormValues = z.infer<typeof KycSchema>
export type InvoicePaymentFormValues = z.infer<typeof InvoicePaymentSchema>
export type PaymentFormValues = z.infer<typeof PaymentDetailsSchema>

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
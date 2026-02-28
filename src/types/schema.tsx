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
    UsersSchema,
    AddLocationSchema,
    EditLocationSchema,
    CreateCoverTypeSchema,
    CreateProductSchema,
    EditProductSchema,
    UpdateProfileSchema,
    UpdatePasswordSchema,
    CreateCoveringSchema,
    CreateVehicleClassesSchema
} from "./form-schema";

export type CustomerFormValues = z.infer<typeof CustomerDetailsSchema>
export type OTPFormValues = z.infer<typeof OTPVerificationSchema>
export type ResendOTPFormValues = z.infer<typeof ResendOtpPayloadSchema>
export type VehicleFormValues = z.infer<typeof VehicleDetailsSchema>
export type LoginFormValues = z.infer<typeof LoginSchema>
export type SignUpFormValues = z.infer<typeof SignUpSchema>
export type KycFormValues = z.infer<typeof KycSchema>
export type InvoicePaymentFormValues = z.infer<typeof InvoicePaymentSchema>
export type PaymentFormValues = z.infer<typeof PaymentDetailsSchema>

export type OrganizationFormValues = z.infer<typeof OrganizationSchema>
export type UsersFormValues = z.infer<typeof UsersSchema>
export type AddLocationFormValues = z.infer<typeof AddLocationSchema>
export type EditLocationFormValues = z.infer<typeof EditLocationSchema>
export type CreateCoverTypeFormValues = z.infer<typeof CreateCoverTypeSchema>
export type MotorCreateCoveringFormValues = z.infer<typeof CreateCoveringSchema>
export type CreateVehicleClassesFormValues = z.infer<typeof CreateVehicleClassesSchema>
export type CreateProductFormValues = z.infer<typeof CreateProductSchema>
export type EditProductFormValues = z.infer<typeof EditProductSchema>

export type UpdateProfileFormValues = z.infer<typeof UpdateProfileSchema>
export type UpdatePasswordFormValues = z.infer<typeof UpdatePasswordSchema>

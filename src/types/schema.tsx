import type z from "zod";
import type { CustomerDetailsSchema, OTPVerificationSchema, VehicleDetailsSchema } from "./form-schema";

export type CustomerFormValues = z.infer<typeof CustomerDetailsSchema>
export type OTPFormValues = z.infer<typeof OTPVerificationSchema>
export type VehicleFormValues = z.infer<typeof VehicleDetailsSchema>
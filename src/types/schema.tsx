import type z from "zod";
import type { CustomerDetailsSchema, OTPVerificationSchema } from "./form-schema";

export type CustomerFormValues = z.infer<typeof CustomerDetailsSchema>
export type OTPFormValues = z.infer<typeof OTPVerificationSchema>
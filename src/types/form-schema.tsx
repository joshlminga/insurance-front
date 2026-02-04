// form-schema.ts
import { z } from "zod"

export const CustomerDetailsSchema = z.object({
  first_name: z
    .string()
    .min(2, "First name is required")
    .max(50),
  last_name: z
    .string()
    .min(2, "Last name is required")
    .max(50),
  email: z
    .string()
    .email("Invalid email address")
    .min(5)
    .max(32),
  mobile_number: z
    .string()
    .min(7, "Invalid phone number"),
})

export const OTPVerificationSchema = z.object({
  otp: z.string().length(4, "OTP must be exactly 4 digits"),
})

export const VehicleDetailsSchema = z.object({
  registration_number: z.string().min(1, "Registration number is required"),
  vehicle_model: z.string().min(1, "Vehicle model is required"),
  vehicle_make: z.string().min(1, "Vehicle make is required"),
  yom: z.string().min(1, "Year of manufacture is required"),
  insurance_type: z.string().min(1, "Insurance type is required"),
})

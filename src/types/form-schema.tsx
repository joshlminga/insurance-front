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

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const SignUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })

export const KycSchema = z.object({
  passport_number: z.string().min(1, "Passport/ID No number is required"),
  tax_number: z.string().min(1, "Tax Number is required"),
  chassis_number: z.string().min(1, "Vehicle chassis number is required"),
  engine_number: z.string().min(1, "Engine number is required"),
  total_seats: z.string().min(1, "Number of seats is required"),
  tonage_capacity: z.string().min(1, "Vehicle tonage capacity is required"),
  log_book_attachment: z
    .any()
    .refine((file) => file instanceof File, "Attach a logbook"),
  tax_certificate: z
    .any()
    .refine((file) => file instanceof File, "Attach a tax certificate"),
  passport_attachment: z
    .any()
    .refine((file) => file instanceof File, "Attach ID/Passport"),
})

export const InvoicePaymentSchema = z.object({
  customer_name: z.string().min(1, "Customer Name is required"),
  email: z.email().min(1, "Email is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  covering: z.string().min(1, "Covering is required"),
  provider: z.string().min(1, "Provider is required"),
  cover_startdate: z.string().min(1, "Cover Start Date is required"),
  total_payable: z.string().min(1, "Total payable is required"),
})

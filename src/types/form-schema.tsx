// form-schema.ts
import { ACCEPTED_IMAGE_TYPES } from "@/utils/constatnts"
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
  phone: z
    .string()
    .min(7, "Invalid phone number"),
})

export const OTPVerificationSchema = z.object({
  token: z.string().length(4, "OTP must be exactly 4 digits"),
  token_type: z.string().optional(),
  token_name: z.string().optional(),
})

export const ResendOtpPayloadSchema = z.object({
  type: z.string().min(1),
  id: z.number(),
  token_type: z.string().min(1),
  token_name: z.string().min(1),
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
    first_name: z.string().min(2, "First name is required").max(50),
    last_name: z.string().min(2, "Last name is required").max(50),
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

// Base payment schema with common fields
const BasePaymentSchema = z.object({
  payment_plans: z.string().optional(),
  first_installment: z.string().optional(),
  second_installment: z.string().optional(),
  third_installment: z.string().optional(),
  payment_method: z.enum(["mpesa", "card", "pesapal"]),
})

// Mpesa specific fields
const MpesaPaymentSchema = BasePaymentSchema.extend({
  payment_method: z.literal("mpesa"),
  phone_number: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^(?:\+254|254|0)?[17]\d{8}$/, "Invalid Kenyan phone number"),
})

// Card specific fields with validation
const CardPaymentSchema = BasePaymentSchema.extend({
  payment_method: z.literal("card"),
  card_number: z.string()
    .min(16, "Card number must be 16 digits")
    .max(19, "Card number too long")
    .regex(/^[\d\s]+$/, "Card number must contain only digits")
    .refine((val) => {
      // Luhn algorithm validation
      const digits = val.replace(/\s/g, '').split('').reverse().map(Number)
      const sum = digits.reduce((acc, digit, idx) => {
        if (idx % 2 === 1) {
          const doubled = digit * 2
          return acc + (doubled > 9 ? doubled - 9 : doubled)
        }
        return acc + digit
      }, 0)
      return sum % 10 === 0
    }, "Invalid card number"),
  expiry_date: z.string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry date must be in MM/YY format")
    .refine((val) => {
      const [month, year] = val.split('/').map(Number)
      const now = new Date()
      const currentYear = now.getFullYear() % 100
      const currentMonth = now.getMonth() + 1
      return year > currentYear || (year === currentYear && month >= currentMonth)
    }, "Card has expired"),
  cvv: z.string()
    .min(3, "CVV must be 3-4 digits")
    .max(4, "CVV must be 3-4 digits")
    .regex(/^\d{3,4}$/, "CVV must be numeric"),
})

// Pesapal specific fields
const PesapalPaymentSchema = BasePaymentSchema.extend({
  payment_method: z.literal("pesapal"),
})

// Discriminated union for payment methods
export const PaymentDetailsSchema = z.discriminatedUnion("payment_method", [
  MpesaPaymentSchema,
  CardPaymentSchema,
  PesapalPaymentSchema,
])

export const OrganizationSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name is too long"),
  organization_type: z
    .string()
    .min(2, "Organization type must be at least 2 characters")
    .max(100, "Organization type is too long"),
  domain: z
    .string()
    .min(2, "Domain is required"),
  admin_id: z
    .string()
    .min(1, "Admin ID is required"),
  initials: z
    .string()
    .min(2, "Initials must be at least 2 characters")
    .max(10, "Initials cannot exceed 10 characters"),
  logo: z
    .any()
    .refine((file) => file instanceof File, "Attach a Logo")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Logo must be jpeg, png, jpg, or webp"
    ),
  locations: z
    .array(z.string())
    .min(1, "At least one location must be selected"),
})

export const UsersSchema = z.object({
  name: z
    .string()
    .min(2, "user name must be at least 2 characters")
    .max(100, "user name is too long"),
  email: z
    .string()
    .email("Invalid email address")
    .min(2, "Email must be at least 2 characters")
    .max(100, "Email is too long"),
  // all countries phone number
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(
      /^(?:\+?\d{1,3})?[ -]?\d{6,14}$/,
      "Invalid phone number format"
    ),
  country: z.string()
    .min(1, "At least one country must be selected"),
})

export const AddLocationSchema = z.object({
  organization_id: z
    .union([z.string(), z.number()])
    .refine((value) => String(value).trim().length > 0, "Organization is required"),
  initials: z
    .string()
    .min(2, "Initials must be at least 2 characters")
    .max(10, "Initials cannot exceed 10 characters"),
  country_id: z
    .string()
    .min(1, "Country is required"),
  logo: z
    .any()
    .optional()
    .refine(
      (file) => !file || file instanceof File,
      "Logo must be a valid file"
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Logo must be jpeg, png, jpg, or webp"
    ),
})

// form-schema.ts
import {
  ACCEPTED_FILE_TYPES,
  ACCEPTED_IMAGE_TYPES,
  KRA_PIN_REGEX,
  MAX_KYC_FILE_BYTES,
  PRODUCT_TYPE_VALUES,
} from "@/utils/constatnts"
import { z } from "zod"

/** Shared KRA PIN rule used by motor / legacy KYC schemas. */
const KraPinSchema = z
  .string()
  .min(1, "KRA PIN is required")
  .regex(KRA_PIN_REGEX, "KRA PIN must be a letter, 9 digits, then a letter (e.g. A020828302W)")

/** MIME + 10MB size checks for a required KYC file. */
const requiredKycFile = (requiredMessage: string) =>
  z
    .any()
    .refine((file) => file instanceof File, requiredMessage)
    .refine(
      (file) => file instanceof File && ACCEPTED_FILE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .pdf formats are supported."
    )
    .refine(
      (file) => !(file instanceof File) || file.size <= MAX_KYC_FILE_BYTES,
      "Each file must be 10MB or smaller."
    )

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
    .max(32)
    .optional(),
  phone: z
    .string()
    .min(7, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  country: z
    .string()
    .min(1, "Select a country")
    .optional()
    .or(z.literal("")),
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
  user_id: z.union([z.string(), z.number()]).or(z.literal("")),
  registration_number: z.string().optional().or(z.literal("")),
  vehicle_registration_number: z.string().optional().or(z.literal("")),
  vehicle_model: z.string().optional().or(z.literal("")),
  vehicle_make: z.string().optional().or(z.literal("")),
  yom: z.string().optional().or(z.literal("")),
  insurance_type: z.string().optional().or(z.literal("")),

  covertype_id: z.string().min(1, "Cover Type is required"),
  covering_id: z.string().min(1, "Covering is required"),
  vehicle_make_id: z.string().optional().or(z.literal("")),
  vehicle_model_id: z.string().optional().or(z.literal("")),
  used_for_id: z.string().min(1, "Vehicle use is required"),
  bodytype_id: z.string().optional().or(z.literal("")),
  country_id: z.string().optional().or(z.literal("")),
  year: z.string().optional().or(z.literal("")),

  ownership: z.string().min(1, "Ownarship is required"),
  vehicle_value: z.string().optional().or(z.literal("")),
  number_of_passengers: z.string().optional().or(z.literal("")),
  tonnage: z.string().optional().or(z.literal("")),

  vehicle_class_id: z.string().optional().or(z.literal("")),
  valued_by_professional: z.boolean().optional()
})
  .superRefine((data, ctx) => {
    const currentYear = new Date().getFullYear()
    const comprehensiveCoverTypeId = "1384"
    const defaultMinYear = currentYear - 50

    if (String(data.covertype_id ?? "").trim().length === 0) return
    if (!String(data.year ?? "").trim()) return

    const isComprehensive = String(data.covertype_id) === comprehensiveCoverTypeId
    const minYear = isComprehensive ? currentYear - 15 : defaultMinYear

    const year = Number(data.year)
    if (!Number.isFinite(year)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["year"],
        message: `Accepted from ${minYear}`,
      })
      return
    }

    if (year < minYear || year > currentYear) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["year"],
        message: `Accepted from ${minYear}`,
      })
    }
  })

export const AddVehicleSchema = z.object({
  registration_number: z.string().min(1, "Registration number is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  manufacture_year: z.string().min(1, "Year of manufacture is required"),
  body_type: z.string().min(1, "Body type is required"),
  // Optional — blank is fine; API stores null
  color: z.string().optional().or(z.literal("")),
  number_of_passengers: z.string().optional().or(z.literal("")),
  tonnage: z.string().min(1, "Tonnage is required"),
  engine_number: z.string().optional().or(z.literal("")),
  cubic_capacity: z.string().optional().or(z.literal("")),
  chassis_number: z.string().min(1, "Chassis number is required"),
})

export const AdminMotorQuotationSchema = CustomerDetailsSchema
  .omit({ country: true, first_name: true, last_name: true })
  .merge(VehicleDetailsSchema)
  // Zod 4: cannot .extend() after merge with a schema that has .superRefine()
  .safeExtend({
    full_name: z.string().max(100).optional().or(z.literal("")),
    email: z
      .string()
      .email("Invalid email address")
      .max(32)
      .optional()
      .or(z.literal("")),
    country_id: z.string().optional().or(z.literal("")),
    processed_by_organization_id: z.string().min(1, "Your agency is required"),
    agency_id: z.string().optional().or(z.literal("")),
    referral_id: z.string().optional().or(z.literal("")),
    /** When customer is not found: checked = create account (is_guest false on submit). */
    create_customer_account: z.boolean().optional(),
  })

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})
export const ForgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const ResetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    password_confirmation: z.string(),
    old_password: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

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

export const UpdateProfileSchema = z.object({
  first_name: z.string().min(2, "First name is required").max(50),
  last_name: z.string().min(2, "Last name is required").max(50),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^(?:\+?\d{1,3})?[ -]?\d{6,14}$/, "Invalid phone number format"),
})

export const UpdatePasswordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(6, "New password must be at least 6 characters"),
  confirm_password: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
})

/** Admin Account Profile — general info (requires current password to authorize) */
export const AccountGeneralSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^(?:\+?\d{1,3})?[ -]?\d{6,14}$/, "Invalid phone number format")
    .or(z.literal("")),
  current_password: z.string().min(1, "Current password is required"),
})

/** Admin Account Profile — avatar upload (requires current password) */
export const AccountAvatarSchema = z.object({
  profile_picture: z
    .any()
    .refine((file) => file instanceof File, "Select a profile picture")
    .refine(
      (file) => file instanceof File && ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Profile picture must be jpeg, png, jpg, or webp"
    ),
  current_password: z.string().min(1, "Current password is required"),
})

export const KycSchema = z.object({
  nationality_id: z.string().min(1, "Select Nationality"),
  id_type: z.string().min(1, "Slect ID Type"),
  id_number: z.string().min(1, "Passport/ID No number is required"),
  tax_pin: KraPinSchema,
  color: z.string().min(1, "Car color is required"),
  chassis_number: z.string().min(1, "Vehicle chassis number is required"),
  engine_cc: z.string().min(1, "Vehicle engine capacity is required").max(5, "Engine capacity must be less than 99999 cc"),
  engine_number: z.string().min(1, "Engine number is required"),
  total_seats: z.string().min(1, "Number of seats is required").max(2, "Total seats must be less than 100"),
  tonage_capacity: z.string().min(1, "Vehicle tonage capacity is required").max(5, "Tonnage capacity must be less than 99999 Tones"),
  logbook: requiredKycFile("Attach a logbook"),
  tax_certificate: requiredKycFile("Attach a tax certificate"),
  id_document: requiredKycFile("Attach ID/Passport"),
})

const OptionalKycFileSchema = z
  .any()
  .optional()
  .refine(
    (file) => !file || file instanceof File,
    "Attach a valid file"
  )
  .refine(
    (file) => !file || ACCEPTED_FILE_TYPES.includes(file?.type),
    "Only .jpg, .jpeg, .png and .pdf formats are supported."
  )
  .refine(
    (file) => !file || !(file instanceof File) || file.size <= MAX_KYC_FILE_BYTES,
    "Each file must be 10MB or smaller."
  )

export const MotorKycSchema = z.object({
  nationality_id: z.string().optional(),
  id_type: z.string().optional(),
  id_number: z.string().optional(),
  date_of_birth: z.string().optional(),
  occupation: z.string().optional(),
  company_name: z.string().optional(),
  incorporated_in: z.string().optional(),
  industry_category: z.string().optional(),
  coi_number: z.string().optional(),
  // Backend requires a valid KRA PIN on every KYC submit
  tax_pin: KraPinSchema,
  policy_holder: z.string().optional(),
  logbook: OptionalKycFileSchema,
  tax_certificate: OptionalKycFileSchema,
  id_document: OptionalKycFileSchema,
  coi_certificate: OptionalKycFileSchema,
})

export const InvoicePaymentSchema = z.object({
  name: z.string().min(1, "Customer Name is required"),
  email: z.email().min(1, "Email is required"),
  payment_plan: z.string().optional(),
  phone: z.string().min(1, "Phone number is required"),
  covering: z.string().optional(),
  provider: z.string().optional(),
  cover_start_date: z
    .string()
    .min(1, "Cover Start Date is required")
    .refine(
      (date) => date >= new Date().toISOString().split("T")[0],
      "Cover start date must be today or later",
    ),
  // Admin-only optional fields (not shown on customer checkout)
  cover_end_date: z.string().optional(),
  policy_number: z.string().optional(),
  // total_payable: z.string().min(1, "Total payable is required"),
}).superRefine((data, ctx) => {
  const endDate = data.cover_end_date?.trim()
  if (!endDate) {
    return
  }

  const startDate = data.cover_start_date
  if (!startDate) {
    return
  }

  if (endDate <= startDate) {
    ctx.addIssue({
      code: "custom",
      message: "Cover end date must be after the cover start date",
      path: ["cover_end_date"],
    })
    return
  }

  const start = new Date(`${startDate}T00:00:00`)
  const maxEnd = new Date(start)
  maxEnd.setMonth(maxEnd.getMonth() + 12)
  maxEnd.setDate(maxEnd.getDate() - 1)
  const maxEndString = maxEnd.toISOString().split("T")[0]

  if (endDate > maxEndString) {
    ctx.addIssue({
      code: "custom",
      message: `Cover end date must not exceed ${maxEndString}`,
      path: ["cover_end_date"],
    })
  }
})

// Base payment schema with common fields
const BasePaymentSchema = z.object({
  payment_plans: z.string().optional(),
  first_installment: z.string().optional(),
  second_installment: z.string().optional(),
  third_installment: z.string().optional(),
  payment_method: z.enum(["mpesa", "card", "pesapal", "paypal", "credit", "cash"]),
})

const PaymentProofFileSchema = z
  .any()
  .refine((file) => file instanceof File, "Upload receipt or proof of payment")
  .refine(
    (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
    "Only .jpg, .jpeg, .png and .pdf formats are supported."
  )

// Mpesa specific fields
const MpesaPaymentSchema = BasePaymentSchema.extend({
  payment_method: z.literal("mpesa"),
  invoice_id: z.string(),
  phone_number: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^(?:\+254|254|0)?[17]\d{8}$/, "Invalid Kenyan phone number"),
  amount: z.number().positive("Amount must be greater than 0"),
  mpesa_transaction_code: z.string().optional().or(z.literal("")),
})

// Card payment provider selection
const CardPaymentSchema = BasePaymentSchema.extend({
  payment_method: z.literal("card"),
  card_provider: z.enum(["paystack", "pesapal", "dpo"], {
    error: "Select a payment provider",
  }),
  invoice_id: z.string().optional(),
  paystack_email: z
    .string()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  pesapal_email: z
    .string()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  phone_number: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || /^(?:\+254|254|0)?[17]\d{8}$/.test(value),
      "Invalid Kenyan phone number"
    ),
}).superRefine((data, ctx) => {
  if (data.card_provider === "paystack") {
    if (!data.invoice_id?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invoice is required",
        path: ["invoice_id"],
      })
    }

    if (!data.paystack_email?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter an email address for Paystack checkout",
        path: ["paystack_email"],
      })
    }
    return
  }

  if (data.card_provider === "pesapal") {
    if (!data.invoice_id?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invoice is required",
        path: ["invoice_id"],
      })
    }

    const hasPhone = Boolean(data.phone_number?.trim())
    const hasEmail = Boolean(data.pesapal_email?.trim())

    if (!hasPhone && !hasEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a phone number or email address for Pesapal checkout",
        path: ["phone_number"],
      })
    }
  }
})

// Pesapal specific fields
const PesapalPaymentSchema = BasePaymentSchema.extend({
  payment_method: z.literal("pesapal"),
  invoice_id: z.string().min(1, "Invoice is required"),
  phone_number: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || /^(?:\+254|254|0)?[17]\d{8}$/.test(value),
      "Invalid Kenyan phone number"
    ),
  pesapal_email: z
    .string()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
}).superRefine((data, ctx) => {
  const hasPhone = Boolean(data.phone_number?.trim())
  const hasEmail = Boolean(data.pesapal_email?.trim())

  if (!hasPhone && !hasEmail) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Enter a phone number or email address for Pesapal checkout",
      path: ["phone_number"],
    })
  }
})

const PaypalPaymentSchema = BasePaymentSchema.extend({
  payment_method: z.literal("paypal"),
  paypal_email: z.string().email("Enter a valid PayPal email address"),
})

const CreditPaymentSchema = BasePaymentSchema.extend({
  payment_method: z.literal("credit"),
  invoice_id: z.string().min(1, "Invoice is required"),
  available_credit: z.string().optional().or(z.literal("")),
  unsettled_credit: z.string().optional().or(z.literal("")),
  unsettled_credit_limit: z.string().optional().or(z.literal("")),
  credit_acknowledged: z.boolean().refine((val) => val === true, {
    message: "You must acknowledge the credit terms to proceed",
  }),
})

const CashPaymentSchema = BasePaymentSchema.extend({
  payment_method: z.literal("cash"),
  payment_proof_receipt: PaymentProofFileSchema,
})

// Discriminated union for payment methods
export const PaymentDetailsSchema = z.discriminatedUnion("payment_method", [
  MpesaPaymentSchema,
  CardPaymentSchema,
  PesapalPaymentSchema,
  PaypalPaymentSchema,
  CreditPaymentSchema,
  CashPaymentSchema,
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
    .min(2, "Acensure subdomain is required")
    .max(63, "Subdomain is too long")
    .regex(
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
      "Use lowercase letters, numbers, and hyphens only (no dots/spaces)"
    ),
  hq_location: z
    .string()
    .min(1, "HQ location is required"),
  admin_id: z
    .string()
    .min(1, "Admin ID is required"),
  logo: z
    .any()
    .refine((file) => file instanceof File, "Attach a Logo")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Logo must be jpeg, png, jpg, or webp"
    ),
})

export const OrganizationEditSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name is too long"),
  organization_type: z
    .string()
    .min(2, "Organization type must be at least 2 characters")
    .max(100, "Organization type is too long"),
  admin_id: z
    .string()
    .min(1, "Admin ID is required"),
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

export const EditLocationSchema = z.object({
  // organization_id: z
  //   .union([z.string(), z.number()])
  //   .refine((value) => String(value).trim().length > 0, "Organization is required"),
  // initials: z
  //   .string()
  //   .min(2, "Initials must be at least 2 characters")
  //   .max(10, "Initials cannot exceed 10 characters"),
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

const refineUniqueOrganizationLocationProducts = (
  rows: Array<{ product: string }>,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = ["product"]
) => {
  const seen = new Set<string>()
  rows.forEach((row, index) => {
    const value = String(row.product ?? "").trim()
    if (!value) return

    if (
      !PRODUCT_TYPE_VALUES.includes(
        value as (typeof PRODUCT_TYPE_VALUES)[number]
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid product type",
        path: [...pathPrefix, index, "product"],
      })
      return
    }

    if (seen.has(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "This product type is already selected",
        path: [...pathPrefix, index, "product"],
      })
      return
    }

    seen.add(value)
  })
}

const OrganizationLocationProductCreateRowSchema = z.object({
  product: z.string(),
  access_public: z.boolean(),
})

const OrganizationLocationProductEditRowSchema = z.object({
  product: z.string(),
  access_public: z.boolean(),
  product_status: z.boolean(),
})

export const OrganizationLocationCreateSchema = z
  .object({
    organization_id: z
      .union([z.string(), z.number()])
      .refine((value) => String(value).trim().length > 0, "Organization is required"),
    initials: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine((value) => String(value ?? "").length === 0 || String(value).length >= 2, {
        message: "Initials must be at least 2 characters",
      })
      .refine((value) => String(value ?? "").length === 0 || String(value).length <= 10, {
        message: "Initials cannot exceed 10 characters",
      }),
    country_id: z.string().min(1, "Country is required"),
    logo: z
      .any()
      .optional()
      .refine((file) => !file || file instanceof File, "Logo must be a valid file")
      .refine(
        (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
        "Logo must be jpeg, png, jpg, or webp"
      ),
    product: z.array(OrganizationLocationProductCreateRowSchema),
  })
  .superRefine((data, ctx) => {
    refineUniqueOrganizationLocationProducts(data.product, ctx)
  })

export const OrganizationLocationEditSchema = z
  .object({
    initials: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine((value) => String(value ?? "").length === 0 || String(value).length >= 2, {
        message: "Initials must be at least 2 characters",
      })
      .refine((value) => String(value ?? "").length === 0 || String(value).length <= 10, {
        message: "Initials cannot exceed 10 characters",
      }),
    country_id: z.string().min(1, "Country is required"),
    logo: z
      .any()
      .optional()
      .refine((file) => !file || file instanceof File, "Logo must be a valid file")
      .refine(
        (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
        "Logo must be jpeg, png, jpg, or webp"
      ),
    product: z.array(OrganizationLocationProductEditRowSchema),
  })
  .superRefine((data, ctx) => {
    refineUniqueOrganizationLocationProducts(data.product, ctx)
  })

const ACCEPTED_BROCHURE_MIME_TYPES = [
  "application/pdf",
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

const ACCEPTED_BROCHURE_EXTENSIONS = [
  ".pdf",
  ".csv",
  ".xls",
  ".xlsx",
  ".docx",
]

const isValidBrochureFile = (file: File) => {
  const fileName = file.name.toLowerCase()
  const hasAllowedExtension = ACCEPTED_BROCHURE_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  )
  const hasAllowedMimeType = ACCEPTED_BROCHURE_MIME_TYPES.includes(file.type)
  return hasAllowedExtension || hasAllowedMimeType
}

export const CreateCoverTypeSchema = z.object({
  name: z
    .string()
    .min(2, "Cover type name must be at least 2 characters")
    .max(100, "Cover type name is too long"),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(1000, "Description is too long"),
})

export const CreateCoveringSchema = z.object({
  name: z
    .string()
    .min(2, "Motor Covering name must be at least 2 characters")
    .max(100, "Motor Covering name is too long"),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(1000, "Description is too long"),
})

export const CreateVehicleClassesSchema = z.object({
  name: z
    .string()
    .min(2, "Vehicle class name must be at least 2 characters")
    .max(100, "Vehicle class name is too long"),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(1000, "Description is too long"),
})

export const CreateVehicleUsesSchema = z.object({
  name: z
    .string()
    .min(2, "Vehicle use name must be at least 2 characters")
    .max(100, "Vehicle use name is too long"),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(1000, "Description is too long"),
  class: z
    .string()
    .min(1, "Class is required"),
  covering: z
    .array(z.string().min(1))
    .min(1, "At least one covering is required"),
})

export const CreateMotorAddonBenefitsSchema = z.object({
  name: z
    .string()
    .min(2, "Addon benefit name must be at least 2 characters")
    .max(100, "Addon benefit name is too long"),
  group: z
    .string()
    .min(2, "Addon benefit group must be selected"),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(1000, "Description is too long"),
})

export const CreateMotorDetailedBenefitsSchema = z.object({
  name: z
    .string()
    .min(2, "Detailed benefit name must be at least 2 characters")
    .max(100, "Detailed benefit name is too long"),
  short_name: z
    .string()
    .max(100, "Detailed benefit short name is too long")
    .optional()
    .or(z.literal("")),
  group: z
    .string()
    .min(1, "Group is required"),
  reference: z
    .string()
    .min(1, "Reference is required"),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(1000, "Description is too long"),
})

const numericCoerce = z.union([
  z.number(),
  z.string().refine((val) => !isNaN(Number(val)) && val !== "", {
    message: "Must be a valid number",
  }).transform((val) => Number(val)),
]);

/** Optional number field: empty input becomes null for the API */
const optionalNumericField = z
  .union([numericCoerce, z.literal(""), z.undefined()])
  .optional()
  .transform((val) => (val === "" || val === undefined ? null : val));

/** Optional taxonomy id: empty input becomes null for the API */
const optionalIdField = z
  .union([z.string().min(1), z.literal(""), z.undefined()])
  .optional()
  .transform((val) => (val === "" || val === undefined ? null : val));

export const CreateMotorProductRatesSchema = z.object({
  coverfor_id: z.string().min(1, "Cover for is required"),
  covertype_id: z.string().min(1, "Cover type is required"),
  covering_id: z.string().min(1, "Covering is required"),
  usedfor_id: z.string().min(1, "Used for is required"),
  bodytype_id: optionalIdField,
  used_tonnage_id: optionalIdField,
  min_tonnage: optionalNumericField,
  max_tonnage: optionalNumericField,

  is_all_sum: z.boolean(),
  valued_from: optionalNumericField,
  valued_to: optionalNumericField,

  is_all_age: z.boolean(),
  age_from: optionalNumericField,
  age_to: optionalNumericField,

  rate: optionalNumericField,
  minimum: optionalNumericField.transform((val) => (val === null ? 0 : val)),
  pll: optionalNumericField,

  is_fleet: z.boolean(),
  min_fleet: optionalNumericField,
  max_fleet: optionalNumericField,

  target_audience: z.string(),
  cover_target: z.string(),
  min_age: optionalNumericField,
  max_age: optionalNumericField,
  start_date: z.string().min(1, "Start date is required"),
  expiry_date: z.string().min(1, "Expiry date is required"),
  is_active: z.boolean(),
  makemodel_offered: z.array(z.number()),
  makemodel_notoffered: z.array(z.number()),
  meta: z.array(z.object({
    key: z.string(),
    value: z.string()
  }))
})
  .refine((data) => {
    const from = data.valued_from != null ? Number(data.valued_from) : null;
    const to = data.valued_to != null ? Number(data.valued_to) : null;

    if (from !== null && to !== null && !isNaN(from) && !isNaN(to)) {
      return to >= from;
    }
    return true;
  }, {
    message: "Valued To must be greater than or equal to Valued From",
    path: ["valued_to"]
  })
  .refine((data) => {
    const from = data.age_from != null ? Number(data.age_from) : null;
    const to = data.age_to != null ? Number(data.age_to) : null;

    if (from !== null && to !== null && !isNaN(from) && !isNaN(to)) {
      return to >= from;
    }
    return true;
  }, {
    message: "Age To must be greater than or equal to Age From",
    path: ["age_to"]
  })
  .refine((data) => {
    const min = data.min_fleet != null ? Number(data.min_fleet) : null;
    const max = data.max_fleet != null ? Number(data.max_fleet) : null;

    if (min !== null && max !== null && !isNaN(min) && !isNaN(max)) {
      return max >= min;
    }
    return true;
  }, {
    message: "Max Fleet must be greater than or equal to Min Fleet",
    path: ["max_fleet"]
  });

export const CreateMotorRateBenefitsSchema = z
  .object({
    benefit_id: z.string().min(1, "Benefit is required"),
    rate: optionalNumericField,
    minimum: optionalNumericField,
    benefit_type: z.string().optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.rate == null && data.minimum == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one of rate or minimum must have a value.",
        path: ["rate"],
      });
    }
  });

export const CreateMotorRateExcessBenefitsSchema = z.object({
  detail_benefit_id: z.string().min(1, "Detailed Benefit is required"),
  detail_type: z.string().optional().or(z.literal("")),
  value: z.string().optional().or(z.literal("")),
  key: z.string().optional().or(z.literal("")),
  detail_highlight: z.string().optional().or(z.literal("")),
  product_rate_id: z.string().optional()
})

export const CreateProductSchema = z.object({
  organization_location_id: z.string().min(1, "Organization location is required"),
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name is too long"),
  officename: z
    .string()
    .min(2, "Office name must be at least 2 characters")
    .max(100, "Office name is too long"),
  description: z
    .string()
    .max(1000, "Description is too long")
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || value.length >= 5,
      "Description must be at least 5 characters"
    ),
  access: z.string().min(1, "Access level is required"),
  for_public: z.enum(["true", "false"], {
    error: "Target audience is required",
  }),
  start_date: z.string().optional().or(z.literal("")),
  expiry_date: z.string().optional().or(z.literal("")),
  brochure: z
    .array(z.instanceof(File))
    .optional()
    .refine(
      (files) => !files?.length || files.every(isValidBrochureFile),
      "Brochure files must be PDF, CSV, XLS, XLSX, or DOCX"
    ),
  organization_location_ids: z
    .string()
    .min(1, "Organization location is required"),
})
  .refine(
    (data) => {
      if (!data.start_date || !data.expiry_date) return true
      return new Date(data.expiry_date) >= new Date(data.start_date)
    },
    {
      message: "Expiry date must be after or equal to start date",
      path: ["expiry_date"],
    }
  )

export const EditProductSchema = z.object({
  organization_location_id: z.string().min(1, "Organization location is required"),
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name is too long"),
  officename: z
    .string()
    .min(2, "Office name must be at least 2 characters")
    .max(100, "Office name is too long"),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(1000, "Description is too long"),
  access: z.string().min(1, "Access level is required"),
  for_public: z.enum(["true", "false"], {
    error: "Target audience is required",
  }),
  start_date: z.string().min(1, "Start date is required"),
  expiry_date: z.string().min(1, "Expiry date is required"),
  brochure: z
    .array(z.instanceof(File))
    .refine(
      (files) => files.every(isValidBrochureFile),
      "Brochure files must be PDF, CSV, XLS, XLSX, or DOCX"
    ),
  organization_location_ids: z
    .string()
    .optional()
    .or(z.literal("")),
})
  .refine(
    (data) => new Date(data.expiry_date) >= new Date(data.start_date),
    {
      message: "Expiry date must be after or equal to start date",
      path: ["expiry_date"],
    }
  )

export const SendViaEmailSchema = z.object({
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  is_self: z.boolean().or(z.literal("")),
  quote_type: z.string().min(1, "Quote type is required").or(z.literal("")),
  product_id: z.string().min(1, "Product ID is required").or(z.literal("")),
  rate_id: z.string().min(1, "Rate ID is required").or(z.literal("")),
  products: z.array(z.object({
    product_id: z.string().optional().or(z.literal("")),
    rate_id: z.string().optional().or(z.literal("")),
  }))
})

export const SendMessageSchema = z.object({
  message: z.string().min(2, "Message must be at least 2 characters").max(1000, "Message is too long").optional().or(z.literal("")),
})

export const ContactUsSchema = z.object({
  first_name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  last_name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().email("Invalid email address").min(2, "Email must be at least 2 characters").max(100, "Email is too long"),
  subject: z.string().min(2, "Subject must be at least 2 characters").max(200, "Subject is too long"),
  message: z.string().min(5, "Message must be at least 5 characters").max(2000, "Message is too long"),
});

/**
 * Organization member (location staff user) create/edit.
 * Roles are kept as strings because the multi-select works with string values;
 * they are converted to numbers right before the API call.
 */
export const OrganizationMemberCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z
    .string()
    .email("Invalid email address")
    .min(2, "Email must be at least 2 characters")
    .max(100, "Email is too long"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .optional()
    .or(z.literal("")),
  roles: z.array(z.string()).min(1, "Select at least one role"),
  profile_picture: z
    .any()
    .optional()
    .refine(
      (file) => !file || file instanceof File,
      "Profile picture must be a valid file"
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Profile picture must be jpeg, png, jpg, or webp"
    ),
})

export const OrganizationMemberEditSchema = OrganizationMemberCreateSchema

/** Organization role create/edit — authority is sent as hidden default "comp" */
export const RoleCreateSchema = z.object({
  name: z.string().min(2, "Role name is required").max(100),
  description: z.string().max(500).optional().or(z.literal("")),
  modules: z.array(z.string()).min(1, "Select at least one module"),
  org_id: z.union([z.string(), z.number()]).refine(
    (value) => String(value).trim().length > 0,
    "Organization is required"
  ),
})

export const RoleEditSchema = RoleCreateSchema

export const PoolSettingsSchema = z.object({
  total_available: z.coerce.number().min(0, "Pool ceiling must be 0 or more"),
  requires_approval: z.boolean(),
  auto_approve_threshold: z.coerce.number().min(0).optional().nullable(),
  finance_can_override_without_payment: z.boolean(),
  finance_role_id: z.union([z.string(), z.number()]).optional().nullable(),
  overall_manager_role_id: z.union([z.string(), z.number()]).optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.requires_approval && (data.auto_approve_threshold === undefined || data.auto_approve_threshold === null)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Auto-approve threshold is required when approval is enabled",
      path: ["auto_approve_threshold"],
    })
  }
})
export const AllocateCreditSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  minimum_spend_threshold: z.coerce.number().min(0, "Minimum threshold must be 0 or more"),
})

/** First-time / picker allocate — same fields plus which eligible user to assign. */
export const AllocateNewCreditSchema = AllocateCreditSchema.extend({
  user_id: z.union([z.string(), z.number()]).refine(
    (value) => String(value).trim().length > 0,
    "Select a user"
  ),
})

export const AdjustmentSchema = z.object({
  user_id: z.union([z.string(), z.number()]).refine(
    (value) => String(value).trim().length > 0,
    "Select a user"
  ),
  amount: z.coerce.number().refine((val) => val !== 0, "Amount cannot be zero"),
  type: z.enum(["refund", "write_off", "manual_charge", "correction"]),
  reason: z.string().min(3, "Reason is required").max(500),
})

export const RejectApprovalSchema = z.object({
  reason: z.string().min(3, "Rejection reason is required").max(500),
})

export const CreateSettlementSchema = z
  .object({
    payment_gateway: z.enum(["pesapal", "mpesa", "paystack"]),
    phone: z.string().optional(),
    email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const phone = data.phone?.trim()
    const email = data.email?.trim()

    if (data.payment_gateway === "mpesa" && !phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone number is required for M-Pesa",
        path: ["phone"],
      })
    }

    if (data.payment_gateway === "pesapal" && !phone && !email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone or email is required for Pesapal",
        path: ["phone"],
      })
    }

    if (data.payment_gateway === "paystack" && !email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email is required for Paystack",
        path: ["email"],
      })
    }
  })

export const ParameterSchema = z
  .object({
    organization_id: z.coerce
      .number()
      .int()
      .positive("Organization is required"),
    product: z
      .string()
      .min(1, "Product type is required"),
    code: z
      .string()
      .min(1, "Parameter code is required")
      .max(20, "Parameter code must not exceed 20 characters"),
    name: z
      .string()
      .min(1, "Parameter name is required")
      .max(200, "Parameter name must not exceed 200 characters"),
    kind: z
      .string()
      .min(1, "Parameter kind is required"),
    value_mode: z.enum(["percentage", "amount"], {
      message: "Value mode is required",
    }),
    percentage: z.coerce
      .number()
      .min(0, "Percentage cannot be negative")
      .max(100, "Percentage cannot exceed 100")
      .nullable(),
    amount: z.coerce
      .number()
      .min(0, "Amount cannot be negative")
      .nullable(),
    calculation_base: z
      .string()
      .min(1, "Calculation base is required"),
    payee: z
      .string()
      .min(1, "Payee is required"),
  })
  .superRefine((data, ctx) => {
    if (data.value_mode === "percentage") {
      if (data.percentage === null || data.percentage === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["percentage"],
          message: "Percentage is required",
        });
      }
    }
    if (data.value_mode === "amount") {
      if (data.amount === null || data.amount === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["amount"],
          message: "Amount is required",
        });
      }
    }
  });

export const CreditTransactionSchema = z.object({
  status: z.string().optional(),
})


// travel schema
export const TravellerDetailsSchema = z.object({
  first_name: z
    .string()
    .min(2, "First name is required")
    .max(50),

  sur_name: z
    .string()
    .min(2, "Last name is required")
    .max(50),

  email: z
    .string()
    .email("Invalid email address")
    .min(5)
    .max(32)
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .min(7, "Invalid phone number")
    .optional()
    .or(z.literal("")),

  d_o_b: z
    .string()
    .min(1, "Date of birth is required"),

  nationality: z
    .string()
    .min(1, "Select a country"),
})

export const OutBoundDestinationSchema = z.object({
  travel_as: z
    .string()
    .min(1, "Please select how you are travelling"),

  type_of_trip: z
    .string()
    .min(1, "Please select the type of trip"),

  country_of_depature: z
    .string()
    .min(1, "Please select your departure country"),

  country_of_arrival: z
    .string()
    .min(1, "Please select your arrival country"),

  date_of_depature: z
    .string()
    .min(1, "Departure date is required"),

  date_of_return: z
    .string()
    .min(1, "Return date is required"),

  reason_for_travel: z
    .string()
    .min(2, "Reason for travel is required")
    .max(255, "Reason for travel cannot exceed 255 characters"),
})

export const InBoundDestinationSchema = z.object({
  travel_as: z
    .string()
    .min(1, "Please select how you are travelling"),

  type_of_trip: z
    .string()
    .min(1, "Please select the type of trip"),

  country_of_depature: z
    .string()
    .min(1, "Please select your departure country"),

  country_of_arrival: z
    .string()
    .min(1, "Please select your arrival country"),

  date_of_depature: z
    .string()
    .min(1, "Departure date is required"),

  date_of_return: z
    .string()
    .min(1, "Return date is required"),

  reason_for_travel: z
    .string()
    .min(2, "Reason for travel is required")
    .max(255, "Reason for travel cannot exceed 255 characters"),
})

export const TravelKycSchema = z.object({
  first_name: z
    .string()
    .min(2, "First name is required")
    .max(50, "First name cannot exceed 50 characters"),

  middle_name: z
    .string()
    .max(50, "Middle name cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),

  sur_name: z
    .string()
    .min(2, "Surname is required")
    .max(50, "Surname cannot exceed 50 characters"),

  email: z
    .string()
    .email("Invalid email address")
    .max(100, "Email cannot exceed 100 characters"),

  phone_number: z
    .string()
    .min(7, "Phone number is required")
    .max(20, "Phone number cannot exceed 20 characters"),

  date_or_birth: z
    .string()
    .min(1, "Date of birth is required"),

  nationality: z
    .string()
    .min(1, "Nationality is required"),

  passport_number: z
    .string()
    .min(2, "Passport number is required")
    .max(30, "Passport number cannot exceed 30 characters"),

  tax_number: z
    .string()
    .min(1, "Tax number is required")
    .max(50, "Tax number cannot exceed 50 characters"),

  tax_certificate: z
    .instanceof(File, {
      message: "Tax certificate is required",
    }),

  passport_attachment: z
    .instanceof(File, {
      message: "Passport or ID attachment is required",
    }),
})

/** DMVIC broker stock — office + certificate type (remaining stock comes from rules). */
export const CreateDmvicStockSchema = z.object({
  organization_location_id: z.string().min(1, 'Organization location is required'),
  product_type: z.string().min(1, 'Product type is required'),
  type_of_certificate: z.string().min(1, 'Certificate type is required'),
  stock: z.coerce.number().int().min(2, 'Stock must be at least 2'),
})

export const EditDmvicStockSchema = CreateDmvicStockSchema.omit({ stock: true })

const dmvicPolicyNumberRuleBase = z.object({
  template: z.string().min(1, 'Template is required').max(255),
  series: z.string().min(1, 'Series is required').max(255),
  sequence_placeholder: z.string().min(1, 'Sequence placeholder is required').max(20),
  stock: z.coerce.number().int().min(2, 'Stock must be at least 2'),
  sequence_start: z.string().regex(/^\d+$/, 'Sequence start must be numeric'),
  maintain_policy_number: z.boolean(),
  effective_from: z.string().min(1, 'Effective from date is required'),
  effective_until: z.string().optional().or(z.literal('')),
})

/** Policy number rule — template + sequence; API generates actual policy numbers. */
export const CreateDmvicPolicyNumberRuleSchema = dmvicPolicyNumberRuleBase
  .extend({
    dmvic_stock_id: z.coerce.number().int().positive('Stock is required'),
  })
  .superRefine((data, ctx) => {
    if (
      data.sequence_placeholder !== '' &&
      !data.template.includes(data.sequence_placeholder)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Sequence placeholder must exist in the template',
        path: ['sequence_placeholder'],
      })
    }
    if (
      data.effective_until &&
      data.effective_until !== '' &&
      data.effective_from &&
      data.effective_until < data.effective_from
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Effective until must be on or after effective from',
        path: ['effective_until'],
      })
    }
  })

export const EditDmvicPolicyNumberRuleSchema = dmvicPolicyNumberRuleBase.superRefine(
  (data, ctx) => {
    if (
      data.sequence_placeholder !== '' &&
      !data.template.includes(data.sequence_placeholder)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Sequence placeholder must exist in the template',
        path: ['sequence_placeholder'],
      })
    }
    if (
      data.effective_until &&
      data.effective_until !== '' &&
      data.effective_from &&
      data.effective_until < data.effective_from
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Effective until must be on or after effective from',
        path: ['effective_until'],
      })
    }
  },
)
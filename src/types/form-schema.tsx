// form-schema.ts
import {
  ACCEPTED_FILE_TYPES,
  ACCEPTED_IMAGE_TYPES,
  PRODUCT_TYPE_VALUES,
} from "@/utils/constatnts"
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

export const KycSchema = z.object({
  nationality_id: z.string().min(1, "Select Nationality"),
  id_type: z.string().min(1, "Slect ID Type"),
  id_number: z.string().min(1, "Passport/ID No number is required"),
  tax_pin: z.string().min(1, "Tax Number is required"),
  color: z.string().min(1, "Car color is required"),
  chassis_number: z.string().min(1, "Vehicle chassis number is required"),
  engine_cc: z.string().min(1, "Vehicle engine capacity is required").max(5, "Engine capacity must be less than 99999 cc"),
  engine_number: z.string().min(1, "Engine number is required"),
  total_seats: z.string().min(1, "Number of seats is required").max(2, "Total seats must be less than 100"),
  tonage_capacity: z.string().min(1, "Vehicle tonage capacity is required").max(5, "Tonnage capacity must be less than 99999 Tones"),
  logbook: z
    .any()
    .refine((file) => file instanceof File, "Attach a logbook")
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, .png and .pdf formats are supported."
    ),
  tax_certificate: z
    .any()
    .refine((file) => file instanceof File, "Attach a tax certificate")
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, .png and .pdf formats are supported."
    ),
  id_document: z
    .any()
    .refine((file) => file instanceof File, "Attach ID/Passport")
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, .png and .pdf formats are supported."
    ),
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
  tax_pin: z.string().optional(),
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
  // total_payable: z.string().min(1, "Total payable is required"),
})

// Base payment schema with common fields
const BasePaymentSchema = z.object({
  payment_plans: z.string().optional(),
  first_installment: z.string().optional(),
  second_installment: z.string().optional(),
  third_installment: z.string().optional(),
  payment_method: z.enum(["mpesa", "card", "pesapal", "paypal", "credit", "cash"]),
})

// Mpesa specific fields
const MpesaPaymentSchema = BasePaymentSchema.extend({
  payment_method: z.literal("mpesa"),
  invoice_id: z.string(),
  phone_number: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^(?:\+254|254|0)?[17]\d{8}$/, "Invalid Kenyan phone number"),
  amount: z.number().positive("Amount must be greater than 0"),
  // amount: z.number().positive().refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()),
  //   "Amount cannot have more than 2 decimal places"
  // )
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

const PaypalPaymentSchema = BasePaymentSchema.extend({
  payment_method: z.literal("paypal"),
})

const CreditPaymentSchema = BasePaymentSchema.extend({
  payment_method: z.literal("credit"),
})

const CashPaymentSchema = BasePaymentSchema.extend({
  payment_method: z.literal("cash"),
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

export const CreateMotorTonageSchema = z.object({
  name: z
    .string()
    .min(2, "Tonage name must be at least 2 characters")
    .max(100, "Tonage name is too long"),
  vehicle_use_id: z
    .string()
    .min(1, "Vehicle use is required"),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(1000, "Description is too long"),
})

export const CreateMotorProductRatesSchema = z.object({
  coverfor_id: z.string().min(1, "Cover for is required"),
  covertype_id: z.string().min(1, "Cover type is required"),
  covering_id: z.string().min(1, "Covering is required"),
  usedfor_id: z.string().min(1, "Used for is required"),
  bodytype_id: z.string().min(1, "Body type is required"),
  used_tonnage_id: z.string().optional().or(z.literal("")),
  min_tonnage: z.union([z.string(), z.number(), z.literal("")]).optional(),
  max_tonnage: z.union([z.string(), z.number(), z.literal("")]).optional(),

  // Valued Sum Section
  is_all_sum: z.boolean(),
  valued_from: z.union([z.string(), z.number(), z.literal("")]).optional(),
  valued_to: z.union([z.string(), z.number(), z.literal("")]).optional(),

  // Age Section
  is_all_age: z.boolean(),
  age_from: z.union([z.string(), z.number(), z.literal("")]).optional(),
  age_to: z.union([z.string(), z.number(), z.literal("")]).optional(),

  rate: z.union([z.string().min(1, "Rate is required"), z.number()]),
  minimum: z.union([z.string().min(1, "Minimum is required"), z.number()]),
  pll: z.union([z.string(), z.number()]).optional(),

  // Fleet Section
  is_fleet: z.boolean(),
  min_fleet: z.union([z.string(), z.number(), z.literal("")]).optional(),
  max_fleet: z.union([z.string(), z.number(), z.literal("")]).optional(),

  target_audience: z.string(),
  cover_target: z.string(),
  min_age: z.union([z.string(), z.number()]).optional(),
  max_age: z.union([z.string(), z.number()]).optional(),
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
    const from = data.valued_from !== "" ? Number(data.valued_from) : null;
    const to = data.valued_to !== "" ? Number(data.valued_to) : null;

    if (from !== null && to !== null && !isNaN(from) && !isNaN(to)) {
      return to >= from;
    }
    return true;
  }, {
    message: "Valued To must be greater than or equal to Valued From",
    path: ["valued_to"]
  })

  // 2. Age Range Validation
  .refine((data) => {
    const from = data.age_from !== "" ? Number(data.age_from) : null;
    const to = data.age_to !== "" ? Number(data.age_to) : null;

    if (from !== null && to !== null && !isNaN(from) && !isNaN(to)) {
      return to >= from;
    }
    return true;
  }, {
    message: "Age To must be greater than or equal to Age From",
    path: ["age_to"]
  })
  .refine((data) => {
    const min = data.min_fleet !== "" ? Number(data.min_fleet) : null;
    const max = data.max_fleet !== "" ? Number(data.max_fleet) : null;

    if (min !== null && max !== null && !isNaN(min) && !isNaN(max)) {
      return max >= min;
    }
    return true;
  }, {
    message: "Max Fleet must be greater than or equal to Min Fleet",
    path: ["max_fleet"]
  });

const numericCoerce = z.union([
  z.number(),
  z.string().refine((val) => !isNaN(Number(val)) && val !== "", {
    message: "Must be a valid number",
  }).transform((val) => Number(val)),
]);

export const CreateMotorRateBenefitsSchema = z.object({
  benefit_id: z.string().min(1, "Benefit is required"),
  rate: numericCoerce,
  minimum: z.union([
    numericCoerce,
    z.literal(""),
    z.undefined()
  ]).optional(),

  benefit_type: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
})

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
    .min(1, "At least one brochure file is required")
    .refine(
      (files) => files.every(isValidBrochureFile),
      "Brochure files must be PDF, CSV, XLS, XLSX, or DOCX"
    ),
  organization_location_ids: z
    .array(z.string().min(1))
    .min(1, "At least one organization location is required"),
})
  .refine(
    (data) => new Date(data.expiry_date) >= new Date(data.start_date),
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
    .array(z.string().min(1)),
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
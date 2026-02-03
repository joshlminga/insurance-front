import { z } from "zod"

export const CustomerDetailsSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .min(5, "Email must be at least 5 characters")
    .max(32, "Email must be at most 32 characters"),
})
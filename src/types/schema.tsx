import type z from "zod";
import type { CustomerDetailsSchema } from "./form-schema";

export type CustomerFormValues = z.infer<typeof CustomerDetailsSchema>
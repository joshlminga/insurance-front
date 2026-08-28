export const EINVOICES = {
  MOTOR: "Motor",
  MARINE: "Marine",
  TRAVEL: "Travel",
  MEDICAL: "Medical",
} as const

export type EINVOICES = (typeof EINVOICES)[keyof typeof EINVOICES]

export const ECREDITTRANSACTIONS = {
  MY_TRANSACTION: "mine",
  ALL_TRANSACTION: "all",
} as const

export type ECREDITTRANSACTIONS =
  (typeof ECREDITTRANSACTIONS)[keyof typeof ECREDITTRANSACTIONS]

export const EMOTORCERTIFICATES = {
  ALL: "all",
  ISSUED: "issued",
  FAILED: "failed",
} as const

export type EMOTORCERTIFICATES =
  (typeof EMOTORCERTIFICATES)[keyof typeof EMOTORCERTIFICATES]

export const EFINANCE_INVOICE_TABS = {
  MOTOR: 'motor',
  TRAVEL: 'travel',
  MARINE: 'marine',
} as const

export type EFINANCE_INVOICE_TABS =
  (typeof EFINANCE_INVOICE_TABS)[keyof typeof EFINANCE_INVOICE_TABS]

export const EFINANCE_RECEIPT_TABS = {
  MOTOR: 'motor',
  TRAVEL: 'travel',
} as const

export type EFINANCE_RECEIPT_TABS =
  (typeof EFINANCE_RECEIPT_TABS)[keyof typeof EFINANCE_RECEIPT_TABS]

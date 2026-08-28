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

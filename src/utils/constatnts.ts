

export const EMETHODS = {
  GET: "get",
  POST: "post",
  PUT: "put",
  PATCH: "patch",
  DELETE: "delete",
} as const

export type EMETHODS = typeof EMETHODS[keyof typeof EMETHODS]
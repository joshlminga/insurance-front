import apiClient from "@/lib/api-client"

type TaxonomyListItem = {
  id?: number | string
  name?: string | null
  title?: string | null
}

type TaxonomyListResponse = {
  data?: TaxonomyListItem[] | { [key: string]: TaxonomyListItem[] }
}

const normalize = (value: string): string => value.trim().toLowerCase()

const listFromPayload = (payload: unknown): TaxonomyListItem[] => {
  if (Array.isArray(payload)) {
    return payload as TaxonomyListItem[]
  }
  if (payload && typeof payload === "object") {
    for (const value of Object.values(payload as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        return value as TaxonomyListItem[]
      }
    }
  }
  return []
}

/**
 * Search the catalog by term and look for an exact name match (case-insensitive).
 * Used before create/edit so the user gets an early warning; API remains source of truth.
 */
export async function findDuplicateTaxonomyName(options: {
  url: string
  name: string
  ignoreId?: number | string | null
}): Promise<boolean> {
  const needle = normalize(options.name)
  if (!needle) return false

  const response = await apiClient.get<TaxonomyListResponse>(options.url, {
    params: {
      term: options.name.trim(),
      per_page: 50,
      page: 1,
    },
  })

  const rows = listFromPayload(response.data?.data)
  return rows.some((row) => {
    if (options.ignoreId != null && String(row.id) === String(options.ignoreId)) {
      return false
    }
    return normalize(String(row.name ?? "")) === needle
  })
}

/**
 * Search commons by term and look for an exact full title match (case-insensitive).
 * List items expose `title` from the API (meta title with name fallback).
 */
export async function findDuplicateTaxonomyTitle(options: {
  url: string
  title: string
  ignoreId?: number | string | null
}): Promise<boolean> {
  const needle = normalize(options.title)
  if (!needle) return false

  const response = await apiClient.get<TaxonomyListResponse>(options.url, {
    params: {
      term: options.title.trim(),
      per_page: 50,
      page: 1,
    },
  })

  const rows = listFromPayload(response.data?.data)
  return rows.some((row) => {
    if (options.ignoreId != null && String(row.id) === String(options.ignoreId)) {
      return false
    }
    return normalize(String(row.title ?? "")) === needle
  })
}

/** Pull Laravel 422 field errors into { name, message } pairs for setError. */
export function extractServerFieldErrors(
  error: unknown
): Array<{ name: string; message: string }> {
  const err = error as {
    response?: { data?: { errors?: Record<string, string[] | string> } }
  }
  const errors = err?.response?.data?.errors
  if (!errors || typeof errors !== "object") {
    return []
  }

  return Object.entries(errors).flatMap(([name, messages]) => {
    const message = Array.isArray(messages) ? messages[0] : messages
    if (!message) return []
    return [{ name, message: String(message) }]
  })
}

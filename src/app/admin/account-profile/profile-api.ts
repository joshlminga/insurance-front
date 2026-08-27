/**
 * Turn a relative media path into an absolute URL for <img> / Avatar.
 * Absolute http(s) URLs are returned unchanged.
 */
export function resolveMediaUrl(pathOrUrl?: string | null): string {
  if (!pathOrUrl) return ""
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl

  const base = import.meta.env.VITE_BASE_URL as string | undefined
  if (!base) return pathOrUrl

  return `${base.replace(/\/$/, "")}/${pathOrUrl.replace(/^\//, "")}`
}

type UserWithOptionalMeta = {
  avatar?: string | null
  meta?: Array<{ key?: string; value?: string | null }> | Record<string, unknown> | null
}

/**
 * Prefer flat avatar, else profile_picture from user meta (check-auth loads meta).
 */
export function resolveUserAvatarUrl(user?: UserWithOptionalMeta | null): string {
  if (!user) return ""

  if (typeof user.avatar === "string" && user.avatar) {
    return resolveMediaUrl(user.avatar)
  }

  const fromMeta = readMetaValue(user.meta, "profile_picture")
  return resolveMediaUrl(fromMeta)
}

function readMetaValue(
  meta: UserWithOptionalMeta["meta"],
  key: string
): string | null {
  if (!meta) return null

  if (Array.isArray(meta)) {
    const row = meta.find((item) => item?.key === key)
    return typeof row?.value === "string" && row.value ? row.value : null
  }

  const value = meta[key]
  return typeof value === "string" && value ? value : null
}

/** Map Account Profile password form fields to the API body. */
export function toProfilePasswordPayload(data: {
  current_password: string
  new_password: string
  confirm_password: string
}): {
  current_password: string
  new_password: string
  new_password_confirmation: string
} {
  return {
    current_password: data.current_password,
    new_password: data.new_password,
    new_password_confirmation: data.confirm_password,
  }
}

// Formatting utilities for the Accensure system

/** Parse API decimal string (e.g. "75000.00") for display — not for arithmetic */
export function parseMoneyString(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0
  const num = typeof value === "number" ? value : parseFloat(String(value))
  return Number.isFinite(num) ? num : 0
}

/**
 * Format a number as currency (KES by default)
 */
export function formatCurrency(
  amount: number,
  currency: string = "KES",
  locale: string = "en-KE"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * Format a percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format a date string
 */
export function formatDate(
  dateString: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }

  return date.toLocaleDateString("en-KE", options || defaultOptions)
}

/**
 * Format a date and time
 */
export function formatDateTime(
  dateString: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }

  return date.toLocaleDateString("en-KE", options || defaultOptions)
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "just now"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
  }

  return formatDate(date)
}

/**
 * Format a phone number (Kenyan format)
 */
export function formatPhone(phone: string): string {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, "")

  // Handle Kenyan numbers
  if (cleaned.startsWith("254")) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }

  if (cleaned.startsWith("0")) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }

  return phone
}

/**
 * Format member ID
 */
export function formatMemberId(id: string): string {
  return id.toUpperCase()
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

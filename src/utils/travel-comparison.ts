import type { SelectedQuoteEntry } from '@/types/types'
import { MAX_COMPARISONS } from '@/utils/constatnts'

/** POST body for document/travel/comparison/{session}. */
export function buildTravelComparisonRequest(
  selectedQuotes: SelectedQuoteEntry[],
  isDownload: boolean,
): {
  is_download: boolean
  products: Array<{ product_id: string | number; rate_id: string | number }>
} {
  return {
    is_download: isDownload,
    products: selectedQuotes.map((quote) => ({
      product_id: quote.product_id,
      rate_id: quote.rate_id,
    })),
  }
}

/**
 * Toggle a rate into / out of the comparison selection.
 * Caps at MAX_COMPARISONS (same as motor).
 */
export function nextTravelQuoteSelection(
  prev: SelectedQuoteEntry[],
  entry: SelectedQuoteEntry,
  max: number = MAX_COMPARISONS,
): { next: SelectedQuoteEntry[]; error?: string } {
  const exists = prev.some(
    (quote) => String(quote.rate_id) === String(entry.rate_id),
  )

  if (exists) {
    return {
      next: prev.filter(
        (quote) => String(quote.rate_id) !== String(entry.rate_id),
      ),
    }
  }

  if (prev.length >= max) {
    return {
      next: prev,
      error: `You can select a maximum of ${max} quotations to compare.`,
    }
  }

  return { next: [...prev, entry] }
}

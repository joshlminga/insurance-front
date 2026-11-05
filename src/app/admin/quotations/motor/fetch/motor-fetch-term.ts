/**
 * Read the quote search term from a fetch-page deep link (?term=Q-...).
 */
export function motorFetchTermFromSearchParams(
  searchParams: URLSearchParams | { get: (key: string) => string | null },
): string {
  return searchParams.get('term')?.trim() ?? ''
}

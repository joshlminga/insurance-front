import type { CustomerCoverProduct } from '@/types/types'

/**
 * One place that maps a cover product (motor / travel) to its report API paths,
 * so the list page and the detail page never hard-code URLs separately.
 */
export const COVER_PRODUCTS: Record<
    CustomerCoverProduct,
    { label: string; listUrl: string; detailUrl: (id: string | number) => string }
> = {
    motor: {
        label: 'Motor',
        listUrl: 'reports/motor/user/covers',
        detailUrl: (id) => `reports/motor/user/covers/${id}`,
    },
    travel: {
        label: 'Travel',
        listUrl: 'reports/travel/user/covers',
        detailUrl: (id) => `reports/travel/user/covers/${id}`,
    },
}

/** Query-string key used on My Covers pages, e.g. `?product=travel`. */
export const COVER_PRODUCT_PARAM = 'product'

/** Unknown / missing value falls back to motor (the original behaviour). */
export const resolveCoverProduct = (
    value?: string | null
): CustomerCoverProduct => (value === 'travel' ? 'travel' : 'motor')

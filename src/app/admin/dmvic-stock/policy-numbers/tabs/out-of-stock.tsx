import PoliciesStockTab from './stock-tab'

/**
 * Out of Stock tab — broker stocks with stock = 0 (visibility only).
 */
export default function DmvicPoliciesOutOfStockTab() {
  return (
    <PoliciesStockTab
      stockStatus="out_of_stock"
      title="Out of Stock"
    />
  )
}

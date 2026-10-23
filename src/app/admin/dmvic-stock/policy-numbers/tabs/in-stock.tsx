import PoliciesStockTab from './stock-tab'

/**
 * In Stock tab — only broker stocks with remaining stock > 0
 * (can assign / update policy numbers).
 */
export default function DmvicPoliciesInStockTab() {
  return (
    <PoliciesStockTab
      stockStatus="in_stock"
      title="In Stock"
    />
  )
}

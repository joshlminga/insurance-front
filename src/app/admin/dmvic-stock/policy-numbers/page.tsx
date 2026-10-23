import { useBypassOrgLocation } from '@/auth/use-bypass-org-location'
import {
  BypassOrgLocationPicker,
  EmptyState,
  PageHeader,
} from '@/components/shared'
import { Card } from '@/components/ui/card'
import { ReusableTabComponent } from '@/dev/core'
import { DmvicPoliciesTabs } from '@/dev/tabs'
import { EDMVIC_POLICIES_TABS } from '@/types/enums'
import { Building2 } from 'lucide-react'
import { DMVIC_STOCK_ORG_STORAGE_KEY } from '../dmvic-stock-org'

/**
 * Policies — find a stock by insurer + certificate type, then open rules.
 * Tabs: In Stock (default, stock > 0) | Out of Stock (stock = 0).
 */
export function DmvicStockPolicyNumbersPage() {
  const {
    isBypass,
    selectedLocationId,
    setLocationId,
    canFetch,
    allowedLocationIds,
  } = useBypassOrgLocation(DMVIC_STOCK_ORG_STORAGE_KEY)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Policies"
        description="Find a stock by insurer office and certificate type, then open its policy-number rules. In Stock is for assignment; Out of Stock is for visibility."
      />

      {isBypass ? (
        <Card className="shadow-none p-6">
          <BypassOrgLocationPicker
            value={selectedLocationId}
            onChange={setLocationId}
            allowedLocationIds={allowedLocationIds}
            hint="Policies are scoped to the selected broker organization."
          />
        </Card>
      ) : null}

      {!canFetch ? (
        <EmptyState
          icon={Building2}
          title="Select an organization location"
          description="Choose a broker organization above before loading stocks."
        />
      ) : (
        <div className="w-full">
          <ReusableTabComponent
            tabs={DmvicPoliciesTabs}
            defaultTab={EDMVIC_POLICIES_TABS.IN_STOCK}
          />
        </div>
      )}
    </div>
  )
}

export default DmvicStockPolicyNumbersPage

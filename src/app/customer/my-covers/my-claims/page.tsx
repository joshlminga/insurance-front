import { EmptyState } from '@/components/shared/empty-state'
import { CoverCard } from '@/app/customer/my-covers/cover-card'
import type { CoverData } from '@/types/types'
import { claims } from '@/utils/enums'
import { FileWarning } from 'lucide-react'

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

export const MyClaimsPage = () => {
  const claimCards: CoverData[] = claims.map((claim) => ({
    id: claim.id,
    title: claim.coverTitle,
    variation: `Policy ${claim.policyNumber}`,
    status: claim.status,
    date: `Incident ${formatDate(claim.incidentDate)}`,
    img: '/cic.png',
  }))
  return (
    <div>
      <h1 className="w-full mb-6 text-xl font-semibold">My Claims</h1>

      {claimCards.length === 0 ? (
        <EmptyState
          icon={FileWarning}
          title="No claims yet"
          description="You have not submitted any claims at the moment."
        />
      ) : (
        <div className=" overflow-hidden">
          {claimCards.map((claim, i) => (
            <CoverCard key={`${claim.id}-${i}`} cover={claim} />
          ))}
        </div>
      )}
    </div>
  )
}

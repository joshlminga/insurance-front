import { ongoingCovers } from '@/utils/enums'
import { CoverCard } from '../cover-card'
import { RouteTabNav } from '@/dev/core'
import { EPREFIX, EROUTES } from '@/utils/enums'
import { Outlet, useLocation } from 'react-router-dom'

const coversTabs = [
    { label: 'Ongoing/Renewed', path: '' },
    { label: 'Cancelled/Rejected', path: 'cancelled' },
]

export function CoversPage() {
    const location = useLocation()
    const isCancelled = location.pathname.includes('cancelled')

    return (
        <div>
            <h1 className="w-full mb-6 text-xl font-semibold">Covers</h1>
            <RouteTabNav tabs={coversTabs} basePath={`/${EPREFIX.CUSTOMER}${EROUTES.MY_COVERS}`} />
            <div className="mt-6">
                {isCancelled ? (
                    <Outlet />
                ) : (
                    <div>
                        {ongoingCovers.map((cover, i) => (
                            <CoverCard key={`${cover.id}-${i}`} cover={cover} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

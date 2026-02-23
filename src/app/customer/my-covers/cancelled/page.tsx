import { EmptyState } from '@/components/shared/empty-state'
import { ShieldX } from 'lucide-react'

export function CancelledCoversPage() {
    return (
        <EmptyState
            icon={ShieldX}
            title="No cancelled or rejected covers"
            description="You don't have any cancelled or rejected covers to display."
        />
    )
}

import { EmptyState } from '@/components/shared/empty-state'
import { ShieldX } from 'lucide-react'

export function CancelledCoversPage() {
    return (
        <EmptyState
            icon={ShieldX}
            title="No pending covers"
            description="You don't have any pending covers to display."
        />
    )
}

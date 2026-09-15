import { PageHeader } from '@/components/shared'

/** Shared placeholder until each Travel product setup screen is built */
export function TravelComingSoonPage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        Coming soon.
      </div>
    </div>
  )
}

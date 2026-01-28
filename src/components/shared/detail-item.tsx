import { cn } from "@/lib/utils"

interface DetailItemProps {
  label: string
  value: React.ReactNode
  className?: string
}

export function DetailItem({ label, value, className }: DetailItemProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value || "-"}</dd>
    </div>
  )
}

interface DetailGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function DetailGrid({ children, columns = 2, className }: DetailGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <dl className={cn("grid gap-4", gridCols[columns], className)}>
      {children}
    </dl>
  )
}

import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"
import { Link } from "react-router-dom"

interface PageHeaderAction {
  label: string
  icon?: LucideIcon
  href?: string
  onClick?: () => void
  variant?: "default" | "outline" | "secondary" | "ghost"
}

interface PageHeaderProps {
  title: string
  description?: string
  actions?: PageHeaderAction[]
  children?: React.ReactNode
}

export function PageHeader({ title, description, actions, children }: PageHeaderProps) {
  return (
    <div className="mb-4 p-2">
      <title>{`${title} - Admin`}</title>
      {description && <meta name="description" content={description} />}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-primary leading-8">
              {title}
            </h1>
            {description && (
              <p className="text-base font-normal text-muted-foreground leading-7">
                {description}
              </p>
            )}
          </div>
          {actions && actions.length > 0 && (
          <div className="flex shrink-0 items-center gap-2">
            {actions.map((action, index) => {
              const Icon = action.icon
              const buttonContent = (
                <>
                  {Icon && <Icon className="h-4 w-4" />}
                  {action.label}
                </>
              )
              if (action.href) {
                return (
                  <Button
                    key={index}
                    variant={action.variant || "default"}
                    asChild>
                    <Link to={action.href}>{buttonContent}</Link>
                  </Button>
                )
              }
              return (
                <Button
                  key={index}
                  variant={action.variant || "default"}
                  onClick={action.onClick}>
                  {buttonContent}
                </Button>
              )
            })}
          </div>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
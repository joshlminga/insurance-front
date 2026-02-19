import { Button } from "@/components/ui/button"
import { BreadCrumbComponent } from "@/dev/core"
import type { PageHeaderProps } from "@/types/types"
import { Link } from "react-router-dom"


export function PageHeader({ title, description, actions, children }: PageHeaderProps) {
  return (
    <>
      <title>{`${title} - Accensure Insurance Marketplace`}</title>
      {description && <meta name="description" content={description} />}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-primary leading-8">
              {title}
            </h1>
            {description && (
              <p className="text-base font-normal text-muted-foreground leading-7">
                {description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {actions?.map((action, index) => {
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
            <BreadCrumbComponent />
          </div>
        </div>
        {children}
      </div>
    </>
  )
}

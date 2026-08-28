import { PageHeader } from "@/components/shared"
import { CreditScheduleStatusPanel } from "@/app/admin/credit/components/CreditScheduleStatusPanel"
import { Button } from "@/components/ui/button"
import { EROUTES } from "@/utils/enums"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export function CreditPendingDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" size="sm">
          <Link to={EROUTES.CREDIT_PENDING}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to pending
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Credit approval status"
        description="See whether this credit payment is waiting for approval, needs a cover date update, or was rejected."
      />
      {invoiceId ? (
        <CreditScheduleStatusPanel invoiceId={invoiceId} />
      ) : (
        <p className="text-sm text-muted-foreground">Missing invoice id.</p>
      )}
    </div>
  )
}

export default CreditPendingDetailPage

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CopyCell } from "@/dev/columns"
import { Button } from "@/dev/core"

/**
 * One-time display of the generated password after creating a member.
 * The password is only ever shown here (the API also emails it to the user);
 * it is never stored anywhere in the browser.
 */
export const MemberPasswordModal = ({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: {
    data?: Record<string, any>
  }
}) => {
  const created = componentProps?.data ?? {}
  const password: string = created?.password ?? ""
  const emailVerification = created?.verification?.email

  return (
    <div className="w-full min-w-[500px] max-w-[600px] p-6 space-y-6">
      <div className="border-b pb-3">
        <DialogTitle className="text-xl font-semibold">Member Created</DialogTitle>
        <DialogDescription className="mt-1">
          Share this password with the member — it is shown only once. It has
          also been emailed to them along with a verification link.
        </DialogDescription>
      </div>

      <div className="space-y-4">
        <div className="rounded-md border border-dashed border-[#ADABAB] bg-muted/40 p-4">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            One-time password
          </p>
          {password ? (
            <div className="text-lg">
              <CopyCell value={password} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No password returned — the member will receive it by email.
            </p>
          )}
        </div>

        {emailVerification && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge className="rounded-full bg-amber-100 text-amber-800 border-transparent">
              Pending verification
            </Badge>
            A verification email has been sent to the member.
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-sm hover:bg-[#C20C0C]"
          onClick={() => handleDialogContextSwitch({})}
        >
          Done
        </Button>
      </div>
    </div>
  )
}

export default MemberPasswordModal

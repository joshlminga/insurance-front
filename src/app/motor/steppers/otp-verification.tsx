import { OTPForm } from "@/components/otp-form";
import { CardFooter } from "@/components/ui/card"
import { Button } from "@/dev/core"
import { ArrowLeftCircle, ArrowRightCircle} from "lucide-react"
import { Link } from "react-router-dom"
import type { CustomerVerificationDetailsProps } from "@/types/types"

export default function OTPVerificationPage({ goToNextStep, goToPrevStep }: CustomerVerificationDetailsProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] w-full">
      <div className="w-full max-w-xl border border-[#D9D9D9] rounded-2xl p-8 bg-white shadow-sm">
        <div className="flex flex-col gap-6">
          <OTPForm className="border-0 shadow-none bg-transparent" showFooter={false} />
          
          <p className="text-center text-sm text-muted-foreground">
            Didn&apos;t receive the code? <Link to="#" className="text-[#C20C0C] font-semibold underline">Resend</Link>
          </p>

          <CardFooter className="flex justify-between px-0 pt-4 border-t border-gray-100">
            <Button
              type="button"
              className="rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
              leftIcon={<ArrowLeftCircle />}
              onClick={() => goToPrevStep?.()}
            >
              Previous
            </Button>

            <Button
              type="button"
              className="bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
              rightIcon={<ArrowRightCircle />}
              onClick={() => goToNextStep?.()}
            >
              Verify & Proceed
            </Button>
          </CardFooter>
        </div>
      </div>
    </div>
  )
}
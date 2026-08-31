/* eslint-disable @typescript-eslint/no-explicit-any */
import { normalizeLoginResponse } from "@/auth";
import { OTPForm } from "@/components/otp-form";
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/dev/core";
import { UseApiMutation } from "@/hooks/hooks";
import { UseAuth } from "@/stores/auth-store";
import { OTPVerificationSchema } from "@/types/form-schema";
import {
    OTPFormValues,
    ResendOTPFormValues
} from "@/types/schema";
import {
    CustomerVerificationDetailsProps,
    LoginResponse
} from "@/types/types";
import { EMETHODS } from "@/utils/constatnts";
import { extractErrorMessage } from "@/utils/helpers";
import { ShowToast } from "@/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowLeftCircle,
    ArrowRightCircle
} from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { Link } from "react-router-dom";

export default function OTPTravelVerificationPage({ goToNextStep, goToPrevStep }: CustomerVerificationDetailsProps) {
    const { setSession, guest } = UseAuth();

    const methods = useForm<OTPFormValues>({
        resolver: zodResolver(OTPVerificationSchema),
        defaultValues: {
            token: "",
            token_type: "email_verification",
            token_name: guest?.verification?.phone?.verification_token_name
        },
    })

    const submitMutation = UseApiMutation<LoginResponse, OTPFormValues>({
        url: "auth/account-verification",
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (data) => {
                setSession(normalizeLoginResponse(data))
                goToNextStep?.()
                ShowToast.success(data.message || "Verified successfully!")
            },
            onError: (error: any) => {
                const message = extractErrorMessage(error);
                ShowToast.error(message || "Submission failed!")
            },
        },
    })

    const onSubmit = (data: OTPFormValues) => {
        submitMutation.mutate(data)
    }

    const handleOtpComplete = () => {
        if (submitMutation.isPending) return
        methods.handleSubmit(onSubmit)()
    }

    const resendMutation = UseApiMutation<LoginResponse, ResendOTPFormValues>({
        url: "auth/account-verification/retry",
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (data) => {
                ShowToast.success(data.message || "Token Resend successfully!")
            },
            onError: (error: any) => {
                const message = extractErrorMessage(error);
                ShowToast.error(message || "Submission failed!")
            },
        },
    })

    const resendOtp = () => {
        const payload: ResendOTPFormValues = {
            type: 'guest',
            id: Number(guest?.guestId),
            token_type: String(guest?.verification?.phone?.verification_token_type),
            token_name: String(guest?.verification?.phone?.verification_token_name),
        }
        resendMutation.mutate(payload)
    }

    return (
        <FormProvider {...methods}>
            <form
                onSubmit={methods.handleSubmit(onSubmit)}
                className="flex flex-col items-center justify-center min-h-125 w-full text-center">
                <div className="w-full max-w-xl border border-[#D9D9D9] rounded-2xl p-8 bg-white shadow-sm text-center">
                    <div className="flex flex-col items-center justify-center text-center mb-6">
                        <OTPForm
                            className="w-full border-0 shadow-none bg-transparent"
                            showFooter={false}
                            onComplete={handleOtpComplete}
                        />
                        <p className="text-center text-sm text-muted-foreground mt-4">
                            Didn&apos;t receive the code?{' '}
                            <Link
                                to="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    resendOtp();
                                }}
                                className="text-[#C20C0C] font-semibold underline">
                                Resend
                            </Link>
                        </p>
                    </div>
                </div>
                <CardFooter className="w-full md:col-span-2 flex justify-between mt-1">
                    <Button
                        type="button"
                        className="rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
                        leftIcon={<ArrowLeftCircle />}
                        onClick={() => goToPrevStep?.()}>
                        Previous
                    </Button>
                    <Button
                        // type="submit"
                        type="button"
                        className="bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
                        rightIcon={<ArrowRightCircle />}
                        // loading={submitMutation.isPending}
                        onClick={() => goToNextStep?.()}>
                        Verify & Proceed
                    </Button>
                </CardFooter>
            </form>
        </FormProvider>
    )
}
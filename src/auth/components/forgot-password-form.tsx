/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Field,
    FieldDescription,
    FieldGroup,
} from "@/components/ui/field";
import { Button, ReuseableInput } from "@/dev/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShowToast } from "@/utils/utils";
import { UseApiMutation } from "@/hooks/hooks";
import { EMETHODS } from "@/utils/constatnts";
import { extractErrorMessage } from "@/utils/helpers";
import { Link, useNavigate } from "react-router-dom";
import { EPREFIX, EROUTES } from "@/utils/enums";
import { ForgotPasswordValues } from "@/types/schema";
import { ForgotPasswordSchema } from "@/types/form-schema";
import { SubmitResponse } from "@/types/types";

const ForgotPasswordForm = ({
    className,
    ...props
}: React.ComponentProps<"div">) => {
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);

    const form = useForm<ForgotPasswordValues>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const mutation = UseApiMutation<SubmitResponse, ForgotPasswordValues>({
        url: "auth/forgot-password",
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (data) => {
                ShowToast.success( data?.message || "Password reset link sent to your email");
                setSubmitted(true);
            },
            onError: (error: any) => {
                ShowToast.error(
                    extractErrorMessage(error) || "Something went wrong"
                );
            },
        },
    });

    const onSubmit = (data: ForgotPasswordValues) => {
        mutation.mutate(data);
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>

            {!submitted ? (
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup className="flex flex-col gap-4">
                        <Field>
                            <ReuseableInput
                                className="w-full h-12 rounded-md border border-gray-300"
                                control={form.control}
                                name="email"
                                label="Email"
                                type="email"
                                placeholder="Enter your registered email"
                            />
                        </Field>

                        <Field>
                            <Button
                                className="w-full h-12 bg-[#C20C0C] hover:bg-[#C20C0C]/80"
                                type="submit"
                                loading={mutation.isPending}>
                                <span className="font-semibold text-sm">
                                    Send Reset Link
                                </span>
                            </Button>
                        </Field>
                    </FieldGroup>
                </form>
            ) : (
                <FieldGroup className="flex flex-col gap-4 text-center">
                    <FieldDescription className="text-base font-medium text-gray-800">
                        Check your email
                    </FieldDescription>
                    <FieldDescription className="text-sm text-gray-500">
                        We’ve sent a password reset link to your email.
                        Please check your inbox and follow the instructions.
                    </FieldDescription>
                    <Field>
                        <Button
                            className="w-full h-12 bg-[#C20C0C] hover:bg-[#C20C0C]/80"
                            onClick={() => navigate(`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`)}>
                            <span className="font-semibold text-sm">
                                Back to Login
                            </span>
                        </Button>
                    </Field>
                </FieldGroup>
            )}
            {!submitted && (
                <FieldDescription className="text-center text-sm">
                    Remember your password?{" "}
                    <Link
                        to={`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`}
                        className="text-[#C20C0C] font-medium hover:underline"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate(`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`);
                        }}>
                        Back to Login
                    </Link>
                </FieldDescription>
            )}
        </div>
    );
};

export default ForgotPasswordForm;
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
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { EPREFIX, EROUTES } from "@/utils/enums";
import { Eye, EyeOff } from "lucide-react";
import { ResetPasswordValues } from "@/types/schema";
import { ResetPasswordSchema } from "@/types/form-schema";
import { SubmitResponse } from "@/types/types";


export const ResetPasswordForm = ({
    className,
    ...props
}: React.ComponentProps<"div">) => {
    const [show, setShow] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [searchParams] = useSearchParams();

    const email = searchParams.get("email");
    const token = searchParams.get("token");

    const navigate = useNavigate();

    const form = useForm<ResetPasswordValues>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: "",
            password_confirmation: "",
        },
    });

    const mutation = UseApiMutation<SubmitResponse, ResetPasswordValues & { token?: string, email?: string }>({
        url: "auth/reset-password",
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (data: SubmitResponse) => {
                ShowToast.success(data?.message || "Password reset successful");
                setTimeout(() => {
                    navigate(`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`);
                }, 1500);
            },
            onError: (error: any) => {
                ShowToast.error(extractErrorMessage(error) || "Reset failed");
            },
        },
    });

    const onSubmit = (data: ResetPasswordValues) => {
        mutation.mutate({
            ...data,
            token: token ?? "",
            email: email ?? "",
        });
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup className="flex flex-col gap-4">
                    <Field className="flex flex-col gap-2">
                        <div className="relative">
                            <ReuseableInput
                                className="w-full h-12 rounded-md border border-gray-300 pr-10"
                                control={form.control}
                                name="password"
                                label="Password"
                                type={show ? "text" : "password"}
                            />
                            <button
                                type="button"
                                onClick={() => setShow((prev) => !prev)}
                                 className="absolute right-3 top-3/5 -translate-y-1/10 text-gray-500 hover:text-gray-700">
                                {show ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </Field>
                    <Field className="flex flex-col gap-2">
                        <div className="relative">
                            <ReuseableInput
                                className="w-full h-12 rounded-md border border-gray-300 pr-10"
                                control={form.control}
                                name="password_confirmation"
                                label="Confirm Password"
                                type={showConfirm ? "text" : "password"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm((prev) => !prev)}
                                 className="absolute right-3 top-3/5 -translate-y-1/10 text-gray-500 hover:text-gray-700">
                                {showConfirm ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                    </Field>
                    <Field>
                        <Button
                            className="w-full h-12 bg-[#C20C0C] hover:bg-[#C20C0C]/80"
                            type="submit"
                            loading={mutation.isPending}>
                            <span className="font-semibold text-sm">
                                Reset Password
                            </span>
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
            <FieldDescription className="text-center text-sm">
                Back to{" "}
                <Link
                    to={`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`}
                    className="text-[#C20C0C] font-medium hover:underline"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate(`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`);
                    }}>
                    Login
                </Link>
            </FieldDescription>
        </div>
    );
};
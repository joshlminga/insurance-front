/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Button,
    ReusableSelect,
    ReuseableInput,
    ReuseableSingleSelectOrganizationInput
} from "@/dev/core";
import { UseApiMutation } from "@/hooks/hooks";
import { ParameterSchema } from "@/types/form-schema";
import { ParameterFormValues } from "@/types/schema";
import { SubmitResponse } from "@/types/types";
import {
    EMETHODS,
    PARAMETER_CALCULATION_BASE,
    PARAMETER_KIND,
    PARAMETER_PAYEE,
    PARAMETER_VALUE_MODE,
    PRODUCT_TYPES,
} from "@/utils/constatnts";
import { extractErrorMessage } from "@/utils/helpers";
import { ShowToast } from "@/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

export const CreateParameter = ({
    handleDialogContextSwitch,
    componentProps,
}: {
    handleDialogContextSwitch: (context?: any) => void;
    componentProps?: any;
}) => {
    const form = useForm<
        z.input<typeof ParameterSchema>,
        any,
        ParameterFormValues
    >({
        resolver: zodResolver(ParameterSchema),
        defaultValues: {
            organization_id: undefined,
            product: "",
            code: "",
            name: "",
            kind: "",
            value_mode: undefined,
            percentage: null,
            amount: null,
            calculation_base: "",
            payee: "",
        },
    });

    const submitMutation = UseApiMutation<SubmitResponse, ParameterFormValues>({
        url: "finance/parameters",
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (data) => {
                ShowToast.success(data.message || "Submitted successfully!");
                form.reset();
                componentProps?.refetch?.();
                handleDialogContextSwitch({ refetch: true });
            },
            onError: (error: unknown) => {
                const message = extractErrorMessage(error);
                ShowToast.error(message || "Submission failed!");
            },
        },
    });
    const onSubmit = (data: ParameterFormValues) => {
        submitMutation.mutate(data);
    };

    return (
        <div className="w-full min-w-150 max-w-150 p-6 space-y-6">
            <div className="border-b pb-3">
                <h2 className="text-xl font-semibold">Create Parameter</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Fill in the details below to register a new organization.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                <Controller
                    control={form.control}
                    name="organization_id"
                    render={({ field }) => (
                        <ReuseableSingleSelectOrganizationInput
                            label="Organization Name"
                            required
                            value={String(field.value ?? "")}
                            onChange={field.onChange}
                        />
                    )}
                />
                <div className="col-span-6">
                    <ReuseableInput
                        control={form.control}
                        name="name"
                        label="Parameter Name"
                        required
                    />
                </div>

                <div className="col-span-6">
                    <ReuseableInput
                        control={form.control}
                        name="code"
                        label="Parameter Code (Unique)"
                        className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        required
                    />
                </div>
                <div className="col-span-6">
                    <ReusableSelect
                        control={form.control}
                        name="product"
                        label="Product Type"
                        options={PRODUCT_TYPES}
                        required
                    />
                </div>
                <div className="col-span-6">
                    <ReusableSelect
                        control={form.control}
                        name="kind"
                        label="Parameter Kind"
                        options={PARAMETER_KIND}
                        required
                    />
                </div>
                <div className="col-span-6">
                    <ReusableSelect
                        control={form.control}
                        name="value_mode"
                        label="Parameter Value Mode"
                        options={PARAMETER_VALUE_MODE}
                        required
                    />
                </div>
                <div className="col-span-6">
                    {/* <ReuseableInput
                        control={form.control}
                        type='number'
                        name="percentage/amount"
                        label="percentage/Amount"
                        required
                    /> */}

                    {form.watch("value_mode") === "percentage" && (
                        <div className="col-span-6">
                            <ReuseableInput
                                control={form.control}
                                type="number"
                                name="percentage"
                                label="Percentage"
                                required
                            />
                        </div>
                    )}

                    {form.watch("value_mode") === "amount" && (
                        <div className="col-span-6">
                            <ReuseableInput
                                control={form.control}
                                type="number"
                                name="amount"
                                label="Amount"
                                required
                            />
                        </div>
                    )}
                </div>
                <div className="col-span-6">
                    <ReusableSelect
                        control={form.control}
                        name="calculation_base"
                        label="Parameter Calculation Base"
                        options={PARAMETER_CALCULATION_BASE}
                        required
                    />
                </div>
                <div className="col-span-6">
                    <ReusableSelect
                        control={form.control}
                        name="payee"
                        label="Payee"
                        options={PARAMETER_PAYEE}
                        required
                    />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2 px-0">
                    <Button
                        type="button"
                        className="w-full sm:w-auto rounded-md border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
                        onClick={() => handleDialogContextSwitch({})}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-md hover:bg-[#C20C0C]"
                        loading={submitMutation.isPending}>
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
};

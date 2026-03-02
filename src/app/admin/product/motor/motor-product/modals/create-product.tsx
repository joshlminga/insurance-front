/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from "@/components/ui/card"
import { 
    Button, 
    ReusableOrganizationsInputMultiselect, 
    ReusableSelect, 
    ReuseableInput, 
    ReuseableSelectInsurerInput 
} from "@/dev/core"
import { UseApiMutation } from "@/hooks/hooks"
import { CreateProductSchema } from "@/types/form-schema"
import { SubmitResponse } from "@/types/types"
import { 
    ACCESSLEVELSOPTIONS, 
    EMETHODS, 
    TARGET_AUDIENCE_OPTIONS 
} from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { CreateProductFormValues } from "@/types/schema"



export const CreateProductModal = ({ handleDialogContextSwitch, componentProps }: {
    handleDialogContextSwitch: (context?: any) => void
    componentProps?: any
}) => {
    const [brochureInputs, setBrochureInputs] = useState<Array<{ id: number, file?: File }>>([
        { id: Date.now() },
    ])

    const form = useForm<CreateProductFormValues>({
        resolver: zodResolver(CreateProductSchema),
        defaultValues: {
            organization_location_id: '',
            name: "",
            officename: "",
            description: "",
            access: "",
            for_public: "false",
            start_date: "",
            expiry_date: "",
            brochure: [],
            organization_location_ids: [],
        },
    })

    const syncBrochures = (inputs: Array<{ id: number, file?: File }>) => {
        const files = inputs
            .map((item) => item.file)
            .filter((file): file is File => Boolean(file))
        form.setValue("brochure", files, { shouldValidate: true })
    }

    const handleAddBrochureInput = () => {
        setBrochureInputs((prev) => [...prev, { id: Date.now() + Math.random() }])
    }

    const handleRemoveBrochureInput = (id: number) => {
        setBrochureInputs((prev) => {
            const next = prev.filter((item) => item.id !== id)
            const safeNext = next.length ? next : [{ id: Date.now() + Math.random() }]
            syncBrochures(safeNext)
            return safeNext
        })
    }

    const handleBrochureFileChange = (id: number, file?: File) => {
        setBrochureInputs((prev) => {
            const next = prev.map((item) => item.id === id ? { ...item, file } : item)
            syncBrochures(next)
            return next
        })
    }

    const submitMutation = UseApiMutation<SubmitResponse, FormData>({
        url: "products/motor",
        method: EMETHODS.POST,
        config: {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        },
        mutationOptions: {
            onSuccess: (data) => {
                ShowToast.success(data.message || "Submitted successfully!")
                form.reset()
                setBrochureInputs([{ id: Date.now() }])
                componentProps?.refetch?.()
                handleDialogContextSwitch({ refetch: true })
            },
            onError: (error: unknown) => {
                const message = extractErrorMessage(error)
                ShowToast.error(message || "Submission failed!")
            },
        },
    })
    const onSubmit = (data: CreateProductFormValues) => {
        const formData = new FormData()
        formData.append("organization_location_id", data.organization_location_id)
        formData.append("name", data.name)
        formData.append("officename", data.officename)
        formData.append("description", data.description)
        formData.append("access", data.access)
        formData.append("for_public", data.for_public)
        formData.append("start_date", data.start_date)
        formData.append("expiry_date", data.expiry_date)
        data.organization_location_ids.forEach((id) => {
            formData.append("organization_location_ids[]", id)
        })
        data.brochure.forEach((file) => {
            formData.append("brochure[]", file)
        })

        submitMutation.mutate(formData)
    }

    return (
        <div className="w-full min-w-[600px] max-w-[600px] p-6 space-y-6">
            <div className="border-b pb-3">
                <h2 className="text-xl font-semibold">
                    Create Motor Product
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Fill in the details below to register a new motor product.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <Controller
                    control={form.control}
                    name="organization_location_id"
                    render={({ field }) => (
                        <ReuseableSelectInsurerInput
                            label="Organization Location"
                            required
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
                <ReuseableInput
                    control={form.control}
                    name="name"
                    label="Product Motor Name"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                <ReuseableInput
                    control={form.control}
                    name="officename"
                    label="Office Name"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                <ReuseableInput
                    control={form.control}
                    name="description"
                    type="textarea"
                    label="Product Motor Description"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                <ReusableSelect
                    control={form.control}
                    name="access"
                    label="Access Level"
                    options={ACCESSLEVELSOPTIONS}
                />
                <ReusableSelect
                    control={form.control}
                    name="for_public"
                    label="Target Audience (public or private)"
                    options={TARGET_AUDIENCE_OPTIONS}
                />
                <ReuseableInput
                    control={form.control}
                    name="start_date"
                    label="Start Date"
                    type="date"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                <ReuseableInput
                    control={form.control}
                    name="expiry_date"
                    label="Expiry Date"
                    type="date"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                <div className="space-y-2">
                    <label className="text-sm font-medium">Attach Brochures</label>
                    {brochureInputs.map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                            <Input
                                type="file"
                                accept=".pdf,.csv,.xls,.xlsx,.docx,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                className="flex h-[51px] w-full 
                                rounded-[5px] border border-[#ADABAB] 
                                bg-transparent px-3 py-2 text-sm file:mr-3 
                                file:rounded file:border-0 file:bg-muted file:px-3 file:py-1"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    handleBrochureFileChange(item.id, file)
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-10 w-10 p-0"
                                onClick={handleAddBrochureInput}>
                                +
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={brochureInputs.length === 1}
                                 className="h-10 w-10 p-0"
                                onClick={() => handleRemoveBrochureInput(item.id)}>
                                -
                            </Button>
                        </div>
                    ))}
                    {form.watch("brochure")?.length ? (
                        <p className="text-xs text-muted-foreground">
                            {form.watch("brochure").length} file{form.watch("brochure").length === 1 ? "" : "s"} selected
                        </p>
                    ) : null}
                    {form.formState.errors.brochure?.message ? (
                        <p className="text-sm text-red-500">{form.formState.errors.brochure?.message}</p>
                    ) : null}
                </div>
                <Controller
                    control={form.control}
                    name="organization_location_ids"
                    render={({ field }) => (
                        <ReusableOrganizationsInputMultiselect
                            label="Organization Locations"
                            required
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
                <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 mt-2 px-0">
                    <Button
                        type="button"
                        className="w-full sm:w-auto rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
                        onClick={() => handleDialogContextSwitch({})}>
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
                        loading={submitMutation.isPending}>
                        Save Changes
                    </Button>
                </CardFooter>
            </form>
        </div>
    )
}

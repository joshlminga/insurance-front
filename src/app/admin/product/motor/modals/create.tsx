import { CardFooter } from "@/components/ui/card"
import { Button, ReusableCountriesInputMultiselect, ReusableSelect, ReuseableInput } from "@/dev/core"
import { UseApiMutation } from "@/hooks/hooks"
import { OrganizationSchema } from "@/types/form-schema"
import { OrganizationFormValues } from "@/types/schema"
import { SubmitResponse } from "@/types/types"
import { ACCESSLEVELSOPTIONS, BOOLEANOPTIONS, EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"


export const CreateProductModal =  ({ handleDialogContextSwitch, componentProps }: {
    handleDialogContextSwitch: (context?: any) => void
    componentProps?: any
}) => {

  const form = useForm<OrganizationFormValues>({
          resolver: zodResolver(OrganizationSchema),
          defaultValues: {
              name: "",
              organization_type: "",
              domain: "",
              admin_id: "",
              initials: "",
              logo: undefined,
              locations: [],
          },
      })
  
      const submitMutation = UseApiMutation<SubmitResponse, FormData>({
          url: "products/motor",
          method: EMETHODS.POST,
          // config: {
          //     headers: {
          //         "Content-Type": "multipart/form-data",
          //     },
          // },
          mutationOptions: {
              onSuccess: (data) => {
                  ShowToast.success(data.message || "Submitted successfully!")
                  form.reset()
                  componentProps?.refetch?.()
                  handleDialogContextSwitch({ refetch: true })
              },
              onError: (error: unknown) => {
                  const message = extractErrorMessage(error)
                  ShowToast.error(message || "Submission failed!")
              },
          },
      })
      const onSubmit = (data: OrganizationFormValues) => {
          submitMutation.mutate(data)
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

            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-4">
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
                    label="Target Audience"
                    options={BOOLEANOPTIONS}
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
                {/* <Controller
                    control={form.control}
                    name="admin_id"
                    render={({ field }) => (
                        <ReuseableSingleSelectAdminInput
                            label="Admin"
                            required
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                /> */}
                <ReuseableInput
                    control={form.control}
                    name="initials"
                    label="Initials"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                <ReuseableInput
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB] sm:col-span-2 lg:col-span-1"
                    control={form.control}
                    type='file'
                    name="logo"
                    label="Attach Logo"
                />
                <Controller
                    control={form.control}
                    name="locations"
                    render={({ field }) => (
                        <ReusableCountriesInputMultiselect
                            label="Locations"
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

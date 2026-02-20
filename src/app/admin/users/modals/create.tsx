import { CardFooter } from '@/components/ui/card'
import { Button, ReusableCountriesInputMultiselect, ReusableSelect, ReuseableInput } from '@/dev/core'
import React from 'react'
import { Controller } from 'react-hook-form'

export const CreateUserModal = ({ handleDialogContextSwitch }:
    {
        handleDialogContextSwitch: (context?: any) => void
        componentProps?: any
    }
) => {
    return (
        <div className="w-full min-w-[600px] max-w-[600px] p-6 space-y-6">
            <div className="border-b pb-3">
                <h2 className="text-xl font-semibold">
                    Create Users
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Fill in the details below to register a new user.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-4">
                <ReuseableInput
                    control={form.control}
                    name="name"
                    label="Organization Name"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                {/* <ReusableSelect
                    control={form.control}
                    name="organization_type"
                    label="Organization Type"
                    options={ORGANIZATIONTYPES}
                /> */}
                <ReuseableInput
                    control={form.control}
                    name="domain"
                    label="Domain"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />

                <ReuseableInput
                    control={form.control}
                    name="admin_id"
                    label="Owner/Admin"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />

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

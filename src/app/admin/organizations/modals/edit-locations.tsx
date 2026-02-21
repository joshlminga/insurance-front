import { UseApiMutation } from '@/hooks/hooks'
import { SubmitResponse } from '@/types/types'
import { EMETHODS } from '@/utils/constatnts'
import React from 'react'

export const EditLocationsModal = () => {

     const updateMutation = UseApiMutation<SubmitResponse, FormData>({
            url: `organization/${organization?.organization_id}`,
            config: {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
            method: EMETHODS.PATCH,
            mutationOptions: {
                onSuccess: (response) => {
                    ShowToast.success(response?.message || 'Organization updated successfully')
                    componentProps?.refetch?.()
                    handleDialogContextSwitch({})
                },
                onError: (error) => {
                    ShowToast.error(extractErrorMessage(error))
                },
            },
        })
    
        const onSubmit = (data: OrganizationFormValues) => {
            updateMutation.mutate(data)
        }

  return (
    <div>edit-locations</div>
  )
}

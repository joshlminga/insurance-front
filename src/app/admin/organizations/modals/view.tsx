/* eslint-disable @typescript-eslint/no-explicit-any */
import { DetailGrid, DetailItem } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button, CustomDialogComponent } from '@/dev/core'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { SubmitResponse } from '@/types/types'
import { ViewMemberLocationModal } from './members-location'
import { useCustomDialogContextFactory } from '@/hooks'
import { CardFooter } from '@/components/ui/card'
import { EMETHODS } from '@/utils/constatnts'
import { ShowToast } from '@/utils/utils'
import { extractErrorMessage } from '@/utils/helpers'

const getOrganizationName = (organization: Record<string, any>) =>
    organization?.organization_name ?? organization?.name ?? 'N/A'

export const ViewOrganizationModal = ({
    componentProps,
}: {
    handleDialogContextSwitch: (context?: any) => void
    componentProps?: any
}) => {
    const orgId = componentProps?.data?.organization_id ?? componentProps?.data?.id


    const { handleDialogContextSwitch, dialogContent, dialogOpen } =
        useCustomDialogContextFactory<{
            refetch?: () => Promise<any>;
            data?: any;
        }>();

    const { data, isLoading, refetch } = UseApiQuery<SubmitResponse>({
        url: `organization/${orgId}`,
        queryOptions: {
            enabled: Boolean(orgId),
        },
    })
    const organization = data?.data ?? componentProps?.data ?? {}
    const locations: any[] = organization?.organization_location ?? []

    const deleteLocationMutation = UseApiMutation<SubmitResponse, { id: number | string }>({
        url: ({ id }) => `organization-location/${id}`,
        method: EMETHODS.DELETE,
        mutationOptions: {
            onSuccess: (response) => {
                ShowToast.success(response?.message || 'Organization location deleted successfully')
                refetch()
            },
            onError: (error) => {
                ShowToast.error(extractErrorMessage(error))
            },
        },
    })

    const toggleLocationStatusMutation = UseApiMutation<SubmitResponse, { id: number | string, is_active: boolean }>({
        url: ({ id }) => `organization-location/${id}/status`,
        method: EMETHODS.PATCH,
        mutationOptions: {
            onSuccess: (response) => {
                ShowToast.success(response?.message || 'Organization location status updated successfully')
                refetch()
            },
            onError: (error) => {
                ShowToast.error(extractErrorMessage(error))
            },
        },
    })

        const toggleDefaultLocationMutation = UseApiMutation<SubmitResponse, { id: number | string, is_default: boolean }>({
        url: ({ id }) => `organization-location/${id}/default`,
        method: EMETHODS.PATCH,
        mutationOptions: {
            onSuccess: (response) => {
                ShowToast.success(response?.message || 'Organization location default status updated successfully')
                refetch()
            },
            onError: (error) => {
                ShowToast.error(extractErrorMessage(error))
            },
        },
    })

    return (
        <div className="w-full min-w-[600px] max-w-[800px] p-6 space-y-6">
            <div className="border-b pb-3">
                <h2 className="text-xl font-semibold">Organization Details</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    View organization profile and location metadata.
                </p>
            </div>
            {!orgId ? (
                <div className="text-sm text-destructive">Unable to load organization details: missing organization id.</div>
            ) : isLoading ? (
                <div className="text-sm text-muted-foreground">Loading organization details...</div>
            ) : (
                <div className="space-y-6">
                    <DetailGrid columns={2}>
                        <DetailItem label="Organization Name" value={getOrganizationName(organization)} />
                        <DetailItem label="Type" value={organization?.organization_type ?? 'N/A'} />
                        <DetailItem label="Domain" value={organization?.domain ?? 'N/A'} />
                        <DetailItem label="Slug" value={organization?.organization_slug ?? organization?.slug ?? 'N/A'} />
                        <DetailItem
                            label="Status"
                            value={
                                <Badge className={`rounded-full text-white ${organization?.is_active ? 'bg-green-500' : 'bg-red-500'}`}>
                                    {organization?.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            }
                        />
                        <DetailItem label="Locations" value={`${locations.length} location${locations.length === 1 ? '' : 's'}`} />
                    </DetailGrid>

                    <div className="space-y-3">
                        <p className="text-sm font-semibold">Location Mapping</p>
                        {locations.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No location data available.</p>
                        ) : (
                            <div className="grid gap-4">
                                {locations.map((location, index) => {
                                    const country = location?.country ?? {}
                                    const meta = location?.meta ?? {}
                                    const logoUrl = meta?.logo
                                    return (
                                        <div
                                            key={location?.organization_location_id ?? index}
                                            className="rounded-lg border p-4 space-y-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-sm font-medium">Location #{index + 1}</p>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDialogContextSwitch({
                                                            componentProps: {
                                                                data: location?.organization_location_id
                                                            },
                                                            Component: ViewMemberLocationModal,
                                                        })
                                                    }>
                                                    View Members
                                                </Button>
                                            </div>
                                            <DetailGrid columns={2}>
                                                <DetailItem label="Country Name" value={country?.name ?? ''} />
                                                <DetailItem
                                                    label="Default Location"
                                                    value={
                                                        <Badge className={`rounded-full text-white ${location?.is_default ? 'bg-cyan-500' : 'bg-red-500'}`}>
                                                            {location?.is_default ? 'Default' : 'Non-default'}
                                                        </Badge>
                                                    }
                                                />
                                                <DetailItem label="Country Slug" value={country?.slug ?? ''} />
                                                <DetailItem label="Initials" value={meta?.initials ?? ''} />
                                            </DetailGrid>
                                            {logoUrl ? (
                                                <div className="space-y-2">
                                                    <p className="text-xs text-muted-foreground">Logo Preview</p>
                                                    <img
                                                        src={logoUrl}
                                                        alt={`${getOrganizationName(organization)} logo`}
                                                        className="h-14 w-14 object-contain rounded border bg-white p-1"
                                                    />
                                                </div>
                                            ) : null}
                                            <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 mt-2 px-0">
                                                 <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        toggleDefaultLocationMutation.mutate({
                                                            id: location?.organization_location_id,
                                                            is_default: !location?.is_default,
                                                        })
                                                    }>
                                                    Default Location?
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        toggleLocationStatusMutation.mutate({
                                                            id: location?.organization_location_id,
                                                            is_active: !location?.is_active,
                                                        })
                                                    }>
                                                    Disable Location
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                // onClick={() =>
                                                //     handleDialogContextSwitch({
                                                //         componentProps: {
                                                //             data: location?.organization_location_id
                                                //         },
                                                //         Component: ViewMemberLocationModal,
                                                //     })
                                                // }
                                                >
                                                    Edit Location
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        deleteLocationMutation.mutate({
                                                            id: location?.organization_location_id,
                                                        })
                                                    }>
                                                    Remove Location
                                                </Button>
                                            </CardFooter>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <CustomDialogComponent
                {...{ handleDialogContextSwitch, dialogOpen }}
                className='sm:max-w-fit w-[95vw] sm:w-auto p-4 sm:p-6'>
                {dialogContent?.Component && (
                    <dialogContent.Component
                        {...{
                            componentProps: dialogContent.componentProps,
                            handleDialogContextSwitch,
                        }}
                    />
                )}
            </CustomDialogComponent>

        </div>
    )
}

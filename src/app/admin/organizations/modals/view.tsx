/* eslint-disable @typescript-eslint/no-explicit-any */
import { DetailGrid, DetailItem } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button, CustomDialogComponent } from '@/dev/core'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { SubmitResponse } from '@/types/types'
import { ViewMemberLocationModal } from './members-location'
import { useCustomDialogContextFactory } from '@/hooks'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { EMETHODS } from '@/utils/constatnts'
import { ShowToast } from '@/utils/utils'
import { extractErrorMessage } from '@/utils/helpers'
import { AddLocationModal } from './add-location'
import { EditLocationsModal } from './edit-locations'

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
        <div className="w-full min-w-[600px] max-w-[860px] space-y-6 p-6">
            <div className="border-b pb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Organization Details</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        View organization profile and location metadata.
                    </p>
                </div>
                <Button
                    variant="default"
                    size="sm"
                    className='self-start sm:self-auto'
                    onClick={() => handleDialogContextSwitch({
                        componentProps: {
                            data: organization,
                            refetch
                        },
                        Component: AddLocationModal,
                    })
                    }>
                    Add Location
                </Button>
            </div>
            {!orgId ? (
                <div className="text-sm text-destructive">Unable to load organization details: missing organization id.</div>
            ) : isLoading ? (
                <div className="text-sm text-muted-foreground">Loading organization details...</div>
            ) : (
                <div className="space-y-6">
                    <Card className="gap-0 py-0">
                        <CardHeader className="border-b px-5 py-4">
                            <CardTitle className="text-base">Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 py-4">
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
                        </CardContent>
                    </Card>

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
                                    const locationId = location?.organization_location_id
                                    const nextDefaultState = !location?.is_default
                                    const nextActiveState = !location?.is_active
                                    const isDefaultMutationPending =
                                        toggleDefaultLocationMutation.isPending &&
                                        String(toggleDefaultLocationMutation.variables?.id) === String(locationId)
                                    const isStatusMutationPending =
                                        toggleLocationStatusMutation.isPending &&
                                        String(toggleLocationStatusMutation.variables?.id) === String(locationId)
                                    const isDeletePending =
                                        deleteLocationMutation.isPending &&
                                        String(deleteLocationMutation.variables?.id) === String(locationId)

                                    return (
                                        <Card key={locationId ?? index} className="gap-0 py-0">
                                            <CardHeader className="border-b px-5 py-4">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <CardTitle className="text-base">Location #{index + 1}</CardTitle>
                                                    <div className='flex flex-wrap items-center gap-2 sm:justify-end'>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="min-w-[108px]"
                                                            onClick={() =>
                                                                handleDialogContextSwitch({
                                                                    componentProps: {
                                                                        data: location,
                                                                        refetch,
                                                                    },
                                                                    Component: EditLocationsModal,
                                                                })
                                                            }>
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="min-w-[124px]"
                                                            onClick={() =>
                                                                handleDialogContextSwitch({
                                                                    componentProps: {
                                                                        data: locationId,
                                                                    },
                                                                    Component: ViewMemberLocationModal,
                                                                })
                                                            }>
                                                            View Members
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="space-y-4 px-5 py-4">
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
                                                    <DetailItem
                                                        label="Status"
                                                        value={
                                                            <Badge className={`rounded-full text-white ${location?.is_active ? 'bg-green-500' : 'bg-red-500'}`}>
                                                                {location?.is_active ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        }
                                                    />
                                                </DetailGrid>

                                                {logoUrl ? (
                                                    <div className="space-y-2">
                                                        <p className="text-xs text-muted-foreground">Logo Preview</p>
                                                        <img
                                                            src={logoUrl}
                                                            alt={`${getOrganizationName(organization)} logo`}
                                                            className="h-14 w-14 rounded border bg-white p-1 object-contain"
                                                        />
                                                    </div>
                                                ) : null}
                                            </CardContent>

                                            <CardFooter className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex flex-col gap-2 sm:flex-row">
                                                    <Button
                                                        size="sm"
                                                        className="w-full sm:w-auto min-w-[150px]"
                                                        loading={isDefaultMutationPending}
                                                        disabled={!locationId}
                                                        onClick={() =>
                                                            toggleDefaultLocationMutation.mutate({
                                                                id: locationId,
                                                                is_default: nextDefaultState,
                                                            })
                                                        }>
                                                        {location?.is_default ? 'Unset Default' : 'Set As Default'}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="w-full sm:w-auto min-w-40"
                                                        variant={location?.is_active ? 'secondary' : 'default'}
                                                        loading={isStatusMutationPending}
                                                        disabled={!locationId}
                                                        onClick={() =>
                                                            toggleLocationStatusMutation.mutate({
                                                                id: locationId,
                                                                is_active: nextActiveState,
                                                            })
                                                        }>
                                                        {location?.is_active ? 'Deactivate Location' : 'Activate Location'}
                                                    </Button>
                                                </div>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="w-full sm:w-auto"
                                                    loading={isDeletePending}
                                                    disabled={!locationId}
                                                    onClick={() =>
                                                        deleteLocationMutation.mutate({
                                                            id: locationId,
                                                        })
                                                    }>
                                                    Remove Location
                                                </Button>
                                            </CardFooter>
                                        </Card>
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

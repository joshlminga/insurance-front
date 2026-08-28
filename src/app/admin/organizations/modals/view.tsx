/* eslint-disable @typescript-eslint/no-explicit-any */
import { DetailGrid, DetailItem } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { CustomDialogComponent } from '@/dev/core'
import { UseApiQuery } from '@/hooks/hooks'
import { SubmitResponse } from '@/types/types'
import { useCustomDialogContextFactory } from '@/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

    const { data, isLoading } = UseApiQuery<SubmitResponse>({
        url: `organization/${orgId}`,
        queryOptions: {
            enabled: Boolean(orgId),
        },
    })
    const organization = data?.data ?? componentProps?.data ?? {}
    const locations: any[] = organization?.organization_location ?? []

    return (
        <div className="w-full min-w-[600px] max-w-[860px] space-y-6 p-6">
            <div className="border-b pb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Organization Details</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        View organization profile and location metadata.
                    </p>
                </div>
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
                            <div className="border rounded-[5px] bg-white overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/40">
                                            <tr className="text-left">
                                                <th className="px-4 py-3 font-semibold">Country Name</th>
                                                <th className="px-4 py-3 font-semibold">Is Default</th>
                                                <th className="px-4 py-3 font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {locations.map((location, index) => {
                                                const country = location?.country ?? {}
                                                const isDefault = Boolean(location?.is_default)
                                                const isActive = Boolean(location?.is_active)
                                                return (
                                                    <tr
                                                        key={location?.organization_location_id ?? index}
                                                        className="border-t">
                                                        <td className="px-4 py-3">
                                                            {country?.name ?? ''}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Badge className={`rounded-full text-white ${isDefault ? 'bg-cyan-500' : 'bg-red-500'}`}>
                                                                {isDefault ? 'Default' : 'Non-default'}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Badge className={`rounded-full text-white ${isActive ? 'bg-green-500' : 'bg-red-500'}`}>
                                                                {isActive ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
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

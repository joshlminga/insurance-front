/* eslint-disable @typescript-eslint/no-explicit-any */
import { DetailGrid, DetailItem } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { CardFooter } from '@/components/ui/card'
import { Button } from '@/dev/core'
import { UseApiQuery } from '@/hooks/hooks'
import { SubmitResponse } from '@/types/types'
import { formatDate } from '@/utils/helpers'

export const ViewUserModal = ({
    componentProps,
    handleDialogContextSwitch,
}: {
    componentProps?: any
    handleDialogContextSwitch: (context?: any) => void
}) => {
    const userId = componentProps?.data?.user_id ?? componentProps?.data?.id
    const { data, isLoading } = UseApiQuery<SubmitResponse>({
        url: `user/${userId}`,
        queryOptions: {
            enabled: Boolean(userId),
        },
    })

    const user = data?.data?.user ?? {}
    const country = user?.country_name ?? user?.country?.name ?? user?.country ?? 'N/A'
    const fullName =
        user?.name ??
        [user?.first_name, user?.last_name].filter(Boolean).join(' ') ??
        'N/A'

    return (
        <div className="w-full min-w-[600px] max-w-[700px] p-6 space-y-6">
            <div className="border-b pb-3">
                <h2 className="text-xl font-semibold">User Details</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    View full profile and account information.
                </p>
            </div>

            {!userId ? (
                <div className="text-sm text-destructive">Unable to load user details: missing user id.</div>
            ) : isLoading ? (
                <div className="text-sm text-muted-foreground">Loading user details...</div>
            ) : (
                <DetailGrid columns={2}>
                    <DetailItem label="Full Name" value={fullName} />
                    <DetailItem label="Email Address" value={user?.email ?? 'N/A'} />
                    <DetailItem label="Phone Number" value={user?.phone ?? 'N/A'} />
                    <DetailItem label="Country" value={country} />
                    <DetailItem
                        label="Status"
                        value={
                            <Badge className={`rounded-full text-white ${user?.is_active ? 'bg-green-500' : 'bg-red-500'}`}>
                                {user?.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        }
                    />
                    <DetailItem
                        label="User Type"
                        value={
                            <Badge className={`rounded-full text-white ${user?.is_general ? 'bg-emerald-500' : 'bg-indigo-600'}`}>
                                {user?.is_general ? 'General' : 'Admin'}
                            </Badge>
                        }
                    />
                    <DetailItem label="Created At" value={formatDate(user?.created_at)} />
                </DetailGrid>
            )}

            <CardFooter className="px-0 pt-2">
                <Button
                    type="button"
                    className="rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
                    onClick={() => handleDialogContextSwitch({})}>
                    Close
                </Button>
            </CardFooter>
        </div>
    )
}

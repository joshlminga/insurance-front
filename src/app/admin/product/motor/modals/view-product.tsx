/* eslint-disable @typescript-eslint/no-explicit-any */
import { DetailGrid, DetailItem } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { CardFooter } from '@/components/ui/card'
import { Button } from '@/dev/core'
import { UseApiQuery } from '@/hooks/hooks'
import { SubmitResponse } from '@/types/types'
import { formatDate } from '@/utils/helpers'

export const ViewProductModal = ({ handleDialogContextSwitch, componentProps }: {
    handleDialogContextSwitch: (context?: any) => void
    componentProps?: any
}) => {
    const productId = componentProps?.data?.id
    const { data, isLoading } = UseApiQuery<SubmitResponse>({
        url: `products/motor/${productId}`,
        queryOptions: {
            enabled: Boolean(productId),
        },
    })

    const product = data?.data?.product ?? componentProps?.data ?? {}
    const baseLocation = product?.base_location ?? {}
    const baseCountry = baseLocation?.country ?? {}
    const targets: any[] = Array.isArray(product?.targets) ? product.targets : []
    const meta = product?.meta ?? {}
    const description = meta?.description ?? 'N/A'
    const brochures: any[] = Array.isArray(meta?.brochure) ? meta.brochure : []

    const getBrochureUrl = (brochure: any) =>
        brochure?.url ?? brochure?.file ?? brochure?.path ?? (typeof brochure === 'string' ? brochure : '')

    const getAudienceLabel = (value: unknown) => (value === true || value === "true" ? 'Public' : 'Private')
    const getAccessLabel = (value?: string) => {
        if (!value) return 'N/A'
        return value
            .split('-')
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ')
    }

    const startDate = product?.start_date ?? product?.cover_start_date
    const expiryDate = product?.expiry_date ?? product?.cover_expiry_date

    return (
        <div className="w-full min-w-[600px] max-w-[760px] p-6 space-y-6">
            <div className="border-b pb-3">
                <h2 className="text-xl font-semibold">Motor Product Details</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    View full product profile, location mapping, and target audience.
                </p>
            </div>

            {!productId ? (
                <div className="text-sm text-destructive">Unable to load product details: missing product id.</div>
            ) : isLoading ? (
                <div className="text-sm text-muted-foreground">Loading product details...</div>
            ) : (
                <div className="space-y-6">
                    <DetailGrid columns={2}>
                        <DetailItem label="Product Name" value={product?.name ?? 'N/A'} />
                        <DetailItem label="Office Name" value={product?.officename ?? 'N/A'} />
                        <DetailItem label="Access" value={getAccessLabel(product?.access)} />
                        <DetailItem
                            label="Target Audience"
                            value={
                                <Badge className={`rounded-full text-white ${getAudienceLabel(product?.for_public) === 'Public' ? 'bg-blue-600' : 'bg-slate-600'}`}>
                                    {getAudienceLabel(product?.for_public)}
                                </Badge>
                            }
                        />
                        <DetailItem
                            label="Status"
                            value={
                                <Badge className={`rounded-full text-white ${product?.is_active ? 'bg-green-500' : 'bg-red-500'}`}>
                                    {product?.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            }
                        />
                        <DetailItem label="Base Organization" value={baseLocation?.organization_name ?? 'N/A'} />
                        <DetailItem label="Base Country" value={baseCountry?.name ?? 'N/A'} />
                        <DetailItem label="Start Date" value={formatDate(startDate)} />
                        <DetailItem label="Expiry Date" value={formatDate(expiryDate)} />
                        <DetailItem label="Targets" value={`${targets.length} organization${targets.length === 1 ? '' : 's'}`} />
                        <DetailItem label="Created At" value={formatDate(product?.created_at)} />
                        <DetailItem label="Updated At" value={formatDate(product?.updated_at)} />
                    </DetailGrid>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Description</p>
                        <div className="rounded-md border p-3 text-sm bg-muted/30">
                            {description}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Target Organizations</p>
                        {targets.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No target organizations mapped.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {targets.map((target, index) => (
                                    <Badge key={target?.ace_organization_location_id ?? index} variant="outline" className="rounded-full">
                                        {target?.targeted_organization_name ?? target?.organization_name ?? 'N/A'}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Brochures</p>
                        {brochures.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No brochures attached.</p>
                        ) : (
                            <div className="space-y-1">
                                {brochures.map((brochure, index) => {
                                    const brochureUrl = getBrochureUrl(brochure)
                                    return brochureUrl ? (
                                        <a
                                            key={`${brochureUrl}-${index}`}
                                            href={brochureUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block text-sm text-blue-600 hover:underline">
                                            Brochure {index + 1}
                                        </a>
                                    ) : (
                                        <p key={`brochure-${index}`} className="text-sm text-muted-foreground">
                                            Brochure {index + 1}
                                        </p>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
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

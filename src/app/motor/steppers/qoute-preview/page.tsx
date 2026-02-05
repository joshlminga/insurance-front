import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/dev/core";
import { cn } from "@/lib/utils";
import { ArrowLeft, Download, Forward } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const QoutePreviewPage = ({ componentProps }: {
    componentProps: any
}) => {
    console.log(componentProps);

    return (
        <div className=''>
            <h1 className="px-3 text-2xl font-bold mb-4">
                <span>Qoute Preview</span>
            </h1>
            <Card className="items-center justify-center">
                <img
                    src={componentProps?.item?.header?.src}
                    alt={componentProps?.item?.header.alt ?? ''}
                    className={cn(
                        'w-40 max-h-full object-contain'
                    )}
                />
            </Card>
            <Card>
                <CardHeader className="font-bold">Coverage Details</CardHeader>
                <CardContent className="w-full">
                    <div className="grid grid-cols-2 gap-4 justify-between p-4">
                        <h6>Basic Premium</h6>
                        <h6>Kes 130,000</h6>
                        <h6>Excess Protector</h6>
                        <Badge className="bg-[#209BFF] rounded-0"></Badge>
                        <h6>Political Violence Terrorism</h6>
                        <Badge className="bg-[#0CC258] rounded-0">Inclusive</Badge>
                        <h6>Personal Accident(Insured)</h6>
                        <Badge className="bg-[#0CC258] rounded-0">Covered</Badge>
                        <h6>Courtesy car 10 days</h6>
                        <Badge className="bg-[#0CC258] rounded-0">Covered</Badge>
                        <h6>Road Rescue -AA</h6>
                        <Badge className="bg-[#0CC258] rounded-0">Covered</Badge>

                        <h6>PHCF &TL & Stamp Duty</h6>
                        <h6>625</h6>
                    </div>
                    <Separator className="bg-primary" />
                    <div className="grid grid-cols-2 gap-4 justify-between p-4">
                        <h6>Total Premium</h6>
                        <h6>Kes 130,000</h6>
                    </div>
                </CardContent>
            </Card>
            <CardFooter className="w-full grid grid-cols-3 gap-4 justify-between p-4">
                <>
                    <Button
                        type="button"
                        variant={'outline'}
                        leftIcon={<ArrowLeft />}>
                        Go Back
                    </Button>
                        <Button
                            type="button"
                            variant={'outline'}
                            leftIcon={<Download />}>
                            Download
                        </Button>
                        <Button
                            type="button"
                            className="bg-[#0CC258] hover:bg-[#0CC258]/70"
                            leftIcon={<Forward />}>
                            Share to
                        </Button>
                </>
            </CardFooter>
        </div>
    )
}

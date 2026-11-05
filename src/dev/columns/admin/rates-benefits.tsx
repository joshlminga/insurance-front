/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { formatExactDecimal } from "@/utils/helpers";
import { ColumnDef } from "@tanstack/table-core";

export const MotorRateBenefitsColumns: ColumnDef<any>[] = [
    {
        accessorKey: "benefit",
        header: () => <div>Addon Benefit</div>,
        cell: ({ row }) => {
            const benefit: any = row.getValue("benefit");
            return <div>{benefit?.name}</div>;
        },
    },
    {
        accessorKey: "benefit_type",
        header: () => <div>Benefit Type</div>,
        cell: ({ row }) => {
            const benefit_type: string = row.getValue("benefit_type");
            return <div>{benefit_type}</div>;
        },
    },
    {
        accessorKey: "rate",
        header: () => <div>Rate</div>,
        cell: ({ row }) => {
            const rate: number | string | null | undefined = row.getValue("rate");
            return <div>{formatExactDecimal(rate)}</div>;
        },
    },
    {
        accessorKey: "minimum",
        header: () => <div>Minimum</div>,
        cell: ({ row }) => {
            const minimum: number | string | null | undefined = row.getValue("minimum");
            return <div>{formatExactDecimal(minimum)}</div>;
        },
    },
    {
        accessorKey: "description",
        header: () => <div>description</div>,
        cell: ({ row }) => {
            const description: string = row.getValue("description");
            return <div>{description}</div>;
        },
    },
    {
        accessorKey: "is_active",
        header: () => <div>Status</div>,
        cell: ({ row }) => {
            const isActive: boolean = row.getValue("is_active");
            return (
                <Badge
                    className={`rounded-lg font-semibold ${isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            );
        },
    },
];

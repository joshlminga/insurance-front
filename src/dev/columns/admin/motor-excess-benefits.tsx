/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/table-core";

export const MotorRateExcessBenefitsColumns: ColumnDef<any>[] = [
    {
        accessorKey: "value",
        header: () => <div>Title</div>,
        cell: ({ row }) => {
            const value: any = row.getValue("value");
            return <div>{value}</div>;
        },
    },
     {
        accessorKey: "common_benefit",
        header: () => <div>Detail Benefit</div>,
        cell: ({ row }) => {
            const common_benefit: any = row.getValue("common_benefit");
            return <div>{common_benefit?.name}</div>;
        },
    },
    {
        accessorKey: "detail_type",
        header: () => <div>Detail Type</div>,
        cell: ({ row }) => {
            const detail_type: string = row.getValue("detail_type");
            return <div>{detail_type}</div>;
        },
    },
    {
        accessorKey: "detail_highlight",
        header: () => <div>Highlight</div>,
        cell: ({ row }) => {
            const detail_highlight: boolean = row.getValue("detail_highlight");
            return (
                <Badge
                    className={`rounded-lg text-white font-semibold ${detail_highlight ? "bg-gray-400" : "bg-cyan-500"
                        }`}>
                    {detail_highlight ? "Highlighted" : "Not Highlighted"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "key",
        header: () => <div>description</div>,
        cell: ({ row }) => {
            const key: string = row.getValue("key");
            return <div>{key}</div>;
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

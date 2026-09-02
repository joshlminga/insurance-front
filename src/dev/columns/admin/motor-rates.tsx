/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import {
    formatMotorRateAge,
    formatMotorRateValue,
    formatOptionalDecimal,
    formatTaxonomyName,
} from "@/utils/helpers";
import { ColumnDef } from "@tanstack/table-core";

export const MotorRateColumns: ColumnDef<any>[] = [
    {
        id: "product_name",
        header: () => <div>Product Name</div>,
        cell: ({ row }) => {
            const rowData = row.original as any;
            return <div>{formatTaxonomyName(rowData?.product)}</div>;
        },
    },
    {
        id: "covertype_name",
        header: () => <div>Cover Type</div>,
        cell: ({ row }) => {
            const rowData = row.original as any;
            return <div>{formatTaxonomyName(rowData?.covertype)}</div>;
        },
    },
    {
        id: "coverfor_name",
        header: () => <div>Class</div>,
        cell: ({ row }) => {
            const rowData = row.original as any;
            return <div>{formatTaxonomyName(rowData?.coverfor)}</div>;
        },
    },
    {
        id: "covering_name",
        header: () => <div>Covering</div>,
        cell: ({ row }) => {
            const rowData = row.original as any;
            return <div>{formatTaxonomyName(rowData?.covering)}</div>;
        },
    },
    {
        id: "usedfor_name",
        header: () => <div>Vehicle Use</div>,
        cell: ({ row }) => {
            const rowData = row.original as any;
            return <div>{formatTaxonomyName(rowData?.usedfor)}</div>;
        },
    },
    {
        id: "age_range",
        header: () => <div>Age</div>,
        cell: ({ row }) => {
            const rowData = row.original as any;
            return (
                <div>
                    {formatMotorRateAge(
                        Boolean(rowData?.is_all_age),
                        rowData?.age_from,
                        rowData?.age_to,
                    )}
                </div>
            );
        },
    },
    {
        id: "value_range",
        header: () => <div>Value</div>,
        cell: ({ row }) => {
            const rowData = row.original as any;
            return (
                <div>
                    {formatMotorRateValue(
                        Boolean(rowData?.is_all_sum),
                        rowData?.valued_from,
                        rowData?.valued_to,
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "rate",
        header: () => <div>Rate</div>,
        cell: ({ row }) => {
            const rowData = row.original as any;
            return <div>{formatOptionalDecimal(rowData?.rate)}</div>;
        },
    },
    {
        accessorKey: "minimum",
        header: () => <div>Minimum</div>,
        cell: ({ row }) => {
            const rowData = row.original as any;
            return <div>{formatOptionalDecimal(rowData?.minimum)}</div>;
        },
    },
    {
        accessorKey: "is_fleet",
        header: () => <div>Fleet</div>,
        cell: ({ row }) => {
            const rowData = row.original as any;
            const isFleet = Boolean(rowData?.is_fleet);
            const minFleet = rowData?.min_fleet;
            const maxFleet = rowData?.max_fleet;
            if (isFleet == false) {
                return (
                    <Badge className="rounded-lg text-white font-semibold bg-gray-400">
                        Not Fleet
                    </Badge>
                );
            }
            if (minFleet != null && isFleet) {
                const fleetLabel = maxFleet != null
                    ? `Fleet ${minFleet} - ${maxFleet}`
                    : `Fleet ${minFleet}+`;
                return (
                    <div>
                        <Badge className="rounded-lg text-white font-semibold bg-cyan-400">{fleetLabel}</Badge>
                    </div>
                );
            }
            return <div>-</div>;
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

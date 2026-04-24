/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { formatDate, twoDecimalformatter } from "@/utils/helpers";
import { ColumnDef } from "@tanstack/table-core";

export const MotorRateColumns: ColumnDef<any>[] = [
    {
        accessorKey: "product",
        header: () => <div>Product Name</div>,
        cell: ({ row }) => {
            const product: any = row.getValue("product");
            return <div>{product?.name}</div>;
        },
    },
    {
        accessorKey: "covertype",
        header: () => <div>Cover Type</div>,
        cell: ({ row }) => {
            const covertype: any = row.getValue("covertype");
            return <div>{covertype?.name}</div>;
        },
    },
    {
        accessorKey: "coverfor",
        header: () => <div>Class</div>,
        cell: ({ row }) => {
            const coverfor: any = row.getValue("coverfor");
            return <div>{coverfor?.name}</div>;
        },
    },
    {
        accessorKey: "covering",
        header: () => <div>Covering</div>,
        cell: ({ row }) => {
            const covering: any = row.getValue("covering");
            return <div>{covering?.name}</div>;
        },
    },
    {
        accessorKey: "bodytype",
        header: () => <div>Vehicle Body Type</div>,
        cell: ({ row }) => {
            const bodytype: any = row.getValue("bodytype");
            return <div>{bodytype?.name}</div>;
        },
    },
    {
        accessorKey: "usedfor",
        header: () => <div>Vehicle Use</div>,
        cell: ({ row }) => {
            const usedfor: any = row.getValue("usedfor");
            return <div>{usedfor?.name}</div>;
        },
    },
    {
        accessorKey: "age_from",
        header: () => <div>Age</div>,
        cell: ({ row }) => {
            const rowData = row.original as any;
            const isAllAge = Boolean(rowData?.is_all_age);
            const ageFrom = rowData?.age_from;
            const ageTo = rowData?.age_to;
            if (isAllAge) {
                return <div>-</div>;
            }
            if (ageFrom != null && ageTo != null) {
                return <div>{`${ageFrom} - ${ageTo}`}</div>;
            }
            return <div>-</div>;
        },
    },
    {
        accessorKey: "rate",
        header: () => <div>Rate</div>,
        cell: ({ row }) => {
            const rate: number = row.getValue("rate");
            return <div>{twoDecimalformatter(rate)}</div>;
        },
    },
    {
        accessorKey: "min_tonnage",
        header: () => <div>Tonnage</div>,
        cell: ({ row }) => {
            const rowData = row.original as any;
            const min_tonnage = rowData?.min_tonnage;
            const max_tonnage = rowData?.max_tonnage;
            if (min_tonnage != null && max_tonnage != null) {
                return <div>{`${min_tonnage} - ${max_tonnage}`}</div>;
            }
            return <div>-</div>;
        },
    },
    {
        accessorKey: "valued_from",
        header: () => <div>Value</div>,
        cell: ({ row }) => {
            const rowData = row.original as any;
            const isAllSum = Boolean(rowData?.is_all_sum);
            const valuedFrom = rowData?.valued_from;
            const valuedTo = rowData?.valued_to;
            if (isAllSum) {
                return <div>-</div>;
            }
            if (valuedFrom != null && valuedTo != null) {
                return <div>{`${valuedFrom} - ${valuedTo}`}</div>;
            }
            return <div>-</div>;
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
            if (minFleet != null && maxFleet != null && isFleet) {
                return (
                    <div>
                        <Badge className="rounded-lg text-white font-semibold bg-cyan-400">Fleet {`${minFleet} - ${maxFleet}`}</Badge>
                    </div>
                );
            }
            return <div>-</div>;
        },
    },
    {
        accessorKey: "start_date",
        header: () => <div>Start Date</div>,
        cell: ({ row }) => {
            const start_date: string = row.getValue("start_date");
            return <div>{formatDate(start_date)}</div>;
        },
    },
    {
        accessorKey: "expiry_date",
        header: () => <div>Expiry Date</div>,
        cell: ({ row }) => {
            const expiry_date: string = row.getValue("expiry_date");
            return <div>{formatDate(expiry_date)}</div>;
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

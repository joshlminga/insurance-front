/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/helpers";
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
        accessorKey: "rate",
        header: () => <div>Rate</div>,
        cell: ({ row }) => {
            const rate: number = row.getValue("rate");
            return <div>{rate}</div>;
        },
    },
    {
        accessorKey: "min_tonnage",
        header: () => <div>Min Tonnage</div>,
        cell: ({ row }) => {
            const min_tonnage: number = row.getValue("min_tonnage");
            return <div>{min_tonnage}</div>;
        },
    },
    {
        accessorKey: "max_tonnage",
        header: () => <div>Max Tonnage</div>,
        cell: ({ row }) => {
            const max_tonnage: number = row.getValue("max_tonnage");
            return <div>{max_tonnage}</div>;
        },
    },
    {
        accessorKey: "is_fleet",
        header: () => <div>Is Fleet</div>,
        cell: ({ row }) => {
            const isFleet: boolean = row.getValue("is_fleet");
            return (
                <Badge
                    className={`rounded-lg text-white font-semibold ${isFleet ? "bg-cyan-400" : "bg-yellow-500"}`}>
                    {isFleet ? "Fleet" : "Not Fleet"}
                </Badge>
            );
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
                    className={`rounded-lg text-white font-semibold ${isActive ? "bg-green-400" : "bg-red-500"
                        }`}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            );
        },
    },
];
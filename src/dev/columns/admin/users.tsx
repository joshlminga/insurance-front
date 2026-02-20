/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/table-core";


export const UsersColumns: ColumnDef<any>[] = [
    {
        accessorKey: "name",
        header: () => <div>Name</div>,
        cell: ({ row }) => {
            const name: string = row.getValue("name");
            return <div>{name}</div>;
        },
    },
    {
        accessorKey: "email",
        header: () => <div>Email</div>,
        cell: ({ row }) => {
            const email: string = row.getValue("email");
            return <div>{email}</div>;
        },
    },
    {
        accessorKey: "phone",
        header: () => <div>Phone</div>,
        cell: ({ row }) => {
            const phone: string = row.getValue("phone");
            return <div>{phone}</div>;
        },
    },
    {
        accessorKey: "is_active",
        header: () => <div>Status</div>,
        cell: ({ row }) => {
            const isActive: boolean = row.getValue("is_active");
            return (
                <Badge
                    className={`rounded-full text-white font-semibold ${isActive ? "bg-green-500" : "bg-red-500"
                        }`}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "is_general",
        header: () => <div className="font-bold">User Type</div>,
        cell: ({ row }) => {
            const is_general: boolean = row.getValue("is_general");

            return (
                <Badge
                    variant="outline"
                    className={`rounded-full px-3 py-1 border-none text-white font-medium shadow-sm transition-colors ${is_general
                            ? "bg-emerald-500"
                            : "bg-indigo-600"
                        }`}
                >
                    {is_general ? "General" : "Admin"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: () => <div>Created At</div>,
        cell: ({ row }) => {
            const created_at: string = row.getValue("created_at");
            return (
                <div>
                    {new Date(created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </div>
            );
        },
    },
];
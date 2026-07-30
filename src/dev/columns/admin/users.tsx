/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    getMemberRoleLabel,
    getMemberRoles,
} from "@/app/admin/organization-members/member-utils";
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
        accessorKey: "country",
        header: () => <div>Country</div>,
        cell: ({ row }) => {
            const country: any = row.getValue("country");
            return <div>{country?.name}</div>;
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
                    className={`rounded-full font-semibold ${isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
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
                    className={`rounded-full px-3 py-1 border-none font-medium shadow-sm transition-colors ${is_general
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-indigo-100 text-indigo-800"
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


export const LocationUsersColumns: ColumnDef<any>[] = [
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
        header: () => <div>User Type</div>,
        cell: ({ row }) => {
            const is_general: boolean = row.getValue("is_general");

            return (
                <Badge
                    variant="outline"
                    className={`rounded-full px-3 py-1 border-none text-white font-medium shadow-sm transition-colors ${is_general
                        ? "bg-emerald-500"
                        : "bg-indigo-600"
                        }`}>
                    {is_general ? "General" : "Admin"}
                </Badge>
            );
        },
    },
];

/** Organization Members table — LocationUsersColumns plus a Roles column from the list API */
export const OrganizationMembersColumns: ColumnDef<any>[] = [
    ...LocationUsersColumns.slice(0, 3),
    {
        id: "roles",
        header: () => <div>Roles</div>,
        cell: ({ row }) => {
            const roles = getMemberRoles(row.original);

            if (roles.length === 0) {
                return <span className="text-sm text-muted-foreground">—</span>;
            }

            return (
                <div className="flex flex-wrap gap-1">
                    {roles.map((role: any, index: number) => (
                        <Badge
                            key={`${role?.role_id ?? role?.name ?? index}-${index}`}
                            variant="outline"
                            className="rounded-full border-transparent bg-slate-100 text-xs font-medium text-slate-800"
                        >
                            {getMemberRoleLabel(role)}
                        </Badge>
                    ))}
                </div>
            );
        },
    },
    ...LocationUsersColumns.slice(3),
];
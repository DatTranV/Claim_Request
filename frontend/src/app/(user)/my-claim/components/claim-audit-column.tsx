"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"

interface ClaimAuditTrail {
    fullName: string
    userAction: string
    loggedNote: string
    actionDate: string
}

export const columns: ColumnDef<ClaimAuditTrail>[] = [
    {
        accessorKey: "fullName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="User Name" />,
    },
    {
        accessorKey: "userAction",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />,
    },
    {
        accessorKey: "loggedNote",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Note" />,
    },
    {
        accessorKey: "actionDate",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({ row }) => {
            const date = new Date(row.getValue("actionDate") as string)
            return <div>{date.toLocaleString()}</div>
        },
    },
] 
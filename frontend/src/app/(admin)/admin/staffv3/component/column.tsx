"use client"

import type { ColumnDef, Row } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"
import { Badge } from "@/components/ui/badge"
import type { User } from "@/services/api/userApi"
import { UserForm } from "./user-form"
import { useState } from "react"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { formatDollarCurrency } from "@/lib/utils"
import { staffApi } from "@/services/api/staffApi"
import { useQueryClient } from "@tanstack/react-query"
import { STAFF_QUERY_KEY } from "../page"

const deleteUser = async (id: string): Promise<void> => {
    await staffApi.delete(id)
    console.log("Deleting user:", id)
}

// Actions cell component to fix useState hook linter errors
const ActionCell = ({ row }: { row: Row<User> }) => {
    const user = row.original
    const [showViewDialog, setShowViewDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const queryClient = useQueryClient()

    return (
        <>
            <DataTableRowActions
                row={row}
                actions={[
                    {
                        label: "View Details",
                        onClick: () => setShowViewDialog(true),
                    },
                    {
                        label: "Edit",
                        onClick: () => setShowEditDialog(true),
                    },
                    {
                        label: "Delete",
                        onClick: () => setShowDeleteDialog(true),
                        destructive: true,
                    },
                ]}
           
            />

            <UserForm user={user} open={showViewDialog} onOpenChange={setShowViewDialog} mode="view" />

            <UserForm
                user={user}
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                mode="edit"
            />

            <DeleteDialog
                item={user}
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                entityName="User"
                entityDisplayField="fullName"   
                deleteFunction={async () => {
                    await deleteUser(user.id)
                    // Invalidate and refetch data after deletion
                    queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY })
                }}
            />
        </>
    )
}

export const columns: ColumnDef<User>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "fullName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    },
    {
        accessorKey: "email",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    },
    {
        accessorKey: "department",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
    },
    {
        accessorKey: "rank",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Rank" />,
    },
    {
        accessorKey: "salary",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Salary" />,
        cell: ({ row }) => {
            const salary = row.getValue("salary") as number
            return <div>{formatDollarCurrency(salary)}</div>
        },
    },
    {
        accessorKey: "roleName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
        cell: ({ row }) => {
            const role = row.getValue("roleName") as string
            return <Badge variant={role === "admin" ? "default" : role === "editor" ? "outline" : "secondary"}>{role}</Badge>
        },
    },
    {
        accessorKey: "isActive",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.getValue("isActive") as boolean
            return <Badge variant={status ? "default" : "destructive"}>{status ? "Active" : "Inactive"}</Badge>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <ActionCell row={row} />
    },
]


"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { formatDollarCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Info, Pen } from "lucide-react"

// Define Claim interface to replace User import
export interface Claim {
    id: string;
    staffName: string;
    projectName: string;
    projectDuration: string;
    totalWorkingHours: number;
    totalClaimAmount: number;
    status?: string;
    remark?: string;
    createdAt?: string;
    claimDetails?: {
        id?: string;
        remark?: string;
        fromDate?: string;
        toDate?: string;
        totalHours?: number;
    }[];
}

export const createColumns = (onViewDetail: (claim: Claim) => void): ColumnDef<Claim>[] => [
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
        accessorKey: "staffName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Staff Name" />,
    },
    {
        accessorKey: "projectName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Project Name" />,
    },
    {
        accessorKey: "projectDuration",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Project Duration" />,
    },
    {
        accessorKey: "totalWorkingHours",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Total Working Hours" />,
    },
    {
        accessorKey: "totalClaimAmount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Total Claim Amount" />,
        cell: ({ row }) => {
            const budget = row.getValue("totalClaimAmount") as number
            return <div>{formatDollarCurrency(budget)}</div>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const claim = row.original
            
            return (
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-primary"
                        onClick={() => onViewDetail(claim)}
                    >
                        {claim.status === "PendingApproval" ? (
                            <Pen className="h-4 w-4" />
                        ) : (
                            <Info className="h-4 w-4" />
                        )}
                        <span className="sr-only">View details</span>
                    </Button>
                </div>
            )
        },
    },
]

// Default columns for backwards compatibility
export const columns: ColumnDef<Claim>[] = createColumns(() => {})


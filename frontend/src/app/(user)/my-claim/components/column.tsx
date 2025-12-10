"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"
import { Badge } from "@/components/ui/badge"

// Define ClaimDetail interface
export interface ClaimDetail {
    id: string;
    date: string;
    day: string;
    from: string;
    to: string;
    totalWork: number;
    remark?: string;
}

// Define Claim interface to replace User import
export interface Claim {
    id: string;
    staffName: string;
    projectName: string;
    projectDuration: string;
    totalWorkingHours: number;
    status: string;
    creatorId: string;
    projectId: string;
    totalClaimAmount?: number;
    remark?: string;
    createdAt: string;
    claimDetails?: ClaimDetail[];
}

export const createColumns = (
    onViewDetail: (claim: Claim) => void,
    onEdit: (claim: Claim) => void,
    onSubmit: (claim: Claim) => void,
    onCancel: (claim: Claim) => void
): ColumnDef<Claim>[] => [
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
            header: ({ column }) => <DataTableColumnHeader column={column} title="TotalWorkingHours" />,
        },
        {
            accessorKey: "status",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <Badge
                        variant={
                            status === "Approved"
                                ? "default"
                                : status === "Rejected"
                                    ? "destructive"
                                    : status === "In Review" || status === "Pending Approval"
                                        ? "outline"
                                        : "secondary"
                        }
                    >
                        {status}
                    </Badge>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const claim = row.original
                const isDraft = claim.status === "Draft"

                return isDraft ? (
                    <DataTableRowActions
                        row={row}
                        actions={[
                            {
                                label: "View Details",
                                onClick: () => onViewDetail(claim),
                            },
                            {
                                label: "Edit",
                                onClick: () => onEdit(claim),
                            },
                            {
                                label: "Submit for Approval",
                                onClick: () => onSubmit(claim),
                            },
                            {
                                label: "Cancel This Claim",
                                onClick: () => onCancel(claim),
                            }
                        ]}
                    />
                ) : (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewDetail(claim)}
                        className="h-8 w-8 p-0"
                    >
                        <Info className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                    </Button>
                )
            },
        },
    ]


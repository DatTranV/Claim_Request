"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/data-table/data-table"
import { useToast } from "@/hooks/use-toast"
import { createColumns, Claim } from "../components/column"
import { claimApi } from "@/services/api/claimApi"
import { ClaimDetail } from "../components/claim-detail"

export default function UsersPage() {
    const [claim, setClaim] = useState<Claim[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
    const [openDetail, setOpenDetail] = useState(false)

    const fetchClaim = async () => {
        try {
            setLoading(true)
            const response = await claimApi.claimForApproval("approved%26paid")
            const data = await response.data
            setClaim(data)
        } catch (error: unknown) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch users",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleViewDetail = (claim: Claim) => {
        setSelectedClaim(claim)
        setOpenDetail(true)
    }

    useEffect(() => {
        fetchClaim()
    }, [])

    if (loading) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading users...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Approved Or Paid Claims</h1>
                <p className="text-muted-foreground">Manage your claims and their permissions.</p>
            </div>
            <DataTable
                columns={createColumns(handleViewDetail)}
                data={claim}
                searchKey="staffName"
                searchKeyAlt="projectName"
                searchPlaceholder="Search by staff or project..."
                // filters={[
                //     {
                //     //     columnId: "roleName",
                //     //     title: "Role",
                //     //     options: [
                //     //         { label: "Admin", value: "ADMIN" },
                //     //         { label: "Staff", value: "STAFF" },
                //     //         { label: "Approver", value: "APPROVER" },
                //     //         { label: "Finance", value: "FINANCE" },
                //     //     ],
                //     // },
                //     // {
                //     //     columnId: "isActive",
                //     //     title: "Status",
                //     //     options: [
                //     //         { label: "Active", value: true },
                //     //         { label: "Inactive", value: false },
                //     //     ],
                //     // },
                //     // {
                //     //     columnId: "department",
                //     //     title: "Department",
                //     //     options: [
                //     //         { label: "Software Development", value: "SoftwareDevelopment" },
                //     //         { label: "Finance", value: "Finance" },
                //     //     ],
                //     // },
                // ]}
            />
            <ClaimDetail 
                claim={selectedClaim} 
                open={openDetail} 
                onOpenChange={setOpenDetail} 
                showActions={false} 
            />
        </div>
    )
}


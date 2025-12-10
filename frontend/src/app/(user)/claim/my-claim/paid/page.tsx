"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/data-table/data-table"
import { useToast } from "@/hooks/use-toast"
import { UserForm } from "../components/claim-form"
import { columns } from "../components/column"
import { claimApi } from "@/services/api/claimApi"

export default function UsersPage() {
    const [claim, setClaim] = useState<[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()
    const [openUserForm, setOpenUserForm] = useState(false)

    const fetchClaim = async () => {
        try {
            setLoading(true)
            const response = await claimApi.myClaim("Paid")
            const data = await response.data
            setClaim(data)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch users",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClaim()
    }, [])

    const handleCreateNew = () => {
        setOpenUserForm(true)
    }

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
                <h1 className="text-3xl font-bold tracking-tight">Paid Claims</h1>
                <p className="text-muted-foreground">Manage your claims and their permissions.</p>
            </div>
            <DataTable
                columns={columns}
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
                onCreateNew={handleCreateNew}
                createNewLabel="Add Claim"
            />
            {/* <UserForm open={openUserForm} onOpenChange={setOpenUserForm} mode="create" onSuccess={fetchClaim} /> */}
        </div>
    )
}


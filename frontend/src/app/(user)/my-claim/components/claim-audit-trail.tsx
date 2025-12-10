"use client"

import { DataTable } from "@/components/data-table/data-table"
import { columns } from "./claim-audit-column"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { auditTrailApi } from "@/services/api/audittrailApi"

interface ClaimAuditTrailProps {
    claimId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ClaimAuditTrail({ claimId, open, onOpenChange }: ClaimAuditTrailProps) {
    const [data, setData] = useState<AuditTrail[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function fetchAuditTrail() {
            if (!claimId || !open) return

            try {
                setLoading(true)
         
                const response = await auditTrailApi.getByClaimId(claimId)
                if (response.isSuccess) {
                    setData(response.data)
                    console.log("Audit trail data:", response.data)
                }
            } catch (error) {
                console.error("Error fetching audit trail:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAuditTrail()
    }, [claimId, open])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Audit Trail</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center items-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <DataTable columns={columns} data={data} />
                )}
            </DialogContent>
        </Dialog>
    )
} 
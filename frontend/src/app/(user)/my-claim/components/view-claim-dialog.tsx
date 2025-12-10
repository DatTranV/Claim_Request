"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn, formatDollarCurrency } from "@/lib/utils"
import { ClaimRequest, claimApi } from "@/services/api/claimApi"
import { useEffect, useState } from "react"
import { History, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClaimAuditTrail } from "./claim-audit-trail"

// Extend the ClaimRequest interface to include needed properties
interface ExtendedClaimRequest extends ClaimRequest {
    staffName?: string
    projectName?: string
    createdAt?: string
}

interface ViewClaimDialogProps {
    claim: ClaimRequest | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ViewClaimDialog({ claim, open, onOpenChange }: ViewClaimDialogProps) {
    const [claimDetails, setClaimDetails] = useState<ExtendedClaimRequest | null>(null)
    const [loading, setLoading] = useState(false)
    const [showAuditTrail, setShowAuditTrail] = useState(false)

    useEffect(() => {
        async function fetchClaimDetails() {
            if (!claim?.id || !open) return

            try {
                setLoading(true)
                const response = await claimApi.getById(claim.id)
                if (response.isSuccess && response.data) {
                    setClaimDetails(response.data)
                }
            } catch (error) {
                console.error("Error fetching claim details:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchClaimDetails()
    }, [claim?.id, open])

    if (!claim) return null

    // Use claimDetails if available, otherwise fall back to the claim prop
    const displayClaim = claimDetails || claim

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle>Claim Information</DialogTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowAuditTrail(true)}
                                    className="h-8 w-8"
                                >
                                    <History className="h-4 w-4" />
                                </Button>
                                <Badge
                                    variant={
                                        displayClaim.status === "Approved"
                                            ? "default"
                                            : displayClaim.status === "Rejected"
                                                ? "destructive"
                                                : displayClaim.status === "In Review" || displayClaim.status === "Pending Approval"
                                                    ? "outline"
                                                    : "secondary"
                                    }
                                    className={cn(
                                        "text-sm px-3 py-1",
                                        displayClaim.status === "Approved" && "bg-green-500 hover:bg-green-600"
                                    )}
                                >
                                    {displayClaim.status}
                                </Badge>
                            </div>
                        </div>
                        <DialogDescription>View claim details #{displayClaim.id}</DialogDescription>
                    </DialogHeader>

                    {loading ? (
                        <div className="flex justify-center items-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-6 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Creator</h3>
                                    <p>{claimDetails?.staffName || "N/A"}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Project</h3>
                                    <p>{claimDetails?.projectName || "N/A"}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Total Working Hours</h3>
                                    <p>{displayClaim.totalWorkingHours} hours</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Total Claim Amount</h3>
                                    <p>{formatDollarCurrency(displayClaim.totalClaimAmount || 0)}</p>
                                </div>                           
                            </div>
                            {displayClaim.remark !== undefined && displayClaim.remark !== null && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Remark</h3>
                                    <p className="text-sm">{displayClaim.remark || 'Không có ghi chú'}</p>
                                </div>
                            )}


                            <Separator />

                            <div>
                                <h3 className="text-lg font-medium mb-4">Claim Details</h3>
                                {!displayClaim.claimDetails || displayClaim.claimDetails.length === 0 ? (
                                    <p className="text-muted-foreground italic">No details for this claim</p>
                                ) : (
                                    <div className="space-y-4">
                                        {displayClaim.claimDetails.map((detail, index) => (
                                            <div key={detail.id || index} className="border rounded-md p-4">
                                                <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                                                    <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium">
                                                        {index + 1}
                                                    </div>
                                                    <h4 className="font-medium">Claim Detail {index + 1}</h4>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h5 className="text-sm font-medium text-muted-foreground">Remark</h5>
                                                        <p>{detail.remark || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-medium text-muted-foreground">Date *</h5>
                                                        <p>{detail.fromDate ? new Date(detail.fromDate).toLocaleDateString() : "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-medium text-muted-foreground">Working Hours</h5>
                                                        <p>{detail.fromDate ? new Date(detail.fromDate).toLocaleTimeString() : "N/A"} - {detail.toDate ? new Date(detail.toDate).toLocaleTimeString() : "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-medium text-muted-foreground">Total Hours</h5>
                                                        <p>{detail.totalHours || 0} hours</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <ClaimAuditTrail
                claimId={displayClaim.id}
                open={showAuditTrail}
                onOpenChange={setShowAuditTrail}
            />
        </>
    )
}


"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, RotateCcw, Loader2, History } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDollarCurrency } from "@/lib/utils"
import { Claim } from "./column"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { claimApi } from "@/services/api/claimApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ClaimAuditTrail } from "@/app/(user)/my-claim/components/claim-audit-trail"

interface ClaimDetailProps {
  claim: Claim | null
  open: boolean
  onOpenChange: (open: boolean) => void
  showActions?: boolean
}

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string
    }
  }
}

// Extended Claim interface to match the response from getById
interface ExtendedClaim extends Claim {
  createdAt?: string;
}

export function ClaimDetail({
  claim,
  open,
  onOpenChange,
  showActions = false
}: ClaimDetailProps) {
  const [remark, setRemark] = useState("")
  const [claimDetails, setClaimDetails] = useState<ExtendedClaim | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAuditTrail, setShowAuditTrail] = useState(false)
  const { toast } = useToast()
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)
  const [showReturnConfirm, setShowReturnConfirm] = useState(false)
  const queryClient = useQueryClient()

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

  const rejectMutation = useMutation({
    mutationFn: async (claimData: { id: string, remark: string }) => {
      return claimApi.rejectClaim(claimData.id, claimData.remark)
    },
    onSuccess: (response) => {
      if (response.isSuccess) {
        toast({
          title: "Success",
          description: response.message,
        })
        // Invalidate and refetch claims data
        queryClient.invalidateQueries({ queryKey: ['pending-approval-claims'] })
        onOpenChange(false)
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        })
      }
      setShowRejectConfirm(false)
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to reject claim";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setShowRejectConfirm(false)
    }
  })

  const returnMutation = useMutation({
    mutationFn: async (claimData: { id: string, remark: string }) => {
      return claimApi.returnClaim(claimData.id, claimData.remark)
    },
    onSuccess: (response) => {
      if (response.isSuccess) {
        toast({
          title: "Success",
          description: response.message,
        })
        // Invalidate and refetch claims data
        queryClient.invalidateQueries({ queryKey: ['pending-approval-claims'] })
        onOpenChange(false)
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        })
      }
      setShowReturnConfirm(false)
    },
    onError: (error: unknown) => {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || "Please input your remarks in order to return Claim.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setShowReturnConfirm(false)
    }
  })

  const confirmReject = () => {
    setShowRejectConfirm(true)
  }

  const confirmReturn = () => {
    setShowReturnConfirm(true)
  }

  const handleReject = () => {
    if (!claim) return;
    rejectMutation.mutate({ id: claim.id, remark })
  }

  const handleReturn = () => {
    if (!claim) return;
    returnMutation.mutate({ id: claim.id, remark })
  }

  if (!claim) return null;

  // Use claimDetails if available, otherwise fall back to the claim prop
  const displayClaim = claimDetails || claim;
  const isLoading = loading || rejectMutation.isPending || returnMutation.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto pr-8">
          <DialogHeader className="pr-8">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">Claim Information</DialogTitle>
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
                    "text-sm py-1",
                    displayClaim.status === "Approved" && "bg-green-500 hover:bg-green-600"
                  )}
                >
                  {displayClaim.status}
                </Badge>
              </div>
            </div>
            <DialogDescription className="mt-1">View claim details #{displayClaim.id}</DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Staff Name</h3>
                  <p>{displayClaim.staffName || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Project Name</h3>
                  <p>{displayClaim.projectName || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Project Duration</h3>
                  <p>{displayClaim.projectDuration || "N/A"}</p>
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
                  <p className="text-sm">{displayClaim.remark || "No remark provided"}</p>
                </div>
              )}

              {showActions && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Add Remark</h3>
                  <Textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="Enter your remark here"
                    className="w-full"
                  />
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

              {showActions && (
                <DialogFooter className="flex gap-2">
                  <Button
                    onClick={() => onOpenChange(false)}
                    variant="outline"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={confirmReturn}
                    variant="outline"
                    disabled={returnMutation.isPending}
                    className="bg-yellow-50 hover:bg-yellow-100 text-yellow-600 hover:text-yellow-700"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Return
                  </Button>
                  <Button
                    onClick={confirmReject}
                    variant="outline"
                    disabled={rejectMutation.isPending}
                    className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ClaimAuditTrail
        claimId={displayClaim.id}
        open={showAuditTrail}
        onOpenChange={setShowAuditTrail}
      />

      {showActions && (
        <>
          <AlertDialog open={showRejectConfirm} onOpenChange={setShowRejectConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject Claim</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will reject the claim.
                  <br />
                  Please click &apos;OK&apos; to reject the claim or &apos;Cancel&apos; to close the dialog.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={rejectMutation.isPending}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReject}
                  disabled={rejectMutation.isPending}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {rejectMutation.isPending ? "Rejecting..." : "OK"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={showReturnConfirm} onOpenChange={setShowReturnConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Return Claim</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will return the claim.
                  <br />
                  Please click &apos;OK&apos; to return the claim or &apos;Cancel&apos; to close the dialog.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={returnMutation.isPending}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReturn}
                  disabled={returnMutation.isPending}
                  className="bg-yellow-600 text-white hover:bg-yellow-700"
                >
                  {returnMutation.isPending ? "Returning..." : "OK"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
  )
} 
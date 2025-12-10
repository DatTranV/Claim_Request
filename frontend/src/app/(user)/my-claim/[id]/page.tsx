"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Breadcrumb } from "@/components/shared/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { formatDollarCurrency } from "@/lib/utils"

interface ClaimDetail {
    id: string
    description: string
    amount: number
    date: string
    hours: number
}

interface ClaimRequest {
    id: string
    creatorId: string
    creatorName: string
    projectId: string
    projectName: string
    status: string
    totalWorkingHours: number
    totalClaimAmount: number
    remark?: string
    createdAt: string
    claimDetails: ClaimDetail[]
}

export default function ClaimDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const [claim, setClaim] = useState<ClaimRequest | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchClaimDetails = async () => {
            try {
                setLoading(true)
                // In a real application, you would fetch this data from your API
                // const response = await fetch(`/api/claims/${params.id}`)
                // const data = await response.json()

                // Simulate API response with mock data
                await new Promise((resolve) => setTimeout(resolve, 1000))

                const mockClaim: ClaimRequest = {
                    id: params.id as string,
                    creatorId: "123e4567-e89b-12d3-a456-426614174010",
                    creatorName: "John Doe",
                    projectId: "123e4567-e89b-12d3-a456-426614174000",
                    projectName: "Project A",
                    status: "In Review",
                    totalWorkingHours: 24,
                    totalClaimAmount: 1200,
                    remark: "This claim is for the work done in March 2023",
                    createdAt: new Date().toISOString(),
                    claimDetails: [
                        {
                            id: "detail-1",
                            description: "Initial research and planning",
                            amount: 500,
                            date: "2023-03-10",
                            hours: 10,
                        },
                        {
                            id: "detail-2",
                            description: "Implementation phase 1",
                            amount: 700,
                            date: "2023-03-15",
                            hours: 14,
                        },
                    ],
                }

                setClaim(mockClaim)
            } catch (error) {
                console.error("Error fetching claim details:", error)
                toast({
                    title: "Error",
                    description: "Failed to fetch claim details",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            fetchClaimDetails()
        }
    }, [params.id, toast])

    if (loading) {
        return (
            <div className="container mx-auto py-10">
                <Breadcrumb />
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading claim details...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!claim) {
        return (
            <div className="container mx-auto py-10">
                <Breadcrumb />
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-muted-foreground">Claim not found</p>
                        <Button onClick={() => router.push("/claims")} className="mt-4">
                            Back to Claims
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <Breadcrumb />
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Claim Request Details</h1>
                    <Badge
                        variant={
                            claim.status === "Approved"
                                ? "success"
                                : claim.status === "Rejected"
                                    ? "destructive"
                                    : claim.status === "In Review"
                                        ? "outline"
                                        : "secondary"
                        }
                        className="text-sm px-3 py-1"
                    >
                        {claim.status}
                    </Badge>
                </div>
                <p className="text-muted-foreground">View details for claim request #{claim.id}</p>
            </div>

            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Claim Information</CardTitle>
                    <CardDescription>Details about this claim request</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Creator</h3>
                            <p>{claim.creatorName}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Project</h3>
                            <p>{claim.projectName}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Total Working Hours</h3>
                            <p>{claim.totalWorkingHours} hrs</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Total Claim Amount</h3>
                            <p>{formatCurrency(claim.totalClaimAmount)}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                            <p>{new Date(claim.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                            <p>{claim.status}</p>
                        </div>
                    </div>

                    {claim.remark && (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Remark</h3>
                            <p className="text-sm">{claim.remark}</p>
                        </div>
                    )}

                    <Separator />

                    <div>
                        <h3 className="text-lg font-medium mb-4">Claim Details</h3>
                        <div className="space-y-4">
                            {claim.claimDetails.map((detail, index) => (
                                <div key={detail.id} className="border rounded-md p-4">
                                    <h4 className="font-medium mb-2">Detail #{index + 1}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h5 className="text-sm font-medium text-muted-foreground">Description</h5>
                                            <p>{detail.description}</p>
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-medium text-muted-foreground">Date</h5>
                                            <p>{new Date(detail.date).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-medium text-muted-foreground">Hours</h5>
                                            <p>{detail.hours} hrs</p>
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-medium text-muted-foreground">Amount</h5>
                                            <p>{formatCurrency(detail.amount)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => router.push("/claims")}>
                        Back to Claims
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push(`/claims/${claim.id}/edit`)}>
                            Edit Claim
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                // In a real app, you would implement delete functionality
                                toast({
                                    title: "Not implemented",
                                    description: "Delete functionality would be implemented here",
                                })
                            }}
                        >
                            Delete Claim
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}


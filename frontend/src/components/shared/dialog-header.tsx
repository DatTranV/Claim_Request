import { DialogDescription } from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { ClaimRequest } from "@/services/api/claimApi";
import { DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "../ui/dialog";
import { Badge } from "../ui/badge";


interface ClaimDialogHeaderProps {
    title: string;
    description: string;
    claim: ClaimRequest
}

const ClaimDialogHeader = ({ title, description, claim }: ClaimDialogHeaderProps) => (
    <DialogHeader>
        <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <Badge
                variant={
                    claim.status === "Approved"
                        ? "default"
                        : claim.status === "Rejected"
                            ? "destructive"
                            : claim.status === "In Review" || claim.status === "Pending Approval"
                                ? "outline"
                                : "secondary"
                }
                className={cn(
                    "text-sm px-3 py-1",
                    claim.status === "Approved" && "bg-green-500 hover:bg-green-600"
                )}
            >
                {claim.status}
            </Badge>
        </div>
        <DialogDescription>{description}</DialogDescription>
    </DialogHeader>
);

export default ClaimDialogHeader;
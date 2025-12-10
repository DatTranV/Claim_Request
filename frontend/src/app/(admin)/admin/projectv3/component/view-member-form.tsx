"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { projectEnrollmentApi } from "@/services/api/projectEnrollmentApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

interface Project {
  id: string;
  projectName: string;
  projectCode: string;
  description: string;
  status: string;
  budget: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt?: string;
}

interface ProjectMember {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  projectRole: string;
  createdAt: string;
}

interface ViewMemberFormProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ViewMemberForm({
  project,
  open,
  onOpenChange,
  onSuccess,
}: ViewMemberFormProps) {
  const { toast } = useToast();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await projectEnrollmentApi.getByProject(project.id);
        const data = response.data.filter(user => !user.isDeleted);
        if (response.isSuccess) {
          const transformedData = data.map((enrollment) => ({
            id: enrollment.id,
            userId: Array.isArray(enrollment.userId) ? enrollment.userId[0] : enrollment.userId,
            fullName: enrollment.fullName,
            email: enrollment.email,
            projectRole: enrollment.projectRole,
            createdAt: enrollment.createdAt,
          }));
          setMembers(transformedData);
        } else {
          throw new Error(response.message || "Failed to fetch project members");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch project members";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchMembers();
    }
  }, [open, project.id, toast]);

  // const updateEnroll: UpdateEnrollmentDto ={
  //   display: "",
  //   projectRole: 
  // }
  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      setUpdating(true);
      const response = await projectEnrollmentApi.update(id, { projectRole: newRole });
      console.log(response);
      if (response.isSuccess) {
        setMembers(members.map(member =>
          member.id === id ? { ...member, projectRole: newRole } : member
        ));

        toast({
          title: "Success",
          description: "Project role updated successfully",
        });

        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(response.message || "Failed to update project role");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update project role";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Remove a member from the project
  const handleRemoveMember = async (Id: string): Promise<void> => {
    try {
      setUpdating(true);
      const response = await projectEnrollmentApi.delete(Id);

      if (response.isSuccess) {

        toast({
          title: "Success",
          description: "Member removed successfully",
        });

        if (onSuccess) {
          onSuccess();
        }
        onOpenChange(false)
      } else {
        throw new Error(response.message || "Failed to remove member");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove member";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",

      });
    } finally {
      setUpdating(false);
      setShowConfirmDialog(false)
    }
  };

  const projectRoleOptions = [
    { label: "Project Manager", value: "ProjectManager" },
    { label: "Developer", value: "Developer" },
    { label: "Tester", value: "Tester" },
    { label: "Business Analyst", value: "BusinessAnalyst" },
    { label: "Quality Assurance", value: "QualityAssurance" },
    { label: "Technical Lead", value: "TechnicalLead" },
    { label: "Technical Consultancy", value: "TechnicalConsultancy" },
  ];

  const columns = [
    {
      accessorKey: "fullName",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "projectRole",
      header: "Project Role",
      cell: ({ row }: { row: { original: ProjectMember } }) => {
        const member = row.original;
        return (
          <Select
            value={member.projectRole}
            onValueChange={(value) => handleRoleChange(member.id, value)}
            disabled={updating}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {projectRoleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined At",
      cell: ({ row }: { row: { original: ProjectMember } }) => {
        const date = new Date(row.original.createdAt)
        return <span>{date.toLocaleDateString()}</span>
      },
    },
    {
      id: "actions",
      cell: ({ row }: { row: { original: ProjectMember } }) => {
        const member = row.original;
        return (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive/90"
            onClick={() => {
              setShowConfirmDialog(true);
              setSelectedMemberId(member.id);
            }}
            disabled={updating}
          >
            <X strokeWidth={3} absoluteStrokeWidth className=" h-4 w-4" />
            <span className="sr-only">Remove member</span>
          </Button>
        );
      },
    }
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>

        <DialogContent className=" sm:max-w-[1200px]">
          <DialogHeader>
            <DialogTitle>View Project Members</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading members...</p>
              </div>
            </div>
          ) : (
            <div>

              <div className="max-h-[500px] mx-auto overflow-auto">
                <DataTable
                  columns={columns}
                  data={members}
                  searchKey="fullName"
                  searchKeyAlt="email"
                  searchPlaceholder="Search by name or email..."
                  filters={[
                    {
                      columnId: "projectRole",
                      title: "Project Role",
                      options: projectRoleOptions,
                    },
                  ]}
                />
                <div className="mt-2 text-sm text-muted-foreground">
                  Total members: {members.length}
                </div>
              </div>


              <DialogFooter className="mt-4">
                <Button type="button" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
        <ConfirmDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          title="Are you sure?"
          description={
            "This action will remove this user out of project."
          }
          onConfirm={() => handleRemoveMember(selectedMemberId)}
        />
      </Dialog>


    </>
  );
} 
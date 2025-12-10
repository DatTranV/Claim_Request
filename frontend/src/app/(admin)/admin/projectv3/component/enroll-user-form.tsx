"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/data-table/data-table";
import type { User } from "@/services/api/userApi";
import { Button } from "@/components/ui/button";
import { staffApi } from "@/services/api/staffApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddEnrollmentDto, projectEnrollmentApi } from "@/services/api/projectEnrollmentApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

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

interface EnrollmentUser extends User {
  enrolled?: string;
}

interface EnrollUserFormProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EnrollUserForm({
  project,
  open,
  onOpenChange,
  onSuccess,
}: EnrollUserFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<EnrollmentUser[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [projectRole, setProjectRole] = useState("Developer");
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await staffApi.getNotInProject(project.id);
      const data = response.data
        .filter(user => !user.isDeleted)
        .map(user => ({
          ...user,
          enrolled: user.enrolled ? "Yes" : ""
        }));
      setUsers(data);
      setSelectedUserIds([]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch users";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const handleConfirmEnroll = async () => {
    try {
      setIsSubmitting(true);

      const addEnroll: AddEnrollmentDto = {
        projectId: project.id,
        userId: selectedUserIds,
        projectRole: projectRole
      }
      const response = await projectEnrollmentApi.create(addEnroll);

      if (!response.isSuccess) {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
        return;
      }

      const data = response.data;
      console.log("API Response:", data);

      toast({
        title: "Success",
        description: "Users enrolled successfully",
      });

      // Reload the data instead of the page
      fetchUsers();

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error enrolling users:", error);
      toast({
        title: "Error",
        description: "An error occurred while enrolling users",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one user to enroll",
        variant: "destructive",
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const columns = [
    {
      id: "select",
      header: "Select",
      cell: ({ row }: { row: { original: EnrollmentUser } }) => {
        const isEnrolled = row.original.enrolled === "Yes";
        return (
          <input
            type="checkbox"
            checked={isEnrolled || selectedUserIds.includes(row.original.id)}
            onChange={(e) => {
              if (isEnrolled) return;
              if (e.target.checked) {
                setSelectedUserIds([...selectedUserIds, row.original.id]);
              } else {
                setSelectedUserIds(
                  selectedUserIds.filter((id) => id !== row.original.id)
                );
              }
            }}
            className={`h-4 w-4 accent-black border-black ${isEnrolled ? "opacity-50 cursor-not-allowed" : ""}`}
            title={isEnrolled ? "User already enrolled" : "Select user"}
            aria-label={isEnrolled ? "User already enrolled" : "Select user"}
            disabled={isEnrolled}
          />
        );
      },
    },
    {
      accessorKey: "fullName",
      header: "Name",
      cell: ({ row }) => {
        const isEnrolled = row.original.enrolled === "Yes";
        return (
          <div className={isEnrolled ? "opacity-50" : ""}>
            {row.original.fullName}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const isEnrolled = row.original.enrolled === "Yes";
        return (
          <div className={isEnrolled ? "opacity-50" : ""}>
            {row.original.email}
          </div>
        );
      },
    },
    {
      accessorKey: "enrolled",
      header: "Enrolled",
      cell: ({ row }) => {
        const status = row.getValue("enrolled") as string;
        return status === "Yes" ? (
          <Badge className="bg-green-500">
            <Check />
          </Badge>
        ) : (
          null
        );
      },
    },
    {
      accessorKey: "rank",
      header: "Rank",
      cell: ({ row }) => {
        const isEnrolled = row.original.enrolled === "Yes";
        return (
          <div className={isEnrolled ? "opacity-50" : ""}>
            {row.original.rank}
          </div>
        );
      },
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => {
        const isEnrolled = row.original.enrolled === "Yes";
        return (
          <div className={isEnrolled ? "opacity-50" : ""}>
            {row.original.department}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[1200px]">
          <DialogHeader>
            <DialogTitle>Enroll Users</DialogTitle>
            <DialogDescription>
              Select users to enroll in the project and set their roles.
            </DialogDescription>
          </DialogHeader>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading users...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-12 gap-4">
                <Label className="text-right col-span-2">Project Name</Label>
                <div className="col-span-2">
                  <Input value={project.projectName} readOnly disabled />
                </div>

                <Label className="ml-25 text-right col-span-2">Start Date</Label>
                <div className="col-span-2">
                  <Input value={new Date(project.startDate).toLocaleDateString()} readOnly disabled />
                </div>

                <Label className="ml-25 text-right col-span-2">End Date</Label>
                <div className="col-span-2">
                  <Input value={new Date(project.endDate).toLocaleDateString()} readOnly disabled />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 items-center">
                <Label className="text-right col-span-2">Project Role</Label>
                <div className="col-span-4">
                  <Select value={projectRole} onValueChange={setProjectRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ProjectManager">
                        Project Manager
                      </SelectItem>
                      <SelectItem value="Developer">Developer</SelectItem>
                      <SelectItem value="Tester">Tester</SelectItem>
                      <SelectItem value="BusinessAnalyst">
                        Business Analyst
                      </SelectItem>
                      <SelectItem value="QualityAssurance">
                        Quality Assurance
                      </SelectItem>
                      <SelectItem value="TechnicalLead">
                        Technical Lead
                      </SelectItem>
                      <SelectItem value="TechnicalConsultancy">
                        Technical Consultancy
                      </SelectItem>

                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="max-h-[300px] overflow-auto">
                  <DataTable
                    columns={columns}
                    data={users}
                    searchKey="fullName"
                    searchKeyAlt="email"
                    searchPlaceholder="Search by name or email..."
                    filters={[
                      {
                        columnId: "department",
                        title: "Department",
                        options: [
                          {
                            label: "Software Development",
                            value: "SoftwareDevelopment",
                          },
                          {
                            label: "Quality Assurance",
                            value: "QualityAssurance",
                          },
                          {
                            label: "Project Management",
                            value: "ProjectManagement",
                          },
                          {
                            label: "Business Analysis",
                            value: "BusinessAnalysis",
                          },
                          { label: "UI/UX Design", value: "UIUXDesign" },
                          {
                            label: "Human Resources",
                            value: "HumanResources",
                          },
                          { label: "Finance", value: "Finance" },
                          { label: "Tech Lead", value: "TechLead" },
                          {
                            label: "Software Architect",
                            value: "SoftwareArchitect",
                          },
                          {
                            label: "Customer Support",
                            value: "CustomerSupport",
                          },
                          { label: "Data Science", value: "DataScience" },
                          { label: "Sales", value: "Sales" },
                          { label: "Marketing", value: "Marketing" },
                          { label: "IT Support", value: "ITSupport" },
                          { label: "Scrum Master", value: "ScrumMaster" },
                        ],
                      },
                      {
                        columnId: "rank",
                        title: "Rank",
                        options: [
                          {
                            label: "Intern",
                            value: "Intern",
                          },
                          {
                            label: "Fresher",
                            value: "Fresher",
                          },
                          {
                            label: "Junior",
                            value: "Junior",
                          },
                          {
                            label: "Senior",
                            value: "Senior",
                          },
                        ],
                      },
                    ]}
                  />
                  <div className="mt-2 text-sm text-muted-foreground">
                    Total selected users: {selectedUserIds.length}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || selectedUserIds.length === 0}
                  className={selectedUserIds.length === 0 ? "opacity-50 cursor-not-allowed" : ""}
                >
                  {isSubmitting ? "Enrolling..." : "Enroll Selected Users"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Enroll User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure want to add {selectedUserIds.length} users with the role {projectRole}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmEnroll} disabled={isSubmitting}>
              {isSubmitting ? "on loading..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

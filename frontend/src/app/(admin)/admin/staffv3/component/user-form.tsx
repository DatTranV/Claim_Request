"use client";

import { useState } from "react";
import type { User } from "@/services/api/userApi";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { staffApi } from "@/services/api/staffApi";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useQueryClient } from "@tanstack/react-query";
import { STAFF_QUERY_KEY } from "../page";

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(2, "Please choose department"),
});

interface UserFormProps {
  user?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | "view";
}

export function UserForm({ user, open, onOpenChange, mode }: UserFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      department: user?.department || "",
    },
  });

  const [formData, setFormData] = useState<User>(
    user || {
      id: "",
      email: "",
      fullName: "",
      userName: "",
      dob: "",
      salary: 0,
      department: "",
      rank: "Intern",
      title: "",
      phoneNumber: "",
      imageUrl: "",
      address: "",
      roleName: "STAFF",
      createdAt: "",
      isActive: true,
    }
  );

  const isViewMode = mode === "view";
  const title =
    mode === "create"
      ? "Add New User"
      : mode === "edit"
        ? "Edit User"
        : "User Details";

  const resetForm = () => {
    form.reset({
      fullName: "",
      email: "",
      department: "",
    });
    setFormData({
      id: "",
      email: "",
      fullName: "",
      userName: "",
      dob: "",
      salary: 0,
      department: "",
      rank: "Intern",
      title: "",
      phoneNumber: "",
      imageUrl: "",
      address: "",
      roleName: "STAFF",
      createdAt: "",
      isActive: true,
    });
  };

  const handleChange = (
    field: keyof User,
    value: string | number | boolean
  ) => {
    if (!isViewMode) {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isViewMode) {
      onOpenChange(false);
      return;
    }

    setFormData((prev) => ({ ...prev, ...values }));
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setIsSubmitting(true);
      const updatedFormData = { ...formData };

      if (mode === "create") {
        try {
          const response = await staffApi.create(updatedFormData);
          if (response.isSuccess) {
            console.log("Creating user:", updatedFormData);
            toast({
              title: "Success",
              description: "User created successfully",
            });
            queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY });
            resetForm();
          } else {
            console.error("Error creating user:", response);
            toast({
              title: "Error",
              description: response.message,
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error creating user:", error);
          toast({
            title: "Error",
            description: String(error),
            variant: "destructive",
          });
        }
      } else if (mode === "edit" && user?.id) {
        const response = await staffApi.update(user.id, updatedFormData);
        if (response.isSuccess) {
          console.log("Updating user:", response);
          toast({
            title: "Success",
            description: response.message,
          });
          queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY });
        } else {
          console.error("Error updating user:", response);
          toast({
            title: "Error",
            description: response.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "User ID is missing",
          variant: "destructive",
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "An error occurred while saving the user",
  
      });
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {isViewMode
                ? "View user details below."
                : "Fill in the information for the user."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="grid gap-4 py-4"
            >
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Name</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input {...field} disabled={isViewMode} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Email</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input type="email" {...field} disabled={isViewMode} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Department</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleChange("department", value);
                          }}
                          disabled={isViewMode}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SoftwareDevelopment">
                              Software Development
                            </SelectItem>
                            <SelectItem value="QualityAssurance">
                              Quality Assurance
                            </SelectItem>
                            <SelectItem value="DevOps">DevOps</SelectItem>
                            <SelectItem value="ProjectManagement">
                              Project Management
                            </SelectItem>
                            <SelectItem value="ScrumMaster">
                              Scrum Master
                            </SelectItem>
                            <SelectItem value="BusinessAnalysis">
                              Business Analysis
                            </SelectItem>
                            <SelectItem value="UIUXDesign">
                              UI/UX Design
                            </SelectItem>
                            <SelectItem value="HumanResources">
                              Human Resources
                            </SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="TechLead">TechLead</SelectItem>
                            <SelectItem value="SoftwareArchitect">
                              Software Architect
                            </SelectItem>
                            <SelectItem value="CustomerSupport">
                              Customer Support
                            </SelectItem>
                            <SelectItem value="DataScience">
                              Data Science
                            </SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="ITSupport">
                              IT Support
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-8 items-center gap-4">
                <Label htmlFor="roleName" className="text-right col-span-2">
                  Role
                </Label>
                <div className="col-span-3">
                  <Select
                    value={formData.roleName}
                    onValueChange={(value) => handleChange("roleName", value)}
                    disabled={isViewMode}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="STAFF">Staff</SelectItem>
                      <SelectItem value="APPROVER">Approver</SelectItem>
                      <SelectItem value="FINANCE">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Label htmlFor="status" className="text-right col-span-1">
                  Status
                </Label>
                <div className="col-span-2">
                  <Select
                    value={String(formData.isActive)}
                    onValueChange={(value) =>
                      handleChange("isActive", value === "true")
                    }
                    disabled={isViewMode}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-8 items-center gap-4">
                <Label htmlFor="rank" className="text-right col-span-2">
                  Rank
                </Label>
                <div className="col-span-3">
                  <Select
                    value={formData.rank}
                    onValueChange={(value) => handleChange("rank", value)}
                    disabled={isViewMode}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select rank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Intern">Intern</SelectItem>
                      <SelectItem value="Fresher">Fresher</SelectItem>
                      <SelectItem value="Junior">Junior</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Label htmlFor="salary" className="text-right col-span-1">
                  Salary
                </Label>
                <div className="col-span-2">
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      min={1}
                      value={formData.salary}
                      onChange={(e) =>
                        handleChange("salary", Number(e.target.value))
                      }
                      disabled={isViewMode}
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>
              {user?.createdAt && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="createdAt" className="text-right">
                    Created At
                  </Label>
                  <Input
                    id="createdAt"
                    value={new Date(user.createdAt).toLocaleString()}
                    className="col-span-3"
                    disabled
                  />
                </div>
              )}
            </form>
          </Form>
          <DialogFooter>
            {isViewMode ? (
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            ) : (
              <>
                {mode === "create" && (
                  <Button 
                    variant="outline" 
                    onClick={resetForm}
                    type="button"
                  >
                    Refresh
                  </Button>
                )}
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={form.handleSubmit(handleSubmit)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Are you sure?"
        description={
          mode === "create"
            ? "This will create a new user with the provided information."
            : "This will update the user's information."
        }
        onConfirm={handleConfirmSubmit}
      />
    </>
  );
}

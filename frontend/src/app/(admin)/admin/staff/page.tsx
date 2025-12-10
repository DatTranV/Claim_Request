"use client";
import ButtonLink from "@/components/button/ButtonLink";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { staffApi } from "@/services/api/staffApi";
import { User, userApi } from "@/services/api/userApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Loader2, PlusIcon } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  dob: z.string().refine((date) => {
    const parsedDate = new Date(date);
    const now = new Date();
    return parsedDate < now && parsedDate > new Date('1900-01-01');
  }, { message: "Please enter a valid date of birth" }),
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  roleName: z.enum(["ADMIN", "STAFF", "APPROVER", "FINANCE"]),
  imageUrl: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;


export default function StaffManagement() {
  const { data, isLoading } = useQuery({
    queryKey: ["allStaff"],
    queryFn: staffApi.getAllStaffs,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      fullName: "",
      dob: "",
      phoneNumber: "",
      address: "",
      roleName: "STAFF",
      imageUrl: "",
    },
  });

  const handleOpenUserDialog = (user: User | null = null) => {
    setSelectedUser(user);
    if (user) {
      form.reset({
        email: user.email,
        fullName: user.fullName,
        dob: new Date(user.dob).toISOString().split('T')[0],
        phoneNumber: user.phoneNumber,
        address: user.address,
        roleName: user.roleName,
        imageUrl: user.imageUrl || "",
      });
      setImagePreview(user.imageUrl || null);
    } else {
      form.reset({
        email: "",
        fullName: "",
        dob: "",
        phoneNumber: "",
        address: "",
        roleName: "STAFF",
        imageUrl: "",
      });
      setImagePreview(null);
    }
    setOpenUserDialog(true);
  };
  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
    setImagePreview(null);
  };

  const onSubmit = async (data: UserFormValues) => {
    let imageUrl = data.imageUrl || "";

    if (imageFile) {
      try {
        imageUrl = await uploadImage(imageFile);
        toast({
          title: "Image uploaded successfully",
          description: "The image has been uploaded successfully",
        });
      } catch (error: any) {
        toast({
          title: "Image upload failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }
    try {
      if (selectedUser) {
        await userApi.update(selectedUser.id, {
          ...data,
          imageUrl,
        });
        toast({
          title: "User updated successfully",
          description: "The user has been updated successfully",
        });
      } else {
        await userApi.create({
          ...data,
          imageUrl,
        });
        toast({
          title: "User created successfully",
          description: "The user has been created successfully",
        });
      }
      handleCloseUserDialog();
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <div className="flex items-center justify-between w-full gap-2 mb-6">
        <h2 className="text-2xl font-bold flex-1">Users</h2>
        <Button variant="default" onClick={() => handleOpenUserDialog(null)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          <span>Create User</span>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Staff ID</TableCell>
            <TableCell>Staff Name</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Rank</TableCell>
            <TableCell>Salary</TableCell>
            <TableCell>Active</TableCell>
            <TableCell >Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center animate-spin">
                <Loader2 size={32} />
              </TableCell>
            </TableRow>
          ) : (
            data?.data.map((staff: any, index: number) => (
              <TableRow key={staff.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{staff.id}</TableCell>
                <TableCell>{staff.fullName}</TableCell>
                <TableCell>{staff.department}</TableCell>
                <TableCell>{staff.roleName}</TableCell>
                <TableCell>{staff.rank}</TableCell>
                <TableCell>${staff.salary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</TableCell>
                <TableCell>
                  {staff.isActive ? (
                    <span className="border border-green-500 bg-green-100 text-green-500 rounded-2xl px-2 py-1">Yes</span>
                  ) : (
                    <span className="border border-red-500 bg-red-100 text-red-500 rounded-2xl px-2 py-1">No</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="px-2">
                        <ChevronDown size={20} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-36">
                      <DropdownMenuItem>
                        <ButtonLink
                          to={`/admin/staff/view/${staff.id}`}
                          label="View"
                          className="w-full text-left"
                        />
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ButtonLink
                          to={`/admin/staff/update/${staff.id}`}
                          label="Update"
                          className="w-full text-left"
                        />
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Button variant="destructive" className="w-full text-left">
                          Cancel
                        </Button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={openUserDialog} onOpenChange={setOpenUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser ? "Update User" : "Create User"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex justify-center mb-6">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={imagePreview || form.getValues('imageUrl') || undefined} />
                  <AvatarFallback>{form.getValues('fullName').charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!selectedUser && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="STAFF">Staff</SelectItem>
                          <SelectItem value="APPROVER">Approver</SelectItem>
                          <SelectItem value="FINANCE">Finance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormItem>
                <FormLabel>Profile Picture</FormLabel>
                <FormControl>
                  <Input id="imageFile" type="file" onChange={handleImageChange} accept="image/*" />
                </FormControl>
              </FormItem>
              <Button type="submit" className="w-full">
                {selectedUser ? "Update User" : "Create User"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div >
  );
}

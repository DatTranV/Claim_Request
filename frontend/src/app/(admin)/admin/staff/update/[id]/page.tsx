"use client";

import FormInput from "@/components/form/FormInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { staffApi } from "@/services/api/staffApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function UpdateStaffInformation() {
  const form = useForm();
  const param = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["getStaffByID", param?.id],
    queryFn: () => staffApi.getStaff(param?.id),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => staffApi.updateStaff(data),
    onMutate: (variables) => {
      form.reset();
    },
    onSuccess: () => {
      toast.success("Staff information updated successfully");
    },
  });

  const onSubmit = (data: any) => {
    updateMutation.mutate(data);  
  };

  return (
    <>
      {isLoading ? (
        <Loader2 size={32} className="animate-spin" />
      ) : (
        <Card className="">
          <CardHeader className="flex flex-row justify-between">
            <CardTitle>Staff Detail</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <FormInput
                    label="Staff Name"
                    defaultValue={data?.data.fullName}
                    {...form.register("fullName")}
                  />
                  <FormInput
                    label="Staff ID"
                    defaultValue={data?.data.id}
                    {...form.register("id")}
                  />
                  <FormInput
                    label="Staff Department"
                    defaultValue={data?.data.department}
                    {...form.register("department")}
                  />
                  <FormInput
                    label="Rank"
                    defaultValue={data?.data.rank}
                    {...form.register("rank")}
                  />
                  <FormInput
                    label="Role"
                    defaultValue={data?.data.roleName}
                    {...form.register("roleName")}
                  />
                  <FormInput
                    label="Title"
                    defaultValue={data?.data.title}
                    {...form.register("title")}
                  />
                  <FormInput
                    label="Salary"
                    defaultValue={data?.data.salary}
                    {...form.register("salary")}
                  />
                  <Separator />
                </div>

                <Button type="submit" className="w-30">
                  Update
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </>
  );
}

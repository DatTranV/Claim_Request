"use client";

import DateRangePicker from "@/components/form/DateRangePicker";
import FormInput from "@/components/form/FormInput";
import FormOption from "@/components/form/FormOption";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormLabel,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  claimDetailsSchema,
  createClaimSchema,
} from "@/lib/validiation/createClaimSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { claimApi } from "@services/api/claimApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { parse, format } from "date-fns";
import { Loader2, X, Plus, Calendar } from "lucide-react";
import React, { useCallback, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import moment from "moment-timezone";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useProgress } from '@bprogress/next';


type ClaimDetailDTO = z.infer<typeof claimDetailsSchema>;
type ClaimCreateDTO = z.infer<typeof createClaimSchema>;

export default function CreateClaim() {
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const router = useRouter();
  const progress = useProgress();

  const form = useForm({
    resolver: zodResolver(createClaimSchema),
    defaultValues: {
      claimDetails: [
        {
          date: "",
          from: "",
          to: "",
          totalWork: 0,
          day: "",
          remark: "",
        },
      ],
      projectDateRange: [null, null],
      projectDuration: 0,
      totalClaimAmount: 0,
    },
  });

  const fieldArray = useFieldArray({
    control: form.control,
    name: "claimDetails",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["initClaim"],
    queryFn: claimApi.init,
  });

  const updateClaim = useMutation({
    mutationFn: claimApi.update,
    onSuccess: ({ isSuccess }) => {
      if (!isSuccess) {
        toast({
          title: "Error",
          description: "Error updating claim",
        });
        return;
      }
      toast({
        title: "Success",
        description: "Claim updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Error updating claim",
      });
    },
  });

  const [projectItems, setProjectItems] = React.useState<
    { value: string; label: string; startDate: Date; endDate: Date }[]
  >([]);
  const [selectedProject, setSelectedProject] = React.useState<any | null>(
    null
  );

  useEffect(() => {
    if (data?.data?.projects) {
      const items = data.data?.projects?.map((project: any) => ({
        value: project.projectId,
        label: project.projectName,
        startDate: project.startDate,
        endDate: project.endDate,
      }));
      setProjectItems(items);
    } else {
      setProjectItems([]);
    }
  }, [data?.data?.projects]);

  const combineDateTime = useCallback((dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return;
    const date = parse(dateStr, "yyyy-MM-dd", new Date());
    const [hours, minutes] = timeStr.split(":").map(Number);
    const time = new Date(date.setHours(hours, minutes));
    console.log(time);
    return time;
  }, []);

  useEffect(() => {
    if (fieldArray.fields.length === 0) {
      fieldArray.append({
        date: "",
        from: "",
        to: "",
        totalWork: 0,
        day: "",
        remark: "",
      });
    }
  }, [fieldArray]);

  const onSubmit = (values: any) => {
    values = {
      ...values,
      claimDetails: values.claimDetails.map((item: any) => {
        return {
          ...item,
          fromDate: moment(combineDateTime(item.date, item.from)).format(
            "YYYY-MM-DDTHH:mm:ssZ"
          ),
          toDate: moment(combineDateTime(item.date, item.to)).format(
            "YYYY-MM-DDTHH:mm:ssZ"
          ),
        };
      }),
    };
    saveClaimMutation.mutate(values);
  };

  const saveClaimMutation = useMutation({
    mutationFn: claimApi.create,
    onSuccess: ({ isSuccess }) => {
      if (!isSuccess) {
        toast({
          title: "Error",
          description: "Error submitting claim",
          variant: "destructive",
        });

        return;
      }
      if (isSuccess) {
        toast({
          title: "Success",
          description: "Claim submitted successfully",
        });
        setTimeout(() => {
          router.push("my-claim/draft")
        }, 1000);
      }
    },
    onError: (error) => {
      localStorage.setItem("error", error.message);
      toast({
        title: "Error",
        description: "Error submitting claim",
        variant: "destructive",
      });
    },
  });

  // Hàm tính tổng số giờ làm việc
  const calculateTotalHours = () => {
    return form.watch("claimDetails").reduce((acc, item) => {
      if (item && item.totalWork !== undefined) {
        let workValue = 0;
        if (typeof item.totalWork === "string") {
          const parsed = Number.parseInt(item.totalWork);
          workValue = Number.isNaN(parsed) ? 0 : parsed;
        } else {
          workValue = Number.isNaN(item.totalWork) ? 0 : item.totalWork;
        }
        return acc + workValue;
      }
      return acc;
    }, 0);
  };

  useEffect(() => {
    const totalHours = calculateTotalHours();
    const salary = data?.data?.salary || 0;
    const calculatedAmount = totalHours * (salary / 192) || 0;
    const formattedAmount = Number.isNaN(calculatedAmount)
      ? 0
      : Number.parseFloat(calculatedAmount.toFixed(0));
    form.setValue("totalClaimAmount", formattedAmount);
  }, [form, data, calculateTotalHours()]);

  return (
    <>
      {isLoading ? progress.start() :
        <>
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Claim Request Form</CardTitle>
              <CardDescription>Status: Draft</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Staff ID"
                    name="staffId"
                    placeholder="Enter staff ID"
                    defaultValue={data?.data?.staffId}
                    readOnly
                    disabled={true}
                  />
                  <FormInput
                    label="Staff Name"
                    name="staffName"
                    placeholder="Enter staff name"
                    defaultValue={data?.data?.staffName}
                    readOnly
                    disabled
                  />
                </div>
                <div className="grid grid-flow-col grid-cols-2 gap-4 pt-1.5">
                  <FormInput
                    label="Department"
                    name="department"
                    defaultValue={data?.data?.department}
                    readOnly
                    disabled
                  />
                  <FormOption
                    placeholder="Select project"
                    label="Project *"
                    name="projectId"
                    options={projectItems}
                    onChange={(values: any) => {
                      const project = projectItems?.filter(
                        (item) => item.value === values
                      );
                      setSelectedProject(project);
                      if (project && project.length > 0) {
                        const startDate = new Date(project[0]?.startDate);
                        const endDate = new Date(project[0]?.endDate);
                        const diff =
                          Math.floor((endDate.getTime() - startDate.getTime()) /
                          (1000 * 3600 * 24));

                        form.setValue("projectDateRange", [startDate, endDate]);
                        form.setValue("projectDuration", diff);
                        //Clear claimDetails
                        form.setValue("claimDetails", [
                          {
                            day: "",
                            date: "",
                            from: "",
                            to: "",
                            totalWork: 0,
                            remark: "",
                          },
                        ]);
                      }
                    }}
                  />
                </div>
                <div className="grid grid-flow-col grid-cols-2 gap-6 my-3">
                  <FormInput
                    label="Project Duration"
                    name="projectDuration"
                    placeholder="Enter project duration"
                    defaultValue={data?.data?.projectDuration ?? "Not available"}
                    disabled
                    readOnly
                  />
                  <DateRangePicker
                    name="projectDateRange"
                    label="Date Range"
                    readOnly
                    disabled
                  />
                </div>
                <FormInput
                  label="Total Claim Amount"
                  name="totalClaimAmount"
                  defaultValue="0"
                  value={form.watch("totalClaimAmount")?.toString() || "0"}
                  readOnly
                  disabled
                />
                <FormField
                  control={form.control}
                  name="remark"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Remark</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea
                            placeholder="Enter any additional information about this claim"
                            className="resize-none min-h-[100px] whitespace-pre-wrap break-words overflow-wrap-anywhere"
                            maxLength={200}
                            {...field}
                          />
                          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                            {field.value?.length || 0}/200
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Claim Details Section */}
                <div className="space-y-4 mt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Claim Details *</h3>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        fieldArray.append({
                          day: "",
                          date: "",
                          from: "",
                          to: "",
                          totalWork: 0,
                          remark: "",
                        })
                      }
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" /> Add New Detail
                    </Button>
                  </div>

                  <div className="border rounded-md bg-muted/10">
                    {fieldArray.fields.map((field, index) => (
                      <div
                        key={field.id}
                        data-claim-detail
                        className={`p-4 ${index !== 0 ? "border-t" : ""} bg-card`}
                      >
                        <div className="flex justify-between items-center mb-4 pb-2 border-b">
                          <div className="flex items-center gap-2">
                            <div
                              className="bg-primary text-primary-foreground w-6 h-6
                           rounded-full flex items-center
                           justify-center text-xs font-medium"
                            >
                              {index + 1}
                            </div>
                            <h4 className="font-medium">Claim Detail</h4>
                          </div>
                          <Button
                            type="button"
                            variant={
                              fieldArray.fields.length <= 1
                                ? "ghost"
                                : "destructive"
                            }
                            size="sm"
                            onClick={() => fieldArray.remove(index)}
                            disabled={fieldArray.fields.length <= 1}
                            className="h-8"
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            <span className="text-xs">Remove</span>
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`claimDetails.${index}.date`}
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormLabel>Date *</FormLabel>
                                <FormControl>
                                  <div className="relative w-full">
                                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                                    <ReactDatePicker
                                      selected={
                                        field.value ? new Date(field.value) : null
                                      }
                                      onChange={(date) => {
                                        if (!date) return;

                                        // Format the date in yyyy-MM-dd format
                                        const formattedDate = format(
                                          date,
                                          "yyyy-MM-dd"
                                        );
                                        field.onChange(formattedDate);

                                        // Set the day of week
                                        form.setValue(
                                          `claimDetails.${index}.day`,
                                          weekday[date.getDay()]
                                        );

                                        // Clear any existing error for this field
                                        form.clearErrors(`claimDetails.${index}.date`);

                                        // Check for duplicate dates
                                        const claimDetails =
                                          form.watch("claimDetails");
                                        for (
                                          let i = 0;
                                          i < claimDetails.length;
                                          i++
                                        ) {
                                          if (i === index) continue;
                                          if (
                                            claimDetails[i].date === formattedDate
                                          ) {
                                            form.setValue(
                                              `claimDetails.${index}.date`,
                                              ""
                                            );
                                            form.setError(
                                              `claimDetails.${index}.date`,
                                              {
                                                message: "Date must be unique",
                                              }
                                            );
                                            return;
                                          }
                                        }
                                        form.clearErrors(`claimDetails.${index}.date`);
                                      }}
                                      dateFormat="yyyy-MM-dd"
                                      className="w-full flex h-10 rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                      minDate={
                                        selectedProject
                                          ? new Date(selectedProject[0]?.startDate)
                                          : undefined
                                      }
                                      maxDate={
                                        selectedProject
                                          ? new Date(selectedProject[0]?.endDate)
                                          : undefined
                                      }
                                      placeholderText="Select date"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`claimDetails.${index}.day`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Day</FormLabel>
                                <FormControl>
                                  <Input
                                    value={field.value || ""}
                                    readOnly
                                    disabled={true}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <FormField
                              control={form.control}
                              name={`claimDetails.${index}.from`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>From *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="time"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(e);
                                        //Tu dong dao nguoc gia tri cua to neu from > to
                                        const from = parse(
                                          e.target.value,
                                          "HH:mm",
                                          new Date()
                                        );
                                        const to = parse(
                                          form.watch(`claimDetails.${index}.to`),
                                          "HH:mm",
                                          new Date()
                                        );
                                        const temp = to;
                                        if (from > to) {
                                          form.setValue(
                                            `claimDetails.${index}.to`,
                                            format(from, "HH:mm")
                                          );
                                          form.setValue(
                                            `claimDetails.${index}.from`,
                                            format(temp, "HH:mm")
                                          );
                                          const hoursDiff = Math.floor(
                                            (from.getTime() - to.getTime()) /
                                            3600000
                                          );
                                          form.setValue(
                                            `claimDetails.${index}.totalWork`,
                                            hoursDiff || 0
                                          );
                                          return;
                                        }
                                        const hoursDiff = Math.floor(
                                          (to.getTime() - from.getTime()) / 3600000
                                        );
                                        form.setValue(
                                          `claimDetails.${index}.totalWork`,
                                          hoursDiff || 0
                                        );
                                        form.clearErrors(`claimDetails.${index}.from`);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`claimDetails.${index}.to`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>To *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="time"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(e);
                                        //Tu dong dao nguoc gia tri cua from neu to < from
                                        const to = parse(
                                          e.target.value,
                                          "HH:mm",
                                          new Date()
                                        );
                                        const from = parse(
                                          form.watch(`claimDetails.${index}.from`),
                                          "HH:mm",
                                          new Date()
                                        );
                                        const temp = to;
                                        if (to < from) {
                                          form.setValue(
                                            `claimDetails.${index}.to`,
                                            format(from, "HH:mm")
                                          );
                                          form.setValue(
                                            `claimDetails.${index}.from`,
                                            format(temp, "HH:mm")
                                          );
                                          const hoursDiff = Math.floor(
                                            (from.getTime() - to.getTime()) /
                                            3600000
                                          );
                                          form.setValue(
                                            `claimDetails.${index}.totalWork`,
                                            hoursDiff || 0
                                          );
                                          return;
                                        }
                                        const hoursDiff = Math.floor(
                                          (to.getTime() - from.getTime()) / 3600000
                                        );
                                        form.setValue(
                                          `claimDetails.${index}.totalWork`,
                                          hoursDiff || 0
                                        );
                                        form.clearErrors(`claimDetails.${index}.to`);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name={`claimDetails.${index}.totalWork`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Total Work</FormLabel>
                                <FormControl>
                                  <Input
                                    value={field.value?.toString() || "0"}
                                    readOnly
                                    disabled={true}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`claimDetails.${index}.remark`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Remark</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Textarea
                                      placeholder="Enter any details about this claim entry"
                                      className="resize-none min-h-[80px] whitespace-pre-wrap break-words overflow-wrap-anywhere"
                                      maxLength={100}
                                      {...field}
                                    />
                                    <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                                      {field.value?.length || 0}/100
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        {index === form.watch("claimDetails").length - 1 && (
                          <div className="mt-2 flex justify-end">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() =>
                                fieldArray.append({
                                  day: "",
                                  date: "",
                                  from: "",
                                  to: "",
                                  totalWork: 0,
                                  remark: "",
                                })
                              }
                              className="h-7 text-xs"
                            >
                              <Plus className="h-3.5 w-3.5 mr-1" /> Add New Detail
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                    <Plus className="h-3 w-3" />
                    Click "Add New Detail" to add more claim detail records
                  </div>
                  {form.formState.errors.claimDetails?.message && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.claimDetails?.message}
                    </p>
                  )}
                </div>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between ">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    form.reset();
                  }}
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  className={
                    saveClaimMutation.isPending ? "cursor-not-allowed" : ""
                  }
                  onClick={async () => {
                    const isValid = await form.trigger();
                    if (isValid) {
                      setShowConfirmDialog(true);
                    } else {
                      console.log(form.formState.errors);
                      // Không cần gọi handleSubmit nữa vì trigger đã cập nhật errors
                    }
                  }}
                >
                  Save as Draft
                </Button>
              </div>
            </CardFooter>
          </Card>
          <ConfirmDialog
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}
            description="Are you sure you want to submit this claim?"
            onConfirm={() => {
              form.handleSubmit(onSubmit)();
              setShowConfirmDialog(false);
            }}
            title="Submit Claim"
          />
        </>
      }
    </>
  );
}

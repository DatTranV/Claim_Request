"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { parse, format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { ClaimRequest } from "@/services/api/claimApi";
import { claimApi } from "@/services/api/claimApi";
import {
  claimDetailsUpdateSchema,
  updateClaimSchema,
} from "@/lib/validiation/createClaimSchema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

type ClaimDetailDTO = z.infer<typeof claimDetailsUpdateSchema>;
type ClaimEditDTO = z.infer<typeof updateClaimSchema>;

interface EditClaimDialogProps {
  claim: ClaimRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditClaimDialog({
  claim,
  open,
  onOpenChange,
  onSuccess,
}: EditClaimDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [claimData, setClaimData] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const router = useRouter();

  // Initialize form with empty values
  const form = useForm<ClaimEditDTO>({
    resolver: zodResolver(updateClaimSchema),
    defaultValues: {
      id: "",
      staffName: "",
      projectName: "",
      startDate: "",
      endDate: "",
      projectDuration: "",
      totalWorkingHours: 0,
      totalClaimAmount: 0,
      remark: "",
      status: "",
      claimDetails: [
        {
          // id: "",
          claimId: "",
          date: new Date().toISOString().split("T")[0],
          from: "",
          to: "",
          totalWork: 0,
          day: "",
          remark: "",
        },
      ],
    },
  });

  // Fetch claim data when dialog opens
  useEffect(() => {
    const fetchClaimData = async () => {
      if (!open || !claim?.id) return;

      try {
        setIsLoading(true);
        const response = await claimApi.getById(claim.id);

        if (response.isSuccess && response.data) {
          console.log("Claim data loaded:", response.data);
          form.reset(response.data);
          setClaimData(response.data);
        } else {
          toast({
            title: "Error",
            description: response.message || "Cannot load claim information",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching claim:", error);
        toast({
          title: "Error",
          description: "Cannot load claim information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClaimData();
  }, [open, claim, toast]);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Update form with fetched claim data
  useEffect(() => {
    if (claimData) {
      form.reset({
        id: claimData.id,
        staffName: claimData.staffName,
        projectName: claimData.projectName,
        startDate: claimData.startDate,
        endDate: claimData.endDate,
        projectDuration: claimData.projectDuration,
        totalWorkingHours: Number(claimData.totalWorkingHours) || 0,
        totalClaimAmount: claimData.totalClaimAmount || 0,
        remark: claimData.remark || "",
        status: claimData.status,
        claimDetails:
          claimData.claimDetails?.map((detail: any) => {
            // Tạo đối tượng Date từ fromDate và toDate
            const fromDate = detail.fromDate
              ? new Date(detail.fromDate)
              : new Date();
            const toDate = detail.toDate ? new Date(detail.toDate) : new Date();

            // Lấy tên ngày trong tuần
            const dayName = dayNames[fromDate.getDay()];

            // Định dạng thời gian từ và đến
            const fromTime = fromDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
            const toTime = toDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });

            return {
              id: detail.id,
              claimId: detail.claimId,
              day: dayName,
              date: fromDate.toISOString().split("T")[0],
              from: fromTime,
              to: toTime,
              totalWork: Number(detail.totalHours) || 0,
              remark: detail.remark || "",
            };
          }) || [],
      });
    }
  }, [claimData, form]);

  // Calculate totals when claim details change
  useEffect(() => {
    const claimDetails = form.watch("claimDetails");

    if (claimDetails && claimDetails.length > 0) {
      const totalHours = claimDetails.reduce((sum, detail) => {
        const workValue =
          typeof detail.totalWork === "string"
            ? Number.isNaN(Number.parseInt(detail.totalWork))
              ? 0
              : Number.parseInt(detail.totalWork)
            : Number.isNaN(detail.totalWork)
              ? 0
              : Number(detail.totalWork);
        return sum + workValue;
      }, 0);
      form.setValue("totalWorkingHours", totalHours);
    }
  }, [form.watch("claimDetails")]);

  // Add a new claim detail
  const addClaimDetail = () => {
    const currentDetails = form.getValues("claimDetails");
    const today = new Date();
    const dayName = dayNames[today.getDay()];

    const newDetail: ClaimDetailDTO = {
      day: dayName,
      date: today.toISOString().split("T")[0],
      from: "",
      to: "",
      totalWork: 0,
      remark: "",
    };

    form.setValue("claimDetails", [...currentDetails, newDetail]);

    // Scroll to the new detail after a short delay to allow rendering
    setTimeout(() => {
      const detailElements = document.querySelectorAll("[data-claim-detail]");
      if (detailElements.length > 0) {
        const lastDetail = detailElements[detailElements.length - 1];
        lastDetail.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);

    toast({
      title: "Detail added",
      description: "New claim detail added",
      variant: "default",
    });
  };

  // Remove a claim detail
  const removeClaimDetail = (index: number) => {
    const currentDetails = form.getValues("claimDetails");
    if (currentDetails.length <= 1) return; // Prevent removing if only one detail exists

    const updatedDetails = [...currentDetails];
    updatedDetails.splice(index, 1);
    form.setValue("claimDetails", updatedDetails);
  };

  // Transform form data to API format
  const transformFormDataToApiFormat = (data: ClaimEditDTO) => {
    return {
      id: data.id,
      creatorId: claimData?.creatorId || "",
      projectId: claimData?.projectId || "",
      status: data.status,
      totalWorkingHours: data.totalWorkingHours,
      totalClaimAmount: data.totalClaimAmount,
      remark: data.remark || "",
      claimDetails: data.claimDetails.map((detail) => {
        // Tạo ngày từ date và thời gian từ from/to
        const dateStr = detail.date;
        const fromDateTime = detail.from
          ? `${dateStr}T${detail.from}:00`
          : `${dateStr}T00:00:00`;
        const toDateTime = detail.to
          ? `${dateStr}T${detail.to}:00`
          : `${dateStr}T00:00:00`;

        return {
          claimId: data.id,
          fromDate: fromDateTime,
          toDate: toDateTime,
          remark: detail.remark || "",
        };
      }),
    };
  };

  // Add update mutation
  const updateClaimMutation = useMutation({
    mutationFn: claimApi.update,
    onSuccess: ({ isSuccess }) => {
      if (!isSuccess) {
        toast({
          title: "Error",
          description: "Error updating claim",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Success",
        description: "Claim updated successfully",
      });

      // Close dialog
      onOpenChange(false);

      // Call onSuccess callback if provided
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("Error updating claim request:", error);
      toast({
        title: "Error",
        description: "Cannot update claim request",
        variant: "destructive",
      });
    },
  });

  // Tính toán total work từ from và to
  const calculateTotalWork = (from: string, to: string) => {
    if (!from || !to) return 0;
    const [fromHours, fromMinutes] = from.split(":").map(Number);
    const [toHours, toMinutes] = to.split(":").map(Number);

    let totalHours = toHours - fromHours;
    let totalMinutes = toMinutes - fromMinutes;

    // Xử lý trường hợp âm
    if (totalMinutes < 0) {
      totalHours--;
      totalMinutes += 60;
    }

    return totalHours + totalMinutes / 60;
  };

  // Cập nhật total work khi from hoặc to thay đổi
  const updateTotalWork = (index: number) => {
    const from = form.watch(`claimDetails.${index}.from`);
    const to = form.watch(`claimDetails.${index}.to`);
    const totalWork = calculateTotalWork(from, to);
    form.setValue(`claimDetails.${index}.totalWork`, totalWork);

    // Cập nhật tổng số giờ làm việc
    if (totalWork) {
      const claimDetails = form.watch("claimDetails");
      console.log("Claim Detail", claimDetails);
      let totalHours = 0;
      console.log("To" , to);
      console.log("From" , from);
      for (let i = 0; i < claimDetails.length; i++) {
        const toTime = parse(claimDetails[i].to, "HH:mm", new Date()).getTime();
        const fromTime = parse(claimDetails[i].from, "HH:mm", new Date()).getTime();
        totalHours += Math.floor((toTime - fromTime) / 3600000);
      }
      console.log("Total Hours", totalHours);
      form.setValue("totalWorkingHours", totalHours);
    }
  };

  const getTotalWork = (index: number) => {
    const from = form.watch(`claimDetails.${index}.from`);
    const to = form.watch(`claimDetails.${index}.to`);
    const totalWork = calculateTotalWork(from, to);
    return totalWork;
  };

  // Handle form submission
  const onSubmit = async (data: ClaimEditDTO) => {
    try {
      setIsSubmitting(true);

      const transformedData = transformFormDataToApiFormat(data);
      updateClaimMutation.mutate(transformedData);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const claimDetails = form.watch("claimDetails");
    let totalWork = 0;
    for (let i = 0; i < claimDetails.length; i++) {
      totalWork += Number(getTotalWork(i));
    }
    form.setValue("totalWorkingHours", totalWork);
  }, [form.watch("claimDetails")]);

  if (!claim) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">Edit claim</DialogTitle>
              <Badge
                variant={
                  claim.status === "Approved"
                    ? "default"
                    : claim.status === "Rejected"
                      ? "destructive"
                      : claim.status === "In Review" ||
                          claim.status === "Pending Approval"
                        ? "outline"
                        : "secondary"
                }
                className={cn(
                  "text-sm px-3 py-1",
                  claim.status === "Approved" &&
                    "bg-green-500 hover:bg-green-600"
                )}
              >
                {claim.status}
              </Badge>
            </div>
            <DialogDescription>
              Update claim information #{claim?.id}
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading data...</p>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 mt-4"
              >
                {/* Main form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="staffName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Staff Name *</FormLabel>
                        <FormControl>
                          <Input value={claimData?.staffName || ""} disabled />
                        </FormControl>
                        <input type="hidden" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name *</FormLabel>
                        <FormControl>
                          <Input
                            value={claimData?.projectName || ""}
                            disabled
                          />
                        </FormControl>
                        <input type="hidden" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalWorkingHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total working hours *</FormLabel>
                        <FormControl>
                          <Input
                            disabled={true}
                            readOnly
                            className="disabled:opacity-85 disabled:bg-gray-200 dark:disabled:bg-gray-800"
                            type="number"
                            value={field.value?.toString() || "0"}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Automatically calculated from claim details
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalClaimAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total claim amount</FormLabel>
                        <FormControl>
                          <Input
                            disabled={true}
                            readOnly
                            className="disabled:opacity-85 disabled:bg-gray-200 dark:disabled:bg-gray-800"
                            type="number"
                            value={field.value?.toString() || "0"}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Automatically calculated from claim details
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
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
                              placeholder="Enter additional information about this request"
                              className="resize-none whitespace-pre-wrap break-words overflow-wrap-anywhere"
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
                </div>

                {/* Claim Details Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Claim details *</h3>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addClaimDetail}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add new detail
                    </Button>
                  </div>

                  <div className="border rounded-md bg-muted/10">
                    {form.watch("claimDetails").map((detail, index) => (
                      <div
                        key={index}
                        data-claim-detail
                        className={`p-4 ${index !== 0 ? "border-t" : ""} bg-card`}
                      >
                        <div className="flex justify-between items-center mb-4 pb-2 border-b">
                          <div className="flex items-center gap-2">
                            <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <h4 className="font-medium">Claim detail</h4>
                          </div>
                          <Button
                            type="button"
                            variant={
                              form.watch("claimDetails").length <= 1
                                ? "ghost"
                                : "destructive"
                            }
                            size="sm"
                            onClick={() => removeClaimDetail(index)}
                            disabled={form.watch("claimDetails").length <= 1}
                            className="h-8"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            <span>Remove</span>
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`claimDetails.${index}.date`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e.target.value);
                                      // Cập nhật trường day khi date thay đổi
                                      const date = new Date(e.target.value);
                                      const dayName = dayNames[date.getDay()];
                                      form.setValue(
                                        `claimDetails.${index}.day`,
                                        dayName
                                      );
                                    }}
                                  />
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
                                  <Input {...field} readOnly />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`claimDetails.${index}.from`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>From</FormLabel>
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
                                        (to.getTime() - from.getTime()) /
                                          3600000
                                      );
                                      form.setValue(
                                        `claimDetails.${index}.totalWork`,
                                        hoursDiff || 0
                                      );
                                      form.clearErrors(
                                        `claimDetails.${index}.from`
                                      );
                                      updateTotalWork(index);
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
                                <FormLabel>To</FormLabel>
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
                                        form.watch(
                                          `claimDetails.${index}.from`
                                        ),
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
                                        (to.getTime() - from.getTime()) /
                                          3600000
                                      );
                                      form.setValue(
                                        `claimDetails.${index}.totalWork`,
                                        hoursDiff || 0
                                      );
                                      form.clearErrors(
                                        `claimDetails.${index}.to`
                                      );
                                      console.log(
                                        "Index",
                                        index,
                                        "to",
                                        form.getValues(
                                          `claimDetails.${index}.to`
                                        )
                                      );
                                      updateTotalWork(index);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`claimDetails.${index}.totalWork`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Total work</FormLabel>
                                <FormControl>
                                  <Input
                                    disabled={true}
                                    readOnly
                                    className="disabled:opacity-85 disabled:bg-gray-200 dark:disabled:bg-gray-800"
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(
                                        Number.parseFloat(e.target.value) || 0
                                      );
                                    }}
                                    value={getTotalWork(index)}
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
                              <FormItem className="md:col-span-3">
                                <FormLabel>Remark *</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Textarea
                                      placeholder="Enter any details about this claim entry"
                                      className="resize-none min-h-[40px] whitespace-pre-wrap break-words overflow-wrap-anywhere"
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
                              onClick={addClaimDetail}
                              className="flex items-center text-xs gap-2"
                            >
                              <Plus className="h-3.5 w-3.5 mr-1" /> Add new
                              detail
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                    <Plus className="h-3 w-3" />
                    Click "Add new detail" to add more claim details
                  </div>
                  {form.formState.errors.claimDetails?.message && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.claimDetails?.message}
                    </p>
                  )}
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
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      const isValid = form.trigger();
                      if (isValid) {
                        setShowConfirmDialog(true);
                      }
                    }}
                  >
                    {isSubmitting ? "Saving..." : "Save changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        description="Are you sure you want to update this claim?"
        onConfirm={() => {
          form.handleSubmit(onSubmit)();
          setShowConfirmDialog(false);
        }}
        title="Update Claim"
      />
    </>
  );
}

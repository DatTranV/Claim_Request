import { z } from "zod";

export const claimDetailsUpdateSchema = z.object({
    // id: z.string().optional(),
    claimId: z.string().optional(),
    date: z.string(),
    from: z.string(),
    to: z.string(),
    totalWork: z.union([z.string(), z.number()]).optional(),
    day: z.string().optional(),
    remark: z.string(),
});
export const claimDetailsSchema = z.object({
    date: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), "Please enter a valid date"),
    from: z.string().min(1, "Start time is required"),
    to: z.string().min(1, "End time is required"),
    remark: z.string().max(100, "Remark cannot exceed 100 characters"),
    day: z.string().optional(),
    totalWork: z.union([z.string(), z.number()]).optional(),
});
export const createClaimSchema = z.object({
    projectId: z.string().uuid("Project ID must be a valid UUID"),
    projectDateRange: z.array(z.date().nullable()).length(2).optional(),
    projectDuration: z.number().optional(),
    totalClaimAmount: z.number().optional(),
    claimDetails: z
        .array(claimDetailsSchema)
        .min(1, "At least one claim detail is required"),

    remark: z
        .string()
        .max(200, "Remark cannot exceed 200 characters")
        .optional(),
});

export const updateClaimSchema = z.object({
    id: z.string(),
    staffName: z.string(),
    projectName: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    projectDuration: z.string(),
    totalWorkingHours: z.number(),
    totalClaimAmount: z.number(),
    remark: z.string(),
    status: z.string(),
    claimDetails: z.array(claimDetailsSchema),
});

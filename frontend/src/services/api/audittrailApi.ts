import axiosClient from "@services/api/axiosClient";
import { ApiResponse } from "@services/api/apiResult";

export interface AuditTrail {
    fullName: string;
    claimId: string;
    actionBy: string;
    actionDate: string;
    userAction: string;
    loggedNote: string;
}

export const auditTrailPath = (path?: string): string =>
    "/audit-trails" + (path ? path : "");

export const auditTrailApi = {
    getAll: async (): Promise<ApiResponse<AuditTrail[]>> => {
        const response =
            await axiosClient.get<ApiResponse<AuditTrail[]>>(auditTrailPath());
        return response.data;
    },
    getByClaimId: async (id?: string): Promise<ApiResponse<AuditTrail>> => {
        const response = await axiosClient.get<ApiResponse<AuditTrail>>(
            auditTrailPath(`/${id}`)
        );
        return response.data;
    },
};

import { ApiResponse } from "@services/api/apiResult";
import axiosClient from "@services/api/axiosClient";

export const claimPath = (path?: string) => "/claims" + (path ? path : "");

export interface ClaimRequest {
    id: string;
    creatorId: string;
    projectId: string;
    status: string;
    totalWorkingHours: number;
    totalClaimAmount: number;
    remark?: string;
    claimDetails: ClaimDetail[];
}

export interface ClaimDetail {
    id: string;
    claimId: string;
    fromDate: string;
    toDate: string;
    totalHours: number;
    remark: string;
}

export const claimApi = {
    init: async (): Promise<ApiResponse<any>> => {
        const response = await axiosClient.get<ApiResponse<any>>(
            claimPath("/init")
        );
        return response.data;
    },
    create: async (data: any): Promise<ApiResponse<any>> => {
        const response = await axiosClient.post<ApiResponse<any>>(
            claimPath("/create"),
            data
        );
        return response.data;
    },
    getAll: async (): Promise<ApiResponse<any>> => {
        const response = await axiosClient.get<ApiResponse<any>>(
            claimPath("/")
        );
        return response.data;
    },
    getById: async (id?: string): Promise<ApiResponse<any>> => {
        const response = await axiosClient.get<ApiResponse<any>>(
            claimPath(`/${id}`)
        );
        return response.data;
    },
    returnClaim: async (
        id: string,
        remark: string
    ): Promise<ApiResponse<any>> => {
        const response = await axiosClient.put<ApiResponse<any>>(
            claimPath(`/return/${id}`),
            {
                remark: remark,
            }
        );
        return response.data;
    },
    rejectClaim: async (
        id: string,
        remark: string
    ): Promise<ApiResponse<any>> => {
        const response = await axiosClient.put<ApiResponse<any>>(
            claimPath(`/reject/${id}`),
            {
                remark: remark,
            }
        );
        return response.data;
    },
    cancelClaim: async (id: string): Promise<ApiResponse<any>> => {
        const response = await axiosClient.put<ApiResponse<any>>(
            claimPath(`/cancel/${id}`)
        );
        return response.data;
    },
    myClaim: async (status?: string): Promise<ApiResponse<any>> => {
        const response = await axiosClient.get<ApiResponse<any>>(
            claimPath(`/my-claim?status=${status}`)
        );
        return response.data;
    },
    downloadClaim: async (claimID?: string[]): Promise<ApiResponse<any>> => {
        const queryString =
            claimID
                ?.map((id) => `ClaimId=${encodeURIComponent(id)}`)
                .join("&") || "";
        const response = await axiosClient.get<ApiResponse<any>>(
            claimPath(`/download?${queryString}`),
            { responseType: "blob" }
        );
        return response.data;
    },

    update: async (data?: any): Promise<ApiResponse<any>> => {
        const response = await axiosClient.put<ApiResponse<any>>(
            claimPath(`/update`),
            data
        );
        return response.data;
    },
    paid: async (claimID?: string[]): Promise<ApiResponse<any>> => {
        const queryString =
            claimID
                ?.map((id) => `ClaimId=${encodeURIComponent(id)}`)
                .join("&") || "";
        const response = await axiosClient.put<ApiResponse<any>>(
            claimPath(`/paid?${queryString}`)
        );
        return response.data;
    },
    approve: async (claimID?: string[]): Promise<ApiResponse<any>> => {
        const queryString =
            claimID
                ?.map((id) => `ClaimId=${encodeURIComponent(id)}`)
                .join("&") || "";
        const response = await axiosClient.put<ApiResponse<any>>(
            claimPath(`/approve?${queryString}`)
        );
        return response.data;
    },
    claimForApproval: async (status?: string): Promise<ApiResponse<any>> => {
        const response = await axiosClient.get<ApiResponse<any>>(
            claimPath(`/claim-for-approval?status=${status}`)
        );
        return response.data;
    },
    cancel: async (id?: string): Promise<ApiResponse<any>> => {
        const response = await axiosClient.put<ApiResponse<any>>(
            claimPath(`/cancel/${id}`),
            {}
        );
        return response.data;
    },
    submit: async (id?: string): Promise<ApiResponse<any>> => {
        const response = await axiosClient.put<ApiResponse<any>>(
            claimPath(`/submit/${id}`),
            {}
        );
        return response.data;
    },
};

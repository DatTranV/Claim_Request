import axiosClient from "@services/api/axiosClient";
import { ApiResponse } from "@services/api/apiResult";

export interface Project {
    id: string;
    projectCode: string;
    projectName: string;
    startDate: string;
    endDate: string;
    budget: number;
    status: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    createdBy: string;
    modifiedAt: string;
    modifiedBy: string;
}

export const projectPath = (path?: string): string =>
    "/projects" + (path ? path : "");

export const projectApi = {
    create: async (
        data: Omit<Project, "id" | "isDeleted">
    ): Promise<ApiResponse<Project>> => {
        const response = await axiosClient.post<ApiResponse<Project>>(
            projectPath(),
            data
        );
        return response.data;
    },
    getAll: async (): Promise<ApiResponse<Project[]>> => {
        const response =
            await axiosClient.get<ApiResponse<Project[]>>(projectPath());
        return response.data;
    },
    getById: async (id?: string): Promise<ApiResponse<Project>> => {
        const response = await axiosClient.get<ApiResponse<Project>>(
            projectPath(`/${id}`)
        );
        return response.data;
    },
    update: async (
        id: string,
        data: Omit<Project, "isDeleted">
    ): Promise<ApiResponse<null>> => {
        const response = await axiosClient.put<ApiResponse<null>>(
            projectPath(`/${id}`),
            data
        );
        return response.data;
    },
    delete: async (id: string): Promise<ApiResponse<Project>> => {
        const response = await axiosClient.delete<ApiResponse<Project>>(
            projectPath(`/${id}`)
        );
        return response.data;
    },
};

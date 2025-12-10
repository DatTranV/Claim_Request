import axiosClient from "@services/api/axiosClient";
import { ApiResponse } from "./apiResult";
import { User, UserUpdateProfile } from "./userApi";

export const staffPath = (path?: string) => "/staff" + (path ?? "");
export const STAFF_API_ENDPOINTS = {
    GET_ALL: staffPath("/"),
    GET_BY_ID: (id: string) => staffPath(`/${id}`),
    CREATE: staffPath("/"),
    UPDATE: (id: string) => staffPath(`/${id}`),
    DELETE: (id: string) => staffPath(`/${id}`),
    GET_NOT_IN_PROJECT: staffPath("/not-in-project"),
};
export interface UserCreateModel {
    fullName: string;
    email: string;
    imageUrl: string | null;
    salary: number;
    department: string;
    rank: string;
    title: string;
    roleName: "ADMIN" | "STAFF" | "APPROVER" | "FINANCE";
}
export const staffApi = {
    getById: async (id: string): Promise<ApiResponse<User>> => {
        const response = await axiosClient.get<ApiResponse<User>>(
            STAFF_API_ENDPOINTS.GET_BY_ID(id)
        );
        return response.data;
    },
    getAll: async (): Promise<ApiResponse<User[]>> => {
        const response = await axiosClient.get<ApiResponse<User[]>>(
            STAFF_API_ENDPOINTS.GET_ALL
        );
        return response.data;
    },
    getNotInProject: async (
        projectId: string
    ): Promise<ApiResponse<User[]>> => {
        const response = await axiosClient.get<ApiResponse<User[]>>(
            STAFF_API_ENDPOINTS.GET_NOT_IN_PROJECT,
            {
                params: {
                    projectId,
                },
            }
        );
        return response.data;
    },
    create: async (data: UserCreateModel): Promise<ApiResponse<User>> => {
        const response = await axiosClient.post<ApiResponse<User>>(
            STAFF_API_ENDPOINTS.CREATE,
            data
        );
        return response.data;
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const response = await axiosClient.delete<ApiResponse<null>>(
            STAFF_API_ENDPOINTS.DELETE(id)
        );
        return response.data;
    },
    update: async (
        id: string,
        data: UserUpdateProfile
    ): Promise<ApiResponse<any>> => {
        const response = await axiosClient.put<ApiResponse<any>>(
            STAFF_API_ENDPOINTS.UPDATE(id),
            data
        );
        return response.data;
    },
};

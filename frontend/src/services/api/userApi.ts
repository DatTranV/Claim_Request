import { ApiResponse } from "@services/api/apiResult";
import axiosClient from "@services/api/axiosClient";

export const userPath = (path?: string) => "/users" + path;
export const USER_API_ENDPOINTS = {
    GET_ALL: userPath("/"),
    GET_BY_ID: (id: string) => userPath(`/${id}`),
    CREATE: userPath("/"),
    UPDATE: (id: string) => userPath(`/${id}`),
    DELETE: (id: string) => userPath(`/${id}`),
    CHANGE_PASSWORD: userPath(`/change-password`),
};

export interface User {
    id: string;
    email: string;
    fullName: string;
    userName: string;
    dob: string;
    salary: number;
    department: string;
    rank: string;
    title: string;
    phoneNumber: string;
    imageUrl: string | null;
    address: string;
    roleName: "ADMIN" | "STAFF" | "APPROVER" | "FINANCE"; // Predefined roles
    createdAt: string;
    isActive?: boolean;
    isDeleted?: boolean;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface UserUpdateProfile {
    fullName: string;
    dob: string;
    userName: string;
    phoneNumber: string;
    imageUrl: string | null;
    address: string;
    salary: number;
    department: string;
    rank: string;
    title: string;
}

export interface UserResponse {
    id: string;
    email: string;
    fullName: string;
    userName: string;
    dob: string;
    phoneNumber: string;
    roleName: string;
    imageUrl: string;
    address: string;
    isActive: boolean;
    isDeleted: boolean;
    department: string;
    salary: number;
    title: string;
    rank: string;
}

export const userApi = {
    getCurrentUser: async (): Promise<ApiResponse<UserResponse>> => {
        const response = await axiosClient.get<ApiResponse<UserResponse>>(
            userPath("/me")
        );
        return response.data;
    },
    update: async (
        id: string,
        data: UserUpdateProfile
    ): Promise<ApiResponse<User>> => {
        const response = await axiosClient.put<ApiResponse<User>>(
            USER_API_ENDPOINTS.UPDATE(id),
            data
        );
        return response.data;
    },
    changePassword: async (
        data: ChangePasswordRequest
    ): Promise<ApiResponse<User>> => {
        const response = await axiosClient.post<ApiResponse<User>>(
            USER_API_ENDPOINTS.CHANGE_PASSWORD,
            data
        );
        return response.data;
    },
};

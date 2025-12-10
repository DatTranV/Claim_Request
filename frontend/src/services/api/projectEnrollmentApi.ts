import axiosClient from "@services/api/axiosClient";
import { ApiResponse } from "@services/api/apiResult";

// Interface for the project enrollment data
export interface ProjectEnrollment {
    id: string;
    projectId: string;
    userId: string[];
    projectRole: string;
    enrolledDate: string;
    isDeleted: boolean;
    createdAt: string;
    createdBy: string;
    // Navigation prop (optional, filled by backend)
    projectName: string;
    fullName: string;
    email: string;
}

export interface AddEnrollmentDto {
    projectId: string;
    userId: string[];
    projectRole: string;
}
export interface UpdateEnrollmentDto {
    display?: string;
    projectRole: string;
}
export const projectEnrollmentPath = (path?: string): string =>
    "/project-enrollments" + (path || "");

export const ENROLLMENT_API_ENDPOINTS = {
    GET_ALL: projectEnrollmentPath("/"),
    GET_BY_ID: (id: string) => projectEnrollmentPath(`/${id}`),
    CREATE: projectEnrollmentPath("/"),
    UPDATE: (id: string) => projectEnrollmentPath(`/${id}`),
    DELETE: (id: string) => projectEnrollmentPath(`/${id}`),
};
export const projectEnrollmentApi = {
    getAll: async (): Promise<ApiResponse<ProjectEnrollment[]>> => {
        const response = await axiosClient.get<
            ApiResponse<ProjectEnrollment[]>
        >(ENROLLMENT_API_ENDPOINTS.GET_ALL);
        return response.data;
    },

    // Get enrollment by ID
    getById: async (id: string): Promise<ApiResponse<ProjectEnrollment>> => {
        const response = await axiosClient.get<ApiResponse<ProjectEnrollment>>(
            ENROLLMENT_API_ENDPOINTS.GET_BY_ID(id)
        );
        return response.data;
    },

    // Get enrollments by user ID
    getByUserId: async (
        userId: string
    ): Promise<ApiResponse<ProjectEnrollment[]>> => {
        const response = await axiosClient.get<
            ApiResponse<ProjectEnrollment[]>
        >(projectEnrollmentPath(`/users/${userId}`));
        return response.data;
    },

    // Get users not enrolled in a project

    getByProject: async (
        projectId: string
    ): Promise<ApiResponse<ProjectEnrollment[]>> => {
        const response = await axiosClient.get<
            ApiResponse<ProjectEnrollment[]>
        >(projectEnrollmentPath(`/get-by-project`), {
            params: {
                projectId,
            },
        });
        return response.data;
    },

    create: async (
        data: AddEnrollmentDto
    ): Promise<ApiResponse<ProjectEnrollment>> => {
        const response = await axiosClient.post<ApiResponse<ProjectEnrollment>>(
            ENROLLMENT_API_ENDPOINTS.CREATE,
            data
        );
        return response.data;
    },

    // Update an enrollment
    update: async (
        id: string,
        // data: UpdateEnrollmentDto

        data: { projectRole: string }
    ): Promise<ApiResponse<ProjectEnrollment>> => {
        const response = await axiosClient.put<ApiResponse<ProjectEnrollment>>(
            ENROLLMENT_API_ENDPOINTS.UPDATE(id),
            data
        );
        return response.data;
    },

    // Delete an enrollment
    delete: async (id: string): Promise<ApiResponse<null>> => {
        const response = await axiosClient.delete<ApiResponse<null>>(
            ENROLLMENT_API_ENDPOINTS.DELETE(id)
        );
        return response.data;
    },

    // Delete an enrollment by project and user IDs
    deleteByProjectAndUser: async (
        projectId: string,
        userId: string
    ): Promise<ApiResponse<null>> => {
        const response = await axiosClient.delete<ApiResponse<null>>(
            projectEnrollmentPath(`/project/${projectId}/user/${userId}`)
        );
        return response.data;
    },

    getProjectMembers: async (projectId: string) => {
        try {
            const response = await axiosClient.get<
                ApiResponse<ProjectEnrollment[]>
            >(projectEnrollmentPath(`/project/${projectId}/members`));
            return {
                isSuccess: true,
                data: response.data,
                message: "Project members fetched successfully",
            };
        } catch (error) {
            return {
                isSuccess: false,
                data: null,
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch project members",
            };
        }
    },
};

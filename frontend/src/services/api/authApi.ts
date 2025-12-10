import { ApiResponse } from "@services/api/apiResult";
import axiosClient from "@services/api/axiosClient";
import { userPath } from "./userApi";

export interface ILoginResponse {
    status: string;
    message: string;
    jwt: string;
    expired: string;
    userId: string;
}

export const authApi = {
    login: async (data: any): Promise<ApiResponse<ILoginResponse>> => {
        const response = await axiosClient.post<ApiResponse<ILoginResponse>>(
            userPath("/login"),
            data
        );
        return response.data;
    },
};

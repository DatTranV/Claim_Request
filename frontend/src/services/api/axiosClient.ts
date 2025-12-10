import { useAuthStore } from "@/store/user/authState";
import axios from "axios";

const axiosClient = axios.create({
    baseURL: "https://localhost:7177/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
    // withCredentials: true,
});

// Add a request interceptor to include the JWT in the Authorization header
axiosClient.interceptors.request.use(
    (config) => {
        // Lấy token từ cookie
        const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        
    }
);

export default axiosClient;

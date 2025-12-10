"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useToast } from "@/hooks/use-toast";
import { authApi, ILoginResponse } from "@/services/api/authApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/user/authState";
import isTokenExpired from "@/services/isTokenExpired";
import { userApi, UserResponse } from "@/services/api/userApi";
import getUserRole, { hasPermission, UserRole } from "@/services/getUserRole";

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: ILoginResponse | null;
  currentUser: UserResponse | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  userRole: UserRole;
  hasPermission: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ILoginResponse | null>(null);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [userRole, setUserRole] = useState<UserRole>("STAFF");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

        if (token) {
          if (isTokenExpired(token)) {
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            useAuthStore.getState().signOut();
            toast({
              title: "Time out",
              description: "Please login again",
            });

            const currentPath = window.location.pathname + window.location.search;
            if (currentPath !== "/login") {
              router.push(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
            } else {
              router.push("/login");
            }

            setLoading(false);
            return;
          }

          try {
            const role = getUserRole(token);
            useAuthStore.getState().setAuth({
              jwt: token,
              role: role,
              status: "success",
              message: "",
              expired: "",
              userId: ""
            });
            setUserRole(role);

            const response = await userApi.getCurrentUser();
            if (response.isSuccess) {
              const data = response.data;
              setCurrentUser({
                id: data.id,
                email: data.email,
                imageUrl: data.imageUrl,
                fullName: data.fullName,
                userName: data.userName,
                dob: data.dob,
                phoneNumber: data.phoneNumber,
                roleName: data.roleName,
                address: data.address,
                department: data.department,
                salary: data.salary,
                title: data.title,
                rank: data.rank,
                isActive: data.isActive,
                isDeleted: data.isDeleted,
              });

              useAuthStore.getState().setAuth({
                jwt: token,
                role: role,
                userId: data.id,
                status: "success",
                message: "",
                expired: ""
              });
            }
          } catch (error) {
            console.error("Error checking auth:", error);
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            useAuthStore.getState().signOut();
            router.push("/login");
          }
        } else {
          const returnUrl = searchParams.get("returnUrl");
          if (returnUrl) {
            router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
          } else {
            router.push("/login");
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        useAuthStore.getState().signOut();
        router.push("/login");
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const response = await authApi.login(credentials);
      const data = response.data;

      if (response.isSuccess && data.jwt) {
        document.cookie = `token=${data.jwt}; path=/; secure; samesite=strict`;
        try {
          const role = getUserRole(data.jwt);
          setUserRole(role);
          setUser({
            userId: data.userId,
            status: data.status,
            message: data.message,
            jwt: data.jwt,
            expired: data.expired,
          });
          useAuthStore.getState().setAuth({
            ...data,
            role
          });

          const userResponse = await userApi.getCurrentUser();
          if (userResponse.isSuccess && userResponse.data.status) {
            toast({
              title: "Login failed",
              description: userResponse.data.message,
            });
          }
          if (userResponse.isSuccess) {
            const userData = userResponse.data;
            setCurrentUser({
              id: userData.id,
              email: userData.email,
              imageUrl: userData.imageUrl,
              fullName: userData.fullName,
              userName: userData.userName,
              dob: userData.dob,
              phoneNumber: userData.phoneNumber,
              roleName: userData.roleName,
              address: userData.address,
              department: userData.department,
              salary: userData.salary,
              title: userData.title,
              rank: userData.rank,
              isActive: userData.isActive,
              isDeleted: userData.isDeleted,
            });
          }

          toast({
            title: "Login successfully",
            description: "Welcome back!",
          });
        } catch (error) {
          console.error("Error processing login:", error);
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          useAuthStore.getState().signOut();
          toast({
            title: "Login failed",
            description: "Token is invalid",
            variant: "destructive",
          });
          throw error;
        }
      } else {
        toast({
          title: "Login failed",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An error occurred during login",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    useAuthStore.getState().signOut();
    setCurrentUser(null);
    setUserRole("STAFF");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    router.push("/login");
  };

  const checkPermission = (requiredRole: UserRole): boolean => {
    return hasPermission(userRole, requiredRole);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!currentUser,
        userRole,
        hasPermission: checkPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

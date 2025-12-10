import { jwtDecode } from "jwt-decode";

export default function getUserRole(token: string): UserRole {
    try {
        const decode = jwtDecode<JwtPayload>(token);
        if (decode.role) {
            return decode.role;
        }
        return "STAFF"; // Default role if not specified
    } catch (error) {
        console.error("Error decoding JWT:", error);
        return "STAFF"; // Default role on error
    }
}
export type UserRole = "ADMIN" | "APPROVER" | "FINANCE" | "STAFF";

interface JwtPayload {
    role?: UserRole;
    exp?: number;
    userId?: string;
}

export const hasPermission = (
    userRole: UserRole,
    requiredRole: UserRole
): boolean => {
    const roleHierarchy: Record<UserRole, number> = {
        ADMIN: 3,
        FINANCE: 2,
        APPROVER: 1,
        STAFF: 0,
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

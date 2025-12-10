import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
    commonInitialState,
    ICommonInitialState,
} from "@/store/common/ICommonInitialState";
import { fullfillField } from "../common/fullfillField";
import { UserRole } from "@/services/getUserRole";

interface IAuthState extends ICommonInitialState {
    data: {
        status: string;
        message: string;
        expired: string;
        userId: string;
        role: UserRole;
    };
    setAuth: (data: any) => void;
    signOut: () => void;
}

// export const useAuthStore = create<IAuthState>((set) => ({
//   ...commonInitialState,
//   data: {
//     status: "",
//     message: "",
//     jwt: "",
//     expired: "",
//     userId: "",
//   },
//   setAuth(data) {
//     set((state) => fullfillField(state, data));
//   },
// }));

export const useAuthStore = create<IAuthState>()(
    persist(
        (set) => ({
            ...commonInitialState,
            data: {
                status: "",
                message: "",
                expired: "",
                userId: "",
                role: "STAFF",
            },
            setAuth(data) {
                set((state) => fullfillField(state, data));
            },
            signOut() {
                set((state) => ({
                    ...state,
                    data: {
                        status: "",
                        message: "",
                        expired: "",
                        userId: "",
                        role: "STAFF",
                    },
                }));
            },
        }),
        {
            name: "auth",
        }
    )
);

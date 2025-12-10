import {
  commonInitialState,
  ICommonInitialState,
} from "@/store/common/ICommonInitialState";
import { create } from "zustand";
import { fullfillField } from "@/store/common/fullfillField";

export interface IInitClaimStore extends ICommonInitialState {
  data: {
    staffName: string;
    department: string;
    staffId: string;
    projects: [
      {
        projectId: string;
        projectName: string;
        projectRole: string;
        startDate: string;
        endDate: string;
        projectDuration: string;
      },
    ];
  };
}

export const useInitClaimStore = create<IInitClaimStore>((set) => ({
  ...commonInitialState,
  data: {
    staffName: "",
    department: "",
    staffId: "",
    projects: [
      {
        projectId: "",
        projectName: "",
        projectRole: "",
        startDate: "",
        endDate: "",
        projectDuration: "",
      },
    ],
  },
  setInitiateClaim(data : any) {
    set((state) => fullfillField(state, data));
  },
}));

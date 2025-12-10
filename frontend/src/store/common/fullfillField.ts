import { statusApi } from "@services/statusApi";

export const fullfillField = (state: any, data: any) => {
  state.isSuccess = data.isSuccess;
  state.data = data.data;
  state.message = data.message;
  return state;
};

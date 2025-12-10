export interface ICommonInitialState {
  isSuccess: boolean;
  message: string;
  error: string;
}

export const commonInitialState: ICommonInitialState = {
  isSuccess: false,
  message: "",
  error: "",
};

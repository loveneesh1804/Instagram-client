import { createSlice } from "@reduxjs/toolkit";

const initState: {open : boolean,msg: string} = {
  open: false,
  msg : ''
};
const toastSlice = createSlice({
  name: "toast",
  initialState: initState,
  reducers: {
    openToast : (state,action) => {
      state = action.payload
      return state;
    },
    closeToast: () => {
      return initState;
    },
  },
});

export const { openToast, closeToast } = toastSlice.actions;
export const toastPath = toastSlice.reducerPath;
export default toastSlice.reducer;

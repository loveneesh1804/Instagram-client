import { createSlice } from "@reduxjs/toolkit";
import { IPostType } from "../../types";

const initState: { open: boolean; id: string } = {
  open: false,
  id: '',
};
const maskSlice = createSlice({
  name: "mask",
  initialState: initState,
  reducers: {
    openMask: (state, action) => {
      state = action.payload;
      return state;
    },
    closeMask: () => {
      return initState;
    },
  },
});

export const { openMask, closeMask } = maskSlice.actions;
export const maskPath = maskSlice.reducerPath;
export default maskSlice.reducer;

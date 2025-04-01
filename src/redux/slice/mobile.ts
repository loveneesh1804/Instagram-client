import { createSlice } from "@reduxjs/toolkit";

const initState: { open: boolean } = {
  open: false
};
const mobileSlice = createSlice({
  name: "mask",
  initialState: initState,
  reducers: {
    setMobile: (state, action) => {
      state.open = action.payload;
      return state;
    }
  },
});

export const { setMobile } = mobileSlice.actions;
export const mobileSlicePath = mobileSlice.reducerPath;
export default mobileSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const initState: { refetch : boolean } = {
  refetch : false
};
const refetchSlice = createSlice({
  name: "refetch",
  initialState: initState,
  reducers: {
    refetchPost: (state) => {
      state = {refetch : true};
      return state;
    },
    resetRefetch: () => {
      return initState;
    },
  },
});

export const { refetchPost, resetRefetch } = refetchSlice.actions;
export const refetchPath = refetchSlice.reducerPath;
export default refetchSlice.reducer;

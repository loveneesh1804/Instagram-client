import { createSlice } from "@reduxjs/toolkit";

const initState: { visible: boolean; users: string[] } = {
  visible: false,
  users: [],
};
const chatMaskSlice = createSlice({
  name: "chatMask",
  initialState: initState,
  reducers: {
    openChatMask: (state, action) => {
      state.users = action.payload;
      state.visible = true;
      return state;
    },
    closeChatMask: (state,action) => {
      state.users = action.payload;
      state.visible = false;
      return state;
    },
  },
});

export const { openChatMask, closeChatMask } = chatMaskSlice.actions;
export const chatMaskPath = chatMaskSlice.reducerPath;
export default chatMaskSlice.reducer;

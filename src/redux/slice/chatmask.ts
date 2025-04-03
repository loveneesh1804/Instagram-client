import { createSlice } from "@reduxjs/toolkit";
import { IMyChats } from "../../types";

const initState: {
  visible: boolean;
  users: string[];
  chatId: string;
  chat: IMyChats | {};
} = {
  visible: false,
  users: [],
  chatId: "",
  chat: {},
};
const chatMaskSlice = createSlice({
  name: "chatMask",
  initialState: initState,
  reducers: {
    openChatMask: (state, action) => {
      state.users = action.payload;
      state.chatId = '';
      state.chat = {};
      state.visible = true;
      return state;
    },
    closeChatMask: (state, action) => {
      state.users = action.payload.users;
      state.chatId = action.payload.chatId;
      state.visible = false;
      state.chat = action.payload.chat;
      return state;
    },
  },
});

export const { openChatMask, closeChatMask } = chatMaskSlice.actions;
export const chatMaskPath = chatMaskSlice.reducerPath;
export default chatMaskSlice.reducer;

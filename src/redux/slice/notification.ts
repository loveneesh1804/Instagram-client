import { createSlice } from "@reduxjs/toolkit";
import { IMessageSocketType, MsgNotification } from "../../types";

const initState: { reqCount: number; msgCount: MsgNotification[] } = {
  reqCount: 0,
  msgCount: [],
};
const notificationSlice = createSlice({
  name: "notification",
  initialState: initState,
  reducers: {
    newReqNotification: (state) => {
      ++state.reqCount;
      return state;
    },
    deleteReqNotification: (state) => {
      if(state.reqCount>0) --state.reqCount;
      return state;
    },
    resetReqNotifications: (state) => {
      state.reqCount = 0;
      return state;
    },
    newMsgNotification: (
      state,
      { payload: { chatId,message } }: { payload: { chatId: string,message: IMessageSocketType } }
    ) => {
      const index = state.msgCount.findIndex((el) => el.chatId === chatId);
      if (index !== -1) {
        state.msgCount[index].count += 1;
        return state;
      } else {
        state.msgCount.push({
          chatId,
          count: 1,
          message
        });
        return state;
      }
    },
    removeMsgNotification: (
      state,
      { payload: { chatId } }: { payload: { chatId: string } }
    ) => {
      state.msgCount = state.msgCount.filter((el) => el.chatId !== chatId);
      return state;
    },
  },
});

export const {
  newReqNotification,
  deleteReqNotification,
  resetReqNotifications,
  newMsgNotification,
  removeMsgNotification,
} = notificationSlice.actions;
export const notificationSlicePath = notificationSlice.reducerPath;
export default notificationSlice.reducer;

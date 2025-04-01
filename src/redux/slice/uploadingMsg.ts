import { createSlice } from "@reduxjs/toolkit";
import { AttachmentsType, IMessageSocketType } from "../../types";

const initState: IMessageSocketType[] = [];

const uploadingSlice = createSlice({
  name: "uploading",
  initialState: initState,
  reducers: {
    addMsg: (state, action: { payload: IMessageSocketType }) => {
      state = [...state, action.payload];
      return state;
    },
    changeMsgStatus: (
      state,
      action: { payload: { id: string; resources: AttachmentsType[] } }
    ) => {
      const msg = state.find((el) => el._id === action.payload.id);
      if (msg) {
        msg.createdAt = "completed";
        msg.attachments = action.payload.resources;
      }
    },
    resetMsg: () => {
      return initState;
    },
  },
});

export const { addMsg, resetMsg, changeMsgStatus } = uploadingSlice.actions;
export const uploadingPath = uploadingSlice.reducerPath;
export default uploadingSlice.reducer;

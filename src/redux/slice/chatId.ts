import { createSlice } from "@reduxjs/toolkit";

const initState: { id: string } = {
  id: '',
};
const chatIdSlice = createSlice({
  name: "chatId",
  initialState: initState,
  reducers: {
    addChatId: (state, action) => {
      state.id = action.payload;
      return state;
    }
  },
});

export const { addChatId } = chatIdSlice.actions;
export const chatIdPath = chatIdSlice.reducerPath;
export default chatIdSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import { SideBarType } from "../../types";

const initState: SideBarType = {
  search: false,
  notify: false,
  post: false,
  more: false,
  chats: false
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState: initState,
  reducers: {
    search: (state) => {
      state.search = true;
      state.post = false;
      state.notify = false;
      state.more = false;
      return state;
    },
    notify: (state) => {
      state.search = false;
      state.post = false;
      state.notify = true;
      state.more = false;
      return state;
    },
    more: (state) => {
      state.more = true;
      return state;
    },
    post: (state) => {
      state.post = true;
      return state;
    },
    chats: (state) => {
      state.chats = true;
      state.more = false;
      state.notify = false;
      state.search = false;
      state.post = false;
      return state;
    },
    resetMore: (state) => {
      state.more = false;
      return state;
    },
    closePost: (state) => {
      state.post = false;
      return state;
    },
    closeSearch: (state) => {
      state.search = false;
      return state;
    },
    closeNotify: (state) => {
      state.notify = false;
      return state;
    },
    resetSidebar: () => {
      return initState;
    },
  },
});

export const {
  search,
  notify,
  post,
  more,
  resetSidebar,
  resetMore,
  chats,
  closePost,
  closeSearch,
  closeNotify
} = sidebarSlice.actions;
export const sidebarPath = sidebarSlice.reducerPath;
export default sidebarSlice.reducer;

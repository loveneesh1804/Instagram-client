import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import sideBarReducer, { sidebarPath } from "./slice/sidebar";
import userReducer from "./slice/user.slice";
import toastReducer, { toastPath } from "./slice/toast.slice";
import maskReducer, { maskPath } from "./slice/mask";
import chatMaskReducer, { chatMaskPath } from "./slice/chatmask";
import { userApi } from "./api/user.api";
import { tempApi } from "./api/temp.api";
import { chatApi } from "./api/chat.api";
import { postApi } from "./api/post.api";
import refetchReducer, { refetchPath } from "./slice/refetch";
import mobileReducer, { mobileSlicePath } from "./slice/mobile";
import uploadingReducer, { uploadingPath } from "./slice/uploadingMsg";
import chatIdReducer, { chatIdPath } from "./slice/chatId";
import notificationReducer, {
  notificationSlicePath,
} from "./slice/notification";
import { LOGOUT } from "../event";

const persistConfig = {
  key: "root",
  storage,
  blacklist: [
    uploadingPath,
    userApi.reducerPath,
    tempApi.reducerPath,
    toastPath,
    maskPath,
    chatMaskPath,
    chatApi.reducerPath,
    postApi.reducerPath,
    refetchPath,
    chatIdPath,
    mobileSlicePath
  ],
};

const appReducer = combineReducers({
  sidebar: sideBarReducer,
  user: userReducer,
  [userApi.reducerPath]: userApi.reducer,
  [tempApi.reducerPath]: tempApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
  [postApi.reducerPath]: postApi.reducer,
  [uploadingPath]: uploadingReducer,
  [notificationSlicePath]: notificationReducer,
  [chatIdPath]: chatIdReducer,
  refetch: refetchReducer,
  toast: toastReducer,
  mask: maskReducer,
  chatMask: chatMaskReducer,
  mobile: mobileReducer
});

const rootReducer = (state: any, action: { type: string; payload: object }) => {
  if (action.type === LOGOUT) {
    storage.removeItem("persist:root");
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
      .concat(userApi.middleware)
      .concat(tempApi.middleware)
      .concat(chatApi.middleware)
      .concat(postApi.middleware),
});

export const persistor = persistStore(store);
export type IRootState = ReturnType<typeof store.getState>;

import { createSlice } from "@reduxjs/toolkit";
import { UserStateType } from "../../types";

const initState: UserStateType = {
  verified: false,
  user: {
    _id: "",
    name: "",
    username: "",
    bio: "",
    avatar: {
      public_id: "",
      url: "",
    },
    followers: [],
    followings: [],
    createdAt : ''
  },
};

const userSlice = createSlice({
  name: "user",
  initialState: initState,
  reducers: {
    login: (state, action) => {
      return (state = action.payload);
    },
    logout: (state) => {
      return (state = initState);
    },
    addFriend: (state,action) => {
      state.user.followers.push(action.payload);
      return state;
    }
  },
});

export const { login, logout,addFriend } = userSlice.actions;
export default userSlice.reducer;

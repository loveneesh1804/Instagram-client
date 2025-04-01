import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import {
  IFollowers,
  IFollowings,
  IFriendRequestType,
  ILogin,
  IProfile,
  ISearchUsers,
  ISignUp,
  ISuggestionUser,
  IUpadtedUserResponse,
  ResponseCommonType,
} from "../../types";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_SERVER}/api/user/`,
    credentials: "include",
  }),
  tagTypes: ["login", "request"],
  endpoints: (builder) => ({
    login: builder.mutation<ResponseCommonType, ILogin>({
      query: (user) => ({
        url: "login",
        method: "POST",
        body: user,
      }),
    }),
    myProfile: builder.query<IProfile, string>({
      query: () => `my-profile`,
      providesTags: ["login"],
    }),
    otherProfile: builder.query<IProfile, string>({
      query: (id) => `${id}`,
      providesTags: ["login"],
    }),
    logout: builder.query<ResponseCommonType, string>({
      query: () => `logout`,
    }),
    register: builder.mutation<ResponseCommonType, ISignUp>({
      query: (user) => ({
        url: "register",
        method: "POST",
        body: user,
      }),
    }),
    search: builder.query<ISearchUsers, string>({
      query: (search) => `search?search=${search}`,
    }),
    getFollowers: builder.query<IFollowers, string>({
      query: (id) => `followers/${id}`,
    }),
    getFollowings: builder.query<IFollowings, string>({
      query: (id) => `followings/${id}`,
    }),
    edit: builder.mutation<IUpadtedUserResponse, FormData>({
      query: (data) => ({
        url: "edit",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["login"],
    }),
    sendRequest: builder.mutation<ResponseCommonType, { id: string }>({
      query: (data) => ({
        url: "send-request",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["login"],
    }),
    acceptRequest: builder.mutation<
      ResponseCommonType,
      { reqId: string; accept: boolean }
    >({
      query: (data) => ({
        url: "accept-request",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["request"],
    }),
    alreadyRequest: builder.query<ResponseCommonType, string>({
      query: (id) => `send-request/${id}`,
      keepUnusedDataFor: 0,
    }),
    getRequests: builder.query<
      { data: IFriendRequestType[]; success: boolean },
      string
    >({
      query: () => "notifications",
      providesTags: ["request"],
    }),
    getFriendsSuggestions: builder.query<
      { suggestions: ISuggestionUser[]; success: boolean },
      string
    >({
      query: () => "friends/suggestion",
      providesTags: ["request"],
    }),
  }),
});

export const {
  useLoginMutation,
  useLazySearchQuery,
  useLazyLogoutQuery,
  useLazyMyProfileQuery,
  useRegisterMutation,
  useEditMutation,
  useLazyOtherProfileQuery,
  useSendRequestMutation,
  useAlreadyRequestQuery,
  useLazyAlreadyRequestQuery,
  useGetRequestsQuery,
  useAcceptRequestMutation,
  useGetFriendsSuggestionsQuery,
  useLazyGetFollowersQuery,
  useLazyGetFollowingsQuery
} = userApi;

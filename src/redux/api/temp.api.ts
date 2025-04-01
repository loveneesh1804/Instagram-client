import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { INotification, ResponseCommonType } from "../../types";

export const tempApi = createApi({
  reducerPath: "tempApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_SERVER}/api/temp/`,
    credentials: "include",
  }),
  tagTypes: ["otp"],
  endpoints: (builder) => ({
    sendOtp: builder.mutation<ResponseCommonType, { username: string }>({
      query: (user) => ({
        url: "otp/send",
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["otp"],
    }),
    verifyOtp: builder.mutation<
      ResponseCommonType,
      { username: string; otp: string }
    >({
      query: (data) => ({
        url: "otp/verify",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["otp"],
    }),
    getOtherNotifications: builder.query<
      { success: boolean; notifications: INotification[] },
      string
    >({
      query: () => `notify`,
    }),
  }),
});

export const { useSendOtpMutation, useVerifyOtpMutation, useGetOtherNotificationsQuery } = tempApi;

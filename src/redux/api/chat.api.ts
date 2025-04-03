import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { IGetChatDetails, IMessageResponse, IMyChatsResponse, NewChatResponse, ResponseCommonType } from "../../types";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_SERVER}/api/chat/`,
    credentials: "include",
  }),
  tagTypes: ["chats", "message"],
  endpoints: (builder) => ({
    newChat: builder.mutation<NewChatResponse, {members :string[]}>({
      query: (data) => {
        return {
          url: "new",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["chats"],
    }),
    myChats: builder.query<IMyChatsResponse, string>({
      query: () => `my`,
      providesTags: ["chats"],
    }),

    getChatDetails: builder.query<
      IGetChatDetails,
      { chatId: string; populate: boolean }
    >({
      query: ({ chatId, populate = false }) => {
        let url = chatId;
        if (populate) url += "?populate=true";

        return url;
      },
      providesTags: ["chats"],
    }),

    deleteChat: builder.mutation<ResponseCommonType, string>({
      query: (id) => {
        return {
          url: `${id}`,
          method: "DELETE",
        };
      }
    }),

    getAllMessages: builder.query<
      IMessageResponse,
      { chatId: string; page: number }
    >({
      query: ({ chatId, page }) => `message/${chatId}?page=${page}`,
      keepUnusedDataFor: 0
    }),

    deleteMessage: builder.mutation<ResponseCommonType, string>({
      query: (id) => {
        return {
          url: `message/${id}`,
          method: "DELETE",
        };
      }
    }),

    sendFiles: builder.mutation<ResponseCommonType, FormData>({
      query: (data) => {
        return {
          url: "files",
          method: "POST",
          body: data,
        };
      }
    }),
  }),
});

export const {
  useNewChatMutation,
  useMyChatsQuery,
  useGetChatDetailsQuery,
  useGetAllMessagesQuery,
  useSendFilesMutation,
  useDeleteMessageMutation,
  useDeleteChatMutation
} = chatApi;

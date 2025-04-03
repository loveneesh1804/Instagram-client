import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { CommentsType, ExplorePostResponse, IPostType, IPostTypeFeed, LikesType, MorePostResponse, MyPostResponse, ResponseCommonType } from "../../types";

export const postApi = createApi({
  reducerPath: "postApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_SERVER}/api/post/`,
    credentials: "include",
  }),
  tagTypes: ["post"],
  endpoints: (builder) => ({
    newPost: builder.mutation<ResponseCommonType, FormData>({
      query: (data) => {
        return {
          url: "new",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["post"],
    }),
    myPost: builder.query<MyPostResponse, number>({
      query: (page) => `my?page=${page}`,
      providesTags: ["post"],
    }),
    morePost: builder.query<MorePostResponse,{id : string,user: string}>({
      query: ({id,user}) => `more-post?id=${id}&user=${user}`,
    }),
    explorePost: builder.query<ExplorePostResponse,number>({
      query: (page) => `explore?page=${page}`,
    }),
    othersPost: builder.query<MyPostResponse, { page: number; id: string }>({
      query: ({ page, id }) => `other/${id}?page=${page}`,
    }),
    newComment: builder.mutation<
      ResponseCommonType,
      { comment: string; postId: string }
    >({
      query: (data) => {
        return {
          url: "comment",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["post"],
    }),
    getComments: builder.query<{ success: boolean; data: {comments : CommentsType[]} }, string>({
      query: (id) => `comment/${id}`,
      providesTags: ["post"],
    }),
    getLikes: builder.query<{ success: boolean; data: {likes : LikesType[]} }, string>({
      query: (id) => `like/${id}`,
      providesTags: ["post"],
    }),
    getPost: builder.query<{ success: boolean; data: IPostType }, string>({
      query: (id) => `${id}`,
      providesTags: ["post"],
    }),
    getFriendPost: builder.query<{ success: boolean; posts: IPostTypeFeed[] }, string>({
      query: () => `friends/feed`,
    }),
    deleteComment: builder.mutation<ResponseCommonType, string>({
      query: (id) => {
        return {
          url: `comment/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["post"],
    }),
    likePost: builder.mutation<
      ResponseCommonType,
      { postId: string; like: boolean }
    >({
      query: (data) => {
        return {
          url: `like`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["post"],
    }),
  }),
});

export const {
  useNewPostMutation,
  useLazyOthersPostQuery,
  useLikePostMutation,
  useLazyMyPostQuery,
  useDeleteCommentMutation,
  useNewCommentMutation,
  useLazyGetCommentsQuery,
  useLazyGetLikesQuery,
  useLazyGetPostQuery,
  useGetFriendPostQuery,
  useMorePostQuery,
  useLazyExplorePostQuery
} = postApi;

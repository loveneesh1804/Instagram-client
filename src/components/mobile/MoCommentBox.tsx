import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../../redux/store";
import { DELETE_NOTIFICATION, NEW_NOTIFICATION, Null } from "../../event";
import User from "../../assets/images/user.png";
import {
  useDeleteCommentMutation,
  useLazyGetCommentsQuery,
  useNewCommentMutation,
} from "../../redux/api/post.api";
import { dateAgo } from "../../utlis";
import { CommentsType, IPostType, IPostTypeFeed } from "../../types";
import MoCommentSkeleton from "../../utils/skeletons/MoCommentSkeleton";
import { IoInfoOutline } from "../icon/Icons";
import { GetSocket } from "../../Socket";
import { refetchPost, resetRefetch } from "../../redux/slice/refetch";
import LineLoader from "../../utils/loaders/LineLoader";

const MoCommentBox = ({
  open,
  setOpen,
  id,
  setId,
  post,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
  setId: React.Dispatch<React.SetStateAction<string>>;
  post: IPostTypeFeed | IPostType;
}) => {
  const user = useSelector((s: IRootState) => s.user.user);
  const [loading, setLoading] = useState<boolean>(true);
  const [comments, setComments] = useState<CommentsType[]>([]);
  const [comment, setComment] = useState<string>("");

  const dispatch = useDispatch();
  const [newComment] = useNewCommentMutation();
  const [deletePostComment] = useDeleteCommentMutation();
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [alreadyComment, setAlreadyComment] = useState<boolean>(false);

  const handleClose = () => {
    setOpen(false);
    setId("");
  };
  const [getComments] = useLazyGetCommentsQuery();
  const socket = GetSocket();
  const { refetch } = useSelector((state: IRootState) => state.refetch);

  const handlePostComment = async () => {
    try {
      const payload = {
        postId: post!._id,
        comment,
      };
      const { data } = await newComment(payload);
      if (data?.success) {
        const payload = {
          attachment: post?.resources[0].url,
          post: post?._id,
          type: "COMMENT",
          receiver: post?.userId._id,
          content: comment,
        };
        if (user._id !== post?.userId._id)
          socket.emit(NEW_NOTIFICATION, payload);
        refetch ? dispatch(resetRefetch()) : dispatch(refetchPost());
        return setComment("");
      }
    } catch (e) {
      console.error(e);
    }
  };
  const handleDeleteComment = async (id: string, cmtId: string) => {
    try {
      setDeleteLoading(true);
      const { data } = await deletePostComment(id);
      if (data) {
        setComments((prev) => prev.filter((el) => el._id !== cmtId));
        const payload = {
          post: {
            _id: post?._id,
            attachment: post?.resources[0].url,
          },
          type: "COMMENT",
          receiver: post?.userId._id,
        };
        if (user._id !== post?.userId._id)
          socket.emit(DELETE_NOTIFICATION, payload);
        refetch ? dispatch(resetRefetch()) : dispatch(refetchPost());
        return setDeleteLoading(false);
      } else {
        setDeleteLoading(false);
      }
    } catch {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      const { data } = await getComments(id);
      if (data?.success) {
        setLoading(false);
        const alreadyComment = data.data.comments.find(
          (el) => el.user._id === user._id
        );
        if (alreadyComment) setAlreadyComment(true);
        else setAlreadyComment(false);
        setComments(data.data.comments);
      }
    };

    id.length && fetchComments();
  }, [id, refetch]);

  return (
    <div
      className="mobile-cmt-box"
      onClick={(e) =>
        (e.target as HTMLDivElement).className === "mobile-cmt-box"
          ? handleClose()
          : undefined
      }
      style={{
        visibility: open ? "visible" : "hidden",
        pointerEvents: open ? "all" : "none",
      }}
    >
      {deleteLoading ? <LineLoader /> : undefined}
      <div
        className="mobile-cmt"
        style={{ opacity: open ? 1 : 0, bottom: open ? "0" : "-100%" }}
      >
        <div className="mobile-cmt-head">
          <span></span>
          <h2>Comments</h2>
          <IoInfoOutline />
        </div>
        <div className="mobile-comments">
          {comments.length && !loading ? (
            comments.map((el) => (
              <div className="mobile-comment" key={el._id}>
                <img
                  src={el.user.avatar.url !== Null ? el.user.avatar.url : User}
                  alt="user-ico"
                />
                <div>
                  <div>
                    <p>{el.user.name}</p>
                    <span>{dateAgo(el.createdAt)}</span>
                  </div>
                  <div>
                    <b>{el.comment}</b>
                    {user._id === el.user._id ? (
                      <button onClick={() => handleDeleteComment(id, el._id)}>
                        Delete
                      </button>
                    ) : undefined}
                  </div>
                </div>
              </div>
            ))
          ) : !comments.length && loading ? (
            <MoCommentSkeleton />
          ) : (
            <div className="no-comments-box mobile-no-cmt">
              <h2>No comments yet.</h2>
              <span>Start the conversation.</span>
            </div>
          )}
        </div>
        {!alreadyComment ? (
          <div className="mobile-add-cmt">
            <img
              src={user.avatar.url !== Null ? user.avatar.url : User}
              alt="user-ico"
            />
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              type="text"
              placeholder="Add a comment"
            />
            <button
              onClick={handlePostComment}
              disabled={comment.length ? false : true}
            >
              Post
            </button>
          </div>
        ) : (
          <div className="mobile-add-cmt already-cmt">
            <span>You've already commented on this post.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoCommentBox;

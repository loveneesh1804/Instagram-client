import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetSocket } from "../Socket";
import User from "../assets/images/user.png";
import {
  IoCloseOutline,
  IoCommentOutline,
  IoHeartOutline,
  IoLeftChevron,
  IoLikedIcon,
  IoRightChevron,
  IoSavedPostOutline,
  IoShareOutline,
  MoreIcon,
} from "../components/icon/Icons";
import { DELETE_NOTIFICATION, NEW_NOTIFICATION } from "../event";
import {
  useDeleteCommentMutation,
  useLazyGetPostQuery,
  useLikePostMutation,
  useNewCommentMutation,
} from "../redux/api/post.api";
import { closeMask } from "../redux/slice/mask";
import { deleteReqNotification } from "../redux/slice/notification";
import { refetchPost, resetRefetch } from "../redux/slice/refetch";
import { IRootState } from "../redux/store";
import { IPostType, ResponseCommonType } from "../types";
import { toast } from "../utils/alert/Toast";
import BigSpinner from "../utils/loaders/BigSpinner";
import LineLoader from "../utils/loaders/LineLoader";
import PostSkeleton from "../utils/skeletons/PostSkeleton";
import { dateAgo, dateFormat, Null, toOriginalStr } from "../utlis";

const PostMask = () => {
  //comman states
  const carouselRef = useRef<HTMLDivElement>(null);
  const [showPrev, setShowPrev] = useState<boolean>(false);
  const [showNext, setShowNext] = useState<boolean>(false);
  const [currentPrev, setCurrentPrev] = useState<number>(0);
  const [post, setPost] = useState<IPostType>();

  //comment states
  const [deleteCmt, setDeleteCmt] = useState<string>("");
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [alreadyComment, setAlreadyComment] = useState<boolean>(false);
  const [cmtLoading, setCmtLoading] = useState<boolean>(false);

  //like states
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const socket = GetSocket();

  //Redux Stuff
  const dispatch = useDispatch();
  const { refetch } = useSelector((state: IRootState) => state.refetch);
  const { open, id } = useSelector((state: IRootState) => state.mask);
  const { user } = useSelector((state: IRootState) => state.user);
  const [newComment] = useNewCommentMutation();
  const [getPost] = useLazyGetPostQuery();
  const [deletePostComment] = useDeleteCommentMutation();
  const [likePost] = useLikePostMutation();

  //Handlers
  const handleOutside = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if ((e.target as HTMLDivElement).className === "post-mask") {
      handleClose();
    }
  };
  const handleClose = () => {
    setPost(undefined);
    setShowPrev(false);
    setShowNext(false);
    setCurrentPrev(0);
    setIsLiked(false);
    dispatch(closeMask());
  };
  const updateBtnView = () => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = carouselRef.current;

      setShowPrev(scrollLeft > 0);
      setShowNext(scrollLeft + clientWidth < scrollWidth);
    }
  };
  const handleNextClick = () => {
    carouselRef.current!.scrollLeft += carouselRef.current!.clientWidth;
    setCurrentPrev((prev) => ++prev);
    updateBtnView();
  };
  const handlePrevClick = () => {
    carouselRef.current!.scrollLeft -= carouselRef.current!.clientWidth;
    setCurrentPrev((prev) => --prev);
    updateBtnView();
  };
  const handlePostComment = async () => {
    try {
      setCmtLoading(true);
      const payload = {
        postId: post!._id,
        comment,
      };
      const { data, error } = await newComment(payload);
      if (data?.success) {
        const payload = {
          attachment: post?.resources[0].url,
          post: post?._id,
          type: "COMMENT",
          receiver: post?.userId._id,
          content: comment
        };
        if(user._id !== post?.userId._id) socket.emit(NEW_NOTIFICATION, payload);
        refetch ? dispatch(resetRefetch()) : dispatch(refetchPost());
        setCmtLoading(false);
        return setComment("");
      } else {
        setCmtLoading(false);
        return toast(
          ((error as FetchBaseQueryError).data as ResponseCommonType).message
        );
      }
    } catch {
      setCmtLoading(false);
      return toast("Something went wrong please try again!");
    }
  };
  const handleDeleteComment = async (id: string) => {
    try {
      setDeleteLoading(true);
      const { data, error } = await deletePostComment(id);
      if (data) {
        const payload = {
          post: {
            _id : post?._id,
            attachment: post?.resources[0].url
          },
          type: "COMMENT",
          receiver: post?.userId._id,
        };
        if(user._id !== post?.userId._id) socket.emit(DELETE_NOTIFICATION, payload);
        refetch ? dispatch(resetRefetch()) : dispatch(refetchPost());
        return setDeleteLoading(false);
      } else {
        setDeleteLoading(false);
        return toast(
          ((error as FetchBaseQueryError).data as ResponseCommonType).message
        );
      }
    } catch {
      setDeleteLoading(false);
      toast("Something went wrong. Please try again!");
    }
  };
  const handleLike = async () => {
    try {
      if (!post) {
        return;
      }
      const payload = {
        postId: post._id,
        like: !isLiked,
      };
      const { data, error } = await likePost(payload);
      const socketPayload = {
        attachment: post.resources[0].url,
        post: post._id,
        type: "LIKE",
        receiver: post.userId._id,
        content: ''
      };
      if (data?.message === "Post Liked" && user._id !== post.userId._id) {
        socket.emit(NEW_NOTIFICATION, socketPayload);
      }else if(data?.message === "Post Unliked" && user._id !== post.userId._id){
        const payload = {
          post: {
            _id : post?._id,
            attachment: post?.resources[0].url
          },
          type: "COMMENT",
          receiver: post?.userId._id,
        };
        dispatch(deleteReqNotification());
        socket.emit(DELETE_NOTIFICATION, payload);
      }
      if (data) {
        refetch ? dispatch(resetRefetch()) : dispatch(refetchPost());
        return setIsLiked((prev) => !prev);
      }
      if (error) {
        return toast(
          ((error as FetchBaseQueryError).data as ResponseCommonType).message
        );
      }
    } catch {
      return toast("Something went wrong. Please try again!");
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await getPost(id);
        if (data) {
          return setPost(data.data);
        }
      } catch {
        return toast("Something went wrong!");
      }
    };
    open && fetchPost();
  }, [refetch, open]);

  useEffect(() => {
    open && post && post.resources.length > 1 && setShowNext(true);
    const handleScroll = () => {
      updateBtnView();
    };
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener("scroll", handleScroll);
    }
    if (open && post) {
      const alreadyComment = post!.comments.find(
        (el) => el.user._id === user._id
      );
      if (alreadyComment) setAlreadyComment(true);
      else setAlreadyComment(false);

      const alreadyLiked = post.likes.find((el) => el._id === user._id);
      if (alreadyLiked) setIsLiked(true);
      else setIsLiked(false);
    }
    return () => {
      if (carousel) {
        carousel.removeEventListener("scroll", handleScroll);
      }
    };
  }, [open, post]);

  useEffect(() => {
    const imgLoaders = document.querySelectorAll(".post-card");
    imgLoaders.forEach((el) => {
      const img = el.querySelector("img");

      function loaded() {
        el.classList.add("loaded-mask-img");
      }
      if (img?.complete) {
        loaded();
      } else {
        img?.addEventListener("load", loaded);
      }
    });
  }, [post]);

  return (
    <div
      className="post-mask"
      onClick={handleOutside}
      style={{ visibility: open ? "visible" : "hidden" }}
    >
      <div
        className="post-mask-box"
        style={{
          opacity: open ? "1" : "0.8",
          visibility: open ? "visible" : "hidden",
          transform: open ? "translate(-50%,-50%) scale(1)" : "",
        }}
      >
        {post ? (
          <>
            <div className="post-resources-box">
              <div ref={carouselRef} className="post-carousel">
                {post!.resources.map((el) => (
                  <div className="post-card" key={el.public_id}>
                    <img
                      style={{ objectFit: post?.view }}
                      src={el.url}
                      alt="post-prev"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
              {showPrev ? (
                <button className="post-prev-btn" onClick={handlePrevClick}>
                  <IoLeftChevron />
                </button>
              ) : undefined}
              {showNext ? (
                <button className="post-next-btn" onClick={handleNextClick}>
                  <IoRightChevron />
                </button>
              ) : undefined}
              {post.resources.length > 1 ? (
                <div className="slider-dots-box">
                  {new Array(post.resources.length).fill(0).map((el, i) => (
                    <div
                      style={{
                        backgroundColor:
                          currentPrev === i ? "white" : "rgba(255,255,255,0.4)",
                      }}
                      className="grey-dots"
                      key={i}
                    ></div>
                  ))}
                </div>
              ) : undefined}
            </div>
            <div className="post-detail-box">
              <div className="post-detail-header">
                <div>
                  <img
                    src={
                      post.userId.avatar.url !== Null
                        ? post.userId.avatar.url
                        : User
                    }
                    alt="user-ico"
                  />
                  <b>{post.userId.name}</b>
                </div>
                <div>
                  <MoreIcon />
                </div>
              </div>
              <div className="caption-comment-section">
                <div className="caption-box-section">
                  <img
                    src={
                      post.userId.avatar.url !== Null
                        ? post.userId.avatar.url
                        : User
                    }
                    alt="user-ico"
                  />
                  <div>
                    <span>
                      <b>{post.userId.name}</b>
                      {open
                        ? toOriginalStr(post!.caption).map((el, i) =>
                            i === 0 ? (
                              <span key={i}>{el}</span>
                            ) : (
                              <p key={i}>{el}</p>
                            )
                          )
                        : ""}
                    </span>
                    <p>{open ? dateAgo(post!.createdAt) : ""}</p>
                  </div>
                </div>
                <div className="comment-box-section">
                  {post!.comments.length
                    ? post!.comments.map((el) => (
                        <div
                          onMouseOut={() => setDeleteCmt("")}
                          onMouseOver={() => setDeleteCmt(el.user._id)}
                          className="real-comment"
                          key={el._id}
                        >
                          <img
                            src={
                              el.user.avatar.url !== Null
                                ? el.user.avatar.url
                                : User
                            }
                            alt="cmt-icon"
                          />
                          <div>
                            <span>
                              <b>{el.user.name}</b>
                              {el.comment}
                            </span>
                            <p>
                              {dateAgo(el.createdAt)}
                              {deleteCmt === el.user._id &&
                              user._id === el.user._id ? (
                                <span
                                  onClick={() => handleDeleteComment(post._id)}
                                  className="delete-comment"
                                >
                                  Delete
                                </span>
                              ) : undefined}
                            </p>
                          </div>
                        </div>
                      ))
                    : undefined}
                </div>
              </div>
              <div className="mask-like-share-section">
                <div>
                  <div>
                    <span onClick={handleLike}>
                      {isLiked ? <IoLikedIcon /> : <IoHeartOutline />}
                    </span>
                    <span>
                      <IoCommentOutline />
                    </span>
                    <span>
                      <IoShareOutline width={24} height={24} />
                    </span>
                  </div>
                  <span>
                    <IoSavedPostOutline />
                  </span>
                </div>
                <div>
                  <b>{post!.likes.length.toLocaleString("en-IN")} likes</b>
                  <p>{open ? dateFormat(post!.createdAt) : ""}</p>
                </div>
              </div>
              {!alreadyComment ? (
                <div className="add-comment-section">
                  {!cmtLoading ? (
                    <input
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      type="text"
                      placeholder="Add a comment..."
                    />
                  ) : (
                    <div>
                      <BigSpinner />
                    </div>
                  )}
                  <span
                    onClick={handlePostComment}
                    style={{
                      opacity: comment.length ? "1" : "0.5",
                      pointerEvents: comment.length ? "all" : "none",
                    }}
                  >
                    Post
                  </span>
                </div>
              ) : (
                <div className="exist-comment">
                  <p>You already commented</p>
                </div>
              )}
            </div>
            {deleteLoading ? <LineLoader /> : undefined}
          </>
        ) : (
          <PostSkeleton />
        )}
      </div>
      <span onClick={handleClose}>
        <IoCloseOutline />
      </span>
    </div>
  );
};

export default PostMask;

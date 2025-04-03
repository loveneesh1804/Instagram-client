import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import User from "../../assets/images/user.png";
import { MainFooter } from "../../components/common/Footer";
import PostCarousel from "../../components/common/PostCarousel";
import {
  IoHeartOutline,
  IoLikedIcon,
  IoSavedOutline,
  IoShareOutline,
  IoWentWrong,
  MoreIcon,
} from "../../components/icon/Icons";
import Sidebar from "../../components/main/Sidebar";
import { DELETE_NOTIFICATION, NEW_NOTIFICATION } from "../../event";
import {
  useDeleteCommentMutation,
  useLazyGetPostQuery,
  useLikePostMutation,
  useNewCommentMutation,
} from "../../redux/api/post.api";
import { deleteReqNotification } from "../../redux/slice/notification";
import { refetchPost, resetRefetch } from "../../redux/slice/refetch";
import { IRootState } from "../../redux/store";
import { GetSocket } from "../../Socket";
import { CommentsType, IPostType } from "../../types";
import BigSpinner from "../../utils/loaders/BigSpinner";
import { dateAgo, dateFormat, Null, toOriginalStr } from "../../utlis";
import LineLoader from "../../utils/loaders/LineLoader";
import MorePost from "../../components/common/MorePost";
import MoPostRender from "../../components/mobile/MoPostRender";
import MoHeader from "../../components/mobile/MoHeader";
const Postusers = () => {
  const [post, setPost] = useState<IPostType>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const { id } = useParams();
  const naviagte = useNavigate();

  const { user } = useSelector((s: IRootState) => s.user);
  const [getPost] = useLazyGetPostQuery();
  const [likePost] = useLikePostMutation();

  const [comment, setComment] = useState<string>("");
  const [comments, setComments] = useState<CommentsType[]>([]);
  const [deleteCmt, setDeleteCmt] = useState<string>("");
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [alreadyComment, setAlreadyComment] = useState<boolean>(false);
  const [like, setLike] = useState<number>(0);

  const [isLiked, setIsLiked] = useState<boolean>(false);
  const socket = GetSocket();

  const dispatch = useDispatch();
  const [newComment] = useNewCommentMutation();
  const [deletePostComment] = useDeleteCommentMutation();

  const { refetch } = useSelector((state: IRootState) => state.refetch);
  const isMobile = useSelector((state: IRootState) => state.mobile.open);

  const handleLike = async () => {
    try {
      if (!post) {
        return;
      }
      const payload = {
        postId: post._id,
        like: !isLiked,
      };
      const { data } = await likePost(payload);
      const socketPayload = {
        attachment: post.resources[0].url,
        post: post._id,
        type: "LIKE",
        receiver: post.userId._id,
        content: "",
      };
      data?.message === "Post Liked"
        ? setLike((prev) => ++prev)
        : setLike((prev) => --prev);
      if (data?.message === "Post Liked" && user._id !== post.userId._id) {
        socket.emit(NEW_NOTIFICATION, socketPayload);
      } else if (
        data?.message === "Post Unliked" &&
        user._id !== post.userId._id
      ) {
        setLike((prev) => --prev);
        const payload = {
          post: {
            _id: post?._id,
            attachment: post?.resources[0].url,
          },
          type: "LIKE",
          receiver: post?.userId._id,
        };
        dispatch(deleteReqNotification());
        socket.emit(DELETE_NOTIFICATION, payload);
      }
      if (data) {
        refetch ? dispatch(resetRefetch()) : dispatch(refetchPost());
        return setIsLiked((prev) => !prev);
      }
    } catch (e) {
      console.error(e);
    }
  };
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
    }catch(e){
      console.error(e)
    }
  };
  const handleDeleteComment = async (id: string,cmtId : string) => {
    try {
      setDeleteLoading(true);
      const { data } = await deletePostComment(id);
      if (data) {
        setComments(prev=>prev.filter(el=>el._id!==cmtId))
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

  useEffect(()=>{setLoading(true)},[id])

  useEffect(() => {
    const fetchPost = async () => {
      if (id?.length !== 24) return naviagte("/not-found");
      try {
        const { data, isError } = await getPost(id as string);
        if (isError) {
          return setError(true);
        }
        if (data) {
          setLike(data.data.likes.length);
          setComments(data?.data.comments);
          setPost(data?.data);
        }
      } catch {
        setError(true);
      }finally{
        setLoading(false);
      }
    };
    if (id?.length) {
      fetchPost();
    }
    if (error) {
      document.title = "Page couldn't load • Instagram";
    }
  }, [id, error,post]);
  useEffect(() => {
    if (post) {
      const alreadyLiked = post.likes.find((el) => el._id === user._id);
      if (alreadyLiked) {
        setIsLiked(true);
      } else {
        setIsLiked(false);
      }
      const alreadyComment = post!.comments.find(
        (el) => el.user._id === user._id
      );
      if (alreadyComment) setAlreadyComment(true);
      else setAlreadyComment(false);
    }
  }, [post]);

  return (
    <div className="single-post-section">
      <Sidebar />
      {isMobile ? <MoHeader /> : undefined}
      <main className="user-posts">
        {!loading && !error && post ? (
          <>
            {" "}
            {!isMobile ? <div className="main-user-post">
              <div className="main-post-resources">
                {post ? <PostCarousel data={post} /> : undefined}
              </div>
              <div className="main-post-details">
                <div className="main-post-header">
                  <div>
                    <img
                      src={
                        post?.userId.avatar.url !== Null
                          ? post?.userId.avatar.url
                          : User
                      }
                      alt="user-ico"
                    />
                    <p>{post?.userId.name}</p>
                  </div>
                  <span>
                    <MoreIcon />
                  </span>
                </div>
                <div className="main-post-comment">
                  <div className="main-post-caption">
                    <img
                      src={
                        post?.userId.avatar.url !== Null
                          ? post?.userId.avatar.url
                          : User
                      }
                      alt="user-ico"
                    />
                    <div>
                      <p>
                        {post?.userId.name}{" "}
                        <span>{dateAgo(post?.createdAt as string)}</span>
                      </p>
                      <b>
                        {toOriginalStr(post?.caption || "").map((el, i) =>
                          i === 0 ? (
                            <span key={i}>{el}</span>
                          ) : (
                            <p key={i}>{el}</p>
                          )
                        )}
                      </b>
                    </div>
                  </div>
                  <div className="main-post-comment-box">
                    {comments.length ? (
                      comments.map((el) => (
                        <div
                          key={el._id}
                          onMouseOut={() => setDeleteCmt("")}
                          onMouseOver={() => setDeleteCmt(el.user._id)}
                        >
                          <img
                            src={
                              el.user.avatar.url !== Null
                                ? el.user.avatar.url
                                : User
                            }
                            alt="user-ico"
                          />
                          <div>
                            <p>
                              {el.user.name}{" "}
                              <span>{dateAgo(el.createdAt as string)}</span>
                            </p>
                            <b>
                              {el.comment}{" "}
                              {deleteCmt === el.user._id &&
                              user._id === el.user._id ? (
                                <span
                                  onClick={() =>
                                    handleDeleteComment(post?._id as string,el._id)
                                  }
                                  className="delete-comment"
                                >
                                  Delete
                                </span>
                              ) : undefined}
                            </b>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-comments-box">
                        <h2>No comments yet.</h2>
                        <span>Start the conversation.</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="like-cmt-section">
                  <div>
                    <span onClick={handleLike}>
                      {isLiked ? <IoLikedIcon /> : <IoHeartOutline />}
                    </span>
                    <span>
                      <IoShareOutline width={24} height={24} />
                    </span>
                  </div>
                  <span>
                    <IoSavedOutline />
                  </span>
                </div>
                <div className="main-post-like-count">
                  <h4>{like.toLocaleString("en-IN")} likes</h4>
                  <span>{post?.createdAt && dateFormat(post?.createdAt)}</span>
                </div>
                {alreadyComment ? <div className="alredy-commented">
                  <span>Comment on this post have been limited.</span>
                </div>
                : <div className="comment-post-section">
                  <img
                    src={user.avatar.url !== Null ? user.avatar.url : User}
                    alt="user-ico"
                  />
                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                  />
                  {comment.length ? <button onClick={handlePostComment}>Post</button> : undefined}
                </div>}
              </div>
              {deleteLoading ? <LineLoader /> : undefined}
            </div> : <MoPostRender data={post} />}
            <hr />
            <MorePost id={post.userId._id} />
          </>
        ) : loading && !error ? (
          <div className="main-post-loader">
            <BigSpinner />
          </div>
        ) : (
          <div className="something-went-wrong">
            <div>
              <IoWentWrong />
              <h3>Something went wrong</h3>
              <span>There's an issue and the page could not be loaded.</span>
              <button onClick={() => naviagte("/")}>Go to Instagram</button>
            </div>
          </div>
        )}
        <MainFooter />
      </main>
    </div>
  );
};

export default Postusers;

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import User from "../../assets/images/user.png";
import { DELETE_NOTIFICATION, NEW_NOTIFICATION } from "../../event";
import { useLikePostMutation } from "../../redux/api/post.api";
import { openMask } from "../../redux/slice/mask";
import { deleteReqNotification } from "../../redux/slice/notification";
import { refetchPost, resetRefetch } from "../../redux/slice/refetch";
import { IRootState } from "../../redux/store";
import { GetSocket } from "../../Socket";
import { IPostType, IPostTypeFeed, ShowCaption } from "../../types";
import { dateAgo, formatCaption, Null, toOriginalStr } from "../../utlis";
import {
  IoCommentOutline,
  IoHeartOutline,
  IoLikedIcon,
  IoSavedPostOutline,
  IoShareOutline,
  MoreIcon,
} from "../icon/Icons";
import PostCarousel from "./PostCarousel";
import { useNavigate } from "react-router-dom";
import MoCommentBox from "../mobile/MoCommentBox";
import LikeMask from "../../mask/LikeMask";

const RenderPost = ({ data }: { data: IPostTypeFeed }) => {
  const [alreadyComment, setAlreadyComment] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);

  const [id, setId] = useState<string>("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: IRootState) => state.user);
  const { refetch } = useSelector((state: IRootState) => state.refetch);
  const [likePost] = useLikePostMutation();
  const [post, setPost] = useState<IPostTypeFeed>();

  const [showCaption, setShowCaption] = useState<boolean>(false);

  const [open, setOpen] = useState<boolean>(false);
  const [showLikes, setShowLikes] = useState<boolean>(false);

  const isMobile = useSelector((s: IRootState) => s.mobile.open);

  useEffect(() => {
    setPost(data);
    setLikeCount(data.likes.length);
    const alreadyCommented = data?.comments.find((el) => el.user === user._id);
    if (alreadyCommented) setAlreadyComment(true);
    else setAlreadyComment(false);

    if (data.caption.length < 80) setShowCaption(true);
  }, []);

  const socket = GetSocket();

  const handlePost = (i: string) => {
    if (isMobile) {
      setOpen(true);
      setId(i);
    } else {
      const payload = {
        open: true,
        id: i,
      };
      dispatch(openMask(payload));
    }
  };

  const handleLike = async () => {
    if (!post) return;
    try {
      const payload = {
        postId: post._id,
        like: !isLiked,
      };
      const { data } = await likePost(payload);
      const socketPayload = {
        attachment: post?.resources[0].url,
        post: post._id,
        type: "LIKE",
        receiver: post.userId._id,
        content: "",
      };
      if (data?.message === "Post Liked" && user._id !== post.userId._id) {
        setLikeCount((prev) => ++prev);
        socket.emit(NEW_NOTIFICATION, socketPayload);
      } else if (
        data?.message === "Post Unliked" &&
        user._id !== post.userId._id
      ) {
        setLikeCount((prev) => --prev);
        const payload = {
          post: {
            _id: post?._id,
            attachment: post?.resources[0].url,
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
    } catch (e) {
      return console.error(e);
    }
  };

  const handleShowLikes = (i: string) => {
    setShowLikes(true);
    setId(i);
  };
  return (
    <>
      {isMobile ? (
        <MoCommentBox
          post={data}
          open={open}
          setOpen={setOpen}
          id={id}
          setId={setId}
        />
      ) : undefined}
      <LikeMask open={showLikes} setOpen={setShowLikes} id={id} setId={setId} />
      <div className="post">
        <div className="post-header">
          <div onClick={() => navigate(`/${data.userId._id}`)}>
            <div>
              <img
                src={
                  data.userId.avatar.url !== Null
                    ? data.userId.avatar.url
                    : User
                }
                alt="user-ico"
              />
            </div>
            <div className="post-head-info">
              <span>
                {data.userId.name} • <b>{dateAgo(data.createdAt)}</b>{" "}
              </span>
              {/* <p>happyclub • Original audio</p> */}
            </div>
          </div>
          <MoreIcon />
        </div>
        <div className="post-content">
          <div className="post-resource">
            <PostCarousel data={data} />
          </div>
          <div className="like-share-section">
            <div>
              <span onClick={handleLike}>
                {isLiked ? <IoLikedIcon /> : <IoHeartOutline />}
              </span>
              <span onClick={() => handlePost(data._id)}>
                <IoCommentOutline />
              </span>
              <IoShareOutline width={24} height={24} />
            </div>
            <IoSavedPostOutline />
          </div>
          <b
            onClick={() =>
              likeCount ? handleShowLikes(data._id) : handleShowLikes(data._id)
            }
            style={{ cursor: "pointer" }}
          >
            {likeCount} likes
          </b>
          <div className="caption">
            <span>
              <b>{data.userId.name}</b>{" "}
              {showCaption
                ? toOriginalStr(data.caption)
                : toOriginalStr(formatCaption(data.caption))}
              {data.caption.length > 80 && !showCaption ? (
                <span
                  onClick={() => setShowCaption(true)}
                  className="show-caption"
                >
                  {" "}
                  ...more
                </span>
              ) : undefined}
            </span>
          </div>
          <div className="comments">
            {data.comments.length ? (
              <span onClick={() => handlePost(data._id)}>
                View all {data.comments.length} comments
              </span>
            ) : undefined}
            {!alreadyComment ? (
              <span onClick={() => handlePost(data._id)}>
                <input disabled type="text" placeholder="Add a comment..." />
              </span>
            ) : undefined}
          </div>
        </div>
      </div>
    </>
  );
};

export default RenderPost;

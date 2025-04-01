import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import User from "../../assets/images/user.png";
import { MainFooter } from "../../components/common/Footer";
import {
  IoComment,
  IoHeart,
  IoLayerFill,
  IoNoPostIco,
  IoPostSmallIco,
  MoreIcon,
} from "../../components/icon/Icons";
import Sidebar from "../../components/main/Sidebar";
import PostMask from "../../mask/PostMask";
import { useLazyOthersPostQuery } from "../../redux/api/post.api";
import {
  useLazyAlreadyRequestQuery,
  useLazyOtherProfileQuery,
  useSendRequestMutation,
} from "../../redux/api/user.api";
import { openMask } from "../../redux/slice/mask";
import { IPostType, IUserProfile, ResponseCommonType } from "../../types";
import { Null, toOriginalStr } from "../../utlis";
import { IRootState } from "../../redux/store";
import BigSpinner from "../../utils/loaders/BigSpinner";
import { useNavigate, useParams } from "react-router-dom";
import { resetSidebar } from "../../redux/slice/sidebar";
import { toast } from "../../utils/alert/Toast";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import Spinner from "../../utils/loaders/Spinner";
import MoHeader from "../../components/mobile/MoHeader";
import MoProfileHeader from "../../components/mobile/MoProfileHeader";
import UsersMask from "../../mask/UsersMask";

const PageProfile = () => {
  const [section, setSection] = useState<string>("POSTS");
  const [post, setPost] = useState<IPostType[]>([]);
  const [user, setUser] = useState<IUserProfile>();
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const [reqLoader, setRequestLoader] = useState<boolean>(false);
  const [reqStatus, setReqStatus] = useState<"PENDING" | "ACCEPTED" | "NOT">(
    "NOT"
  );
  const [reload, setReload] = useState<boolean>(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { refetch } = useSelector((state: IRootState) => state.refetch);
  const { user: self } = useSelector((state: IRootState) => state.user);
  const { open } = useSelector((state: IRootState) => state.mask);
  const isMobile = useSelector((state: IRootState) => state.mobile.open);
  const [showUsers, setShowUsers] = useState<boolean>(false);
  const [type, setType] = useState<"Follower" | "Following">("Follower");
  const [othersPost] = useLazyOthersPostQuery();
  const [trigger] = useLazyOtherProfileQuery();
  const [sendRequest] = useSendRequestMutation();
  const [alreadRequested] = useLazyAlreadyRequestQuery();
  const [imgLoaded, setImgLoaded] = useState<boolean[]>([]);

  useEffect(() => {
    if (id?.length !== 24) {
      return navigate("not-found");
    }
    const fetchPost = async () => {
      try {
        setLoading(true);
        const { data, error } = await othersPost({ page, id: id as string });
        if (data) {
          setPost(data.data);
          setTotalPages(totalPages);
          setLoading(false);
          setImgLoaded(new Array(data.data.length).fill(false));
        }
        if (error) {
          return navigate("not-found");
        }
      } catch {
        return setLoading(false);
      }
    };
    const fetchDetails = async () => {
      try {
        const { data } = await trigger(id as string);
        if (!data) {
          return;
        }
        return setUser(data.user);
      } catch (e) {
        return e;
      }
    };
    !open && fetchDetails();
    !open && fetchPost();
  }, [refetch, id, open]);

  useEffect(() => {
    dispatch(resetSidebar());
  }, [id]);

  useEffect(() => {
    const alreadySent = async () => {
      try {
        const { data } = await alreadRequested(id as string);
        if (data && data.message === "Already Sent") {
          return setReqStatus("PENDING");
        } else if (data && data?.message === "Already Friend") {
          setReqStatus("ACCEPTED");
        } else {
          setReqStatus("NOT");
        }
      } catch (e) {
        return e;
      }
    };
    alreadySent();
  }, [id, reload]);

  const handleImageLoad = (index: number) => {
    setImgLoaded((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  const handlePost = (i: string) => {
    if(isMobile){
      navigate(`/p/${i}`);
    }else{
      const payload = {
        open: true,
        id: i,
      };
      dispatch(openMask(payload));
    }
  };

  const handleRequest = async () => {
    try {
      setRequestLoader(true);
      const { error } = await sendRequest({ id: id as string });
      if (error) {
        return toast(
          ((error as FetchBaseQueryError).data as ResponseCommonType).message ||
            "Something went wrong!"
        );
      }
    } catch {
      return toast("Something went wrong!");
    } finally {
      reload ? setReload(false) : setReload(true);
      setRequestLoader(false);
    }
  };
  const handleShowUser = (type: "Follower" | "Following") => {
    setShowUsers(true);
    setType(type);
  };

  return (
    <div className="profile">
      <Sidebar />
      <UsersMask
        id={user?._id as string}
        type={type}
        open={showUsers}
        setOpen={setShowUsers}
      />
      {isMobile ? <MoHeader /> : undefined}
      <main className="profile-box">
        <div className="profile-header">
          <img
            src={user?.avatar.url !== Null ? user?.avatar.url : User}
            alt="user-ico"
          />
          <div>
            <div>
              <p style={{ width: "100%" }}>{user?.username}</p>
              <span>
                {id !== self?._id ? (
                  reqStatus === "NOT" ? (
                    <button className="follow-btn" onClick={handleRequest}>
                      {reqLoader ? <Spinner /> : "Follow"}
                    </button>
                  ) : reqStatus === "PENDING" ? (
                    <button>Requested</button>
                  ) : (
                    <button>Following</button>
                  )
                ) : undefined}
                <button>Message</button>
                <MoreIcon />
              </span>
            </div>
            {!isMobile ? (
              <>
                <div>
                  <span>
                    <b>{post.length}</b> posts
                  </span>
                  <span onClick={() => handleShowUser("Follower")}>
                    <b>{user?.followers.length}</b> followers
                  </span>
                  <span onClick={() => handleShowUser("Following")}>
                    <b>{user?.followings.length}</b> following
                  </span>
                </div>
                <div>
                  <b>{user?.name}</b>
                  <span className="bio-section">
                    {user?.bio === Null
                      ? ""
                      : user?.bio
                      ? toOriginalStr(user.bio).map((el, i) => (
                          <p key={i}>{el}</p>
                        ))
                      : undefined}
                  </span>
                </div>
              </>
            ) : undefined}
          </div>
        </div>
        {isMobile ? (
          <MoProfileHeader
            handleShowUser={handleShowUser}
            postNo={post.length}
            follower={user?.followers.length || 0}
            following={user?.followings.length || 0}
            bio={user?.bio || ''}
            name={user?.name || ''}
          />
        ) : undefined}
        <div className="profile-content-swap">
          <div className="slider"></div>
          <div>
            <p
              className={section === "POSTS" ? "active" : ""}
              onClick={(e) =>
                setSection(
                  (e.target as HTMLParagraphElement).textContent as string
                )
              }
            >
              <IoPostSmallIco />
              POSTS
            </p>
          </div>
        </div>
        {post.length && !loading ? (
          <div className="profile-content">
            {post.length
              ? post.map((el, i) => (
                  <div key={el._id} onClick={() => handlePost(el._id)}>
                    <div
                      className={`img-loader ${imgLoaded[i] ? "loaded" : ""}`}
                    >
                      <img
                        loading="lazy"
                        src={el.resources[0].url}
                        alt="post-ico"
                        onLoad={() => handleImageLoad(i)}
                      />
                    </div>
                    <div className="like-count">
                      <div>
                        <IoHeart />
                        {el.likes.length}
                      </div>
                      <div>
                        <IoComment />
                        {el.comments.length}
                      </div>
                    </div>
                    {el.resources.length > 1 ? <IoLayerFill /> : undefined}
                  </div>
                ))
              : undefined}
          </div>
        ) : !post.length && !loading ? (
          <div className="no-post-box">
            <IoNoPostIco />
            <h1>No Posts Yet</h1>
          </div>
        ) : (
          <div className="profile-spinner">
            <BigSpinner />
          </div>
        )}
        <MainFooter />
      </main>
      <PostMask />
    </div>
  );
};

export default PageProfile;

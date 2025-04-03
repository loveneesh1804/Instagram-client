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
  IoSavedOutline,
  IoSettingIco,
} from "../../components/icon/Icons";
import Sidebar from "../../components/main/Sidebar";
import PostMask from "../../mask/PostMask";
import { useLazyMyPostQuery } from "../../redux/api/post.api";
import { useLazyLogoutQuery, useLazyMyProfileQuery } from "../../redux/api/user.api";
import { openMask } from "../../redux/slice/mask";
import { login, logout } from "../../redux/slice/user.slice";
import { IPostType, IUserProfile } from "../../types";
import { Null, toOriginalStr, transformImage } from "../../utlis";
import { IRootState } from "../../redux/store";
import BigSpinner from "../../utils/loaders/BigSpinner";
import { useNavigate } from "react-router-dom";
import MoHeader from "../../components/mobile/MoHeader";
import MoProfileHeader from "../../components/mobile/MoProfileHeader";
import UsersMask from "../../mask/UsersMask";
import { LOGOUT } from "../../event";
import { resetMore } from "../../redux/slice/sidebar";

const Profile = () => {
  const [section, setSection] = useState<string>("POSTS");
  const [posts, setPosts] = useState<IPostType[]>([]);
  const [user, setUser] = useState<IUserProfile>();
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [imgLoaded, setImgLoaded] = useState<boolean[]>([]);
  const [showUsers, setShowUsers] = useState<boolean>(false);
  const [type, setType] = useState<"Follower" | "Following">("Follower");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { refetch } = useSelector((state: IRootState) => state.refetch);
  const { open } = useSelector((state: IRootState) => state.mask);
  const isMobile = useSelector((state: IRootState) => state.mobile.open);

  const [myPost] = useLazyMyPostQuery();
  const [trigger] = useLazyMyProfileQuery();

  useEffect(() => {
    const fetchMyPost = async () => {
      try {
        setLoading(true);
        const { data } = await myPost(page);
        if (data) {
          setPosts(data.data);
          setTotalPages(totalPages);
          setLoading(false);
          setImgLoaded(new Array(data.data.length).fill(false));
        }
      } catch {
        return setLoading(false);
      }
    };

    const fetchMyDetails = async () => {
      try {
        const { data } = await trigger("");
        if (!data) {
          return dispatch(logout());
        }
        setUser(data.user);
        return dispatch(login({ verified: true, user: data.user }));
      } catch (e) {
        return dispatch(logout());
      }
    };

    if (!open) {
      fetchMyDetails();
      fetchMyPost();
    }
  }, [refetch, open]);

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

  const handleShowUser = (type: "Follower" | "Following") => {
    setShowUsers(true);
    setType(type);
  };

  const [logoutQuery] = useLazyLogoutQuery();

  const handleLogout = async () => {
    const { isSuccess } = await logoutQuery("");
    if (isSuccess) {
      navigate("/login");
      dispatch({type: LOGOUT})
      return dispatch(resetMore());
    }
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
            src={user?.avatar.url !== Null ? transformImage(user?.avatar.url,300) : User}
            alt="user-ico"
          />
          <div>
            <div>
              <p>{user?.username}</p>
              <span className="dummy-class">
                <button onClick={() => navigate("/edit")}>Edit profile</button>
                <span tabIndex={1}><IoSettingIco /></span>
                <div className="logout-btn">
                  <span onClick={handleLogout}>Logout</span>
                </div>
              </span>
            </div>
            {!isMobile ? (
              <>
                <div>
                  <span>
                    <b>{posts.length}</b> posts
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
            postNo={posts.length}
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
            <p
              className={section === "SAVED" ? "active" : ""}
              onClick={(e) =>
                setSection(
                  (e.target as HTMLParagraphElement).textContent as string
                )
              }
            >
              <IoSavedOutline />
              SAVED
            </p>
          </div>
        </div>
        {posts.length && !loading ? (
          <div className="profile-content">
            {posts.map((el, index) => (
              <div key={el._id} onClick={() => handlePost(el._id)}>
                <div
                  className={`img-loader ${imgLoaded[index] ? "loaded" : ""}`}
                >
                  <img
                    loading="lazy"
                    src={el.resources[0].url}
                    alt="post-ico"
                    onLoad={() => handleImageLoad(index)}
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
            ))}
          </div>
        ) : !posts.length && !loading ? (
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

export default Profile;

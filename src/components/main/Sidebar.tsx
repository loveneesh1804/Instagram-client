import { useCallback, useEffect, useRef, useState } from "react";
import { IoLogo, IoMenu, IoMenuOutline, IoSavedOutline } from "../icon/Icons";
import { IMessageSocketType, LiProps } from "../../types";
import { useLocation, useNavigate } from "react-router-dom";
import { IoHomeOutline } from "../icon/Icons";
import { IoMessageOutline } from "../icon/Icons";
import { IoMessage } from "../icon/Icons";
import { IoHome } from "../icon/Icons";
import { IoSearchOutline } from "../icon/Icons";
import { IoSearch } from "../icon/Icons";
import { IoExplore } from "../icon/Icons";
import { IoExploreOutline } from "../icon/Icons";
import { IoHeart } from "../icon/Icons";
import { IoHeartOutline } from "../icon/Icons";
import { IoAdd } from "../icon/Icons";
import { useDispatch, useSelector } from "react-redux";
import {
  chats,
  more,
  notify,
  post,
  resetMore,
  resetSidebar,
  search,
} from "../../redux/slice/sidebar";
import { IRootState } from "../../redux/store";
import { IoLogo2 } from "../icon/Icons";
import { AnimatePresence, motion } from "framer-motion";
import Searchbar from "./Searchbar";
import Messagebar from "./Messagebar";
import Newpost from "./Newpost";
import User from "../../assets/images/user.png";
import { useLazyLogoutQuery } from "../../redux/api/user.api";
import { Null } from "../../utlis";
import { GetSocket } from "../../Socket";
import { LOGOUT, NEW_MESSAGE_NOTIFY, NEW_REQUEST } from "../../event";
import {
  newMsgNotification,
  newReqNotification,
  resetReqNotifications,
} from "../../redux/slice/notification";
import { useSocketEvents } from "../../hooks/useSocketEvent";

const Sidebar = () => {
  const location = useLocation();
  const state = useSelector((state: IRootState) => state.sidebar);
  const { user } = useSelector((state: IRootState) => state.user);
  const { id: chatId } = useSelector((state: IRootState) => state.chatId);

  const refDiv3 = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const [trigger] = useLazyLogoutQuery();
  const navigate = useNavigate();
  const socket = GetSocket();

  useEffect(()=>{
    if(!location.pathname.includes('message')){
      dispatch(resetSidebar());
    }
  },[location])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!refDiv3.current?.contains(e.target as HTMLElement)) {
        dispatch(resetMore());
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  },[]);

  useEffect(() => {
    if (location.pathname.includes("message")) dispatch(chats());
  }, []);

  const newRequestNotify = useCallback(() => {
    if(state.notify) return;
    dispatch(newReqNotification());
  }, [dispatch,state]);

  const newMessageNotify = useCallback(
    (data: { chatId: string,message: IMessageSocketType }) => {
      if (data.chatId === chatId) return;
      dispatch(newMsgNotification(data));
    },
    [dispatch, chatId]
  );

  const socketHandlers = {
    [NEW_REQUEST]: newRequestNotify,
    [NEW_MESSAGE_NOTIFY]: newMessageNotify,
  };

  useSocketEvents(socket, socketHandlers);

  const handleLogout = async () => {
    const { isSuccess } = await trigger("");
    if (isSuccess) {
      navigate("/login");
      dispatch({type: LOGOUT})
      return dispatch(resetMore());
    }
  };
  return (
    <>
      <div
        className="sidebar"
        style={{
          width: state.notify || state.search || state.chats ? "5.5%" : "16%",
          textAlign:
            state.notify || state.search || state.chats ? "center" : "left",
        }}
      >
        <span onClick={()=>navigate('/')}>
          {state.notify || state.search || state.chats ? <IoLogo2 /> : <IoLogo />}
        </span>
        <div className="navigate">
          <Li
            url="/"
            text="Home"
            location={location}
            active={<IoHome />}
            Icon={<IoHomeOutline />}
          />
          <Li
            url="/search"
            text="Search"
            location={location}
            active={<IoSearch />}
            Icon={<IoSearchOutline />}
          />
          <Li
            url="/explore"
            text="Explore"
            location={location}
            active={<IoExplore />}
            Icon={<IoExploreOutline />}
          />
          <Li
            url="/message"
            text="Message"
            location={location}
            active={<IoMessage />}
            Icon={<IoMessageOutline />}
          />
          <Li
            url="/notification"
            text="Notifications"
            location={location}
            active={<IoHeart />}
            Icon={<IoHeartOutline />}
          />
          <Li
            url="/add"
            text="Create"
            location={location}
            active={<IoAdd />}
            Icon={<IoAdd />}
          />
          <Li
            url="/profile"
            text="Profile"
            location={location}
            profile={user.avatar.url !== Null ? user.avatar.url : User}
          />
          <Li
            url="/menu"
            text="More"
            location={location}
            active={<IoMenu />}
            Icon={<IoMenuOutline />}
          />
        </div>
        {state.more && (
          <div ref={refDiv3} className="more-box">
            <div className="more">
              <div className="saved">
                <IoSavedOutline />
                <span>Saved</span>
              </div>
            </div>
            <section className="line"></section>
            <div className="list-more">
              <p>Switch Account</p>
            </div>
            <div onClick={handleLogout} className="list-more">
              <p>Logout</p>
            </div>
          </div>
        )}
      </div>
      <Searchbar />
      <Messagebar />
      <Newpost />
    </>
  );
};

export const Li = ({ url, text, location, Icon, active, profile }: LiProps) => {
  const isStyled: boolean = location.pathname === url;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const state = useSelector((state: IRootState) => state.sidebar);
  const isMobile = useSelector((state: IRootState) => state.mobile.open);

  const { reqCount, msgCount } = useSelector(
    (state: IRootState) => state.notification
  );

  const [isShrunk, setIsShrunk] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [hovered, setHovered] = useState(false);

  const totalMsg = msgCount.reduce((acc, el) => el.count + acc, 0);

  const handleMouseDown = () => {
    setIsShrunk(true);
  };

  const handleMouseUp = () => {
    setIsShrunk(false);
  };
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (hovered && (state.search || state.notify)) {
      timerRef.current = setTimeout(() => {
        setShowPopup(true);
      }, 1000);
    } else {
      setShowPopup(false);
      clearTimeout(timerRef.current);
    }

    return () => clearTimeout(timerRef.current);
  }, [hovered, state.search, state.notify]);

  const handleNavigate = () => {
    setShowPopup(false);
    switch (text) {
      case "Search":
        return dispatch(search());
      case "Notifications":
        dispatch(resetReqNotifications());
        return dispatch(notify());
      case "Create":
        return dispatch(post());
      case "More":
        return dispatch(more());
      case "Message":
        dispatch(chats());
        return navigate(url);
      default:
        dispatch(resetSidebar());
        return navigate(url);
    }
  };


  return (
    <>
      <div
        tabIndex={1}
        onClick={handleNavigate}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          border:
            (state.search && text === "Search") ||
            (state.notify && text === "Notifications")
              ? "1px solid #DBDBDB"
              : "",
        }}
      >
        <div className={`icon ${isShrunk ? "shrink" : ""}`}>
          {(isStyled && !state.search && !state.notify) ||
          (text === "Search" && state.search) ||
          (text === "Notifications" && state.notify) ||
          (text === "More" && state.more)
            ? active
            : Icon}
          {reqCount && text === "Notifications" ? (
            <span className="badge">{reqCount}</span>
          ) : totalMsg && text === "Message" ? (
            <span className="badge">{totalMsg}</span>
          ) : undefined}
          {profile ? (
            <img
              style={{
                border: isStyled ? "2px solid black" : "1px solid #efefef",
              }}
              className="profile-photo"
              src={profile}
              alt="user-ico"
            />
          ) : undefined}
        </div>
        {state.search || state.notify || state.chats ? undefined : (
          <span
            style={{
              fontWeight:
                isStyled || (text === "More" && state.more) ? "900" : "400",
            }}
          >
            {text}
          </span>
        )}
        {!isMobile ? <AnimatePresence>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: showPopup ? 1 : 0 }}
            exit={{ scale: 0 }}
            className="small-pop-up"
          >
            <div className="triangle"></div>
            <span>{text}</span>
          </motion.div>
        </AnimatePresence> : undefined}
      </div>
    </>
  );
};

export default Sidebar;

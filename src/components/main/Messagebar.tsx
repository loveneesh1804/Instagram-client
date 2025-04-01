import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import User from "../../assets/images/user.png";
import {
  useAcceptRequestMutation,
  useGetRequestsQuery,
  useLazyAlreadyRequestQuery,
} from "../../redux/api/user.api";
import { closeNotify } from "../../redux/slice/sidebar";
import { IRootState } from "../../redux/store";
import NotificationSkeletion from "../../utils/skeletons/NotificationSkeletion";
import { checkIsFriend, dateAgo, Null, transformImage } from "../../utlis";
import { useNavigate } from "react-router-dom";
import Spinner from "../../utils/loaders/Spinner";
import { addFriend } from "../../redux/slice/user.slice";
import { DELETE_NOTIFICATION, NEW_NOTIFICATION, REAL_TIME_REQUEST } from "../../event";
import { useSocketEvents } from "../../hooks/useSocketEvent";
import { GetSocket } from "../../Socket";
import { IFriendRequestType, INotification, SocketNotify } from "../../types";
import { useGetOtherNotificationsQuery } from "../../redux/api/temp.api";
import { deleteReqNotification } from "../../redux/slice/notification";
import { IoCloseOutline } from "../icon/Icons";

const Messagebar = () => {
  const [reqLoading, setReqLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotifications] = useState<INotification[]>([]);
  const [request, setRequests] = useState<IFriendRequestType[]>([]);
  
  const [requestedStatus, setRequestedStatus] = useState<{
    [key: string]: boolean;
  }>({});

  const state = useSelector((state: IRootState) => state.sidebar);
  const refDiv2 = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  const { data, isLoading, refetch } = useGetRequestsQuery("");
  const [acceptReq] = useAcceptRequestMutation();
  const [alreadRequested] = useLazyAlreadyRequestQuery();
  const { data: otherNotifications, refetch: otherRefetch } =
    useGetOtherNotificationsQuery("");
  const navigate = useNavigate();
  const socket = GetSocket();
  const { user } = useSelector((state: IRootState) => state.user);
  const isMobile = useSelector((state: IRootState) => state.mobile.open);

  useEffect(() => {
    refetch();
    otherRefetch();
    setLoading(true);
  }, [state]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!refDiv2.current?.contains(e.target as HTMLElement)) {
        dispatch(closeNotify());
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  useEffect(() => {
    setNotifications([]);
    setRequests([]);
  }, [state.notify]);


  const handleReq = async (reqId: string, accept: boolean, id: string = "") => {
    try {
      setReqLoading(true);
      const payload = { reqId, accept };
      await acceptReq(payload);
      if(!accept){
        setRequests(prev=>{
          if(!prev.length) return [];
          return prev.filter(el=>el._id!==reqId);
        })
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (id.length) dispatch(addFriend(id));
      setReqLoading(false);
    }
  };

  const alreadySent = async (id: string) => {
    try {
      const { data } = await alreadRequested(id);
      if (data && data.message === "Already Sent") {
        return true;
      } else if (data && data?.message === "Already Friend") {
        return false;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    const checkRequests = async () => {
      const statusMap: { [key: string]: boolean } = {};

      for (const el of data?.data || []) {
        const result = await alreadySent(el.sender._id);
        statusMap[el.sender._id] = result;
      }
      setRequestedStatus(statusMap);
    };

    if (data?.data) {
      checkRequests();
    }
  }, [data]);

  const newNotificationListner = useCallback(
    ({ message }: { message: INotification }) => {
      setNotifications((prev) => [...prev, message]);
    },
    [state]
  );

  const newRequestListner = useCallback(
    (data:IFriendRequestType) => {
      setRequests((prev) => [...prev, data]);
    },
    [state]
  );

  const deleteNotificationListner = useCallback(
    (message: SocketNotify) => {
      dispatch(deleteReqNotification());
      setNotifications((prev) => {
        if (!prev.length) return prev;
        const res = prev.filter(
          (el) =>
            el.post._id !== message.post._id &&
            el.type !== message.type &&
            el.receiver !== message.receiver
        );
        return res;
      });
    },
    [state]
  );

  const socketHandlers = {
    [NEW_NOTIFICATION]: newNotificationListner,
    [DELETE_NOTIFICATION]: deleteNotificationListner,
    [REAL_TIME_REQUEST] : newRequestListner
  };

  useSocketEvents(socket, socketHandlers);

  const handleNavigate = (id: string) => {
    navigate(`/${id}`);
  };

  const allNotification = [
    ...(otherNotifications?.notifications?.length
      ? otherNotifications.notifications
      : []),
    ...notification,
  ];

  const allRequest = [
    ...(data?.data?.length
      ? data.data
      : []),
    ...request,
  ];

  return (
    <div
      ref={refDiv2}
      className="notify"
      style={{
        width:
          state.notify && isMobile
            ? "100%"
            : state.notify && !isMobile
            ? "26%"
            : "0%",
        left: !state.notify ? "-10%" : "5.5%",
      }}
    >
      <div className="notify-top">
        <h1>Notifications</h1>
        {isMobile ? (
          <span
            onClick={() => dispatch(closeNotify())}
            className="mobile-search-close"
          >
            <IoCloseOutline />
          </span>
        ) : undefined}
      </div>

      {loading ? (
        <NotificationSkeletion />
      ) : (allRequest.length || allNotification.length) && !isLoading ? (
        <div className="notification-section">
          {allRequest.length ? allRequest.map((el) => (
            <div key={el._id} className="notification">
              <div onClick={()=>handleNavigate(el.sender._id)}>
                <img
                  src={
                    el.sender.avatar.url !== Null ? el.sender.avatar.url : User
                  }
                  alt=""
                />
                <span>
                  <b>{el.sender.name}</b> <br />
                  {el.status === "PENDING"
                    ? "requested to follow you."
                    : el.status === "ACCEPTED"
                    ? "started following you"
                    : " "}{" "}
                  <span>{dateAgo(el.updatedAt)}</span>
                </span>
              </div>
              {el.status === "PENDING" ? (
                <div className="btns">
                  <button
                    disabled={reqLoading}
                    onClick={() => handleReq(el._id, true, el.sender._id)}
                  >
                    {reqLoading ? <Spinner /> : "Confirm"}
                  </button>
                  <button
                    disabled={reqLoading}
                    onClick={() => handleReq(el._id, false)}
                  >
                    {reqLoading ? <Spinner /> : "Delete"}
                  </button>
                </div>
              ) : (
                <div className="btns">
                  {!checkIsFriend(user, el.sender._id) ? (
                    <button
                      style={{
                        backgroundColor: requestedStatus[el.sender._id]
                          ? "#efefef"
                          : "#0095f6",
                        color: requestedStatus[el.sender._id]
                          ? "black"
                          : "white",
                      }}
                      onClick={() => handleNavigate(el.sender._id)}
                    >
                      {requestedStatus[el.sender._id]
                        ? "Requested"
                        : "Follow Back"}
                    </button>
                  ) : undefined}
                </div>
              )}
            </div>
          )) : undefined}
          {allNotification.length
            ? allNotification.map((el) => (
                <div key={el._id} className="notification">
                  <div onClick={()=>handleNavigate(el.sender._id)}>
                    <img
                      src={
                        el.sender?.avatar.url !== Null
                          ? el.sender?.avatar.url
                          : User
                      }
                      alt=""
                    />
                    <span>
                      <b>{el.sender.name}</b>
                      {el.type === "LIKE"
                        ? " liked your post."
                        : el.type === "COMMENT"
                        ? ` commented on your post:`
                        : ""}{" "}
                      {el.content.length ? <b>{el.content} </b> : undefined}
                      <span>{dateAgo(el.createdAt)}</span>
                    </span>
                  </div>
                  <img
                    className="thumbnail"
                    src={transformImage(el.post.attachment, 100)}
                    alt="post-thumbnail"
                    onClick={()=>handleNavigate(`p/${el.post._id}`)}
                  />
                </div>
              ))
            : undefined}
        </div>
      ) : isLoading ? (
        <NotificationSkeletion />
      ) : (
        <div className="recent-search">
          <span>No recent notifications.</span>
        </div>
      )}
    </div>
  );
};

export default Messagebar;

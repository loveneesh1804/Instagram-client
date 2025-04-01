import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import User from "../../assets/images/user.png";
import RenderMessage from "../../components/common/RenderMessage";
import {
  IoGoBack,
  IoNoMessageIco,
  IoSendMessageOutline,
} from "../../components/icon/Icons";
import Sidebar from "../../components/main/Sidebar";
import UserChats from "../../components/main/UserChats";
import { LAST_MSG } from "../../event";
import { useSocketEvents } from "../../hooks/useSocketEvent";
import ChatMask from "../../mask/ChatMask";
import {
  useDeleteChatMutation,
  useMyChatsQuery,
} from "../../redux/api/chat.api";
import { closeChatMask, openChatMask } from "../../redux/slice/chatmask";
import { IRootState } from "../../redux/store";
import { GetSocket } from "../../Socket";
import { IMessageSocketType, IMyChats, IRealTimeMsg } from "../../types";
import { formatGroupMemberName, Null } from "../../utlis";
import { useNavigate } from "react-router-dom";

const Chats = () => {
  useEffect(() => {
    document.title = "Inbox • Chats";
  }, []);

  const [selected, setSelected] = useState<boolean>(false);
  const { users } = useSelector((state: IRootState) => state.chatMask);

  const [selectedUser, setSelectedUser] = useState<string>("");
  const [chatData, setChatData] = useState<IMyChats>();
  const [chat, setChat] = useState<IMyChats[]>([]);
  const [lastMessage, setLastMessage] = useState<IMessageSocketType[]>([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socket = GetSocket();

  useEffect(() => {
    users.length && setSelected(true);
  }, [users]);

  const { data, refetch } = useMyChatsQuery("");
  const [deleteChat] = useDeleteChatMutation();
  const { user } = useSelector((state: IRootState) => state.user);
  const { msgCount } = useSelector((state: IRootState) => state.notification);
  const isMobile = useSelector((state: IRootState) => state.mobile.open);

  const [showChatsInfo, setShowChatsInfo] = useState<boolean>(false);

  const lastMessageListner = useCallback((msg: IRealTimeMsg) => {
    const { message } = msg;
    setLastMessage((prev) => {
      if (!prev.length) return [message];
      const filtered = prev.filter((el) => el.chatId !== message.chatId);
      return [...filtered, message];
    });
    refetch();
  }, []);

  useEffect(() => {
    if (data?.chats?.length) {
      const sortedChats = [...data.chats].sort((a, b) => {
        const dateA = new Date(a.lastMessage.createdAt || 0);
        const dateB = new Date(b.lastMessage.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
      setChat(sortedChats);
    }
  }, [data, lastMessage]);

  const socketListner = {
    [LAST_MSG]: lastMessageListner,
  };
  useSocketEvents(socket, socketListner);

  const handleSelectChat = (el: IMyChats) => {
    if (!selected) {
      setSelected(true);
      setChatData(el);
      return setSelectedUser(el._id);
    }
    setChatData(el);
    return setSelectedUser(el._id);
  };

  const getNewMsgCount = (id: string) => {
    const indx = msgCount.findIndex((el) => el.chatId === id);
    return msgCount[indx].count;
  };

  const getNewMsg = (id: string) => {
    const indx = msgCount.findIndex((el) => el.chatId === id);
    return msgCount[indx].message;
  };

  const handleDeleteChat = async () => {
    if (!chatData) return;
    try {
      const { error } = await deleteChat(chatData._id);
      if (!error) {
        refetch();
        setSelectedUser("");
        return setSelected(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="chats">
        {!isMobile || (isMobile && !selected) ? <Sidebar /> : undefined}
        <div
          className="message-box"
          style={{
            width:
              showChatsInfo && !isMobile
                ? "84%"
                : showChatsInfo && isMobile
                ? "0%"
                : !showChatsInfo && isMobile
                ? "100%"
                : "94.5%",
          }}
        >
          {(isMobile && !selected) || !isMobile ? (
            <div
              className="chats-ppl"
              style={{ width: showChatsInfo ? "35.2%" : "27.9%" }}
            >
              <div className="chat-ppl-head">
                {isMobile ? (
                  <span>
                    <IoGoBack />
                  </span>
                ) : undefined}
                <h1>{user.name}</h1>
                <span onClick={() => dispatch(openChatMask([]))}>
                  <IoSendMessageOutline />
                </span>
              </div>
              <div className="chat-msg-box">
                <img
                  src={user.avatar.url !== Null ? user.avatar.url : User}
                  alt="user-ico"
                />
                <h4>Messages</h4>
                <div className="main-msg-box">
                  {chat?.length ? (
                    chat.map((el) => (
                      <div
                        onClick={() => handleSelectChat(el)}
                        className="msg-user"
                        key={el._id}
                      >
                        {el.groupChats ? (
                          <div className="group-avatar">
                            {el.avatar.map((el) => (
                              <img
                                key={el}
                                src={el !== Null ? el : User}
                                alt="avatar"
                              />
                            ))}
                          </div>
                        ) : (
                          <img
                            src={el?.avatar[0] !== Null ? el?.avatar[0] : User}
                            alt="user-ico"
                          />
                        )}
                        <div>
                          <b>
                            {!el?.groupChats && el.groupName !== null
                              ? el?.groupName
                              : formatGroupMemberName(el.groupMembers)}
                          </b>
                          {msgCount.find(
                            (e) => e.chatId === el._id && e.count > 1
                          ) ? (
                            <span className="new-unseen-msg">
                              {getNewMsgCount(el._id)} New Messages
                            </span>
                          ) : msgCount.find(
                              (e) => e.chatId === el._id && e.count === 1
                            ) ? (
                            <span className="new-unseen-msg">
                              <RenderMessage el={getNewMsg(el._id)} />
                            </span>
                          ) : !lastMessage.find((e) => e.chatId === el._id) ? (
                            <RenderMessage el={el.lastMessage} />
                          ) : (
                            <RenderMessage
                              el={
                                lastMessage.find(
                                  (e) => e.chatId === el._id
                                ) as IMessageSocketType
                              }
                            />
                          )}
                        </div>
                        {msgCount.find((e) => e.chatId === el._id) ? (
                          <span className="unseen-msg"></span>
                        ) : undefined}
                      </div>
                    ))
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>
            </div>
          ) : undefined}
          {(isMobile && selected) || !isMobile ? (
            <div
              className="message"
              style={{
                width:
                  showChatsInfo && !isMobile
                    ? "64.8%"
                    : !showChatsInfo && !isMobile
                    ? "72.1%"
                    : showChatsInfo && isMobile
                    ? "0%"
                    : "100%",
              }}
            >
              {!selected ? (
                <div className="no-usr-selected">
                  <IoNoMessageIco />
                  <h3>Your Messages</h3>
                  <span>Send a message to start a chat.</span>
                  <button onClick={() => dispatch(openChatMask([]))}>
                    Send message
                  </button>
                </div>
              ) : (
                <UserChats
                  chatId={selectedUser}
                  chatData={chatData as IMyChats}
                  showChatsInfo={showChatsInfo}
                  setShowChatsInfo={setShowChatsInfo}
                  setSelected={setSelected}
                />
              )}
            </div>
          ) : undefined}
        </div>
        <div
          className="chats-info"
          style={{
            width:
              showChatsInfo && !isMobile
                ? "22%"
                : showChatsInfo && isMobile
                ? "100%"
                : "0",
          }}
        >
          <div className="chat-info-header">
            {isMobile ? (
              <span onClick={() => setShowChatsInfo(false)}>
                <IoGoBack />
              </span>
            ) : undefined}
            <h2>Details</h2>
          </div>
          <div className="chat-info-members">
            <h3>Members</h3>
            <div className="members-info-section">
              {chatData?.groupMembers.length
                ? chatData.groupMembers.map((el) => (
                    <div onClick={() => navigate(`/${el._id}`)} key={el._id}>
                      <img
                        src={el.avatar.url !== Null ? el.avatar.url : User}
                        alt="profile-ico"
                      />
                      <div>
                        <b>{el.name}</b>
                        <span>{el.username}</span>
                      </div>
                    </div>
                  ))
                : undefined}
            </div>
          </div>
          <p onClick={handleDeleteChat}>Delete Chat</p>
        </div>
      </div>
      <ChatMask />
    </>
  );
};

export default Chats;

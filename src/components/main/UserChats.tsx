import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import User from "../../assets/images/user.png";
import {
  IoAttachmentOutline,
  IoEmojiOutline,
  IoGoBack,
  IoHeartOutline,
  IoInfoFill,
  IoInfoOutline,
} from "../icon/Icons";
import {
  useGetAllMessagesQuery,
  useGetChatDetailsQuery,
  useSendFilesMutation,
} from "../../redux/api/chat.api";
import { GetSocket } from "../../Socket";
import { DELETE_MSG, NEW_MSG, START_TYPING, STOP_TYPING } from "../../event";
import {
  IMessageSocketType,
  IMyChats,
  IRealTimeMsg,
  PreviewFile,
} from "../../types";
import { formatGroupMemberName, generateFakerMsg, Null } from "../../utlis";
import Message from "./Message";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../../redux/store";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import ChatLoader from "../../utils/loaders/ChatLoader";
import { toast } from "../../utils/alert/Toast";
import { resetMsg } from "../../redux/slice/uploadingMsg";
import { v4 as uuid } from "uuid";
import { removeMsgNotification } from "../../redux/slice/notification";
import { useSocketEvents } from "../../hooks/useSocketEvent";
import { addChatId } from "../../redux/slice/chatId";
import TypingLoader from "../../utils/loaders/TypingLoader";
import { useNavigate } from "react-router-dom";

const UserChats = ({
  chatId,
  chatData,
  showChatsInfo,
  setShowChatsInfo,
  setSelected,
}: {
  chatId: string;
  chatData: IMyChats;
  showChatsInfo: boolean;
  setShowChatsInfo: React.Dispatch<React.SetStateAction<boolean>>;
  setSelected: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [message, setMessage] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [typing, setTyping] = useState<boolean>(false);
  const [userTyping, setUserTyping] = useState<boolean>(false);

  const [messages, setMessages] = useState<IMessageSocketType[]>([]);
  const [allMessages, setAllMessages] = useState<IMessageSocketType[]>([]);
  const [delMsg, setDelMsg] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeRef = useRef<NodeJS.Timeout>();

  const { isLoading, data } = useGetChatDetailsQuery({
    chatId,
    populate: false,
  });

  const { data: dbMsg, isFetching } = useGetAllMessagesQuery({
    chatId,
    page,
  });

  const [sendFiles] = useSendFilesMutation();

  const { user } = useSelector((state: IRootState) => state.user);
  const isMobile = useSelector((state: IRootState) => state.mobile.open);

  const socket = GetSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if(!chatId.length || !chatData) return setSelected(false);
    dispatch(addChatId(chatId));
    dispatch(removeMsgNotification({ chatId }));

    return () => {
      setShowChatsInfo(false);
      setData([]);
      setMessages([]);
      setMessage("");
      setPage(1);
      dispatch(resetMsg());
    };
  }, [chatId]);

  const handleSend = () => {
    if (!message.trim().length) return;

    const members = data?.chat?.groupMembers;
    socket.emit(NEW_MSG, { message, chatId, groupMembers: members });
    setMessage("");
  };

  const newMessageListner = useCallback(
    (msg: IRealTimeMsg) => {
      if (chatId !== msg.chatId) return;

      setMessages((prevMessages) => {
        const existIndx = prevMessages.findIndex(
          (el) => el._id === msg.message._id
        );

        if (existIndx !== -1) {
          const updatedMessages = [...prevMessages];
          updatedMessages[existIndx] = msg.message;
          return updatedMessages;
        } else {
          return [...prevMessages, msg.message];
        }
      });
    },
    [chatId]
  );

  const typingListner = useCallback(
    (data: { chatId: string }) => {
      if (data.chatId !== chatId) return;
      setUserTyping(true);
    },
    [chatId]
  );

  const stopTypingListner = useCallback(
    (data: { chatId: string }) => {
      if (data.chatId !== chatId) return;
      setUserTyping(false);
    },
    [chatId]
  );

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const { data: dbMessages, setData } = useInfiniteScroll<IMessageSocketType>({
    containerRef: containerRef,
    page,
    setPage,
    totalPage: dbMsg?.pages,
    messages: dbMsg?.data,
  });

  const handleNavigate = (id: string) => {
    navigate(`/${id}`);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    if (!typing) {
      socket.emit(START_TYPING, { chatId, members: data?.chat?.groupMembers });
      setTyping(true);
    }

    if (typingTimeRef.current) clearTimeout(typingTimeRef.current);

    typingTimeRef.current = setTimeout(() => {
      socket.emit(STOP_TYPING, { chatId, members: data?.chat?.groupMembers });
      setTyping(false);
    }, 3000);
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files as FileList;
    if (!files?.length) return;

    if (files.length > 10) {
      return toast("Only 10 Files can be sent at a time");
    }
    try {
      const payload = new FormData();
      const _id = uuid();
      payload.append("chatId", chatId);
      payload.append("_id", _id);

      const uploadingDataPayload: PreviewFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const data = files[i];
        const dataType = data.type.split("/")[0];
        if (data.size < 1024 * 1024 * 10) {
          payload.append("files", data);
          uploadingDataPayload.push({
            name: data.name,
            url: URL.createObjectURL(data),
            type: dataType,
          });
        } else {
          return toast(`${data.name} is too large.`);
        }
      }

      if (uploadingDataPayload.length) {
        const pending = generateFakerMsg(uploadingDataPayload, user._id, _id);
        setMessages((prev) => [...prev, pending]);
      }
      const { error } = await sendFiles(payload);
      if (error) return toast("Something went wrong!");
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setAllMessages(() => {
      const mergedMessages = [...dbMessages, ...messages];

      const filteredMessages = mergedMessages.filter(
        (el) => !delMsg.includes(el._id)
      );

      filteredMessages.sort((a, b) => {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });

      return filteredMessages;
    });
  }, [dbMessages, messages, delMsg]);

  const deleteMsgListner = useCallback(
    (msg: { id: string }) => {
      const indx = messages.findIndex((el) => el._id === msg.id);
      if (indx !== -1) {
        setMessages((prev) => prev.filter((el, i) => i !== indx));
      } else {
        setAllMessages((prev) => prev.filter((el) => el._id !== msg.id));
        setDelMsg((prev) => [...prev, msg.id]);
      }
    },
    [chatId, allMessages, messages]
  );

  const socketHandlers = {
    [NEW_MSG]: newMessageListner,
    [START_TYPING]: typingListner,
    [STOP_TYPING]: stopTypingListner,
    [DELETE_MSG]: deleteMsgListner,
  };

  useSocketEvents(socket, socketHandlers);

  return chatData ? (
    <main className="user-chat">
      <div className="user-chat-header">
        <div>
          {isMobile ? (
            <span onClick={() => setSelected(false)}>
              <IoGoBack />
            </span>
          ) : undefined}
          <div
            onClick={() =>
              handleNavigate(
                chatData.groupMembers.filter((el) => el._id !== user._id)[0]._id
              )
            }
          >
            {chatData?.groupChats ? (
              <div className="group-avatar">
                {chatData.avatar.map((el) => (
                  <img src={el !== Null ? el : User} key={el} alt="group-ico" />
                ))}
              </div>
            ) : (
              <img
                src={chatData?.avatar[0] !== Null ? chatData?.avatar[0] : User}
                alt="user-ico"
              />
            )}
            <p>
              {chatData?.groupName !== Null
                ? chatData.groupName
                : formatGroupMemberName(chatData.groupMembers)}
            </p>
          </div>
        </div>
        <span
          onClick={() => setShowChatsInfo((prev) => !prev)}
          className="show-chats-info-btn"
        >
          {showChatsInfo ? <IoInfoFill /> : <IoInfoOutline />}
        </span>
      </div>
      {isLoading ? (
        <div className="dummy">
          <ChatLoader />
        </div>
      ) : (
        <div className="user-msg-section">
          <div className="main-msg-section" ref={containerRef}>
            {allMessages.length
              ? allMessages.map((el) => (
                  <Message user={user} message={el} key={el._id} />
                ))
              : undefined}
            {userTyping ? <TypingLoader /> : undefined}
            {allMessages.length ? <div ref={bottomRef} /> : undefined}
          </div>
          {isFetching ? <ChatLoader /> : undefined}
          {(page === (dbMsg?.pages || 1) &&
            !isFetching &&
            allMessages.length) ||
          (!isFetching && !allMessages.length) ? (
            <div className="user-msg-header">
              {!chatData.groupChats ? (
                <img
                  src={
                    chatData?.avatar[0] !== Null ? chatData?.avatar[0] : User
                  }
                  alt="user-ico"
                />
              ) : (
                <div className="group-avatar-header">
                  {chatData.avatar.map((el) => (
                    <img
                      key={el}
                      src={el !== Null ? el : User}
                      alt="group-ico"
                    />
                  ))}
                </div>
              )}
              <p>
                {chatData?.groupName !== Null
                  ? chatData.groupName
                  : formatGroupMemberName(chatData.groupMembers)}{" "}
                · Instagram
              </p>
              {chatData.groupChats ? undefined : (
                <button
                  onClick={() =>
                    handleNavigate(
                      chatData.groupMembers.filter(
                        (el) => el._id !== user._id
                      )[0]._id
                    )
                  }
                >
                  View profile
                </button>
              )}
            </div>
          ) : undefined}
        </div>
      )}
      <div className="send-msg-input">
        <div>
          <IoEmojiOutline />
          <input
            value={message}
            onChange={handleMessageChange}
            type="text"
            placeholder="Message..."
          />
          {message.length ? (
            <span onClick={handleSend} className="send-btn">
              Send
            </span>
          ) : (
            <>
              <IoHeartOutline />
              <div className="send-file">
                <input
                  type="file"
                  multiple
                  onChange={handleFiles}
                  accept="image/png, image/jpeg, image/gif, images/jpg, video/mp4, video/ogg, video/webm "
                />
                <IoAttachmentOutline />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  ) : (
    <div></div>
  );
};

export default UserChats;

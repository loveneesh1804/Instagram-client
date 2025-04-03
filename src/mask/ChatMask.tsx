import React, { useEffect, useState } from "react";
import { IoCloseOutline } from "../components/icon/Icons";
import { useLazySearchQuery } from "../redux/api/user.api";
import { useDebouncer } from "../hooks/useDobuncer";
import { ISearchUsersResponse } from "../types";
import { Null } from "../utlis";
import User from "../assets/images/user.png";
import ChatResSkel from "../utils/skeletons/ChatResSkel";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../redux/store";
import { closeChatMask } from "../redux/slice/chatmask";
import { useNewChatMutation } from "../redux/api/chat.api";

const ChatMask = () => {
  //States
  const [search, setSearch] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<ISearchUsersResponse[]>([]);

  //Redux
  const data = useSelector((state: IRootState) => state.chatMask);
  const dispatch = useDispatch();
  const [trigger] = useNewChatMutation();

  //Handlers
  const handleOutside = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if ((e.target as HTMLDivElement).className === "chat-mask-box") {
      setSearch("");
      dispatch(closeChatMask([]));
    }
  };
  const handleSelectUser = (id: string) => {
    selectedUser.includes(id)
      ? setSelectedUser(selectedUser.filter((el) => el !== id))
      : setSelectedUser((prev) => [...prev, id]);
  };
  const handleChat = async () => {
    if (!selectedUser.length) return;

    try {
      const payload = {
        members: selectedUser,
      };
      const { data } = await trigger(payload);
      if (data?.success) {
        dispatch(
          closeChatMask({
            users: selectedUser,
            chatId: data.chatId,
            chat: data.chat,
          })
        );
        setSearch("");
        return setSelectedUser([]);
      }
    } catch (e) {
      return e;
    }
  };

  //Hooks
  const [searchUsers] = useLazySearchQuery();
  const mainSearch = useDebouncer(search);

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      try {
        if (mainSearch.length) {
          const { data } = await searchUsers(mainSearch);
          if (data?.data.length) {
            setLoading(false);
            return setUsers(data.data);
          } else {
            setUsers([]);
            return setLoading(false);
          }
        }
      } catch {
        setLoading(false);
        return setUsers([]);
      }
    };
    getUsers();
  }, [mainSearch]);

  return (
    <div
      className="chat-mask-box"
      style={{ visibility: data.visible ? "visible" : "hidden" }}
      onClick={handleOutside}
    >
      <div className="chat-mask">
        <div className="chat-mask-header">
          <p>New message</p>
          <span onClick={() => dispatch(closeChatMask([]))}>
            <IoCloseOutline />
          </span>
        </div>
        <div className="chat-sender-bar">
          <p>To:</p>
          <input
            autoFocus
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="chat-search-result">
          {!search.length ? (
            <div className="suggested">
              <p>Suggested</p>
            </div>
          ) : (
            <div className="searched-result">
              {users.length && !loading ? (
                users.map((el) => (
                  <div
                    className="search-res"
                    key={el._id}
                    onClick={() => handleSelectUser(el._id)}
                  >
                    <div className="res-user-info">
                      <img
                        src={el.avatar.url !== Null ? el.avatar.url : User}
                        alt="user-ico"
                      />
                      <p>{el.name}</p>
                    </div>
                    <div
                      className={
                        selectedUser.includes(el._id)
                          ? "checkbox tick"
                          : "checkbox"
                      }
                    ></div>
                  </div>
                ))
              ) : !loading && !users.length ? (
                <p>No account found.</p>
              ) : (
                <ChatResSkel />
              )}
            </div>
          )}
        </div>
        <div className="chat-mask-btn">
          <button
            onClick={handleChat}
            disabled={selectedUser.length ? false : true}
          >
            Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatMask;

import { useEffect } from "react";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";

import { useDispatch, useSelector } from "react-redux";
import { getMyChatPartners, setSelectedUser } from "../store/chatStore";

function ChatsList() {
  const dispatch = useDispatch();

  const chats = useSelector((state) => state.chat.chats);
  const isUsersLoading = useSelector((state) => state.chat.isUsersLoading);
  // const setSelectedUser = useDispatch((state) => state.chat.setSelectedUser);
  // const getMyChatPartners = useDispatch((state) => state.chat.getMyChatPartners);
  const onlineUsers = useSelector((state) => state.auth.onlineUsers);

  useEffect(() => {
    dispatch(getMyChatPartners());
  }, [dispatch]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => (
        <div
          key={chat._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => dispatch(setSelectedUser(chat))}
        >
          <div className="flex items-center gap-3">
            <div
              className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}
            >
              <div className="size-12 rounded-full">
                <img
                  src={chat.profilePicture || "/avatar.png"}
                  alt={chat.fullName}
                />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">
              {chat.fullName}
            </h4>
          </div>
        </div>
      ))}
    </>
  );
}
export default ChatsList;

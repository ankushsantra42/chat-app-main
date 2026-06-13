import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import { useDispatch, useSelector } from "react-redux";
import { getMessagesByUserId, receiveNewMessage } from "../store/chatStore";
import { setOnlineUsers } from "../store/authStore";


function ChatContainer() {
  // const {
  //   selectedUser,
  //   getMessagesByUserId,
  //   messages,
  //   isMessagesLoading,
  //   subscribeToMessages,
  //   unsubscribeFromMessages,
  // } = useChatStore();


  const selectedUser = useSelector((state) => state.chat.selectedUser);
  // const getMessagesByUserId = useDispatch((state) => state.chat.getMessagesByUserId);
  const messages = useSelector((state) => state.chat.messages);
  const isMessagesLoading = useSelector((state) => state.chat.isMessagesLoading);
  // const subscribeToMessages = useDispatch((state) => state.chat.subscribeToMessages);
  // const unsubscribeFromMessages = useDispatch((state) => state.chat.unsubscribeFromMessages);
  const authUser = useSelector((state) => state.auth.authUser);
  const socket = useSelector((state) => state.auth.socket);
  const dispatch = useDispatch();

  console.log(selectedUser, "selectedUser");
  console.log(authUser, "authUser");
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("getOnlineUsers", (userIds) => {
      dispatch(setOnlineUsers(userIds));
      
      
    });

    return () => {
      socket.off("getOnlineUsers");
    };
  }, [socket, dispatch]);

  useEffect(() => {
    dispatch(getMessagesByUserId(selectedUser._id));  
    // subscribeToMessages();

    // clean up
    // return () => unsubscribeFromMessages();
  }, [
    selectedUser,
    dispatch
    // subscribeToMessages,
    // unsubscribeFromMessages,
  ]);

  

  useEffect(() => {
    // If socket isn't alive or no user is clicked yet, skip setting listeners
    if (!socket || !selectedUser) return;

    // Listen to real-time events incoming
    socket.on("newMessage", (newMessage) => {
      dispatch(receiveNewMessage(newMessage));
    });

    // Cleanup handles 'unsubscribeFromMessages' automatically when user switches or exits chat
    return () => {
      socket.off("newMessage");
    };
  }, [socket, selectedUser, dispatch]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-8">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${msg.senderId === authUser.id ? "chat-end" : "chat-start"}`}
              >
                <div
                  className={`chat-bubble relative ${
                    msg.senderId === authUser.id
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Shared"
                      className="rounded-lg h-48 object-cover"
                    />
                  )}
                  {msg.text && <p className="mt-2">{msg.text}</p>}
                  <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {/* 👇 scroll target */}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput />
    </>
  );
}

export default ChatContainer;

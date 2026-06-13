// import React from 'react'

// export default function Chat() {
//   return (
//     <div>Chat</div>
//   )
// }

import { useChatStore } from "../store/useChatStore";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import {useDispatch, useSelector} from 'react-redux'
import { useEffect } from "react";
import { receiveNewMessage } from "../store/chatStore";
import { setOnlineUsers } from "../store/authStore";

function Chat() {
  // const { activeTab, selectedUser } = useChatStore();

  const dispatch = useDispatch();
  const socket = useSelector((state) => state.auth.socket);
  const selectedUser = useSelector((state) => state.chat.selectedUser);
  const activeTab = useSelector((state) => state.chat.activeTab);


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

 

  console.log(selectedUser, "selectedUser");
  



  return (
    /* <div className="relative w-full max-w-6xl h-[800px]"> */
    <div className="relative w-full max-w-6xl h-[calc(100vh-64px)] max-h-[800px]">
      <BorderAnimatedContainer>
        {/* LEFT SIDE */}
        <div className="w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col">
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm">
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}
export default Chat;
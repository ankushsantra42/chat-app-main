import { XIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../store/chatStore";


function ChatHeader() {
  // const { selectedUser, setSelectedUser } = useChatStore();
  // const { onlineUsers } = useAuthStore();
  const selectedUser = useSelector((state)=>state.chat.selectedUser);
  const onlineUsers = useSelector((state)=>state.auth.onlineUsers);
  const dispatch = useDispatch();
  // const setSelectedUser = (user) => dispatch(setSelectedUser(user));

  const isOnline = onlineUsers.includes(selectedUser._id);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") dispatch(setSelectedUser(null));
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [dispatch]);

  return (
    /* <div className="flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 max-h-[84px] px-6 flex-1"> */
    <div className="flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 max-h-[72px] px-4 flex-1">
      <div className="flex items-center space-x-3">
        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="w-12 rounded-full">
            <img
              src={selectedUser.profilePicture || "/avatar.png"}
              alt={selectedUser.fullName}
            />
          </div>
        </div>

        <div>
          <h3 className="text-slate-200 font-medium">
            {selectedUser.fullName}
          </h3>
          <p className="text-slate-400 text-sm">
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <button onClick={() => dispatch(setSelectedUser(null))}>
        <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
      </button>
    </div>
  );
}
export default ChatHeader;

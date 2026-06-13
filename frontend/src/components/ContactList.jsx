import { useEffect } from "react";
// import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
// import { useAuthStore } from "../store/useAuthStore";
import { useDispatch, useSelector } from "react-redux";
import { getAllContacts } from "../store/chatStore";
import { setSelectedUser } from "../store/chatStore";

function ContactList() {
  // const { getAllContacts, allContacts, setSelectedUser, isUsersLoading } = useChatStore();
  // const { onlineUsers } = useAuthStore();
  const dispatch = useDispatch();

  const allContacts = useSelector((state) => state.chat.allContacts);
  const isUsersLoading = useSelector((state) => state.chat.isUsersLoading);
  const onlineUsers = useSelector((state) => state.auth.onlineUsers);
  // const setSelectedUser = (user) => dispatch({ type: "SET_SELECTED_USER", payload: user });

  useEffect(() => {
    dispatch(getAllContacts());
  }, [dispatch]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      {allContacts.map((contact) => (
        <div
          key={contact._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => dispatch(setSelectedUser(contact))}
        >
          <div className="flex items-center gap-3">
            <div
              className={`avatar ${onlineUsers.includes(contact._id) ? "online" : "offline"}`}
            >
              <div className="size-12 rounded-full">
                <img src={contact.profilePicture || "/avatar.png"} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium">{contact.fullName}</h4>
          </div>
        </div>
      ))}
    </>
  );
}
export default ContactList;

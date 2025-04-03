import React, { useEffect } from "react";
import ChatSidebar from "../component/ChatSidebar";
import NoChatSelected from "../component/NoChatSelected";
import ChatContainer from "../component/ChatContainer";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { setSelectedUser } from "../redux/user/userSlice";

export default function Chat() {
  const location = useLocation()
  const dispatch = useDispatch()
  const { selectedUser } = useSelector((state) => state.user)
  useEffect(() => {
    dispatch(setSelectedUser(null))
  }, [location.search])

  return (
    <div className="h-[calc(100vh-70px)] top-[65px] bg-base-200">
      <div className="h-full p-2">
        <div className="bg-base-100 rounded-lg shadow-lg h-full">
          <div className="flex h-full rounded-lg overflow-hidden">
            <div className={`${selectedUser ? 'w-0' : 'w-full' } sm:w-60 md:w-72 border-r border-base-300 flex-shrink-0 h-full overflow-hidden`}>
              <ChatSidebar />
            </div>
            <div className="flex-1 h-full overflow-hidden">
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

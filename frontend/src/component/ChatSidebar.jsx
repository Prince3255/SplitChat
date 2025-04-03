import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetail } from "../util/fetchUserDetail.js";
import { TextInput } from "flowbite-react";
import { AiOutlineSearch } from "react-icons/ai";
import { setSelectedUser } from "../redux/user/userSlice.js";
import SidebarSkeleton from "./skeleton/SidebarSkeleton.jsx";
import { fetchGroupDetail } from "../util/fetchGroupDetail.js";
import { getSocket } from "../util/socketAction.js";

export default function ChatSidebar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUser, setFilteredUser] = useState([]);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const {
    data: userData,
    isLoading: userLoading,
    isError: userError,
    error: userErrorMessage,
  } = useQuery({
    queryKey: ["userDetail", user?.currentUser?._id],
    queryFn: fetchUserDetail,
  });

  const {
    data: groupData,
    isLoading: groupLoading,
    isError: groupError,
    error: groupErrorMessage,
  } = useQuery({
    queryKey: ["groupDetail", user?.currentUser?._id],
    queryFn: fetchGroupDetail,
  });

  useEffect(() => {
    if (userData?.data?.friend) {
      setFilteredUser((prev) => [
        ...(Array.isArray(prev) ? prev : []),
        ...userData?.data?.friend,
      ]);
    }
  }, [userData]);

  useEffect(() => {
    let filteredUser1 = searchTerm?.trim()
      ? [
          ...(userData?.data?.friend?.filter((user) =>
            user?.username?.toLowerCase()?.includes(searchTerm?.toLowerCase())
          ) || []),
          ...(groupData?.data?.filter((grp) =>
            grp?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
          ) || []),
        ]
      : [...(userData?.data?.friend || []), ...(groupData?.data || [])];

    setFilteredUser(filteredUser1);
  }, [searchTerm]);

  useEffect(() => {
    if (groupData?.data) {
      setFilteredUser((prev) => [
        ...(Array.isArray(prev) ? prev : []),
        ...groupData?.data,
      ]);
    }
  }, [groupData]);

  if (userLoading || groupLoading) {
    return (
      <>
        <SidebarSkeleton />
      </>
    );
  }

  if (userError) {
    return <div>Error: {userErrorMessage}</div>;
  }

  if (groupError) {
    return <div>Error: {groupErrorMessage}</div>;
  }

  const handleSelectUser = (user) => {
    const socket = getSocket();
    if (user?.id) {
      socket.emit("join-group", user.id);
    }
  };

  return (
    // <aside className="h-full flex flex-col">
    //   <div className="border-b border-base-300 w-full p-5">
    //     <div className="flex items-center gap-2">
    //       <div className="w-10 h-10 rounded">
    //         <img
    //           src="https://media.istockphoto.com/id/938887966/vector/two-people-icon-symbol-of-group-or-pair-of-persons-friends-contacts-users-outline-modern.jpg?s=612x612&w=0&k=20&c=575mQXvCuoAjbX6tnVXU4TIlGw9CJH6AVR0QjA4S7JA="
    //           alt="img"
    //           className="w-full h-full rounded-md object-cover border-2"
    //         />
    //       </div>
    //       <span className="font-medium hidden lg:block">Friends & Group</span>
    //     </div>
    //     <div className="mt-3 w-full">
    //       <form>
    //         <TextInput
    //           type="text"
    //           placeholder="Search for friend and group..."
    //           icon={AiOutlineSearch}
    //           className="w-full"
    //           value={searchTerm}
    //           id="search"
    //           onChange={(e) => setSearchTerm(e.target.value)}
    //           aria-label="Search for friend and group..."
    //         />
    //       </form>
    //     </div>
    //   </div>
    //   <div className="overflow-y-auto w-full flex-1">
    //     {filteredUser?.map((user1) => (
    //       <div
    //         key={user1?._id}
    //         className={`w-full p-2 space-x-4 cursor-pointer flex items-center bg-slate-50 hover:!bg-slate-200 ${
    //           user?.selectedUser?._id === user1?._id
    //             ? "bg-base-300 ring-1 ring-base-300"
    //             : ""
    //         }`}
    //         onClick={() => {dispatch(setSelectedUser(user1)); setSearchTerm('')}}
    //       >
    //         <div className="relative mx-auto lg:mx-0">
    //           <img
    //             src={
    //               user1?.profilePicture ||
    //               "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg?w=360"
    //             }
    //             alt={""}
    //             className="size-12 object-cover rounded-full"
    //           />
    //           {user?.onlineUsers?.includes(user1?._id) && (
    //             <span
    //               className="absolute bottom-0 right-0 size-3 bg-green-500
    //                       rounded-full ring-2 ring-slate-100"
    //             />
    //           )}
    //         </div>

    //         <div className="block text-left min-w-0">
    //           <div className="font-medium truncate text-gray-800">
    //             {user1?.username}
    //           </div>
    //           <div className="text-sm text-zinc-400">
    //             {user?.onlineUsers?.includes(user1?._id) ? "Online" : "Offline"}
    //           </div>
    //         </div>
    //       </div>
    //     ))}
    //     {filteredUser?.length === 0 && (
    //       <div className="text-center text-zinc-500 py-4">No user</div>
    //     )}
    //   </div>
    // </aside>
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-5 border-b border-base-300">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded">
            <img
              src="https://media.istockphoto.com/id/938887966/vector/two-people-icon-symbol-of-group-or-pair-of-persons-friends-contacts-users-outline-modern.jpg?s=612x612&w=0&k=20&c=575mQXvCuoAjbX6tnVXU4TIlGw9CJH6AVR0QjA4S7JA="
              alt="img"
              className="w-full h-full rounded-md object-cover border-2"
            />
          </div>
          <span className="font-medium hidden lg:block">Friends & Group</span>
        </div>
        <div className="mt-3 w-full">
          <TextInput
            type="text"
            placeholder="Search for friend and group..."
            icon={AiOutlineSearch}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="h-full">
          {filteredUser?.map((user1) => (
            <div
              key={`${user1?._id}-${Date.now()}-${Math.random()}`}
              className={`w-full p-2 space-x-4 cursor-pointer flex items-center bg-slate-50 hover:!bg-slate-200 ${
                user?.selectedUser?._id === user1?._id
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }`}
              onClick={() => {
                dispatch(setSelectedUser(user1));
                setSearchTerm("");
                handleSelectUser(user1);
              }}
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={
                    user1?.profilePicture ||
                    user1?.groupProfile ||
                    "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg?w=360" ||
                    "/placeholder.svg"
                  }
                  alt=""
                  className="size-12 object-cover rounded-full"
                />
                {user?.onlineUsers?.includes(user1?._id) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-slate-100" />
                )}
              </div>

              <div className="block text-left min-w-0">
                <div className="font-medium truncate text-gray-800">
                  {user1?.username || user1?.name}
                </div>
                <div className="text-sm text-zinc-400">
                  {!user1?.memberId &&
                    (user?.onlineUsers?.includes(user1?._id)
                      ? "Online"
                      : "Offline")}
                </div>
              </div>
            </div>
          ))}
          {filteredUser?.length === 0 && (
            <div className="text-center text-zinc-500 py-4">No user</div>
          )}
        </div>
      </div>
    </div>
  );
}

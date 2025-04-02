import { Button } from "flowbite-react";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RxCross2 } from "react-icons/rx";
import { setCalling, setSelectedUser } from "../redux/user/userSlice";
import { getSocket } from "../util/socketAction";
import { useNavigate } from "react-router-dom";
import { MdOutlineMissedVideoCall } from "react-icons/md";
import { FcEndCall } from "react-icons/fc";
import toast from "react-hot-toast";

export default function ChatHeader() {
  const { selectedUser, onlineUsers, currentUser, calling } = useSelector(
    (state) => state.user
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const socket = getSocket();
    socket.on("error-reciever", (data) => {
      toast.error(data.error);
      setCalling(false);
      navigate(window.history.length > 1 ? -1 : "/chat");
    });
  }, [socket]);

  const handleCrossClick = (user) => {
    const socket = getSocket();
    if (user?.id) {
      socket.emit("leave-group", user.id);
    }
  };

  const handleClick = () => {
    if (selectedUser?.groupProfile && selectedUser?.id) {
      navigate(
        `/?tab=group&view=expense&edit=group&id=${
          selectedUser?.id
        }&flag=${false}&len=1`
      );
    }
  };

  const handleVideoCall = () => {
    const socket = getSocket();
    if (!onlineUsers?.includes(selectedUser?._id)) {
      toast.error(`${selectedUser?.username} is offline`);
    } else {
      if (calling) {
        dispatch(setCalling(false));
        socket.emit("end-call-by-caller", {
          to: selectedUser?._id,
        });
      } else {
        socket.emit("incoming-call", {
          id: selectedUser._id,
          from: currentUser?._id,
          name: currentUser?.username,
          profilePicture: currentUser?.profilePicture,
        });
        dispatch(setCalling(true));
      }
    }
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div
          className={`flex flex-1 items-center gap-3 ${
            selectedUser?.groupProfile && "cursor-pointer"
          }`}
          onClick={handleClick}
        >
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={
                  selectedUser?.profilePicture ||
                  selectedUser?.groupProfile ||
                  "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg?w=360"
                }
                alt={""}
              />
            </div>
          </div>

          <div>
            <h3 className="font-medium">
              {selectedUser?.username || selectedUser?.name}
            </h3>
            <p className="text-sm text-base-content/70">
              {!selectedUser?.memberId &&
                (onlineUsers?.includes(selectedUser?._id)
                  ? "Online"
                  : "Offline")}
            </p>
          </div>
        </div>

        <div className="flex space-x-3 justify-end items-center">
          {selectedUser?.username && (
            <Button onClick={handleVideoCall} color="gray">
              {calling ? (
                <FcEndCall className="size-5" />
              ) : (
                <MdOutlineMissedVideoCall className="size-5" />
              )}
            </Button>
          )}
          <Button
            onClick={() => {
              handleCrossClick(selectedUser);
              dispatch(setSelectedUser(null));
            }}
            color="gray"
          >
            <RxCross2 className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

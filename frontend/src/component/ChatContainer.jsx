import React, { useEffect, useReducer, useRef, useState } from "react";
import { getMessage } from "../util/getMessage";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import ChatHeader from "./ChatHeader";
import MessageSkeleton from "./skeleton/MessageSkeleton";
import MessageInput from "./MessageInput";
import moment from "moment";
import { getSocket } from "../util/socketAction";
import { fetchUserDetail } from "../util/fetchUserDetail";

export default function ChatContainer() {
  const user = useSelector((state) => state?.user);
  const [message, setMessage] = useState([]);
  const [userDetail, setUserDetail] = useState({});
  const messageEndRef = useRef(null);
  const socket = getSocket();

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
    data: messageData,
    isLoading: messageLoading,
    isError: messageError,
    error: messageErrorMessage,
  } = useQuery({
    queryKey: user?.selectedUser?.id
      ? ["userDetail", null, user.selectedUser?.id]
      : ["userDetail", user.selectedUser._id, null],
    queryFn: getMessage,
  });

  // } = useQuery({
  //   queryKey: ["userDetail", user?.selectedUser?._id, user?.selectedUser?.id],
  //   queryFn: getMessage,
  // });

  useEffect(() => {
    if (!socket || !user) return;

    socket.on("message1", (message1) => {
      const isGroupMessage =
        message1?.senderId !== user?.currentUser?._id &&
        message1?.groupId === user.selectedUser.id;
      const isMessageSentFromSelectedUser =
        message1?.senderId === user?.selectedUser?._id;

      if (!isMessageSentFromSelectedUser && !isGroupMessage) return;

      setMessage((prevMessage) => [...prevMessage, message1]);
    });

    if (message) {
      // messageEndRef?.current?.scrollIntoView({ behaviour: "smooth" });
      // setTimeout(() => {
      //   messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      // }, 100);
    }

    return () => {
      socket.off("message1");
    };
  }, [
    socket,
    user?.currentUser?._id,
    user?.selectedUser?._id,
    user?.selectedUser?.id,
    messageData,
    userData,
  ]);

  useEffect(() => {
    if (userData?.data?.friend) {
      const obj = userData?.data?.friend?.reduce((acc, element) => {
        acc[element?._id] = element;
        return acc;
      }, {});

      setUserDetail(obj);
    }
  }, [userData]);

  useEffect(() => {
    if (messageData) {
      setMessage(messageData?.data);
    }
    // if (messageEndRef.current && messageData) {
    //   messageEndRef?.current?.scrollIntoView({ behaviour: "smooth" });
    // }
  }, [messageData]);

  if (messageLoading || userLoading) {
    return (
      <>
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </>
    );
  }

  if (messageError) {
    return <div>Error: {messageErrorMessage}</div>;
  }

  if (userError) {
    return <div>Error: {userErrorMessage}</div>;
  }

  const handleImageClick = (img) => {
    const windowOpen = window.open(img, "_blank", "noopener,noreferrer");
    if (windowOpen) {
      windowOpen.focus();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <ChatHeader />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="min-h-full">
          {message?.length > 0 &&
            message?.map((message) => (
              <div
                key={message?._id}
                className={`chat ${
                  message?.senderId === user?.currentUser?._id
                    ? "chat-end"
                    : "chat-start"
                }`}
              >
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full border">
                    <img
                      src={
                        message?.senderId === user?.currentUser?._id
                          ? user?.currentUser?.profilePicture ||
                            "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg?w=360"
                          : userDetail[message?.senderId]?.profilePicture ||
                            "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg?w=360"
                      }
                      alt="Profile Pic"
                    />
                  </div>
                </div>
                <div className="chat-header mb-1">
                  <time className="text-xs opacity-50 ml-1">
                    {moment(message?.createdAt).fromNow()}
                  </time>
                </div>
                <div className="chat-bubble flex flex-col space-y-2">
                  {message?.image && (
                    <img
                      src={message.image || "/placeholder.svg"}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2 cursor-pointer"
                      onClick={() => handleImageClick(message?.image)}
                    />
                  )}
                  {message?.audio && (
                    <audio src={message?.audio} controls></audio>
                  )}
                  {message?.video && (
                    <video controls preload="auto" width="300" height="300">
                      <source src={message?.video} />
                    </video>
                  )}
                  {message?.message && <p>{message.message}</p>}
                </div>
              </div>
            ))}
          <div ref={messageEndRef} />
        </div>
      </div>

      <div className="flex-shrink-0">
        <MessageInput setMessage={setMessage} />
      </div>
    </div>
  );
}

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
import { Button, Modal } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import toast from "react-hot-toast";

export default function ChatContainer() {
  const user = useSelector((state) => state?.user);
  const [message, setMessage] = useState([]);
  const [userDetail, setUserDetail] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [messageId, setMessageId] = useState(null);
  const messageEndRef = useRef(null);
  const longPressTimer = useRef(null);
  const socket = getSocket();
  const API_URL = import.meta.env.VITE_API_URL;

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

    socket.on('delete-message', (data) => {
      const msgId = data?.msgId;
      setMessage((prevMessage) =>
        prevMessage.filter((msg) => msg?._id !== msgId)
      );
    });

    return () => {
      socket.off("message1");
      socket.off("delete-message")
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

  const deleteMessage = async (msgId) => {
    try {
      if (msgId) {
        const response = await fetch(`${API_URL}/chat/delete/${msgId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          toast.error(response.statusText);
          return;
        }

        const data = await response.json();

        if (!data.success) {
          toast.error(data.message);
          return { success: false, data: [] };
        } else {
          setMessage((prevMessage) =>
            prevMessage.filter((msg) => msg?._id != msgId)
          );
          setShowModal(false);
          setMessageId(null);
          socket.emit('delete-message', {
            id: user?.selectedUser?._id,
            msgId: msgId
          });
          toast.success(data?.message || "Comment deleted successfully");
        }
      }
    } catch (error) {
      console.log("error", error.message);
      toast.error(error.message);
    }
  };

  const handleLongPressStart = (msgId) => {
    if (msgId) {
      longPressTimer.current = setTimeout(() => {
        setShowModal(true);
        setMessageId(msgId);
      }, 2000);
    }
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      longPressTimer.current = null;
      setMessageId(null);
      setShowModal(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-x-hidden">
      <div className="flex-shrink-0">
        <ChatHeader />
      </div>

      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4">
        <div className="min-h-full">
          {message?.length > 0 &&
            message?.map((message) => (
              <div
                key={message?._id}
                className={`chat max-w-full ${
                  message?.senderId === user?.currentUser?._id
                    ? "chat-end"
                    : "chat-start"
                }`}
              >
                <div className="chat-image avatar">
                  <div className="size-8 sm:size-10 rounded-full border">
                    <img
                      src={
                        message?.senderId === user?.currentUser?._id
                          ? user?.currentUser?.profilePicture ||
                            "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg?w=360"
                          : userDetail[message?.senderId]?.profilePicture ||
                            "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg?w=360"
                      }
                      alt="Profile Pic"
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="chat-header mb-1">
                  <time className="text-[10px] sm:text-xs opacity-50 ml-1">
                    {moment(message?.createdAt).fromNow()}
                  </time>
                </div>
                <div
                  className="chat-bubble max-w-[75vw] sm:max-w-[60vw] md:max-w-[50vw] flex flex-col space-y-2"
                  onContextMenu={(e) => {
                    e?.preventDefault();
                    if (message?.senderId === user?.currentUser?._id) {
                      setShowModal((prev) => !prev);
                      setMessageId(message?._id);
                    }
                  }}
                  onTouchStart={() => {
                    if (message?.senderId === user?.currentUser?._id) {
                      handleLongPressStart(message?._id);
                    }
                  }}
                  onTouchMove={() => {
                    if (message?.senderId === user?.currentUser?._id) {
                      handleLongPressEnd();
                    }
                  }}
                  onTouchEnd={() => {
                    if (message?.senderId === user?.currentUser?._id) {
                      handleLongPressEnd();
                    }
                  }}
                >
                  {message?.image && (
                    <img
                      src={message.image || "/placeholder.svg"}
                      alt="Attachment"
                      className="max-w-full sm:max-w-[200px] rounded-md mb-2 cursor-pointer"
                      onClick={() => handleImageClick(message?.image)}
                    />
                  )}
                  {message?.audio && (
                    <audio 
                      src={message?.audio} 
                      controls 
                      className="max-w-full w-[200px] sm:w-[250px]"
                      preload="metadata"
                    />
                  )}
                  {message?.video && (
                    <video 
                      controls 
                      preload="metadata" 
                      className="max-w-full sm:max-w-[300px] rounded-md"
                    >
                      <source src={message?.video} />
                    </video>
                  )}
                  {message?.message && (
                    <p className="break-words text-sm sm:text-base">
                      {message.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          <div ref={messageEndRef} />
        </div>
      </div>

      <div className="flex-shrink-0">
        <MessageInput setMessage={setMessage} />
      </div>
      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setMessageId(null);
        }}
        size="md"
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="text-lg mb-5 text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this message?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={() => deleteMessage(messageId)}>
                Yes, I'm sure
              </Button>
              <Button
                color="gray"
                onClick={() => {
                  setShowModal(false);
                  setMessageId(null);
                }}
              >
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

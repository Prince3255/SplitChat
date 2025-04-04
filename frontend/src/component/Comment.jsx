import { Button, Modal, Textarea } from "flowbite-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaThumbsUp } from "react-icons/fa";
import { useSelector } from "react-redux";
import fetchComment from "../util/fetchComment";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { fetchUserDetail } from "../util/fetchUserDetail";
import CommentSkeleton from "./skeleton/CommentSkeleton";

export default function Comment({ postId }) {
  const [comment, setComment] = useState("");
  const [allComment, setAllComment] = useState([]);
  const [editing, setEditing] = useState(false);
  const [newComment, setNewComment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cmntId, setCmntId] = useState(null);
  const [userData, setUserData] = useState([]);
  const user = useSelector((state) => state.user);
  const queryClient = useQueryClient();
  const API_URL = import.meta.env.VITE_API_URL

  const {
    data: commentData,
    isLoading: commentLoading,
    isError: commentError,
    error: commentErrorMessage,
  } = useQuery({
    queryKey: ["fetchComment", postId],
    queryFn: fetchComment,
  });

  const {
    data: userData1,
    isLoading: userLoading,
    isError: userError,
    error: userErrorMessage,
  } = useQuery({
    queryKey: ["userDetail", user?.currentUser?._id],
    queryFn: fetchUserDetail,
  });

  useEffect(() => {
    let tempUserData = {};

    if (Array.isArray(userData1?.data?.friend)) {
      userData1?.data?.friend?.map((item1, _) => {
        if (!tempUserData[item1?._id]) {
          tempUserData[item1?._id] = {
            id: item1?._id,
            name: item1?.username,
            image: item1?.profilePicture,
          };
        }
      });
      tempUserData[user?.currentUser?._id] = {
        id: user?.currentUser?._id,
        name: user?.currentUser?.username,
        image: user?.currentUser?.profilePicture,
      };
    }

    setUserData(tempUserData);
  }, [userData1]);

  useEffect(() => {
    if (commentData?.data !== null) {
      setAllComment(commentData?.data || []);
    } else if (commentData?.data === null) {
      setAllComment([]);
    }
  }, [commentData]);

  if (commentLoading || userLoading) {
    return (
      <>
        <CommentSkeleton />
      </>
    );
  }

  if (commentError) {
    return <div>Error: {commentErrorMessage.message}</div>;
  }

  if (userError) {
    return <div>Error: {userErrorMessage.message}</div>;
  }

  if (!commentData) {
    return <div>No comments yet!</div>;
  }

  const onLike = async (commentId) => {
    try {
      const response = await fetch(`${API_URL}/comment/likecomment/${commentId}`, {
        method: "PUT",
        credentials: "include",
      });

      if (!response.ok) {
        toast.error(response.statusText);
        return;
      }

      const data = await response.json();

      if (!data.success) {
        toast.error(data?.message || "Something went wrong");
        return { success: false, data: [] };
      } else {
        setAllComment(
          allComment?.map((comment) =>
            comment?._id?.toString() === commentId?.toString()
              ? {
                  ...comment,
                  like: data?.data?.like,
                  numberOfLike:
                    data?.data?.numberOfLike || data?.data?.like?.length,
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.log("error", error.message);
      toast.error(error.message);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const response = await fetch(`${API_URL}/comment/deletecomment/${commentId}`, {
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
        setAllComment(allComment.filter((c) => c._id !== commentId));
        setShowModal(false);
        setCmntId(null);
        toast.success(data?.message || "Comment deleted successfully");
      }
    } catch (error) {
      console.log("error", error.message);
      toast.error(error.message);
    }
  };

  const handleEdit = (comment1) => {
    setEditing(true);
    setCmntId(comment1?._id);
    setNewComment(comment1?.content);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.length > 200) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/comment/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: comment,
          postId,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        toast.error(res.statusText);
        return;
      }

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message);
        return { success: false, data: [] };
      } else {
        toast.success("Comment added successfully");
        setComment("");
        queryClient.invalidateQueries("fetchComment", { refetchActive: true });
      }
    } catch (error) {
      console.log("error", error.message);
      toast.error(error.message);
    }
  };

  const handleSave = async (commentId) => {
    try {
      const res = await fetch(`${API_URL}/comment/editcomment/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Something went wrong");
        return;
      }

      if (!data.success) {
        toast(data.message);
        return { success: false, data: [] };
      } else {
        setEditing(false);
        setAllComment(
          allComment.map((c) =>
            c._id === commentId ? { ...c, content: newComment } : c
          )
        );
        setCmntId(null);
        setNewComment(null);
        toast.success(data?.message || "Comment updated successfully");
        return data;
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="mx-auto w-full sm:w-4/5 p-3">
      <div className="flex items-center gap-1 my-5 text-gray-500 text-sm">
        <p>Signed in as: &nbsp;</p>
        <img
          className="h-5 w-5 rounded-full object-cover"
          src={user?.currentUser?.profilePicture}
          alt=""
        />
        {/* <Link to={"/dashboard?tab=profile"}> */}
        <p className="text-blue-500 hover:text-blue-700">
          {user?.currentUser?.email}
        </p>
        {/* </Link> */}
      </div>
      <form
        className="border border-teal-500 rounded-md p-3"
        onSubmit={handleSubmit}
      >
        <Textarea
          placeholder="Add a comment.."
          maxLength="200"
          rows="3"
          onChange={(e) => setComment(e.target.value)}
          value={comment}
        />
        <div className="flex justify-between items-center mt-5">
          <p className="text-gray-500 text-xs">
            {200 - comment.length} character remaining
          </p>
          <Button type="submit" gradientDuoTone="purpleToBlue" outline>
            Submit
          </Button>
        </div>
      </form>
      {Array.isArray(allComment) && allComment?.length === 0 ? (
        <p className="text-sm my-5">No comments yet!</p>
      ) : (
        <>
          <div className="text-sm my-5 flex items-center gap-1">
            <p>Comment</p>
            <div className="border border-gray-400 py-1 px-2 rounded-sm">
              <p>{allComment?.length}</p>
            </div>
          </div>
          {allComment?.map((comment1) => (
            <div
              className="flex p-4 border-b dark:border-gray-600 text-sm"
              key={comment1?._id}
            >
              <div className="flex-shrink-0 mr-3">
                <img
                  src={userData[comment1?.userId]?.image}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <span className="font-bold mr-1 text-xs truncate">
                    {userData[comment1?.userId]?.name
                      ? userData[comment1?.userId]?.name
                      : "anonymus user"}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {moment(comment1?.createdAt).fromNow()}
                  </span>
                </div>
                {editing &&
                comment1?.userId === user?.currentUser?._id &&
                comment1?._id === cmntId ? (
                  <>
                    <Textarea
                      className="mb-2"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 text-xs">
                      <Button
                        type="button"
                        size="sm"
                        gradientDuoTone="purpleToBlue"
                        onClick={() => handleSave(comment1?._id)}
                      >
                        save
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        gradientDuoTone="purpleToBkue"
                        onClick={() => setEditing(false)}
                      >
                        cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-500 pb-2">{comment1?.content}</p>
                    <div className="flex items-center pt-2 text-xs border-t dark:border-gray-700 max-w-fit gap-2">
                      <button
                        type="button"
                        onClick={() => onLike(comment1?._id)}
                        className={`text-gray-400 hover:text-blue-500 ${
                          user &&
                          comment1?.like?.includes(user?.currentUser?._id) &&
                          "!text-blue-500"
                        }`}
                      >
                        <FaThumbsUp className="text-sm" />
                      </button>
                      <p className="text-gray-500">
                        {comment1?.numberOfLike > 0 &&
                          comment1?.numberOfLike +
                            " " +
                            (comment1?.numberOfLike > 1 ? "likes" : "like")}
                      </p>
                      {user && user?.currentUser?._id === comment1?.userId && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEdit(comment1)}
                            className="text-gray-400 hover:text-blue-500"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCmntId(comment1?._id);
                              setShowModal(true);
                            }}
                            className="text-gray-400 hover:text-red-500"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </>
      )}
      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setCmntId(null);
        }}
        size="md"
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="text-lg mb-5 text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this comment?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={() => deleteComment(cmntId)}>
                Yes, I'm sure
              </Button>
              <Button
                color="gray"
                onClick={() => {
                  setShowModal(false);
                  setCmntId(null);
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

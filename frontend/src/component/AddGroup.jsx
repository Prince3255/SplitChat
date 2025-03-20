import { useQueryClient } from "@tanstack/react-query";
import { Avatar, Button, HR, Label, Modal, TextInput } from "flowbite-react";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { CiSearch } from "react-icons/ci";
import { RxCross2 } from "react-icons/rx";

export default function AddGroup({ showModal, setShowModal, userDetail }) {
  const [groupName, setGroupName] = useState("");
  const [groupMemberSearchTerm, setGroupMemberSearchTerm] = useState("");
  const [filteredUser, setFilteredUser] = useState([]);
  const [userSelectDetail, setUserSelectDetail] = useState([]);

  const ref = useRef();

  const queryClient = useQueryClient();

  const searchUsersApi = async (searchTerm) => {
    try {
      const res = await fetch(
        `/api/user/search?query=${encodeURIComponent(searchTerm)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!res.ok) {
        console.error("Failed to fetch user");
        return [];
      }

      const data = await res.json();
      return data.data || [];
    } catch (error) {
      console.error("Error searching users:", error.message);
      toast.error("Something went wrong while searching for users.");
      return [];
    }
  };

  useEffect(() => {
    const fetchFilteredUsers = async () => {
      let filtered = userDetail?.data?.friend?.filter(
        (user) =>
          user?.username
            .toLowerCase()
            .includes(groupMemberSearchTerm.toLowerCase()) &&
          !userSelectDetail.find((selected) => selected._id === user._id)
      );

      if (filtered?.length === 0 && groupMemberSearchTerm.trim().length > 0) {
        filtered = (await searchUsersApi(groupMemberSearchTerm)).filter(
          (user) =>
            !userSelectDetail.find((selected) => selected._id === user._id)
        );
      }

      setFilteredUser(filtered);
    };

    fetchFilteredUsers();
  }, [groupMemberSearchTerm, userSelectDetail, userDetail]);

  const handleUserSelect = (friendDetail) => {
    setUserSelectDetail((prev) => {
      const exist = prev.some((friend) => friend._id === friendDetail._id);

      if (!exist) {
        setGroupMemberSearchTerm("");
        return [...prev, friendDetail];
      }
      setGroupMemberSearchTerm("");
      return prev;
    });
  };

  const handleUserRemove = (userId) => {
    setUserSelectDetail(
      userSelectDetail?.filter((user) => user._id !== userId)
    );

    setGroupMemberSearchTerm("");
  };

  const handleCreateGroup = async () => {
    try {
      const res = await fetch(`/api/group/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: groupName,
            memberId: userSelectDetail.map((user) => user._id)
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
        if (data?.success) {
          queryClient.invalidateQueries("groupExpense");
          toast.success(data.message);
        }
        return data;
      }
    } catch (error) {
      console.log("error", error.message);
      toast.error("Something went wrong");
    }
  };

  const validateFields = () => {
    if (!groupName) return toast.error("Group name is required");

    handleCreateGroup();
    setShowModal(false);
    setGroupMemberSearchTerm("");
    setGroupName("");
    setFilteredUser([]);
    setUserSelectDetail([]);
  };

  return (
    <Modal
      show={showModal}
      popup
      onClose={() => {
        setShowModal(false);
        setGroupMemberSearchTerm("");
        setGroupName("");
        setFilteredUser([]);
        setUserSelectDetail([]);
      }}
      initialFocus={ref}
    >
      <Modal.Header>Add a group</Modal.Header>
      <HR className="h-[1px] my-1 bg-slate-200 border-none" />
      <Modal.Body className="scrollbar-thin">
        <form className="space-y-4">
          <div>
            <Label htmlFor="groupName" className="whitespace-nowrap">
              Enter group name:
            </Label>
            <div className="mt-1">
              <TextInput
                type="text"
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                ref={ref}
                required
                sizing="sm"
                className="w-full"
                placeholder="Enter group name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="userSearch" className="whitespace-nowrap">
              Add group member:
            </Label>
            <div className="relative mt-1">
              <TextInput
                type="text"
                id="userSearch"
                value={groupMemberSearchTerm}
                onChange={(e) => setGroupMemberSearchTerm(e.target.value)}
                icon={CiSearch}
                required
                sizing="sm"
                className="w-full"
                placeholder="Type to search users..."
              />
            </div>

            {groupMemberSearchTerm && (
              <div className="absolute z-10 w-11/12 bg-white border rounded-md shadow-lg max-h-48 overflow-auto scrollbar-thin mt-1">
                {filteredUser?.length > 0 ? (
                  filteredUser.map((friend) => (
                    <div
                      key={friend._id}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 w-full"
                      onClick={() => handleUserSelect(friend)}
                    >
                      <Avatar img={friend?.profilePicture} size="xs" rounded />
                      <span>{friend?.username}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500 text-sm text-center">
                    User not found
                  </div>
                )}
              </div>
            )}

            {userSelectDetail?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {userSelectDetail?.map((user) => (
                  <div
                    key={user?._id}
                    className="flex items-center justify-center gap-2 bg-slate-100 text-slate-800 px-2 py-1 rounded-lg"
                  >
                    <Avatar
                      img={
                        user?.profilePicture ||
                        "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg?w=360"
                      }
                      size="xs"
                      rounded
                    />
                    <span>{user?.username}</span>
                    <Button
                      color="gray"
                      pill
                      className="p-0 flex justify-center items-center"
                      size="xs"
                      onClick={() => handleUserRemove(user?._id)}
                    >
                      <RxCross2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <div className="w-full">
          <div className="flex justify-end gap-3">
            <Button
              color="gray"
              onClick={() => {
                setShowModal(false);
                setGroupMemberSearchTerm("");
                setGroupName("");
                setFilteredUser([]);
                setUserSelectDetail([]);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-success hover:bg-green-400"
              onClick={() => {
                validateFields();
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

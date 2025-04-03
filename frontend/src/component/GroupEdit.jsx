import React, { useEffect, useRef } from "react";
import { useState } from "react";
import {
  Avatar,
  Button,
  Card,
  TextInput,
  Modal,
  MegaMenu,
  HR,
  Spinner,
} from "flowbite-react";
import {
  HiArrowLeft,
  HiPencil,
  HiUserGroup,
  HiLink,
  HiCheck,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { IoIosLogOut } from "react-icons/io";
import uploadImage from "../util/uploadImage";
import { MdOutlineCameraAlt } from "react-icons/md";
import toast from "react-hot-toast";
import { CiSearch } from "react-icons/ci";
import { RxCross2 } from "react-icons/rx";
import searchUsersApi from "../util/searchUserApi";
import fetchGroupMember from "../util/fetchGroupMember";
import { useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { groupExpense } from "../util/fetchData";

export default function GroupEdit() {
  const [isEditing, setIsEditing] = useState(false);
  const [groupName, setGroupName] = useState(null);
  const [prevName, setPrevName] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [coverImage1, setCoverImage] = useState(null);
  const [isCoverImageUploading, setIsCoverImageUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [formData1, setFormData1] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [memberId, setMemberId] = useState([]);
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [filteredUser, setFilteredUser] = useState([]);
  const [userSelectDetail, setUserSelectDetail] = useState([]);
  const [memberDetail, setMemberDetail] = useState([]);
  const [flag1, setFlag] = useState("true");
  const fileInputRef = useRef(null);
  const coverFileInputRef = useRef(null);
  const user = useSelector((state) => state?.user);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL
  const location = useLocation();
  const queryParam = new URLSearchParams(location.search);

  let flag = queryParam.get("flag");
  let id = queryParam.get("id");
  let len = queryParam.get("len");

  const {
    data: expenseData,
    isLoading: expenseLoading,
    isError: expenseError,
    error: expenseErrorMessage,
  } = useQuery({
    queryKey: ["GroupExpense", user?.currentUser?._id, id],
    queryFn: groupExpense,
  });

  useEffect(() => {
    if (expenseData?.data?.groupDetail?.length > 0) {
      let item = expenseData?.data?.groupDetail[0];
      setCoverImage(item?.coverImage);
      setGroupName(item?.name);
      setImageFile(item?.groupProfile);
    }
  }, [expenseData]);

  useEffect(() => {
    if (flag != "false") {
      setFlag("true");
    } else {
      setFlag("false");
    }
  }, [flag]);

  useEffect(() => {
    const fetchGroupMember1 = async () => {
      const data = await fetchGroupMember(id);

      if (!data) {
        return;
      }

      const arr = {
        _id: user?.currentUser?._id,
        username: user?.currentUser?.username,
        profilePicture: user?.currentUser?.profilePicture,
      };
      setMemberDetail([...data?.data?.friend, arr]);
    };

    fetchGroupMember1();
  }, [flag1]);

  useEffect(() => {
    memberDetail?.map((member) => {
      setMemberId((memberId) => [...memberId, member?._id]);
    });
  }, [memberDetail]);

  useEffect(() => {
    if (searchTerm !== "") {
      const search = async () => {
        let filtered = (await searchUsersApi(searchTerm)).filter(
          (user) =>
            !(
              (Array.isArray(userSelectDetail) &&
                userSelectDetail.find(
                  (selected) => selected._id === user._id
                )) ||
              (Array.isArray(memberId) &&
                memberId.find((selected) => selected === user._id))
            )
        );

        setFilteredUser(filtered);
      };

      search();
    }
  }, [searchTerm]);

  const handleNameEdit = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      setPrevName(name);
      setIsEditing(true);
    }
  };

  const handleNameChange = () => {
    setIsEditing(false);
    if (prevName !== groupName) {
      setHasChanges(true);
    }
  };

  const handleInviteLink = () => {
    setShowInviteLink(true);
    // Generate and copy invite link
    const inviteLink = "https://yourapp.com/invite/xyz123";
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied to clipboard!");
  };

  const handleImageChange = (e, isCover) => {
    const imageFile = e.target.files[0];
    if (imageFile) {
      const updateImage = async () => {
        if (isCover === true) {
          setIsCoverImageUploading(true);
        }
        let imageUrl = await uploadImage({
          imageFile,
          setIsUploading,
          setFormData1,
          setImageFile,
          formData1,
          setIsCoverImageUploading,
        });
        if (isCover === true) {
          setCoverImage(imageUrl);
        } else {
          setImageFile(imageUrl);
        }
        setHasChanges(true);
      };
      updateImage();
    }
  };

  const handleImageClick = (isCover) => {
    if (!isUploading) {
      if (isCover === true) {
        coverFileInputRef.current?.click();
      } else {
        fileInputRef.current?.click();
      }
    }
  };

  const handleLeave = () => {
    if (flag1 == "true") {
      toast.error(
        "You can't leave the group because you have some expense to settleup"
      );
    } else {
      setShowModal(true);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const res = await fetch(`${API_URL}/group/leave/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Something went wrong");
        return;
      }

      if (!data.success) {
        toast.error(data?.message || "Something went wrong");
        return { success: false, data: [] };
      } else {
        toast.success(data?.message);
        queryClient.invalidateQueries("groupExpense", { refetchActive: true });
        if (window.history.length > 1) {
          navigate("/?tab=group");
        } else {
          navigate("/?tab=group");
        }
      }
    } catch (error) {
      console.log("error", error.message);
      toast.error(error.message);
    }
  };

  const addSelectedMember = () => {
    if (userSelectDetail?.length > 0) {
      let id = [];
      userSelectDetail.forEach((item) => {
        id.push(item?._id);
      });

      setMemberId((prev) => [...prev, ...id]);
      setHasChanges(true);
    }
    setAddMemberModal(false);
    setSearchTerm("");
    setUserSelectDetail([]);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_URL}/group/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: id,
          name: groupName,
          groupProfile: imageFile,
          coverImage: coverImage1,
          memberId: memberId,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        toast.error(response?.statusText);
        return;
      }

      const data = await response.json();

      if (!data.success) {
        toast.error(data.message);
        return { success: false, data: [] };
      } else {
        toast.success(data?.message || "Group data updated successfully");
        queryClient.invalidateQueries("groupExpense", { refetchActive: true });
        setFlag(!flag1);
        setHasChanges(false);
      }
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error(error?.message || "Something went wrong");
    }
  };

  const handleSearch = async (e) => {
    setSearchTerm(e?.target?.value);
  };

  const handleUserSelect = (friendDetail) => {
    setUserSelectDetail((prev) => {
      const exist = prev.some((friend) => friend._id === friendDetail._id);

      if (!exist) {
        setSearchTerm("");
        return [...prev, friendDetail];
      }
      setSearchTerm("");
      return prev;
    });
  };

  const handleUserRemove = (userId) => {
    setUserSelectDetail(
      userSelectDetail?.filter((user) => user._id !== userId)
    );

    setSearchTerm("");
  };

  if (expenseLoading) {
    return <Spinner size="sm" className="disabled" />;
  }

  if (expenseError) {
    return <div>Error: {expenseErrorMessage.message}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="top-0 w-full">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button color="gray" pill size="xs" onClick={() => navigate(-1)}>
                <HiArrowLeft className="size-4" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-semibold">Group settings</h1>
            </div>
            <div>
              {hasChanges && (
                <Button onClick={handleSave} className="bg-[#4fce9b] text-sm sm:text-base">
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-3xl">
        <Card className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className="relative group cursor-pointer mr-2"
                onClick={() => handleImageClick(false)}
              >
                <img
                  src={imageFile}
                  alt=""
                  className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover ${
                    isUploading ? "opacity-40" : ""
                  }`}
                />
                <div className="absolute bottom-0 right-0 bg-slate-700 rounded-full p-1.5 border-2 border-white">
                  <MdOutlineCameraAlt className="w-4 h-4 text-white" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleImageChange(e, false)}
                accept="image/*"
                className="hidden"
              />
              {isEditing ? (
                <TextInput
                  value={groupName}
                  onChange={(e) => {
                    setGroupName(e.target.value);
                  }}
                  className="max-w-[200px] sm:max-w-xs"
                />
              ) : (
                <h2 className="text-lg sm:text-xl font-semibold break-all">{groupName}</h2>
              )}
            </div>
            <Button color="gray" pill size="sm" onClick={handleNameEdit}>
              {isEditing ? (
                <HiCheck className="w-4 h-4 sm:w-5 sm:h-5" onClick={handleNameChange} />
              ) : (
                <HiPencil className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>
          </div>
        </Card>

        <Card className="my-4 bg-white w-full overflow-hidden">
          <h3 className="text-lg sm:text-xl font-semibold mb-3">Cover Image</h3>
          <div
            className="relative group cursor-pointer h-36 sm:h-52 w-full"
            onClick={() => handleImageClick(true)}
          >
            <img
              src={coverImage1}
              alt=""
              className={`w-full rounded-md object-cover h-full ${
                isCoverImageUploading ? "opacity-40" : ""
              }`}
            />
            <div className="absolute bottom-0 right-0 bg-slate-700 rounded-full p-1.5 border-2 border-white">
              <MdOutlineCameraAlt className="w-4 h-4 text-white" />
            </div>
          </div>
          <input
            type="file"
            ref={coverFileInputRef}
            onChange={(e) => handleImageChange(e, true)}
            accept="image/*"
            className="hidden"
          />
        </Card>

        <div className="space-y-4 sm:space-y-6">
          <h3 className="text-lg sm:text-xl font-semibold">Group members</h3>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <Button
              className="flex items-center gap-2 justify-start text-sm sm:text-base py-0.5 px-1 sm:py-1 sm:px-2"
              onClick={() => setAddMemberModal(true)}
            >
              <HiUserGroup className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              Add people to group
            </Button>
            {/* <Button
              className="flex items-center gap-2 justify-start text-sm sm:text-base py-2 px-3 sm:py-2.5 sm:px-4"
              onClick={handleInviteLink}
            >
              <HiLink className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              Invite via link
            </Button> */}
          </div>

          <div className="space-y-3 sm:space-y-4">
            {memberDetail?.map((member) => (
              <Card key={member?._id}>
                <div className="flex items-center justify-between p-0.5 sm:p-1">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Avatar 
                      img={member?.profilePicture} 
                      rounded 
                      size="sm"
                      className="w-8 h-8 sm:w-10 sm:h-10"
                    />
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base">{member?.username}</h4>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-6 sm:mt-8 space-y-6">
          {len == "0" && (
            <div className="pt-4 sm:pt-6">
              <Button
                color="red"
                type="button"
                className="w-full text-sm sm:text-base py-2 sm:py-2.5"
                onClick={handleLeave}
              >
                <IoIosLogOut className="my-auto mr-1.5 size-4 sm:size-5" />
                Leave group
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* <div className="top-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button color="gray" pill size="xs" onClick={() => navigate(-1)}>
                <HiArrowLeft className="size-4" />
              </Button>
              <h1 className="text-2xl font-semibold">Group settings</h1>
            </div>
            <div>
              {hasChanges && (
                <Button onClick={handleSave} className="bg-[#4fce9b]">
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="relative group cursor-pointer mr-2"
                onClick={() => handleImageClick(false)}
              >
                <img
                  src={imageFile}
                  alt=""
                  className={`w-32 h-32 rounded-full object-cover ${
                    isUploading ? "opacity-40" : ""
                  }`}
                />
                <div className="absolute bottom-0 right-0 bg-slate-700 rounded-full p-1.5 border-2 border-white">
                  <MdOutlineCameraAlt className="w-4 h-4 text-white" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleImageChange(e, false)}
                accept="image/*"
                className="hidden"
              />
              {isEditing ? (
                <TextInput
                  value={groupName}
                  onChange={(e) => {
                    setGroupName(e.target.value);
                  }}
                  className="max-w-xs"
                />
              ) : (
                <h2 className="text-xl font-semibold">{groupName}</h2>
              )}
            </div>
            <Button color="gray" pill size="sm" onClick={handleNameEdit}>
              {isEditing ? (
                <HiCheck className="w-5 h-5" onClick={handleNameChange} />
              ) : (
                <HiPencil className="h-5 w-5" />
              )}
            </Button>
          </div>
        </Card>

        <Card className="my-4 bg-white w-full overflow-hidden">
          <h3 className="text-xl font-semibold">Cover Image</h3>
          <div
            className="relative group cursor-pointer h-52 w-full"
            onClick={() => handleImageClick(true)}
          >
            <img
              src={coverImage1}
              alt=""
              className={`w-full rounded-md object-cover h-full ${
                isCoverImageUploading ? "opacity-40" : ""
              }`}
            />
            <div className="absolute bottom-0 right-0 bg-slate-700 rounded-full p-1.5 border-2 border-white">
              <MdOutlineCameraAlt className="w-4 h-4 text-white" />
            </div>
          </div>
          <input
            type="file"
            ref={coverFileInputRef}
            onChange={(e) => handleImageChange(e, true)}
            accept="image/*"
            className="hidden"
          />
        </Card>

        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Group members</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <Button
              className="flex items-center gap-2 justify-start"
              onClick={() => setAddMemberModal(true)}
            >
              <HiUserGroup className="h-5 w-5 mr-2" />
              Add people to group
            </Button>
            <Button
              className="flex items-center gap-2 justify-start"
              onClick={handleInviteLink}
            >
              <HiLink className="h-5 w-5 mr-2" />
              Invite via link
            </Button>
          </div>

          <div className="space-y-4">
            {memberDetail?.map((member) => (
              <Card key={member?._id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar img={member?.profilePicture} rounded />
                    <div>
                      <h4 className="font-semibold">{member?.username}</h4>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-6"></div>

        {len == "0" ? (
          <div className="pt-6">
            <Button
              color="red"
              type="button"
              className="w-full"
              onClick={handleLeave}
            >
              <IoIosLogOut className="my-auto mr-1.5 size-5" />
              Leave group
            </Button>
          </div>
        ) : null}
      </div> */}

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        size="md"
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="text-lg mb-5 text-gray-500 dark:text-gray-400">
              Are you sure you want to leave this group?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleLeaveGroup}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        size="xl"
        show={addMemberModal}
        onClose={() => {
          setAddMemberModal(false);
          setSearchTerm("");
          setUserSelectDetail([]);
        }}
      >
        <Modal.Header>Search for a member to add</Modal.Header>
        <Modal.Body className="scrollbar-thin">
          <form>
            <div>
              <div className="relative mt-1">
                <TextInput
                  type="text"
                  id="userSearch"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e)}
                  icon={CiSearch}
                  required
                  sizing="sm"
                  className="w-full"
                  placeholder="Type to search users..."
                />
              </div>

              {searchTerm && (
                <div className="absolute z-10 w-11/12 bg-white border rounded-md shadow-lg max-h-48 overflow-auto scrollbar-thin mt-1">
                  {filteredUser?.map((friend) => (
                    <div
                      key={friend._id}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 w-full"
                      onClick={() => handleUserSelect(friend)}
                    >
                      <Avatar img={friend?.profilePicture} size="xs" rounded />
                      <span>{friend?.username}</span>
                    </div>
                  ))}
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
          <div className="flex justify-between items-center w-full">
            <Button
              color="gray"
              onClick={() => {
                setShowModal(false);
                setSearchTerm("");
                setUserSelectDetail([]);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-success hover:bg-green-400"
              onClick={addSelectedMember}
            >
              Save
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

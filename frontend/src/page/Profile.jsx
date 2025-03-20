import React, { useState, useRef, useEffect } from "react";
import { Button, Card, Label, Modal, TextInput } from "flowbite-react";
import {
  HiUser,
  HiMail,
  HiCalendar,
  HiCheck,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { MdOutlineCameraAlt } from "react-icons/md";
import fetchUser from "../util/fetchUser";
import { useQuery } from "@tanstack/react-query";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { logoutUserSuccess, updateUserSuccess } from "../redux/user/userSlice";
import uploadImage from "../util/uploadImage";
import ProfileSkeleton from "../component/skeleton/ProfileSkeleton";

export default function Profile() {
  const user = useSelector((state) => state.user);
  const [profileImage, setProfileImage] = useState(
    user?.currentUser?.profileImage
  );
  const [showModal, setShowModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [formData1, setFormData1] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [coverImage, setIsCoverImageUploading] = useState(false);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL

  const {
    data: userData,
    isLoading: userLoading,
    isError: userError,
    error: userErrorMessage,
  } = useQuery({
    queryKey: ["dashUser", user?.currentUser?._id],
    queryFn: fetchUser,
    enabled: user?.isAuthenticated,
  });

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    setProfileImage(userData?.data?.profilePicture);
  }, [userData]);

  const handleImageClick = () => {
    if (!isUploading) {
      fileInputRef?.current?.click();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };
  useEffect(() => {
    if (imageFile) {
      const updateImage = async () => {
        let imageUrl = await uploadImage({
          imageFile,
          setIsUploading,
          setFormData1,
          setImageFile,
          formData1,
          setIsCoverImageUploading,
        });
        if (imageUrl) {
          updateProfile(imageUrl);
        }
      };
      updateImage();
    }
  }, [imageFile]);

  const updateProfile = async (imageUrl) => {
    try {
      const res = await fetch(`${API_URL}/user/update/${user?.currentUser?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profilePicture: imageUrl }),
        credentials: "include",
      });

      if (!res.ok) {
        toast.error(res.statusText);
        return;
      }

      const data = await res?.json();

      if (!data?.success) {
        toast(data?.message);
        return { success: false, data: [] };
      } else {
        setProfileImage(imageUrl);
        dispatch(updateUserSuccess(imageUrl));
        toast.success("Image updated successfully");
      }
    } catch (error) {
      console.log("error", error.message);
      toast.error(error.message);
    } finally {
      setImageFile(null);
    }
  };

  if (userLoading) {
    return (
      <>
        <ProfileSkeleton />
      </>
    );
  }

  if (userError) {
    return <div>Error: {userErrorMessage.message}</div>;
  }

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/user/logout`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response?.ok) {
        toast.error(response?.statusText);
        return;
      }

      if (!data?.success) {
        toast(data?.message);
        return;
      } else {
        dispatch(logoutUserSuccess());
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="px-6 py-8">
        <div className="flex justify-center mb-1 relative">
          <div
            className="relative group cursor-pointer"
            onClick={handleImageClick}
          >
            <img
              src={profileImage}
              alt=""
              className={`w-32 h-32 rounded-full object-cover ${
                isUploading ? "opacity-60" : ""
              }`}
            />
            <div className="absolute bottom-0 right-0 bg-slate-700 rounded-full p-1.5 border-2 border-white">
              <MdOutlineCameraAlt className="w-4 h-4 text-white" />
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
        </div>
        <p className="text-center text-sm text-gray-500 mb-8">
          {isUploading
            ? "Uploading.."
            : "Click the camera icon to update your photo"}
        </p>

        <div className="space-y-6">
          <div>
            <Label
              htmlFor="fullName"
              className="flex items-center mb-1 text-gray-600"
            >
              Full Name
            </Label>
            <TextInput
              id="fullName"
              type="text"
              value={user?.currentUser?.username}
              readOnly
              icon={HiUser}
              className="cursor-not-allowed"
            />
          </div>

          <div>
            <Label
              htmlFor="email"
              className="flex items-center mb-1 text-gray-600"
            >
              Email Address
            </Label>
            <TextInput
              id="email"
              type="email"
              value={user?.currentUser?.email}
              readOnly
              icon={HiMail}
              className="cursor-not-allowed"
            />
          </div>

          <div className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-2 text-gray-600">
                  <HiCalendar className="w-5 h-5" />
                  <span>Member Since</span>
                </div>
                <span className="text-gray-900">
                  {new Date().toLocaleString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-2 text-gray-600">
                  <HiCheck className="w-5 h-5" />
                  <span>Account Status</span>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button
              color="red"
              type="button"
              className="w-full"
              onClick={() => setShowModal(true)}
            >
              <FiLogOut className="my-auto mr-1.5" />
              Log out
            </Button>
          </div>
        </div>
      </Card>

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
              Are you sure you want to Log out?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={() => handleLogout()}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

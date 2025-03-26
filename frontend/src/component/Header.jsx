import React, { useEffect, useRef, useState } from "react";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Button, Label, Spinner, TextInput } from "flowbite-react";
import { AiOutlineSearch } from "react-icons/ai";
import { LuMessageCircleMore } from "react-icons/lu";
import { useSelector } from "react-redux";
import AddExpense from "./AddExpense";
import useUserDetail from "../util/useUserDetail";
import useGroupDetail from "../util/useGroupDetail";
import toast from "react-hot-toast";
import { getSocket } from "../util/socketAction";
import { MdCall, MdCallEnd } from "react-icons/md";

export default function Header() {
  const user = useSelector((state) => state?.user);
  const id = user?.currentUser?._id;
  const profilePicture = user?.currentUser?.profilePicture;
  const username = user?.currentUser?.username;
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchData, setSearchData] = useState([]);
  const [name, setName] = useState(null);
  const [profilePicture1, setProfilePicture] = useState(null);
  const [id1, setId] = useState(null);
  const socket = getSocket();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL
  const ref = useRef(null);

  const {
    userDetail,
    userLoading,
    userError,
    userErrorMessage,
    setUserDetail,
  } = useUserDetail(id, user?.isAuthenticated);
  const { groupDetail, groupLoading, groupError, groupErrorMessage } =
    useGroupDetail(id, user?.isAuthenticated);

  useEffect(() => {
    if (!socket) return;

    socket.on("incoming-call", ({ id, name, profilePicture, from }) => {
      if (name) {
        setId(from);
        setName(name);
        setProfilePicture(profilePicture);
      }
    });

    socket.on("accept-click", ({ id }) => {
      toast.success("Call accepted");
      setId(null);
      setName(null);
      setProfilePicture(null);
      navigate("/call", {
        state: {
          isCaller: true,
          id1: id,
        },
      });
    });

    socket.on("decline-click", () => {
      toast.error("Call declined");
      setId(null);
      setName(null);
      setProfilePicture(null);
    });

    socket.on("end-call-by-caller", () => {
      setName(null)
    })

    return () => {
      socket.off("incoming-call");
      socket.off("accept-click");
      socket.off("decline-click");
    };
  }, [socket, user, name, id1, profilePicture1]);

  useEffect(() => {
    if (searchTerm) {
      const search = async () => {
        try {
          const res = await fetch(`${API_URL}/search?searchTerm=${searchTerm}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          const data = await res.json();

          if (!data.success) {
            toast.error(data.message);
            return { success: false, data: [] };
          } else {
            // console.log(data)
            // return data;
            setSearchData(data);
          }
        } catch (error) {
          console.log("error", error.message);
          toast.error(error.message);
        }
      };
      search();
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (ref.current && ref.current.contains(e.target)) {
        return;
      }

      setSearchTerm("");
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  if (userLoading || groupLoading) {
    return (
      <div className="text-center mx-auto">
        <Spinner size="sm" className="disabled" />
      </div>
    );
  }

  if (userError) {
    return <div>Error: {userErrorMessage}</div>;
  }

  if (groupError) {
    return <div>Error: {groupErrorMessage}</div>;
  }

  const handleGroupClick = (grp) => {
    setSearchTerm("");
    if (grp?.expenseId?.length >= 3) {
      navigate(`/?tab=group&view=expense&id=${grp?._id}&len=3`);
    } else {
      navigate(
        `/?tab=group&view=expense&id=${grp?._id}&len=${grp?.expenseId?.length}`
      );
    }
  };

  const handleSettleUpClick = (settleUp) => {
    setSearchTerm("");
    if (settleUp?.isGroupExpense) {
      navigate(
        `/?tab=group&view=expense&edit=settleup&sid=${settleUp?._id}&id=${settleUp?.groupId}`
      );
    } else {
      navigate(
        `/?tab=non-group&view=expense&edit=settleup&sid=${settleUp?._id}`
      );
    }
  };

  const handleExpenseClick = (expense) => {
    setSearchTerm("");
    if (expense?.isGroupExpense) {
      navigate(
        `/?tab=group&view=expense&edit=expense&id=${expense?._id}&groupId=${expense?.groupId}`
      );
    } else {
      navigate(`/?tab=non-group&view=expense&edit=expense&id=${expense?._id}`);
    }
  };

  const handleAcceptClick = () => {
    socket.emit("accept-click", { id1, id: user?.currentUser?._id });
    setName(null);
    setId(null);
    setProfilePicture(null);
    navigate("/call", {
      state: {
        isCaller: false,
        id1: id1,
      },
    });
  };

  const handleDeclineClick = () => {
    socket.emit("decline-click", { id1 });
    setName(null);
    setId(null);
    setProfilePicture(null);
  };

  return (
    <>
      <header className="border-b bg-green-50 px-4 py-1.5 relative top-0 w-full h-[65px]">
        <div className="flex justify-between items-center px-1">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex justify-center">
              <img
                src={logo}
                alt="SpliChat"
                className="w-20 h-14 mix-blend-darken object-contain rounded-md"
              />
            </Link>
          </div>
          <div className="w-auto flex-shrink"></div>
          {/* Search */}
          <div
            className="flex w-1/2 items-center justify-center px-6 rounded-md"
            ref={ref}
          >
            <form className="w-full relative">
              {/* <label htmlFor="search">
              <Button className='w-12 h-10 lg:hidden' color='gray' pill onClick={handleSubmit}>
                <AiOutlineSearch />
              </Button>
            </label> */}
              <TextInput
                type="text"
                placeholder="Search for expense, settle-up, group & friend..."
                icon={AiOutlineSearch}
                className="w-full"
                value={searchTerm}
                id="search"
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search expenses, settle-up, groups, or friends"
              />
              {searchTerm && (
                <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-auto scrollbar-thin mt-1 px-1">
                  <div className="my-2">
                    <Label className="px-2 mb-2">Expense</Label>
                    {searchData?.data?.expenses?.length > 0 ? (
                      searchData?.data?.expenses?.map((expense) => (
                        <div
                          key={expense._id}
                          className="p-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExpenseClick(expense);
                          }}
                        >
                          <div className="flex space-x-2">
                            <Avatar img={expense?.image} size="xs" rounded />
                            <span>{expense?.title}</span>
                          </div>
                          <div>
                            <span>₹{Number(expense?.amount).toFixed(2)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-gray-500 text-sm text-center">
                        No expense found
                      </div>
                    )}
                  </div>
                  <div className="my-2">
                    <Label className="px-2 mb-2">Settle Up</Label>
                    {searchData?.data?.settleUps?.length > 0 ? (
                      searchData?.data?.settleUps?.map((settleUp) => (
                        <div
                          key={settleUp?._id}
                          className="p-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSettleUpClick(settleUp);
                          }}
                        >
                          <div className="flex space-x-2">
                            <Avatar
                              img={
                                "https://media.istockphoto.com/id/938887966/vector/two-people-icon-symbol-of-group-or-pair-of-persons-friends-contacts-users-outline-modern.jpg?s=612x612&w=0&k=20&c=575mQXvCuoAjbX6tnVXU4TIlGw9CJH6AVR0QjA4S7JA="
                              }
                              size="xs"
                              rounded
                            />
                            <span>{settleUp?.note}</span>
                          </div>
                          <div>
                            <span>₹{Number(settleUp?.amount).toFixed(2)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-gray-500 text-sm text-center">
                        No settle up found
                      </div>
                    )}
                  </div>
                  <div className="my-2 z-50">
                    <Label className="px-2 mb-2">Group</Label>
                    {Array.isArray(searchData?.data?.groups) &&
                    searchData?.data?.groups.length > 0 ? (
                      searchData.data.groups.map((group) => (
                        <div
                          key={group?._id}
                          className="p-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGroupClick(group);
                          }}
                        >
                          <div className="flex space-x-2">
                            <Avatar
                              img={group?.groupProfile}
                              size="xs"
                              rounded
                            />
                            <span>{group?.name}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-gray-500 text-sm text-center">
                        No group found
                      </div>
                    )}
                  </div>
                  <div className="my-2">
                    <Label className="px-2 mb-2">User</Label>
                    {searchData?.data?.users?.length > 0 ? (
                      searchData?.data?.users?.map((user) => (
                        <div
                          key={user?._id}
                          className="p-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between w-full"
                        >
                          {/* onClick={(e) => {e.stopPropagation(); handleGroupClick(group)} left */}
                          <div className="flex space-x-2">
                            <Avatar
                              img={user?.profilePicture}
                              size="xs"
                              rounded
                            />
                            <span>{user?.username}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-gray-500 text-sm text-center">
                        No user found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>
          <div className="flex justify-between space-x-4">
            {/* Add Expense */}
            <div className="flex items-center space-x-5">
              <Button
                className="bg-white hover:!bg-green-100 !text-green-500 hover:!text-green-600 focus:ring-green-300 flex justify-center items-center"
                onClick={() => setShowModal(true)}
              >
                <span className="mr-2">+</span>
                Add expense
              </Button>
            </div>
            <div className="flex justify-center items-center space-x-4">
              <Link
                to="/chat"
                className="flex items-center gap-2.5 hover:opacity-80 transition-all"
              >
                <div className="size-9 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center border-2 border-green-200">
                  <LuMessageCircleMore className="w-5 h-5" />
                </div>
              </Link>
            </div>
            {/* <div className="flex justify-center items-center">
            <Link
              to={"/tab=profile"}
              className={`btn btn-sm gap-2 bg-transparent`}
            >
              <FaUser className="size-5" />
              <span className="hidden lg:block text-xs">Profile</span>
            </Link>
          </div> */}
          </div>
        </div>
        <AddExpense
          showModal={showModal}
          setShowModal={setShowModal}
          userDetail={userDetail}
          setUserDetail={setUserDetail}
          groupDetail={groupDetail}
          id={id}
          profilePicture={profilePicture}
          username={username}
        />
      </header>
      {name && (
        <div className="w-full max-h-fit">
          <audio
            src="https://res.cloudinary.com/dpqfajndi/video/upload/v1742296501/eu3itw8awplkudmbzvke.mp3"
            autoPlay
            loop
            className="hidden"
          ></audio>
          <div className="w-full flex justify-between items-center max-h-fit px-8 py-2 bg-slate-200 my-1">
            <p>
              <img
                src={profilePicture1}
                alt=""
                className="size-10 rounded-full relative inline"
              />
              &nbsp;&nbsp;{name}
            </p>
            <div className="flex space-x-3 justify-end items-center">
              <Button className="bg-red-500" onClick={handleDeclineClick}>
                <MdCallEnd />
              </Button>
              <Button className="bg-green-400" onClick={handleAcceptClick}>
                <MdCall />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

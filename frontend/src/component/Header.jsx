import React, { useEffect, useRef, useState } from "react";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Button, Label, Spinner, TextInput } from "flowbite-react";
import { AiOutlineSearch } from "react-icons/ai";
import { LuMessageCircleMore } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import AddExpense from "./AddExpense";
import useUserDetail from "../util/useUserDetail";
import useGroupDetail from "../util/useGroupDetail";
import toast from "react-hot-toast";
import { getSocket } from "../util/socketAction";
import { MdCall, MdCallEnd } from "react-icons/md";
import { setCalling } from "../redux/user/userSlice";

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
  const API_URL = import.meta.env.VITE_API_URL;
  const ref = useRef(null);
  const dispacth = useDispatch();

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
      if (id1 || user?.calling) {
        toast(`${name} is calling you!`);
        socket.emit("already-on-call", { from, username });
        return;
      } else if (name) {
        setId(from);
        setName(name);
        setProfilePicture(profilePicture);
      }
    });

    socket.on("already-on-call", (username) => {
      dispacth(setCalling(false));
      toast(`${username} is busy on another call`);
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
      dispacth(setCalling(false));
    });

    socket.on("end-call-by-caller", () => {
      if (name) {
        setId(null);
        setName(null);
        setProfilePicture(null);
      }
    });

    return () => {
      socket.off("incoming-call");
      socket.off("accept-click");
      socket.off("decline-click");
      socket.off("end-call-by-caller");
      socket.off("already-on-call");
    };
  }, [socket, user, name, id1, profilePicture1]);

  useEffect(() => {
    if (searchTerm) {
      const search = async () => {
        try {
          const res = await fetch(
            `${API_URL}/search?searchTerm=${searchTerm}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );

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
    dispacth(setCalling(true));
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
      <header className="border-b bg-green-50 px-2 sm:px-4 py-1.5 sticky top-0 w-full z-50">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0">
          {/* Top row with logo and buttons on mobile */}
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex justify-center">
                <img
                  src={logo || "/placeholder.svg"}
                  alt="SpliChat"
                  className="w-16 h-12 md:w-20 md:h-14 mix-blend-darken object-contain rounded-md"
                />
              </Link>
            </div>

            {/* Mobile-only buttons */}
            <div className="flex md:hidden items-center space-x-2">
              <Button
                size="sm"
                className="bg-white hover:!bg-green-100 !text-green-500 hover:!text-green-600 focus:ring-green-300 flex justify-center items-center"
                onClick={() => setShowModal(true)}
              >
                <span className="mr-1">+</span>
                Add expense
              </Button>

              <Link
                to="/chat"
                className="flex items-center hover:opacity-80 transition-all"
              >
                <div className="size-8 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center border-2 border-green-200">
                  <LuMessageCircleMore className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>

          {/* Search - full width on mobile, centered on desktop */}
          <div
            className="w-full md:w-1/2 md:mx-auto flex items-center justify-center px-0 sm:px-2 md:px-6 rounded-md"
            ref={ref}
          >
            <form className="w-full relative">
              <TextInput
                type="text"
                placeholder="Search expenses, groups & friends..."
                icon={AiOutlineSearch}
                className="w-full"
                value={searchTerm}
                id="search"
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search expenses, settle-up, groups, or friends"
              />
              {searchTerm && (
                <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-auto scrollbar-thin mt-1 px-1 left-0">
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
                          <div className="flex space-x-2 items-center">
                            <Avatar img={expense?.image} size="xs" rounded />
                            <span className="truncate max-w-[150px] sm:max-w-none">
                              {expense?.title}
                            </span>
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

                  {/* Other search result sections with similar responsive changes */}
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
                          <div className="flex space-x-2 items-center">
                            <Avatar
                              img={
                                "https://media.istockphoto.com/id/938887966/vector/two-people-icon-symbol-of-group-or-pair-of-persons-friends-contacts-users-outline-modern.jpg?s=612x612&w=0&k=20&c=575mQXvCuoAjbX6tnVXU4TIlGw9CJH6AVR0QjA4S7JA="
                              }
                              size="xs"
                              rounded
                            />
                            <span className="truncate max-w-[150px] sm:max-w-none">
                              {settleUp?.note}
                            </span>
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
                          <div className="flex space-x-2 items-center">
                            <Avatar
                              img={group?.groupProfile}
                              size="xs"
                              rounded
                            />
                            <span className="truncate max-w-[150px] sm:max-w-none">
                              {group?.name}
                            </span>
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
                          onClick={() => navigate('/chat')}
                        >
                          <div className="flex space-x-2 items-center">
                            <Avatar
                              img={user?.profilePicture}
                              size="xs"
                              rounded
                            />
                            <span className="truncate max-w-[150px] sm:max-w-none">
                              {user?.username}
                            </span>
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

          {/* Desktop-only buttons */}
          <div className="hidden md:flex justify-between space-x-4">
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

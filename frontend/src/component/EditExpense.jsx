import React, { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CiSearch } from "react-icons/ci";
import { RxCross2 } from "react-icons/rx";
import { PiSubtitlesLight } from "react-icons/pi";
import { BsCurrencyRupee } from "react-icons/bs";
import { IoFastFoodOutline } from "react-icons/io5";
import {
  MdEmojiTransportation,
  MdMovie,
  MdOutlineGroupAdd,
  MdOutlineOtherHouses,
} from "react-icons/md";
import { FaUserFriends } from "react-icons/fa";
import { AiOutlineShopping } from "react-icons/ai";
import {
  Avatar,
  Button,
  Checkbox,
  Dropdown,
  HR,
  Label,
  Modal,
  Spinner,
  Textarea,
  TextInput,
} from "flowbite-react";
import toast from "react-hot-toast";
import searchUsersApi from "../util/searchUserApi";
import fetchGroupMember from "../util/fetchGroupMember";
import { useSelector } from "react-redux";
import useUserDetail from "../util/useUserDetail";
import useGroupDetail from "../util/useGroupDetail";
import fetchExpense from "../util/fetchExpense";
import { useLocation, useNavigate } from "react-router-dom";

export default function EditExpense() {
  const [addExpenseSearchTerm, setAddExpenseSearchTerm] = useState("");
  const [expenseType, setExpenseType] = useState(null);
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [paidBy, setPaidBy] = useState("Select Paid By");
  const [paidById, setPaidById] = useState(null);
  const [splitBtwnId, setSplitBtwnId] = useState([]);
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [note, setNote] = useState(null);
  const [groupToggle, setGroupToggle] = useState(false);
  const [userSelectDetail, setUserSelectDetail] = useState([]);
  const [groupSelectDetail, setGroupSelectDetail] = useState(null);
  const [groupId, setGroupId] = useState(null);
  const [expenseTitle, setExpenseTitle] = useState(null);
  const [filteredUser, setFilteredUser] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL
  const user = useSelector((state) => state?.user);
  const id = user?.currentUser?._id;
  const profilePicture = user?.currentUser?.profilePicture;
  const username = user?.currentUser?.username;

  const ref = useRef();
  const dropdownRef = useRef(null);

  const location = useLocation()
  const queryParam = new URLSearchParams(location.search)

  const expId = queryParam.get('id')
  const groupId1 = queryParam.get('groupId') || null
  const len = queryParam.get('len')

  const navigate = useNavigate()

  useEffect(() => {
    setShowModal(queryParam.get("modal") === "true");
  }, [location.search]);

  const handleCloseModal = () => {
    setShowModal(false);
    if (window.history.length > 1) {
      navigate(-1)
    } 
    else {
      if (groupId1) {
        navigate(`/tab?tab=group&view=expense&edit=expense&id=${expId}&groupId=${groupId1}&len=${len}`);
      }
      else {
        navigate(`/tab?tab=non-group&view=expense&edit=expense&id=${expId}&len=${len}`);
      }
    }
  };

  const queryClient = useQueryClient();

  const {
    userDetail,
    userLoading,
    userError,
    userErrorMessage,
    setUserDetail,
  } = useUserDetail(id, user?.isAuthenticated);

  const { groupDetail, groupLoading, groupError, groupErrorMessage } =
    useGroupDetail(id, user?.isAuthenticated);

    const {
      data: expenseData,
      isLoading: expenseLoading,
      isError: expenseError,
      error: expenseErrorMessage,
    } = useQuery({
      queryKey: ["fetchExpense", expId],
      queryFn: fetchExpense,
    });

    useEffect(() => {
      if (expenseData?.data) {
        setExpenseType(expenseData?.data?.expenseType)
        setExpenseAmount(expenseData?.data?.amount)
        setExpenseTitle(expenseData?.data?.title)
        setNote(expenseData?.data?.note)
        setPaidById(expenseData?.data?.paidby)
        setSplitBtwnId(expenseData?.data?.splitbtwn)
      }
    }, [expenseData])

  useEffect(() => {
    if (!userDetail || !groupDetail) return;

    if (paidById) {
      const user = userDetail?.data?.friend?.find(
        (user) => user?._id?.toString() === paidById?.toString()
      );

      if (user) {
        setPaidBy(user?.username);
      } else if (paidById === id) {
        setPaidBy(username);
      }
    }

    if (userLoading || groupLoading || expenseLoading) {
        return (
          <>
            <Spinner size="sm" className="disabled" />
          </>
        );
      }

    if (userError) {
      return <div>Error: {userErrorMessage}</div>;
    }

    if (groupError) {
      return <div>Error: {groupErrorMessage}</div>;
    }

    if (expenseError) {
      return <div>Error: {expenseErrorMessage}</div>;
    }

    if (groupId1) {
      const group = groupDetail?.data?.find(
        (element) => element._id === groupId1
      );
      if (group) {
        setGroupSelectDetail(group);
      }
      const groupMember = async () => {
        const data = await fetchGroupMember(groupId1);
        setUserDetail(data);
      };
      groupMember();
    }

    const existingUserIds = new Set(userSelectDetail.map((user) => user?._id));

    if (
      paidById?.toString() !== id?.toString() &&
      !existingUserIds.has(paidById)
    ) {
      const userDetail1 = userDetail?.data?.friend?.find(
        (user) => user?._id === paidById
      );
      if (userDetail1) {
        setUserSelectDetail((prev) => [...prev, userDetail1]);
        existingUserIds.add(paidById);
      }
    }

    const missingUsers = splitBtwnId
      ?.filter(
        (split) =>
          split?.toString() !== id?.toString() && !existingUserIds.has(split)
      )
      ?.map((split) => {
        const userDetail1 = userDetail?.data?.friend?.find(
          (user) => user?._id === split
        );
        return userDetail1;
      })
      .filter(Boolean);
      
    if (missingUsers?.length > 0) {
      setUserSelectDetail((prev) => [...prev, ...missingUsers]);
    }
  }, [expId, userDetail, groupDetail]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setGroupToggle(false); // Close dropdown
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      // Clean up event listener on unmount
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const fetchFilteredUsers = async () => {
      let filtered = userDetail?.data?.friend?.filter(
        (user) =>
          user?.username
            .toLowerCase()
            .includes(addExpenseSearchTerm.toLowerCase()) &&
          !userSelectDetail.find((selected) => selected._id === user._id)
      );

      if (
        (!groupSelectDetail || !groupId) &&
        filtered?.length === 0 &&
        addExpenseSearchTerm.trim().length > 0
      ) {
        filtered = (await searchUsersApi(addExpenseSearchTerm)).filter(
          (user) =>
            !userSelectDetail.find((selected) => selected._id === user._id)
        );
      }

      setFilteredUser(filtered);
    };

    fetchFilteredUsers();
  }, [addExpenseSearchTerm, userSelectDetail, userDetail]);

  const handleUserSelect = (friendDetail) => {
    setUserSelectDetail((prev) => {
      const exist = prev.some((friend) => friend._id === friendDetail._id);

      if (!exist) {
        setAddExpenseSearchTerm("");
        return [...prev, friendDetail];
      }
      setAddExpenseSearchTerm("");
      return prev;
    });
  };

  const handleGroupSelect = async (groupDetail) => {
    setGroupSelectDetail(groupDetail);
    setGroupId(groupDetail._id);
    setGroupToggle(false);

    const data = await fetchGroupMember(groupDetail?._id);
    if (data) {
      setPaidBy("Select Paid By");
      setPaidById(null);
      setSplitBtwnId([]);
      setUserSelectDetail([]);
      setExpenseType("Group");
      setUserDetail(data);
    }
  };

  const expenseTypes = [
    { icon: <IoFastFoodOutline className="text-xl" />, label: "Food" },
    {
      icon: <MdEmojiTransportation className="text-xl" />,
      label: "Transportation",
    },
    { icon: <AiOutlineShopping className="text-xl" />, label: "Shopping" },
    { icon: <MdMovie className="text-xl" />, label: "Entertainment" },
    { icon: <FaUserFriends className="text-xl" />, label: "Non group" },
    { icon: <MdOutlineGroupAdd className="text-xl" />, label: "Group" },
    { icon: <MdOutlineOtherHouses className="text-xl" />, label: "Other" },
  ];

  const handleUserRemove = (userId) => {
    setUserSelectDetail(
      userSelectDetail?.filter((user) => user._id !== userId)
    );
    setAddExpenseSearchTerm("");
    if (paidById === userId) {
      setPaidById("");
      setPaidBy("Select Paid By");
    }
    setSplitBtwnId(splitBtwnId?.filter((id) => id !== userId));
  };

  const handleCheckboxChange = (id) => {
    setSplitBtwnId((prevIds) => {
      const currentIds = Array.isArray(prevIds) ? prevIds : [];
      if (currentIds.includes(id)) {
        return currentIds.filter((userId) => userId !== id);
      } else {
        return [...currentIds, id];
      }
    });
  };

  const editExpense = async () => {
    try {
      const res = await fetch(`${API_URL}/expense/update/${expId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: expId,
          title: expenseTitle,
          amount: expenseAmount,
          currency: "INR",
          paidby: paidById,
          splitbtwn: splitBtwnId,
          note: note,
          isGroupExpense: groupId ? true : false,
          groupId: groupId,
          expenseType:
            expenseType === "Select an option" ? "Other" : expenseType,
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
          queryClient.invalidateQueries("nonGroupExpense", {
            refetchActive: true,
          });
          queryClient.invalidateQueries("groupExpense", {
            refetchActive: true,
          });
          queryClient.invalidateQueries("settleUpDetail", {
            refetchActive: true,
          });
          queryClient.invalidateQueries("fetchExpense", {
            refetchActive: true,
          })
          toast.success(data.message);
          handleCloseModal()
        }
        return data;
      }
    } catch (error) {
      console.log("error", error.message);
      toast.error("Something went wrong");
    }
  };

  const handleAddExpenseSubmit = () => {
    editExpense();
  };

  const validateFields = () => {
    if (userSelectDetail.length === 0)
      return toast.error("Please select at least one user");
    if (!expenseTitle.trim()) return toast.error("Expense title is required.");
    if (!expenseAmount || isNaN(expenseAmount) || Number(expenseAmount) <= 0)
      return toast.error("A valid amount is required.");
    if (!paidById) return toast.error("Paid by information is required.");
    if (!splitBtwnId.length)
      return toast.error(
        "At least one user must be selected to split the expense."
      );

    setIsGroupDropdownOpen(false);
    setUserDropdownOpen(false);
    handleAddExpenseSubmit();
    setAddExpenseSearchTerm("");
  };

  return (
    <Modal
      show={showModal}
      popup
      onClose={() => {
        handleCloseModal()
        setIsGroupDropdownOpen(false);
        setUserDropdownOpen(false);
      }}
      size="xl"
      initialFocus={ref}
    >
      <Modal.Header>Edit Expense</Modal.Header>
      <HR className="h-[1px] my-1 bg-slate-200 border-none" />
      <Modal.Body className="scrollbar-thin">
        <form className="space-y-3.5">
          <div>
            <Label htmlFor="userSearch" className="whitespace-nowrap">
              With you and:
            </Label>
            <div className="relative mt-1">
              <TextInput
                type="text"
                id="userSearch"
                value={addExpenseSearchTerm}
                onChange={(e) => setAddExpenseSearchTerm(e.target.value)}
                ref={ref}
                icon={CiSearch}
                required
                sizing="sm"
                className="w-full"
                placeholder="Type to search users..."
              />
            </div>

            {addExpenseSearchTerm && (
              <div className="absolute z-10 w-11/12 bg-white border rounded-md shadow-lg max-h-48 overflow-auto scrollbar-thin mt-1">
                {filteredUser?.length > 0 ? (
                  filteredUser.map((friend, id) => (
                    <div
                      key={id}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 w-full"
                      onClick={() => handleUserSelect(friend)}
                    >
                      <Avatar img={friend?.profilePicture} size="xs" rounded />
                      <span>{friend?.username}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500 text-sm text-center">
                    {groupId || groupSelectDetail
                      ? `${addExpenseSearchTerm} is not a memeber of this group`
                      : "User not found"}
                  </div>
                )}
              </div>
            )}

            {userSelectDetail?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {userSelectDetail?.map((user, id) => (
                  <div
                    key={id}
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

          <div>
            <Label htmlFor="title">Title</Label>
            <TextInput
              id="title"
              type="text"
              placeholder="Enter expense title"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              className="mt-1"
              icon={PiSubtitlesLight}
              required
              sizing="sm"
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <TextInput
              type="number"
              sizing="sm"
              id="amount"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              icon={BsCurrencyRupee}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="note">Add a note</Label>
            <Textarea
              id="note"
              placeholder="Enter a note for this expense"
              rows={3}
              className="mt-1"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex gap-2 items-center scrollbar-thin">
            <Label htmlFor="paidBy">Paid by:</Label>
            <Dropdown
              label={paidBy}
              id="paidBy"
              dismissOnClick={true}
              inline={false}
              size="xs"
              className="w-fit mt-1"
            >
              <Dropdown.Item
                onClick={() => {
                  setPaidBy(username);
                  setPaidById(id);
                }}
                className="flex items-center gap-1"
              >
                <div className="p-1 hover:bg-gray-100 cursor-pointer flex items-center gap-2 w-full">
                  <Avatar img={profilePicture} size="xs" rounded />
                  <span>{username}</span>
                </div>
              </Dropdown.Item>
              {userSelectDetail?.map((friend, id) => (
                <Dropdown.Item
                  key={id}
                  onClick={() => {
                    setPaidBy(friend?.username);
                    setPaidById(friend?._id);
                  }}
                  className="flex items-center gap-1"
                >
                  <div className="p-1 hover:bg-gray-100 cursor-pointer flex items-center gap-2 w-full">
                    <Avatar img={friend?.profilePicture} size="xs" rounded />
                    <span>{friend?.username}</span>
                  </div>
                </Dropdown.Item>
              ))}
            </Dropdown>
          </div>

          <div className="flex gap-2 items-center scrollbar-thin">
            <Label htmlFor="splitBtwn">Split between:</Label>
            <Dropdown
              label={"Equally"}
              id="splitBtwn"
              dismissOnClick={false}
              inline={false}
              size="xs"
              className="w-fit mt-1"
            >
              <Dropdown.Item className="flex items-center gap-1">
                <div className="flex items-center justify-between w-full">
                  <Label
                    htmlFor={`checkbox-${id}`}
                    className={`p-1 hover:bg-gray-100 cursor-pointer flex items-center justify-between w-full ${
                      splitBtwnId.length === 0 || splitBtwnId.length === 1
                        ? "gap-3"
                        : null
                    }`}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Avatar img={profilePicture} size="xs" rounded />
                      <span>{username}</span>
                    </div>
                    <Checkbox
                      id={`checkbox-${id}`}
                      checked={splitBtwnId.includes(id)}
                      onChange={() => handleCheckboxChange(id)}
                      className="ml-auto"
                    />
                  </Label>
                </div>
              </Dropdown.Item>
              {userSelectDetail?.map((friend, id) => (
                <Dropdown.Item key={id}>
                  <div className="flex items-center justify-between w-full">
                    <Label
                      htmlFor={`checkbox-${friend?._id}`}
                      className="p-1 hover:bg-gray-100 cursor-pointer flex items-center justify-between w-full"
                    >
                      <div className="flex items-center gap-2 w-fit">
                        <Avatar
                          img={friend?.profilePicture}
                          size="xs"
                          rounded
                        />
                        <span>{friend?.username}</span>
                      </div>
                      <Checkbox
                        id={`checkbox-${friend?._id}`}
                        checked={splitBtwnId.includes(friend?._id)}
                        onChange={() => handleCheckboxChange(friend?._id)}
                        className="ml-2"
                      />
                    </Label>
                  </div>
                </Dropdown.Item>
              ))}
            </Dropdown>
          </div>

          <div className="flex items-center gap-3 scrollbar-thin">
            <Label htmlFor="ExpenseType">Expense type:</Label>
            <Dropdown
              label={expenseType}
              id="ExpenseType"
              dismissOnClick={true}
              inline={false}
              size="xs"
              className="w-fit"
            >
              {expenseTypes.map((type, id) => (
                <Dropdown.Item
                  key={id}
                  onClick={() => setExpenseType(type.label)}
                  className="flex items-center gap-2"
                >
                  {type.icon}&nbsp;
                  {type.label}
                </Dropdown.Item>
              ))}
            </Dropdown>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <div className="w-full flex justify-between">
          <div className="relative" ref={dropdownRef}>
            {groupSelectDetail ? (
              <div className="flex items-center justify-center gap-2 bg-slate-100 text-slate-800 px-2 py-1 rounded-lg">
                <Avatar
                  img={groupSelectDetail?.groupProfile}
                  size="sm"
                  rounded
                />
                <span>{groupSelectDetail?.name}</span>
                <Button
                  color="gray"
                  pill
                  className="p-0 flex justify-center items-center"
                  size="xs"
                  onClick={() => {
                    setGroupSelectDetail(null);
                    setExpenseType("Select an option");
                    setGroupId(null);
                  }}
                >
                  <RxCross2 className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                color="gray"
                className="rounded-lg w-fit"
                onClick={() => {
                  setGroupToggle(true);
                }}
              >
                Choose a group
              </Button>
            )}
            {groupToggle && groupDetail?.data?.length > 0 ? (
              <div className="absolute bottom-full left-0 w-auto mb-1">
                <ul className="bg-white border rounded-lg w-auto shadow-lg max-h-60 overflow-auto scrollbar-thin">
                  {groupDetail?.data?.map((group) => (
                    <li
                      key={group._id}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleGroupSelect(group)}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={group?.groupProfile}
                          alt="Group"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="font-medium whitespace-nowrap">
                          {group?.name}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="flex justify-end gap-3">
            <Button
              color="gray"
              onClick={() => {
                setIsGroupDropdownOpen(false);
                setUserDropdownOpen(false);
                handleCloseModal()
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

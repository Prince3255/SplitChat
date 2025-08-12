import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import banner1 from "../assets/banner1.webp";
import { Button, Spinner } from "flowbite-react";
import { dateFormater } from "../util/dateFormater";
import toast from "react-hot-toast";
import ExpenseSkeleton from "../component/skeleton/ExpenseSkeleton";
import { fetchUserDetail } from "../util/fetchUserDetail";
import Settleup from "./Settleup";
import Expense from "./Expense";
import SettleUp from "../component/SettleUp";
import { useLocation, useNavigate } from "react-router-dom";

const userExpense = async ({ queryKey }) => {
  const [_, id, groupId] = queryKey;
  const API_URL = import.meta.env.VITE_API_URL;
  let url = `${API_URL}/user/${id}/expense/user`;

  if (groupId) {
    url += `?groupId=${groupId}`;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!res.ok) {
      toast.error(res.statusText);
      return;
    }

    const data = await res.json();

    if (!data.success) {
      toast(data.message);
      return { success: false, data: [] };
    } else {
      return data;
    }
  } catch (error) {
    console.log("error", error.message);
    toast.error(error.message);
  }
};

export default function NonGroup() {
  const user = useSelector((state) => state.user);
  const id = user?.currentUser._id;
  const profilePicture = user?.currentUser.profilePicture;
  const [userData, setUserData] = useState([]);
  const [expense, setExpense] = useState([]);

  const [userDetail, setUserDetail] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  let edit = queryParams.get("edit");

  const navigate = useNavigate();

  const {
    data: expenseData,
    isLoading: expenseLoading,
    isError: expenseError,
    error: expenseErrorMessage,
  } = useQuery({
    queryKey: ["nonGroupExpense", id],
    queryFn: userExpense,
  });

  const {
    data: userData1,
    isLoading: userLoading,
    isError: userError,
    error: userErrorMessage,
  } = useQuery({
    queryKey: ["userDetail", id],
    queryFn: fetchUserDetail,
  });

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    if (userData) {
      const newUser = {
        _id: id,
        username: user?.currentUser?.username,
        profilePicture: profilePicture,
      };

      const updatedUserDetail = {
        ...userData1,
        data: {
          ...userData1?.data,
          friend: [...(userData1?.data?.friend || []), newUser],
        },
      };

      setUserDetail(updatedUserDetail);
    }
  }, [userData1]);

  useEffect(() => {
    let tempUserData = {};
    let tempExpense = [];
    if (expenseData?.data?.userExpense?.length > 0) {
      expenseData?.data?.userExpense?.map((item, _) => {
        item?.userDetails?.map((item1, _) => {
          if (!tempUserData[item1._id]) {
            tempUserData[item1._id] = {
              id: item1._id,
              name: item1?.username,
              image: item1?.profilePicture,
            };
          }
        });

        const combinedArray = [
          ...item?.userExpenses,
          ...item?.settledTransaction,
        ];

        const latest = combinedArray.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        tempExpense.push(latest);
      });
    }

    setExpense(tempExpense);
    setUserData(tempUserData);
  }, [expenseData]);

  if (expenseLoading || userLoading) {
    return <ExpenseSkeleton />;
  }

  if (expenseError) {
    return <div>Error: {expenseErrorMessage.message}</div>;
  }

  if (!expenseData) {
    return <div>No expense data</div>;
  }

  if (userError) {
    return <div>Error: {userErrorMessage}</div>;
  }

  const getName = (id) => {
    if (userData[id]?.name) {
      return userData[id]?.name;
    }
    return "unknown";
  };

  const getImage = (id) => {
    if (userData[id]?.image) {
      return userData[id]?.image;
    }
    return "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg?w=360";
  };

  const handleExpenseClick = (id1) => {
    // setExpenseId(id);
    navigate(
      `/tab?tab=non-group&view=expense&edit=expense&id=${id1}&len=${
        expenseData?.data?.userExpense[0]?.userExpenses?.length || 0
      }`
    );
  };

  const handleSettleUpClick = (item1) => {
    navigate(
      `/tab?tab=non-group&view=expense&edit=settleup&sid=${item1?._id}&len=${
        expenseData?.data?.userExpense[0]?.userExpenses?.length || 0
      }`
    );
    // setSettleUpId(item1?._id);
    // setSettleUpItem(item1);
  };

  if (edit === "expense") {
    return <Expense />;
  }

  if (edit === "settleup") {
    return <SettleUp />;
  }

  return (
    <div className="w-full min-h-screen">
      <div className="relative w-full mb-10">
        <div className="w-full max-h-28 sm:max-h-36 md:max-h-44 overflow-hidden">
          <img
            src={banner1}
            alt="banner"
            className="w-full h-full object-cover overflow-hidden"
          />
        </div>
        <div className="w-12 h-12 sm:w-16 sm:h-16 absolute border-2 rounded-lg top-2/3 left-4 sm:left-28">
          <img
            src={banner1}
            alt="img"
            className="w-full h-full rounded-md border-2 object-cover"
          />
        </div>
      </div>

      <div className="w-full p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-3 gap-4 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold">Non-group expenses</h1>
          <Button
            className="w-full sm:w-auto bg-white hover:!bg-green-100 !text-green-500 hover:!text-green-600 focus:ring-green-300 border border-slate-200"
            onClick={() => setShowModal(true)}
          >
            Settle up
          </Button>
        </div>
        {expenseData?.data?.userExpense?.length > 0 && (
          <>
            <div className="flex flex-col space-y-3.5">
              {expenseData?.data?.userExpense?.map((item, id) => {
                return (
                  <div key={id} className="px-2 space-y-2">
                    {Object.keys(item?.total) ? (
                      <>
                        {Object.keys(item?.total)?.map((key) => {
                          return (
                            key !== user?.currentUser?._id && (
                              <p key={key} className="text-sm sm:text-base">
                                {item?.total[key]?.lent ? (
                                  <>
                                    {item?.total[key]?.lent !== 0 && (
                                      <>
                                        <span className="font-medium">
                                          {user?.currentUser?.username}
                                        </span>{" "}
                                        owe{" "}
                                        <span className="font-medium">
                                          {getName(key)}
                                        </span>{" "}
                                        <span className="text-red-400">
                                          ₹
                                          {Number(
                                            item?.total[key]?.lent
                                          ).toFixed(2) || 0}
                                        </span>
                                      </>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {item?.total[key]?.owed != null && item?.total[key]?.owed != 0 && (
                                      <>
                                        <span className="font-medium">
                                          {getName(key)}
                                        </span>{" "}
                                        owes{" "}
                                        <span className="font-medium">
                                          {user?.currentUser?.username}
                                        </span>{" "}
                                        <span className="text-teal-500">
                                          ₹
                                          {Number(
                                            item?.total[key]?.owed
                                          ).toFixed(2) || 0}
                                        </span>
                                      </>
                                    )}
                                  </>
                                )}
                              </p>
                            )
                          );
                        })}
                      </>
                    ) : (
                      <>
                        {item?.userExpenses?.length > 0 && (
                          <p key={id} className="text-sm sm:text-base">
                            You are all settled up for these expenses.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col justify-between items-center w-full mt-8 space-y-8 px-2 py-1">
              {expense[0]?.map((item1, id) => (
                <div
                  className="flex justify-between items-center w-full cursor-pointer hover:bg-gray-100 transition duration-200 p-2 rounded border-b border-gray-300"
                  key={id}
                >
                  {item1?.settledBy || item1?.settledWith ? (
                    <>
                      <div
                        className="flex justify-between items-center gap-2 w-full"
                        onClick={(e) => handleSettleUpClick(item1)}
                      >
                        <img
                          src={getImage(item1?.settledBy)}
                          alt="img"
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1 text-sm sm:text-base">
                          {item1?.settledBy === user?.currentUser._id ? (
                            <span>
                              <span className="font-medium">
                                {getName(item1?.settledBy)}
                              </span>{" "}
                              settled their{" "}
                              {<span>₹{Number(item1?.amount).toFixed(2)}</span>}{" "}
                              with{" "}
                              {
                                <span className="font-medium">
                                  {getName(item1?.settledWith)}
                                </span>
                              }{" "}
                              on
                            </span>
                          ) : (
                            <span>
                              {
                                <span>
                                  <span className="font-medium">
                                    {getName(item1?.settledBy)}
                                  </span>{" "}
                                  settled their ₹
                                  {Number(item1?.amount).toFixed(2)} with{" "}
                                  <span className="font-medium">
                                    {getName(item1?.settledWith)}
                                  </span>{" "}
                                  on
                                </span>
                              }
                            </span>
                          )}
                          <span className="text-gray-500 block sm:inline">
                            {" "}
                            {dateFormater(item1?.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2"
                        onClick={() => handleExpenseClick(item1?._id)}
                        key={item1?._id}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={getImage(item1?.paidby)}
                            alt="img"
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                          <div className="text-sm sm:text-base">
                            {item1?.paidby === user?.currentUser._id ? (
                              <span>
                                <span className="font-medium">
                                  {user?.currentUser?.username}
                                </span>{" "}
                                paid{" "}
                                {
                                  <span>
                                    ₹{Number(item1?.amount).toFixed(2)}
                                  </span>
                                }{" "}
                                for
                              </span>
                            ) : (
                              <span>
                                <span className="font-medium">
                                  {getName(item1?.paidby)}
                                </span>{" "}
                                paid{" "}
                                {
                                  <span>
                                    ₹{Number(item1?.amount).toFixed(2)}
                                  </span>
                                }{" "}
                                for
                              </span>
                            )}
                            <span className="font-medium">
                              {" "}
                              {item1?.title}{" "}
                            </span>
                            on
                            <span className="text-gray-500 block sm:inline">
                              {" "}
                              {dateFormater(item1?.updatedAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {item1?.paidby === user?.currentUser._id ? (
                            <span className="font-semibold text-teal-500 flex flex-col justify-between items-end text-xs">
                              <span>you lent</span>
                              <span>
                                ₹
                                {item1?.splitbtwn?.includes(
                                  user?.currentUser._id
                                ) ? (
                                  <>
                                    {Number(
                                      item1?.amount -
                                        item1?.amount / item1?.splitbtwn?.length
                                    ).toFixed(2)}
                                  </>
                                ) : (
                                  <>{Number(item1?.amount).toFixed(2)}</>
                                )}
                              </span>
                            </span>
                          ) : (
                            <span className="font-semibold text-red-400 flex flex-col justify-between items-end text-xs">
                              <span>you borrowed</span>
                              <span>
                                ₹
                                {Number(
                                  item1?.amount / item1?.splitbtwn?.length
                                ).toFixed(2)}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Settleup
        showModal={showModal}
        setShowModal={setShowModal}
        userDetail={userDetail}
        setUserDetail={setUserDetail}
        id={id}
        profilePicture={profilePicture}
        groupId1={null}
        user={user}
      />
    </div>
  );
}

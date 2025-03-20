import { Button, Card } from "flowbite-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import DashboardSkeleton from "../component/skeleton/DashboardSkeleton";
import fetchUser from "../util/fetchUser";
import { Link } from "react-router-dom";

const userExpense = async ({ queryKey }) => {
  const [_, id, groupId] = queryKey;
  let url = `/api/user/${id}/expense/user`;

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

const groupExpense = async ({ queryKey }) => {
  const [_, id] = queryKey;
  let url = `/api/user/${id}/expense/group`;

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
      if (data.message !== "User Expense Not Found") {
        toast(data.message);
      }
      return { success: false, data: [] };
    } else {
      return data;
    }
  } catch (error) {
    console.log("error", error.message);
    toast.error(error.message);
  }
};

export default function Dashboard({ onViewNonGroup, onViewGroup }) {
  const [owed, setOwed] = useState(0);
  const [lent, setLent] = useState(0);
  const [nonGroupData, setNonGroupData] = useState([]);
  const [groupData2, setGroupData] = useState([]);
  const user = useSelector((state) => state.user);
  const id = user?.currentUser._id;

  const {
    data: userData,
    isLoading: userLoading,
    isError: userError,
    error: userErrorMessage,
  } = useQuery({
    queryKey: ["dashUser", id],
    queryFn: fetchUser,
    enabled: user?.isAuthenticated,
  });

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
    data: groupData,
    isLoading: groupLoading,
    isError: groupError,
    error: groupErrorMessage,
  } = useQuery({
    queryKey: ["groupExpense", id],
    queryFn: groupExpense,
  });

  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    let tempNonGroupData = [];
    let tempGroupData = [];
    let totalOwed = 0;
    let totalLent = 0;
    let groupOwed = 0;
    let groupLent = 0;
    if (expenseData) {
      for (let key in expenseData?.data?.userExpense[0]?.total || {}) {
        const { owed = 0, lent = 0 } =
          expenseData?.data?.userExpense[0]?.total[key] || {};
        totalOwed += owed;
        totalLent += lent;

        if (key !== id) {
          if (tempNonGroupData.length <= 2) {
            expenseData?.data?.userExpense[0]?.userDetails?.map((userId) => {
              if (userId?._id === key) {
                const obj = {
                  id: userId?._id,
                  name: userId?.username,
                  profile: userId?.profilePicture,
                };
                if (owed !== 0) {
                  obj.owed = owed;
                }
                if (lent !== 0) {
                  obj.lent = lent;
                }
                tempNonGroupData.push(obj);
              }
            });
          }
        }
      }
    }

    if (groupData?.data?.groupExpense?.length > 0) {
      groupData?.data?.groupExpense?.map((item, _) => {
        groupLent = item?.totalLent + item?.totalSettlementLent;
        groupOwed = item?.totalOwed + item?.totalSettlementOwed;

        const obj = {
          id: item._id,
          name: item.name,
          image: item.image,
        };

        if (groupLent > groupOwed) {
          obj.lent = groupLent - groupOwed;
          totalLent += obj.lent;
        } else if (groupOwed > groupLent) {
          obj.owed = groupOwed - groupLent;
          totalOwed += obj.owed;
        }
        if(tempGroupData?.length <= 2) {
          tempGroupData.push(obj);
        }
      });
    }

    setGroupData(tempGroupData);
    setNonGroupData(tempNonGroupData);
    setOwed(totalOwed);
    setLent(totalLent);
  }, [expenseData, groupData]);

  // Render loading states
  if (userLoading || expenseLoading || groupLoading) {
    return <DashboardSkeleton />;
  }

  // Render error states
  if (userError) {
    return <div>Error: {userErrorMessage.message}</div>;
  }
  if (expenseError) {
    return <div>Error: {expenseErrorMessage.message}</div>;
  }
  if (groupError) {
    return <div>Error: {groupErrorMessage.message}</div>;
  }

  // Handle no data cases
  // if (!userData) {
  //   return <div>No user data</div>;
  // }
  // if (!expenseData) {
  //   return <div>No non-group expense data</div>;
  // }
  // if (!groupData) {
  //   return <div>No group expense data</div>;
  // }

  return (
    <div className="w-full p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <div className="space-y-5">
        {/* Total Summary */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Total summary</h2>
          <div className="flex justify-between mb-8 items-center space-x-2">
            <div className="flex-1 flex flex-col justify-between space-y-5">
              <h3 className="text-gray-500 text-base">Total amount you owe</h3>
              <p className="text-xl sm:text-2xl font-bold text-red-400">
                ₹{Number(lent).toFixed(2)}
              </p>
            </div>
            <div className="flex-1 flex flex-col justify-between space-y-5">
              <h3 className="text-gray-500 text-base">
                Total amount owe to you
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-teal-500">
                ₹{Number(owed).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        {/* Non Group Expenses */}
        <Card>
          <div className="w-full flex justify-between items-center">
            <h2 className="text-xl font-semibold mb-4">
              Non-Group Expense Summary
            </h2>
            <Link to="/?tab=non-group">
              <Button
                type="button"
                gradientDuoTone="greenToBlue"
                outline
                onClick={onViewNonGroup}
                className="w-fit"
              >
                View all
              </Button>
            </Link>
          </div>
          <div className="flex justify-between mb-8 items-start space-x-2">
            <div className="flex-1 flex flex-col space-y-5 pr-2">
              <h3 className="text-gray-500 text-base">Friends you owe</h3>
              <div className="flex flex-col space-y-2 p-1">
                {nonGroupData?.length > 0 &&
                nonGroupData?.some((item) => item?.lent) ? (
                  nonGroupData?.map((item, id) => {
                    return (
                      item?.lent && (
                        <div
                          key={id}
                          className="flex justify-between items-center"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={item?.profile}
                              alt="Avatar"
                              className="w-8 h-8 rounded-full"
                            />
                            <span className="text-md font-medium">
                              {item?.name}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-red-400">
                            ₹{Number(item?.lent).toFixed(2)}
                          </span>
                        </div>
                      )
                    );
                  })
                ) : (
                  <p className="text-gray-300">No amount to owe</p>
                )}
              </div>
            </div>
            <div className="flex-1 flex flex-col space-y-5 pr-2">
              <h3 className="text-gray-500 text-base">Friends owe to you</h3>
              <div className="flex flex-col space-y-2 p-1">
                {nonGroupData?.length > 0 &&
                nonGroupData?.some((item) => item?.owed) ? (
                  nonGroupData?.map((item, id) => {
                    return (
                      item?.owed && (
                        <div
                          key={id}
                          className="flex justify-between items-center"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={item?.profile}
                              alt="Avatar"
                              className="w-8 h-8 rounded-full"
                            />
                            <span className="text-md font-medium">
                              {item?.name}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-teal-500">
                            ₹{Number(item?.owed).toFixed(2)}
                          </span>
                        </div>
                      )
                    );
                  })
                ) : (
                  <p className="text-gray-300">No amount you owe</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Group Expenses */}
        <Card>
          <div className="w-full flex justify-between items-center">
            <h2 className="text-xl font-semibold mb-4">
              Group Expense Summary
            </h2>
            <Link to="/?tab=group">
              <Button
                type="button"
                gradientDuoTone="greenToBlue"
                outline
                onClick={onViewGroup}
                className="w-fit"
              >
                View all
              </Button>
            </Link>
          </div>
          <div className="flex justify-between mb-8 items-start space-x-2">
            <div className="flex-1 flex flex-col space-y-5 pr-2">
              <h3 className="text-gray-500 text-base">Groups you owe</h3>
              <div className="flex flex-col space-y-2 p-1">
                {groupData2?.length > 0 &&
                groupData2.some((item) => item?.lent) ? (
                  groupData2?.map((item, id) => {
                    return (
                      item?.lent && (
                        <div
                          key={id}
                          className="flex justify-between items-center"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={item?.image}
                              alt="Avatar"
                              className="w-8 h-8 rounded-full"
                            />
                            <span className="text-md font-medium">
                              {item?.name}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-red-400">
                            ₹{Number(item?.lent).toFixed(2)}
                          </span>
                        </div>
                      )
                    );
                  })
                ) : (
                  <p className="text-gray-300">No amount to owe</p>
                )}
              </div>
            </div>
            <div className="flex-1 flex flex-col space-y-5 pr-2">
              <h3 className="text-gray-500 text-base">Groups owe to you</h3>
              <div className="flex flex-col space-y-2 p-1">
                {groupData2?.length > 0 &&
                groupData2.some((item) => item?.owed) ? (
                  groupData2?.map((item, id) => {
                    return (
                      item?.owed && (
                        <div
                          key={id}
                          className="flex justify-between items-center"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={item?.image}
                              alt="Avatar"
                              className="w-8 h-8 rounded-full"
                            />
                            <span className="text-md font-medium">
                              {item?.name}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-teal-500">
                            ₹{Number(item?.owed).toFixed(2)}
                          </span>
                        </div>
                      )
                    );
                  })
                ) : (
                  <p className="text-gray-300">No amount you owe</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Button, Card, Spinner } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { HiOutlineArrowRight } from "react-icons/hi";
import toast from "react-hot-toast";
import GroupSkeleton from "../component/skeleton/GroupSkeleton";
import { dateFormater } from "../util/dateFormater";
import GroupExpense from "./GroupExpense";
import AddGroup from "../component/AddGroup";
import { fetchUserDetail } from "../util/fetchUserDetail";
import { Link, useLocation } from "react-router-dom";

const groupExpense = async ({ queryKey }) => {
  const [_, id] = queryKey;
  const API_URL = import.meta.env.VITE_API_URL
  let url = `${API_URL}/user/${id}/expense/group`;

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

export default function Group() {
  const user = useSelector((state) => state.user);
  const id = user?.currentUser._id;
  const [groupData2, setGroupData2] = useState([]);
  const [settlementData, setSettlementData] = useState([]);
  const [selectGroup, setSelectGroup] = useState(null);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [userDetail, setUserDetail] = useState(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const view = queryParams.get("view");
  const groupId = queryParams.get("id");
  const len = queryParams.get("len");

  const {
    data: groupData,
    isLoading: groupLoading,
    isError: groupError,
    error: groupErrorMessage,
  } = useQuery({
    queryKey: ["groupExpense", id],
    queryFn: groupExpense,
  });

  const {
    data: userData,
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
      setUserDetail(userData);
    }
  }, [userData]);

  const getLatestObject = (userExpenses = [], settlements = []) => {
    let combined = [];
    if (!Array.isArray(settlements || settlements?.length === 0)) {
      combined = [...userExpenses];
    } else {
      combined = [...userExpenses, ...settlements];
    }

    const top3Latest = combined
      .sort(
        (a, b) =>
          new Date(b?.updatedAt)?.getTime() - new Date(a?.updatedAt)?.getTime()
      )
      .slice(0, 3);

    return top3Latest;
  };

  useEffect(() => {
    let tempGroupData = [];
    let tempSettlementData = {};
    let groupLent = 0;
    let groupOwed = 0;
    if (
      groupData?.data?.groupExpense?.length > 0 ||
      groupData?.data?.otherGroupDetail?.length > 0
    ) {
      groupData?.data?.groupExpense?.forEach((item) => {
        groupLent = item?.totalLent + item?.totalSettlementLent;
        groupOwed = item?.totalOwed + item?.totalSettlementOwed;

        const obj = {
          id: item._id,
          name: item.name,
          image: item.image,
        };

        if (groupLent > groupOwed) {
          obj.lent = groupLent - groupOwed;
        } else if (groupOwed > groupLent) {
          obj.owed = groupOwed - groupLent;
        }
        obj.data = getLatestObject(item.userExpenses, item.settlements);

        tempGroupData.push(obj);
      });

      groupData?.data?.otherGroupDetail?.forEach((item) => {
        groupLent = item?.totalLent + item?.totalSettlementLent;
        groupOwed = item?.totalOwed + item?.totalSettlementOwed;

        const obj = {
          id: item._id,
          name: item.name,
          image: item.image,
        };

        if (groupLent > groupOwed) {
          obj.lent = groupLent - groupOwed;
        } else if (groupOwed > groupLent) {
          obj.owed = groupOwed - groupLent;
        }

        let settlement = [];

        if (Array.isArray(item?.settlements)) {
          settlement = item.settlements;
        } else if (item?.settlements) {
          settlement = [item.settlements];
        }

        obj.data = getLatestObject(item.userExpenses, settlement);
        tempGroupData.push(obj);
      });
    }

    if (
      groupData?.data?.settleupDetail?.length > 0 ||
      groupData?.data?.otherGroupDetail?.length > 0
    ) {
      groupData?.data?.settleupDetail?.forEach((item) => {
        item?.settledByDetails.forEach((item1) => {
          if (!tempSettlementData[item1._id]) {
            tempSettlementData[item1._id] = {
              name: item1.username,
              image: item1.profilePicture,
            };
          }
        });

        item?.settledWithDetails.forEach((item2) => {
          if (!tempSettlementData[item2._id]) {
            tempSettlementData[item2._id] = {
              name: item2.username,
              image: item2.profilePicture,
            };
          }
        });
      });

      groupData?.data?.otherGroupDetail?.forEach((item) => {
        item?.settledByDetails.forEach((item1) => {
          if (!tempSettlementData[item1._id]) {
            tempSettlementData[item1._id] = {
              name: item1.username,
              image: item1.profilePicture,
            };
          }
        });

        item?.settledWithDetails.forEach((item2) => {
          if (!tempSettlementData[item2._id]) {
            tempSettlementData[item2._id] = {
              name: item2.username,
              image: item2.profilePicture,
            };
          }
        });
      });
    }

    if (
      tempGroupData?.length > 0 ||
      groupData?.data?.otherGroupProfile?.length > 0
    ) {
      groupData?.data?.otherGroupProfile?.map((item3) => {
        const obj = {
          id: item3?._id,
          name: item3?.name,
          image: item3?.groupProfile,
        };
        tempGroupData.push(obj);
      });
    }

    setGroupData2(tempGroupData);
    setSettlementData(tempSettlementData);
  }, [groupData]);

  if (userLoading) {
    return (
      <>
        <Spinner size="sm" className="disabled" />
      </>
    );
  }

  if (userError) {
    return <div>Error: {userErrorMessage}</div>;
  }

  if (groupLoading) {
    return <GroupSkeleton />;
  }

  if (groupError) {
    return <div>Error: {groupErrorMessage.message}</div>;
  }

  if (!groupData) {
    return <div>No user data</div>;
  }

  const getName = (id) => {
    return settlementData[id].name;
  };

  const getImage = (id) => {
    return settlementData[id].image;
  };

  return (
    <>
      {view === "expense" ? (
        <GroupExpense />
      ) : (
        <div className="w-full p-4 sm:p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Groups</h1>
            <Button
              className="bg-white hover:!bg-green-100 !text-green-500 hover:!text-green-600 focus:ring-green-300 flex justify-center items-center border border-slate-200"
              onClick={() => setShowModal(true)}
            >
              <span className="mr-2">+</span>
              Add group
            </Button>
          </div>

          <div className="space-y-5">
            {groupData2?.map((item, id) => (
              <Card key={id}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={item?.image}
                      alt="img"
                      className="w-12 h-12 rounded-full"
                    />
                    <h2 className="text-xl font-medium">{item?.name}</h2>
                  </div>
                  <div className="text-right">
                    {item?.owed ? (
                      <>
                        {Number.isNaN(Number(item?.owed)) ? null : (
                          <>
                            <div className="text-sm text-gray-500">
                              you are owed
                            </div>
                            <div className="text-xl font-bold text-teal-500">
                              ₹{Number(item?.owed).toFixed(2)}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {Number.isNaN(Number(item?.lent)) ? null : (
                          <>
                            <div className="text-sm text-gray-500">you owe</div>
                            <div className="text-xl font-bold text-red-400">
                              ₹{Number(item?.lent).toFixed(2)}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-5">
                  {item?.data?.length > 0 ? (
                    <>
                      {item?.data?.map((item1, id) => (
                        <div
                          className="flex justify-between items-center group px-5"
                          key={id}
                        >
                          {item1?.settledBy || item1?.settledWith ? (
                            <>
                              <div className="flex items-center gap-2">
                                <img
                                  src={getImage(item1?.settledBy)}
                                  alt="img"
                                  className="w-8 h-8 rounded-full"
                                />
                                <div>
                                  {item1?.settledBy ===
                                  user?.currentUser._id ? (
                                    <span>
                                      <span className="font-medium">
                                        {getName(item1?.settledBy)}
                                      </span>{" "}
                                      settled their{" "}
                                      {
                                        <span>
                                          ₹{Number(item1?.amount).toFixed(2)}
                                        </span>
                                      }{" "}
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
                                          {Number(item1?.amount).toFixed(2)}{" "}
                                          with{" "}
                                          <span className="font-medium">
                                            {getName(item1?.settledWith)}
                                          </span>{" "}
                                          on
                                        </span>
                                      }
                                    </span>
                                  )}
                                  <span className="text-gray-500">
                                    {" "}
                                    {dateFormater(item1?.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <img
                                  src={item1?.paidByDetails?.profilePicture}
                                  alt="img"
                                  className="w-8 h-8 rounded-full"
                                />
                                <div>
                                  {item1?.paidByDetails?._id ===
                                  user?.currentUser._id ? (
                                    <span>
                                      <span className="font-medium">
                                        {item1?.paidByDetails?.username}
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
                                        {item1?.paidByDetails?.username}
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
                                  <span className="text-gray-500">
                                    {" "}
                                    {dateFormater(item1?.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {item1?.paidByDetails?._id ===
                                user?.currentUser._id ? (
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
                                              item1?.amount /
                                                item1?.splitbtwn?.length
                                          ).toFixed(2)}
                                        </>
                                      ) : (
                                        <>{Number(item1?.amount).toFixed(2)}</>
                                      )}
                                    </span>
                                  </span>
                                ) : (
                                  <>
                                    {item1?.splitbtwn?.includes(
                                      user?.currentUser?._id
                                    ) ? (
                                      <span className="font-semibold text-red-400 flex flex-col justify-between items-end text-xs">
                                        <span>you borrowed</span>
                                        <span>
                                          ₹
                                          {Number(
                                            item1?.userLent === 0
                                              ? item1?.userOwes
                                              : item1?.userLent
                                          ).toFixed(2)}
                                        </span>
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 text-sm">
                                        not involved
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-gray-400 px-5">
                      No expenses added yet for this group.
                    </p>
                  )}
                </div>
                <Link
                  to={`/?tab=group&view=expense&id=${item?.id}&len=${
                    item?.data?.length || 0
                  }`}
                >
                  <Button
                    type="button"
                    size="xs"
                    outline
                    gradientDuoTone="cyanToBlue"
                    className="w-fit text-sm flex justify-center items-center mx-auto mt-2"
                  >
                    View all
                    <HiOutlineArrowRight className="ml-2 h-3 w-3 my-auto" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>

          {/* Modal */}
          <AddGroup
            showModal={showModal}
            setShowModal={setShowModal}
            userDetail={userDetail}
          />
        </div>
      )}
    </>
  );
}

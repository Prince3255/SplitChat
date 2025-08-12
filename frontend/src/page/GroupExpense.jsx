import { useQuery } from "@tanstack/react-query";
import { Button } from "flowbite-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { dateFormater } from "../util/dateFormater";
import { HiOutlineArrowLeft } from "react-icons/hi";
import ExpenseSkeleton from "../component/skeleton/ExpenseSkeleton";
import Settleup from "./Settleup";
// import { FaRegEdit } from "react-icons/fa";
import { CiSettings } from "react-icons/ci";
import GroupEdit from "../component/GroupEdit";
import Expense from "./Expense";
import SettleUp from "../component/SettleUp";
import { useLocation, useNavigate } from "react-router-dom";
import { groupExpense, settleUpDetail } from "../util/fetchData";

export default function GroupExpense() {
  const user = useSelector((state) => state.user);
  const userId = user?.currentUser._id;
  const profilePicture = user?.currentUser.profilePicture;
  const [userData, setUserData] = useState([]);
  const [expense, setExpense] = useState([]);
  const [groupData, setGroupData] = useState([]);
  const [flag, setFlag] = useState(false);
  const [userDetail, setUserDetail] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectExpense, setSelectExpense] = useState(false);
  const [expenseId, setExpenseId] = useState(null);
  const [settleUp, setSettleUp] = useState(false);
  const [settleUpId, setSettleUpId] = useState(null);
  const [settleUpItem, setSettleUpItem] = useState(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  let edit = queryParams.get("edit");
  let id = queryParams.get("id");
  let len = queryParams.get("len");
  let term = queryParams.get("term") || 0;

  const navigate = useNavigate();

  const {
    data: expenseData,
    isLoading: expenseLoading,
    isError: expenseError,
    error: expenseErrorMessage,
  } = useQuery({
    queryKey: ["groupExpense", userId, id],
    queryFn: groupExpense,
  });

  const {
    data: settleUpData,
    isLoading: settleUpLoading,
    isError: settleUpError,
    error: settleUpErrorMessage,
  } = useQuery({
    queryKey: ["settleUpDetail", id],
    queryFn: settleUpDetail,
  });

  const handleBackButton = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/tab?tab=dashboard");
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    let tempUserData = {};
    let tempExpense = [];
    let tempGroupDetail = {};

    if (settleUpData?.data?.length > 0) {
      if (Array.isArray(settleUpData?.data)) {
        settleUpData?.data?.map((item, _) => {
          if (!tempUserData[item?.settledBy]) {
            tempUserData[item?.settledBy] = {
              id: item?.settledByDetail?._id,
              name: item?.settledByDetail?.username,
              image: item?.settledByDetail?.profilePicture,
            };
          }
          if (!tempUserData[item?.settledWith]) {
            tempUserData[item?.settledWith] = {
              id: item?.settledWithDetail?._id,
              name: item?.settledWithDetail?.username,
              image: item?.settledWithDetail?.profilePicture,
            };
          }
        });
      }
    }

    if (
      expenseData?.data?.groupDetail?.length > 0 ||
      expenseData?.data?.userExpense?.length > 0 ||
      expenseData?.data?.otherGroupExpense?.length > 0
    ) {
      if (Array.isArray(expenseData?.data?.userExpense)) {
        expenseData?.data?.userExpense?.map((item, _) => {
          if (item?.userDetails?.length > 0) {
            item?.userDetails?.map((item1, _) => {
              if (!tempUserData[item1?._id]) {
                tempUserData[item1?._id] = {
                  id: item1?._id,
                  name: item1?.username,
                  image: item1?.profilePicture,
                };
              }
            });
          }

          let combinedArray = [];
          if (settleUpData) {
            combinedArray = [
              ...item?.userExpenses,
              ...(settleUpData?.data || []),
              ...(expenseData?.data?.otherGroupExpense || []),
            ];
          } else {
            combinedArray = [
              ...item?.userExpenses,
              ...item?.settledTransaction,
              ...(expenseData?.data?.otherGroupExpense || []),
            ];
          }

          const latest = combinedArray.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );

          tempExpense.push(latest);
        });
      }

      if (Array.isArray(expenseData?.data?.otherGroupExpense)) {
        expenseData?.data?.otherGroupExpense?.map((item, _) => {
          if (item?.friendDetail?.length > 0) {
            item?.friendDetail?.map((item1, _) => {
              if (!tempUserData[item1?._id]) {
                tempUserData[item1?._id] = {
                  id: item1?._id,
                  name: item1?.username,
                  image: item1?.profilePicture,
                };
              }
            });
          }
        });
      }

      expenseData?.data?.groupDetail?.map((item, _) => {
        tempGroupDetail[item._id] = {
          id: item._id,
          name: item?.name,
          image: item?.groupProfile,
          coverImage: item?.coverImage,
        };
      });
    }

    setExpense([...tempExpense]);
    setUserData(tempUserData);
    setGroupData(tempGroupDetail);
  }, [expenseData, settleUpData]);

  if (expenseLoading || settleUpLoading) {
    return <ExpenseSkeleton />;
  }

  if (expenseError) {
    return <div>Error: {expenseErrorMessage.message}</div>;
  }

  if (settleUpError) {
    return <div>Error: {settleUpErrorMessage.message}</div>;
  }

  if (!expenseData) {
    return <div>No non-group expense data</div>;
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

  const handleSettingButtonClick = () => {
    navigate(`/tab?tab=group&view=expense&edit=group&id=${id}&flag=${flag}&len=0`);
  };

  const handleExpenseClick = (id1) => {
    setExpenseId(id);
    navigate(
      `/tab?tab=group&view=expense&edit=expense&id=${id1}&groupId=${id}&len=${len}`
    );
  };

  const handleSettleUpClick = (item1) => {
    navigate(
      `/tab?tab=group&view=expense&edit=settleup&sid=${item1?._id}&id=${id}&len=${len}`
    );
    setSettleUpId(item1?._id);
    setSettleUpItem(item1);
  };

  if (edit === "group") {
    return <GroupEdit />;
  }

  if (edit === "expense") {
    return <Expense />;
  }

  if (edit === "settleup") {
    return <SettleUp />;
  }

  return (
    <div className="w-full min-h-screen">
      <div className="relative w-full mb-10">
        <Button
          type="button"
          size="xs"
          outline
          gradientDuoTone="cyanToBlue"
          className="w-fit absolute text-xs mt-2 ml-2 left-0 z-10"
          onClick={handleBackButton}
        >
          <HiOutlineArrowLeft className="size-4" />
        </Button>
        <Button
          type="button"
          size="xs"
          outline
          gradientDuoTone="cyanToBlue"
          className="w-fit absolute text-xs mt-2 right-2 z-10"
          onClick={() => handleSettingButtonClick()}
        >
          <CiSettings className="size-5" />
        </Button>
        <div className="w-full max-h-28 sm:max-h-36 md:max-h-44 overflow-hidden">
          <img
            src={groupData[id]?.coverImage}
            alt="cover image"
            className="w-full h-full object-cover overflow-hidden"
          />
        </div>
        <div className="w-12 h-12 sm:w-16 sm:h-16 absolute border-2 rounded-lg top-2/3 left-4 sm:left-28">
          <img
            src={groupData[id]?.image}
            alt="img"
            className="w-full h-full rounded-md border-2 object-cover"
          />
        </div>
      </div>

      <div className="w-full p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-3 gap-2 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold">
            {groupData[id]?.name}
          </h1>
          <Button
            className={`w-full sm:w-auto text-center bg-white hover:!bg-green-100 !text-green-500 hover:!text-green-600 focus:ring-green-300 border border-slate-200 ${
              expenseData?.data?.userExpense[0]?.userExpenses?.length > 0 ||
              expenseData?.data?.otherGroupExpense?.length > 0
                ? "block"
                : "hidden"
            }`}
            onClick={() => setShowModal(true)}
          >
            <span className="w-full text-center">Settle up</span>
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
                                    {Number.isNaN(
                                      Number(item?.total[key]?.lent)
                                    ) ? null : (
                                      <>
                                        {flag === false && setFlag(true)}
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
                                          ).toFixed(2)}
                                        </span>
                                      </>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {Number.isNaN(
                                      Number(item?.total[key]?.owed)
                                    ) ? null : (
                                      <>
                                        {flag === false && setFlag(true)}
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
                                          ).toFixed(2)}
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
                    ) : null}
                    {flag && Object.keys(item?.total).length > 0 ? null : len ==
                      0 ? (
                      <p className="text-gray-400 text-sm sm:text-base">
                        No expenses added yet for this group.
                      </p>
                    ) : (
                      <p
                        key={id}
                        className="text-green-400 text-sm sm:text-base"
                      >
                        You are all settled up in this group.
                      </p>
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
                          <span className="text-gray-500 text-xs sm:text-sm">
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
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
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
                            <span className="text-gray-500 text-xs sm:text-sm">
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
                            <>
                              {item1?.splitbtwn?.includes(
                                user?.currentUser._id
                              ) ? (
                                <span className="font-semibold text-red-400 flex flex-col justify-between items-end text-xs">
                                  <span>you borrowed</span>
                                  <span>
                                    ₹
                                    {Number(
                                      item1?.amount / item1?.splitbtwn?.length
                                    ).toFixed(2)}
                                  </span>
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs sm:text-sm">
                                  not involved
                                </span>
                              )}
                            </>
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
        id={userId}
        profilePicture={profilePicture}
        groupId1={id}
        user={user}
      />
    </div>
    // <div className="w-full min-h-screen">
    //   <div className="relative w-full mb-10">
    //     <Button
    //       type="button"
    //       size="xs"
    //       outline
    //       gradientDuoTone="cyanToBlue"
    //       className="w-fit absolute text-xs mt-2 ml-2 left-0"
    //       onClick={handleBackButton}
    //     >
    //       <HiOutlineArrowLeft className="size-4" />
    //     </Button>
    //     <Button
    //       type="button"
    //       size="xs"
    //       outline
    //       gradientDuoTone="cyanToBlue"
    //       className="w-fit absolute text-xs mt-2 right-2"
    //       onClick={() => handleSettingButtonClick()}
    //     >
    //       {/* <FaRegEdit /> */}
    //       <CiSettings className="size-5" />
    //     </Button>
    //     <div className="w-full max-h-28 overflow-hidden">
    //       <img
    //         src={groupData[id]?.coverImage}
    //         alt="cover image"
    //         className="w-full h-full object-fill overflow-hidden"
    //       />
    //     </div>
    //     <div className="w-16 h-16 absolute border-2 rounded-lg top-2/3 left-28">
    //       <img
    //         src={groupData[id]?.image}
    //         alt="img"
    //         className="w-full h-full rounded-md border-2"
    //       />
    //     </div>
    //   </div>

    //   <div className="w-full p-4 sm:p-6">
    //     <div className="flex justify-between items-center w-full mb-3">
    //       <h1 className="text-2xl font-bold">{groupData[id]?.name}</h1>
    //       <Button
    //         className={`bg-white hover:!bg-green-100 !text-green-500 hover:!text-green-600 focus:ring-green-300 border border-slate-200 ${
    //           expenseData?.data?.userExpense[0]?.userExpenses?.length > 0 ||
    //           expenseData?.data?.otherGroupExpense?.length > 0
    //             ? "block"
    //             : "hidden"
    //         }`}
    //         onClick={() => setShowModal(true)}
    //       >
    //         Settle up
    //       </Button>
    //     </div>
    //     {expenseData?.data?.userExpense?.length > 0 && (
    //       <>
    //         <div className="flex flex-col space-y-3.5">
    //           {expenseData?.data?.userExpense?.map((item, id) => {
    //             return (
    //               <div key={id} className="px-2 space-y-2">
    //                 {Object.keys(item?.total) ? (
    //                   <>
    //                     {Object.keys(item?.total)?.map((key) => {
    //                       return (
    //                         key !== user?.currentUser?._id && (
    //                           <p key={key}>
    //                             {item?.total[key]?.lent ? (
    //                               <>
    //                                 {Number.isNaN(
    //                                   Number(item?.total[key]?.lent)
    //                                 ) ? null : (
    //                                   <>
    //                                     {flag === false && setFlag(true)}
    //                                     <span className="font-medium">
    //                                       {user?.currentUser?.username}
    //                                     </span>{" "}
    //                                     owe{" "}
    //                                     <span className="font-medium">
    //                                       {getName(key)}
    //                                     </span>{" "}
    //                                     <span className="text-red-400">
    //                                       ₹
    //                                       {Number(
    //                                         item?.total[key]?.lent
    //                                       ).toFixed(2)}
    //                                     </span>
    //                                   </>
    //                                 )}
    //                               </>
    //                             ) : (
    //                               <>
    //                                 {Number.isNaN(
    //                                   Number(item?.total[key]?.owed)
    //                                 ) ? null : (
    //                                   <>
    //                                     {flag === false && setFlag(true)}
    //                                     <span className="font-medium">
    //                                       {getName(key)}
    //                                     </span>{" "}
    //                                     owes{" "}
    //                                     <span className="font-medium">
    //                                       {user?.currentUser?.username}
    //                                     </span>{" "}
    //                                     <span className="text-teal-500">
    //                                       ₹
    //                                       {Number(
    //                                         item?.total[key]?.owed
    //                                       ).toFixed(2)}
    //                                     </span>
    //                                   </>
    //                                 )}
    //                               </>
    //                             )}
    //                           </p>
    //                         )
    //                       );
    //                     })}
    //                   </>
    //                 ) : null}
    //                 {flag && Object.keys(item?.total).length > 0 ? null : len ==
    //                   0 ? (
    //                   <p className="text-gray-400">
    //                     No expenses added yet for this group.
    //                   </p>
    //                 ) : (
    //                   <p key={id} className="text-green-400">
    //                     You are all settled up in this group.
    //                   </p>
    //                 )}
    //               </div>
    //             );
    //           })}
    //         </div>
    //         <div className="flex flex-col justify-between items-center w-full mt-8 space-y-8 px-2 py-1">
    //           {expense[0]?.map((item1, id) => (
    //             <div
    //               className="flex justify-between items-center w-full cursor-pointer hover:bg-gray-100 transition duration-200 p-2 rounded border-b border-gray-300"
    //               key={id}
    //             >
    //               {item1?.settledBy || item1?.settledWith ? (
    //                 <>
    //                   <div
    //                     className="flex justify-between items-center gap-2"
    //                     onClick={(e) => handleSettleUpClick(item1)}
    //                   >
    //                     <img
    //                       src={getImage(item1?.settledBy)}
    //                       alt="img"
    //                       className="w-8 h-8 rounded-full"
    //                     />
    //                     <div>
    //                       {item1?.settledBy === user?.currentUser._id ? (
    //                         <span>
    //                           <span className="font-medium">
    //                             {getName(item1?.settledBy)}
    //                           </span>{" "}
    //                           settled their{" "}
    //                           {<span>₹{Number(item1?.amount).toFixed(2)}</span>}{" "}
    //                           with{" "}
    //                           {
    //                             <span className="font-medium">
    //                               {getName(item1?.settledWith)}
    //                             </span>
    //                           }{" "}
    //                           on
    //                         </span>
    //                       ) : (
    //                         <span>
    //                           {
    //                             <span>
    //                               <span className="font-medium">
    //                                 {getName(item1?.settledBy)}
    //                               </span>{" "}
    //                               settled their ₹
    //                               {Number(item1?.amount).toFixed(2)} with{" "}
    //                               <span className="font-medium">
    //                                 {getName(item1?.settledWith)}
    //                               </span>{" "}
    //                               on
    //                             </span>
    //                           }
    //                         </span>
    //                       )}
    //                       <span className="text-gray-500">
    //                         {" "}
    //                         {dateFormater(item1?.updatedAt)}
    //                       </span>
    //                     </div>
    //                   </div>
    //                 </>
    //               ) : (
    //                 <>
    //                   <div
    //                     className="flex justify-between items-center w-full"
    //                     onClick={() => handleExpenseClick(item1?._id)}
    //                     key={item1?._id}
    //                   >
    //                     <div className="flex items-center gap-2">
    //                       <img
    //                         src={getImage(item1?.paidby)}
    //                         alt="img"
    //                         className="w-8 h-8 rounded-full"
    //                       />
    //                       <div>
    //                         {item1?.paidby === user?.currentUser._id ? (
    //                           <span>
    //                             <span className="font-medium">
    //                               {user?.currentUser?.username}
    //                             </span>{" "}
    //                             paid{" "}
    //                             {
    //                               <span>
    //                                 ₹{Number(item1?.amount).toFixed(2)}
    //                               </span>
    //                             }{" "}
    //                             for
    //                           </span>
    //                         ) : (
    //                           <span>
    //                             <span className="font-medium">
    //                               {getName(item1?.paidby)}
    //                             </span>{" "}
    //                             paid{" "}
    //                             {
    //                               <span>
    //                                 ₹{Number(item1?.amount).toFixed(2)}
    //                               </span>
    //                             }{" "}
    //                             for
    //                           </span>
    //                         )}
    //                         <span className="font-medium">
    //                           {" "}
    //                           {item1?.title}{" "}
    //                         </span>
    //                         on
    //                         <span className="text-gray-500">
    //                           {" "}
    //                           {dateFormater(item1?.updatedAt)}
    //                         </span>
    //                       </div>
    //                     </div>
    //                     <div className="flex items-center gap-2">
    //                       {item1?.paidby === user?.currentUser._id ? (
    //                         <span className="font-semibold text-teal-500 flex flex-col justify-between items-end text-xs">
    //                           <span>you lent</span>
    //                           <span>
    //                             ₹
    //                             {item1?.splitbtwn?.includes(
    //                               user?.currentUser._id
    //                             ) ? (
    //                               <>
    //                                 {Number(
    //                                   item1?.amount -
    //                                     item1?.amount / item1?.splitbtwn?.length
    //                                 ).toFixed(2)}
    //                               </>
    //                             ) : (
    //                               <>{Number(item1?.amount).toFixed(2)}</>
    //                             )}
    //                           </span>
    //                         </span>
    //                       ) : (
    //                         <>
    //                           {item1?.splitbtwn?.includes(
    //                             user?.currentUser._id
    //                           ) ? (
    //                             <span className="font-semibold text-red-400 flex flex-col justify-between items-end text-xs">
    //                               <span>you borrowed</span>
    //                               <span>
    //                                 ₹
    //                                 {Number(
    //                                   item1?.amount / item1?.splitbtwn?.length
    //                                 ).toFixed(2)}
    //                               </span>
    //                             </span>
    //                           ) : (
    //                             <span className="text-slate-400 text-sm">
    //                               not involved
    //                             </span>
    //                           )}
    //                         </>
    //                       )}
    //                     </div>
    //                   </div>
    //                 </>
    //               )}
    //             </div>
    //           ))}
    //         </div>
    //       </>
    //     )}
    //   </div>

    //   <Settleup
    //     showModal={showModal}
    //     setShowModal={setShowModal}
    //     userDetail={userDetail}
    //     setUserDetail={setUserDetail}
    //     id={userId}
    //     profilePicture={profilePicture}
    //     groupId1={id}
    //     user={user}
    //   />
    // </div>
  );
}

import { Avatar, Button, Card } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { HiOutlineArrowLeft } from "react-icons/hi";
import Designer from "../assets/Designer.png";
import Comment from "./Comment";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { groupExpense, settleUpDetail } from "../util/fetchData";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import EditSettleUp from "./EditSettleUp";
import deleteSettleUp from "../util/deleteSettleUp";
import DeleteModal from "./DeleteModal";
import GroupSettleUpSkeleton from "./GroupSettleUpSkeleton";

export default function SettleUp() {
  const [expense, setExpense] = useState([]);
  const [userData, setUserData] = useState([]);
  const [settleUpItem, setSettleUpItem] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const user = useSelector((state) => state.user);
  const location = useLocation();
  const queryParam = new URLSearchParams(location.search);

  const id = queryParam.get("id") || null;
  const sid = queryParam.get("sid");
  const len = queryParam.get("len");

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const {
    data: expenseData,
    isLoading: expenseLoading,
    isError: expenseError,
    error: expenseErrorMessage,
  } = useQuery({
    queryKey: ["groupExpense", user?.currentUser?._id, id],
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

  useEffect(() => {
    let tempUserData = {};
    let tempExpense = [];

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
    }

    setExpense([...tempExpense]);
    setUserData(tempUserData);
  }, [expenseData, settleUpData]);

  useEffect(() => {
    setShowModal(queryParam.get("modal") || false);
  }, [location.search]);

  useEffect(() => {
    expense[0]?.map((item) => {
      if (item?._id == sid) {
        setSettleUpItem(item);
      }
    });
  }, [expense]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  if (expenseLoading || settleUpLoading) {
    return (
      <>
        <GroupSettleUpSkeleton />
      </>
    );
  }

  if (expenseError) {
    return <div>Error: {expenseErrorMessage.message}</div>;
  }

  if (settleUpError) {
    return <div>Error: {settleUpErrorMessage.message}</div>;
  }

  const handleBackButton = () => {
    setShowModal(false);
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      if (id) {
        navigate(`/?tab=group&view=expense&id=${id}&len=${len}`);
      } else {
        navigate(`/?tab=non-group`);
      }
    }
  };

  const handleOpenModal = () => {
    if (id) {
      navigate(
        `/?tab=group&view=expense&edit=settleup&sid=${sid}&id=${id}&len=${len}&modal=true`
      );
    } else {
      navigate(
        `/?tab=non-group&view=expense&edit=settleup&sid=${sid}&len=${len}&modal=true`
      );
    }
  };

  const handleDelete = async () => {
    const result = await deleteSettleUp(sid);
    if (result) {
      queryClient.invalidateQueries("nonGroupExpense", {
        refetchActive: true,
      });
      queryClient.invalidateQueries("groupExpense", {
        refetchActive: true,
      });
      queryClient.invalidateQueries("settleUpDetail", {
        refetchActive: true,
      });
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        if (id) {
          navigate(`/?tab=group&view=expense&id=${id}&len=${len}`);
        } else {
          navigate(`/?tab=non-group`);
        }
      }
    }
  };

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
        <div className="w-full max-h-28 sm:max-h-36 md:max-h-44 overflow-hidden">
          <img
            src={Designer}
            alt="cover image"
            className="w-full h-full object-contain overflow-hidden"
          />
        </div>
        <div className="w-12 h-12 sm:w-16 sm:h-16 absolute border-2 rounded-lg top-2/3 left-4 sm:left-28">
          <img
            src="https://media.istockphoto.com/id/938887966/vector/two-people-icon-symbol-of-group-or-pair-of-persons-friends-contacts-users-outline-modern.jpg?s=612x612&w=0&k=20&c=575mQXvCuoAjbX6tnVXU4TIlGw9CJH6AVR0QjA4S7JA="
            alt="img"
            className="w-full h-full rounded-md object-cover border-2"
          />
        </div>
      </div>
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 sm:px-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">Settleup details</h1>
          </div>
          <div className="flex w-full sm:w-fit space-x-4">
            <Button
              className="flex-1 sm:flex-none bg-[#4fce9b] hover:!bg-[#2e7c5dea]"
              onClick={() => handleOpenModal()}
            >
              Edit
            </Button>
            <Button
              className="flex-1 sm:flex-none bg-red-500 hover:!bg-red-600"
              onClick={() => setDeleteModal(true)}
            >
              Delete
            </Button>
          </div>
        </div>
        <div className="mx-2 sm:mx-8 md:mx-20 mt-7">
          <div className="flex flex-col space-y-8">
            {settleUpItem?.groupId && (
              <div className="flex flex-row space-y-0 items-center">
                <h4 className="text-lg sm:text-xl font-semibold">Group Name:&nbsp;</h4>
                <span className="text-lg sm:text-xl font-normal">
                  {expenseData?.data?.groupDetail[0]?.name}
                </span>
              </div>
            )}
            <div className="flex flex-row space-y-0 items-center">
              <h4 className="text-lg sm:text-xl font-semibold">Amount:&nbsp;</h4>
              <span className="text-lg sm:text-xl font-normal">
                ₹{Number(settleUpItem?.amount).toFixed(2)}
              </span>
            </div>
            {settleUpItem?.note && (
              <div className="flex flex-row space-y-0 items-center">
                <h4 className="text-lg sm:text-xl font-semibold">Note:&nbsp;</h4>
                <span className="text-lg sm:text-xl font-normal">
                  {settleUpItem?.note}
                </span>
              </div>
            )}
            <div className="space-y-4">
              <h4 className="text-lg sm:text-xl font-semibold">Payer</h4>
              <div className="space-y-4">
                {
                  <Card>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <Avatar
                          img={settleUpItem?.settledByDetail?.profilePicture}
                          rounded
                          size="sm"
                          className="sm:size-10"
                        />
                        <div>
                          <h4 className="text-sm sm:text-base font-semibold">
                            {settleUpItem?.settledByDetail?.username}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </Card>
                }
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg sm:text-xl font-semibold">Recipient</h4>
              <div className="space-y-4">
                {
                  <Card>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <Avatar
                          img={settleUpItem?.settledWithDetail?.profilePicture}
                          rounded
                          size="sm"
                          className="sm:size-10"
                        />
                        <div>
                          <h4 className="text-sm sm:text-base font-semibold">
                            {settleUpItem?.settledWithDetail?.username}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </Card>
                }
              </div>
            </div>
            <Comment postId={sid} />
          </div>
        </div>
      </div>
      {showModal && <EditSettleUp />}
      {deleteModal && (
        <DeleteModal
          deleteModal={deleteModal}
          setDeleteModal={setDeleteModal}
          handleDelete={handleDelete}
        />
      )}
    </div>
    // <div className="w-full min-h-screen">
    //   <div className="relative w-full mb-10">
    //     <Button
    //       type="button"
    //       size="xs"
    //       outline
    //       gradientDuoTone="cyanToBlue"
    //       className="w-fit absolute text-xs mt-0 ml-2 left-0"
    //       onClick={handleBackButton}
    //     >
    //       <HiOutlineArrowLeft className="size-4" />
    //     </Button>
    //     <div className="w-full max-h-28 overflow-hidden">
    //       <img
    //         src={Designer}
    //         alt="cover image"
    //         className="w-full h-full object-contain overflow-hidden"
    //       />
    //     </div>
    //     <div className="w-16 h-16 absolute border-2 rounded-lg top-2/3 left-28">
    //       <img
    //         src="https://media.istockphoto.com/id/938887966/vector/two-people-icon-symbol-of-group-or-pair-of-persons-friends-contacts-users-outline-modern.jpg?s=612x612&w=0&k=20&c=575mQXvCuoAjbX6tnVXU4TIlGw9CJH6AVR0QjA4S7JA="
    //         alt="img"
    //         className="w-full h-full rounded-md object-cover border-2"
    //       />
    //     </div>
    //   </div>
    //   <div className="container mx-auto px-4 py-4">
    //     <div className="flex items-center justify-between px-8">
    //       <div>
    //         <h1 className="text-2xl font-semibold">Settleup details</h1>
    //       </div>
    //       <div className="flex w-fit space-x-4">
    //         <Button
    //           className="bg-[#4fce9b] hover:!bg-[#2e7c5dea]"
    //           onClick={() => handleOpenModal()}
    //         >
    //           Edit
    //         </Button>
    //         <Button
    //           className="bg-red-500 hover:!bg-red-600"
    //           onClick={() => setDeleteModal(true)}
    //         >
    //           Delete
    //         </Button>
    //       </div>
    //     </div>
    //     <div className="mx-20 mt-7">
    //       <div className="flex flex-col space-y-8">
    //         {settleUpItem?.groupId && (
    //           <div className="flex space-x-2 items-center">
    //             <h4 className="text-xl font-semibold">Group Name:&nbsp;</h4>
    //             <span className="text-xl font-normal">
    //               {expenseData?.data?.groupDetail[0]?.name}
    //             </span>
    //           </div>
    //         )}
    //         <div className="flex space-x-2 items-center">
    //           <h4 className="text-xl font-semibold">Amount:&nbsp;</h4>
    //           <span className="text-xl font-normal">
    //             ₹{Number(settleUpItem?.amount).toFixed(2)}
    //           </span>
    //         </div>
    //         {settleUpItem?.note && (
    //           <div className="flex space-x-2 items-center">
    //             <h4 className="text-xl font-semibold">Note:&nbsp;</h4>
    //             <span className="text-xl font-normal">
    //               {settleUpItem?.note}
    //             </span>
    //           </div>
    //         )}
    //         <div className="space-y-4">
    //           <h4 className="text-xl font-semibold">Payer</h4>
    //           <div className="space-y-4">
    //             {
    //               <Card>
    //                 <div className="flex items-center justify-between">
    //                   <div className="flex items-center gap-4">
    //                     <Avatar
    //                       img={settleUpItem?.settledByDetail?.profilePicture}
    //                       rounded
    //                     />
    //                     <div>
    //                       <h4 className="font-semibold">
    //                         {settleUpItem?.settledByDetail?.username}
    //                       </h4>
    //                     </div>
    //                   </div>
    //                 </div>
    //               </Card>
    //             }
    //           </div>
    //         </div>
    //         <div className="space-y-4">
    //           <h4 className="text-xl font-semibold">Recipient</h4>
    //           <div className="space-y-4">
    //             {
    //               <Card>
    //                 <div className="flex items-center justify-between">
    //                   <div className="flex items-center gap-4">
    //                     <Avatar
    //                       img={settleUpItem?.settledWithDetail?.profilePicture}
    //                       rounded
    //                     />
    //                     <div>
    //                       <h4 className="font-semibold">
    //                         {settleUpItem?.settledWithDetail?.username}
    //                       </h4>
    //                     </div>
    //                   </div>
    //                 </div>
    //               </Card>
    //             }
    //           </div>
    //         </div>
    //         <Comment postId={sid} />
    //       </div>
    //     </div>
    //   </div>
    //   {showModal && <EditSettleUp />}
    //   {deleteModal && (
    //     <DeleteModal
    //       deleteModal={deleteModal}
    //       setDeleteModal={setDeleteModal}
    //       handleDelete={handleDelete}
    //     />
    //   )}
    // </div>
  );
}

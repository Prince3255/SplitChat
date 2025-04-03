import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, Button, Card } from "flowbite-react";
import React, { useEffect, useState } from "react";
import fetchExpense from "../util/fetchExpense";
import { HiOutlineArrowLeft } from "react-icons/hi";
import expense from "../assets/expense.png";
import expenseCoverImage from "../assets/expenseCoverImage.jpeg";
import Comment from "../component/Comment";
import EditExpense from "../component/EditExpense";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { groupExpense } from "../util/fetchData";
import DeleteModal from "../component/DeleteModal";
import deleteExpense from "../util/deleteExpense";
import GroupExpenseSkeleton from "../component/skeleton/GroupExpenseSkeleton";

export default function Expense() {
  const user = useSelector((state) => state?.user);
  const id = user?.currentUser?._id;
  const [userData, setUserData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const location = useLocation();
  const queryParam = new URLSearchParams(location.search);

  const expenseId = queryParam.get("id");
  const groupId = queryParam.get("groupId") || null;
  const len = queryParam.get("len");

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const {
    data: expenseData1,
    isLoading: expense1Loading,
    isError: expense1Error,
    error: expense1ErrorMessage,
  } = useQuery({
    queryKey: ["groupExpense", id, groupId],
    queryFn: groupExpense,
  });

  const {
    data: expenseData,
    isLoading: expenseLoading,
    isError: expenseError,
    error: expenseErrorMessage,
  } = useQuery({
    queryKey: ["fetchExpense", expenseId],
    queryFn: fetchExpense,
  });

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    setShowModal(queryParam.get("modal") || false);
  }, [location.search]);

  useEffect(() => {
    let tempUserData = {};

    if (
      expenseData1?.data?.userExpense?.length > 0 ||
      expenseData1?.data?.otherGroupExpense?.length > 0
    ) {
      if (Array.isArray(expenseData1?.data?.userExpense)) {
        expenseData1?.data?.userExpense?.map((item, _) => {
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
        });
      }

      if (Array.isArray(expenseData1?.data?.otherGroupExpense)) {
        expenseData1?.data?.otherGroupExpense?.map((item, _) => {
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
    }

    setUserData(tempUserData);
  }, [expenseData1]);

  if (expense1Loading || expenseLoading) {
    return (
      <>
        <GroupExpenseSkeleton />
      </>
    );
  }

  if (expense1Error) {
    return <div>Error: {expense1ErrorMessage}</div>;
  }

  if (expenseError) {
    return <div>Error: {expenseErrorMessage.message}</div>;
  }

  if (!expenseData) {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      if (groupId) {
        navigate(`/?tab=group&view=expense&id=${groupId}&len=${len}`);
      } else {
        navigate("/?tab=non-group");
      }
    }
  }

  const handleBackButton = (event) => {
    event.preventDefault();
    setShowModal(false);
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      if (groupId) {
        navigate(`/?tab=group&view=expense&id=${groupId}&len=${len}`);
      } else {
        navigate("/?tab=non-group");
      }
    }
  };

  const handleOpenModal = () => {
    if (groupId) {
      navigate(
        `/?tab=group&view=expense&edit=expense&id=${expenseId}&groupId=${groupId}&len=${len}&modal=true`
      );
    } else {
      navigate(
        `/?tab=non-group&view=expense&edit=expense&id=${expenseId}&len=${len}&modal=true`
      );
    }
  };

  const handleDelete = async () => {
    const result = await deleteExpense(expenseId);
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
        if (groupId) {
          navigate(`/?tab=group&view=expense&id=${groupId}&len=${len}`);
        } else {
          navigate("/?tab=non-group");
        }
      }
    }
  };

  return (
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
    //     <div className="w-full max-h-28 overflow-hidden">
    //       <img
    //         src={expenseCoverImage}
    //         alt="cover image"
    //         className="w-full h-full object-contain overflow-hidden"
    //       />
    //     </div>
    //     <div className="w-16 h-16 absolute border-2 rounded-lg top-2/3 left-28">
    //       <img
    //         src={expense}
    //         alt="img"
    //         className="w-full h-full rounded-md object-cover border-2"
    //       />
    //     </div>
    //   </div>

    //   <div className="container mx-auto px-4 py-4">
    //     <div className="flex items-center justify-between px-8">
    //       <div>
    //         <h1 className="text-2xl font-semibold">Expense details</h1>
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
    //         {expenseData?.data?.isGroupExpense && (
    //           <div className="flex space-x-2 items-center">
    //             <h4 className="text-xl font-semibold">Group Name:&nbsp;</h4>
    //             <span className="text-xl font-normal">
    //               {expenseData1?.data?.groupDetail[0]?.name}
    //             </span>
    //           </div>
    //         )}
    //         <div className="flex space-x-2 items-center">
    //           <h4 className="text-xl font-semibold">Amount:&nbsp;</h4>
    //           <span className="text-xl font-normal">
    //             ₹{Number(expenseData?.data?.amount).toFixed(2)}
    //           </span>
    //         </div>
    //         <div className="flex space-x-2 items-center">
    //           <h4 className="text-xl font-semibold">Title:&nbsp;</h4>
    //           <span className="text-xl font-normal">
    //             {expenseData?.data?.title}
    //           </span>
    //         </div>
    //         <div className="space-y-4">
    //           <h4 className="text-xl font-semibold">Paid by</h4>
    //           <div className="space-y-4">
    //             {
    //               <Card>
    //                 <div className="flex items-center justify-between">
    //                   <div className="flex items-center gap-4">
    //                     <Avatar
    //                       img={userData[expenseData?.data?.paidby]?.image}
    //                       rounded
    //                     />
    //                     <div>
    //                       <h4 className="font-semibold">
    //                         {userData[expenseData?.data?.paidby]?.name}
    //                       </h4>
    //                     </div>
    //                   </div>
    //                 </div>
    //               </Card>
    //             }
    //           </div>
    //         </div>
    //         <div className="space-y-4">
    //           <h4 className="text-xl font-semibold">Split between</h4>
    //           <div className="space-y-4">
    //             {expenseData?.data?.splitbtwn?.map((splitBtwnId) => (
    //               <Card key={splitBtwnId}>
    //                 <div className="flex items-center justify-between">
    //                   <div className="flex items-center gap-4">
    //                     <Avatar img={userData[splitBtwnId]?.image} rounded />
    //                     <div>
    //                       <h4 className="font-semibold">
    //                         {userData[splitBtwnId]?.name}
    //                       </h4>
    //                     </div>
    //                   </div>
    //                 </div>
    //               </Card>
    //             ))}
    //           </div>
    //         </div>
    //         {expenseData?.data?.note && (
    //           <div className="flex space-x-2 items-center">
    //             <h4 className="text-xl font-semibold">Note:&nbsp;</h4>
    //             <span className="text-xl font-normal">
    //               {expenseData?.data?.note}
    //             </span>
    //           </div>
    //         )}
    //         <div className="flex space-x-2 items-center">
    //           <h4 className="text-xl font-semibold">Expense type:&nbsp;</h4>
    //           <span className="text-xl font-normal">
    //             {expenseData?.data?.expenseType}
    //           </span>
    //         </div>
    //         <Comment postId={expenseId} />
    //       </div>
    //     </div>
    //   </div>
    //   {showModal && <EditExpense />}
    //   {deleteModal && (
    //     <DeleteModal
    //       deleteModal={deleteModal}
    //       setDeleteModal={setDeleteModal}
    //       handleDelete={handleDelete}
    //     />
    //   )}
    // </div>
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
            src={expenseCoverImage}
            alt="cover image"
            className="w-full h-full object-contain overflow-hidden"
          />
        </div>
        <div className="w-12 h-12 sm:w-16 sm:h-16 absolute border-2 rounded-lg top-2/3 left-4 sm:left-28">
          <img
            src={expense}
            alt="img"
            className="w-full h-full rounded-md object-cover border-2"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 sm:px-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">Expense details</h1>
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
            {expenseData?.data?.isGroupExpense && (
              <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-1 sm:space-y-0 sm:items-center">
                <h4 className="text-lg sm:text-xl font-semibold">Group Name:&nbsp;</h4>
                <span className="text-lg sm:text-xl font-normal">
                  {expenseData1?.data?.groupDetail[0]?.name}
                </span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-1 sm:space-y-0 sm:items-center">
              <h4 className="text-lg sm:text-xl font-semibold">Amount:&nbsp;</h4>
              <span className="text-lg sm:text-xl font-normal">
                ₹{Number(expenseData?.data?.amount).toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-1 sm:space-y-0 sm:items-center">
              <h4 className="text-lg sm:text-xl font-semibold">Title:&nbsp;</h4>
              <span className="text-lg sm:text-xl font-normal">
                {expenseData?.data?.title}
              </span>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg sm:text-xl font-semibold">Paid by</h4>
              <div className="space-y-4">
                {
                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <Avatar
                          img={userData[expenseData?.data?.paidby]?.image}
                          rounded
                          size="sm"
                          className="sm:size-10"
                        />
                        <div>
                          <h4 className="text-sm sm:text-base font-semibold">
                            {userData[expenseData?.data?.paidby]?.name}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </Card>
                }
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg sm:text-xl font-semibold">Split between</h4>
              <div className="space-y-4">
                {expenseData?.data?.splitbtwn?.map((splitBtwnId) => (
                  <Card key={splitBtwnId} className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <Avatar 
                          img={userData[splitBtwnId]?.image} 
                          rounded 
                          size="sm"
                          className="sm:size-10"
                        />
                        <div>
                          <h4 className="text-sm sm:text-base font-semibold">
                            {userData[splitBtwnId]?.name}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            {expenseData?.data?.note && (
              <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-1 sm:space-y-0 sm:items-center">
                <h4 className="text-lg sm:text-xl font-semibold">Note:&nbsp;</h4>
                <span className="text-lg sm:text-xl font-normal">
                  {expenseData?.data?.note}
                </span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-1 sm:space-y-0 sm:items-center">
              <h4 className="text-lg sm:text-xl font-semibold">Expense type:&nbsp;</h4>
              <span className="text-lg sm:text-xl font-normal">
                {expenseData?.data?.expenseType}
              </span>
            </div>
            <Comment postId={expenseId} />
          </div>
        </div>
      </div>
      {showModal && <EditExpense />}
      {deleteModal && (
        <DeleteModal
          deleteModal={deleteModal}
          setDeleteModal={setDeleteModal}
          handleDelete={handleDelete}
        />
      )}
    </div>
  );
}

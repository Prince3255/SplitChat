import { useQueryClient } from '@tanstack/react-query';
import { Avatar, Button, HR, Label, Modal, Textarea, TextInput } from 'flowbite-react';
import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import { BsCurrencyRupee } from 'react-icons/bs';
import { CiSearch } from 'react-icons/ci';
import { RxCross2 } from 'react-icons/rx';

export default function Settleup({
  showModal,
  setShowModal,
  userDetail,
  setUserDetail,
  id,
  profilePicture,
  groupId1,
  user
}) {
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [note, setNote] = useState("");
  const [settleUpSearchTerm, setSettleUpSearchTerm] = useState("");
  const [settleWithSearchTerm, setSettleWithSearchTerm] = useState("");
  const [filteredUser, setFilteredUser] = useState([]);
  const [payerDetail, setPayerDetail] = useState(null);
  const [recipientDetail, setRecipientDetail] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL
  const [groupId, setGroupId] = useState(groupId1);
  const [groupSelectDetail, setGroupSelectDetail] = useState(null);

  const ref = useRef();

  const queryClient = useQueryClient();

  useEffect(() => {
    setGroupId(groupId1)
    const fetchGroupMember = async (groupId) => {
      try {
        const res = await fetch(`${API_URL}/group/${groupId}/member`, {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
  
        const data = await res.json();
  
        if (!res.ok) {
          toast.error(data.message || "Something went wrong");
          return;
        }
  
        if (!data.success) {
          toast.error(data.message);
          return { success: false, data: [] };
        } else {
          const member = {
            _id: id,
            username: user?.currentUser?.username,
            profilePicture: profilePicture
          }
          const updatedUserDetail = {
            ...data,
            data: {
              ...data?.data,
              friend: [...(data?.data?.friend) || [], member]
            }
          }
          setUserDetail(updatedUserDetail);
        }
      } catch (error) {
        console.log("error", error.message);
        toast.error(error.message);
      }
    };
  
    if (groupId1) {
      fetchGroupMember(groupId1);
    }
  }, [groupId1]);

  useEffect(() => {
    const fetchFilteredUsers = async () => {
      let filtered = userDetail?.data?.friend?.filter((user) => {
        return (
          user?.username.toLowerCase().includes(settleUpSearchTerm.toLowerCase() || settleWithSearchTerm.toLowerCase()) &&
          (!payerDetail || user?._id !== payerDetail?._id) &&
          (!recipientDetail || user?._id !== recipientDetail?._id)
        );
      });
  
      setFilteredUser(filtered);
    };
  
    fetchFilteredUsers();
  }, [settleUpSearchTerm, settleWithSearchTerm, payerDetail, recipientDetail, userDetail]);

  const handleSettleUpSubmit = async () => {
    try {
      const res = await fetch(`${API_URL}/settleup/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          note: note,
          settledBy: payerDetail?._id,
          settledWith: recipientDetail?._id,
          amount: expenseAmount,
          isGroupExpense: groupId1 ? true : false,
          groupId: groupId1
        }),
        credentials: 'include',
      })
  
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message || 'Something went wrong')
        return
      }

      if (!data.success) {
        toast(data.message);
        return { success: false, data: [] }
      } else {
        if (data?.success) {
          queryClient.invalidateQueries('nonGroupExpense', { refetchActive: true })
          queryClient.invalidateQueries('groupExpense', { refetchActive: true })
          queryClient.invalidateQueries('settleUpDetail', { refetchActive: true });
          toast.success(data.message)
        }
        return data;
      }
    } catch (error) {
      console.log('error', error.message);
      toast.error('Something went wrong')
    }
  }

  const validateFields = () => {
    if (!payerDetail) return toast.error('Please select Payer')
    if (!recipientDetail) return toast.error("Please select Recipient");
    if (!expenseAmount || isNaN(expenseAmount) || Number(expenseAmount) <= 0) return toast.error("A valid amount is required.");
    
    setShowModal(false);
    handleSettleUpSubmit();
    setGroupSelectDetail(null);
    setSettleUpSearchTerm("");
    setSettleWithSearchTerm("");
    setPayerDetail(null);
    setRecipientDetail(null);
    setGroupId(null);
    setNote("");
    setExpenseAmount(0)
  }

  return (
    <Modal
        show={showModal}
        popup
        onClose={() => {
          setShowModal(false);
          setGroupSelectDetail(null);
          setSettleUpSearchTerm("");
          setSettleWithSearchTerm("");
          setPayerDetail(null)
          setRecipientDetail(null)
          setGroupId(null);
          setNote("");
          setExpenseAmount(0);
        }}
        initialFocus={ref}
      >
        <Modal.Header>Settle Up</Modal.Header>
        <HR className="h-[1px] my-1 bg-slate-200 border-none" />
        <Modal.Body className="scrollbar-thin">
          <form className="space-y-3">
            <div>
              <Label htmlFor="userSearch" className="whitespace-nowrap">
                Select Payer:
              </Label>
              <div className="relative mt-1">
                <TextInput
                  type="text"
                  id="userSearch"
                  value={settleUpSearchTerm}
                  onChange={(e) => {setSettleUpSearchTerm(e.target.value)}}
                  ref={ref}
                  icon={CiSearch}
                  required
                  sizing="sm"
                  className="w-full"
                  placeholder="Type to search user..."
                />
              </div>

              {settleUpSearchTerm && (
                <div className="absolute z-10 w-11/12 bg-white border rounded-md shadow-lg max-h-48 overflow-auto scrollbar-thin mt-1">
                  {filteredUser?.length > 0 ? (
                    <>
                      {filteredUser?.map((friend) => (
                        <div
                          key={friend._id}
                          className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 w-full"
                          onClick={() => {setPayerDetail(friend); setSettleUpSearchTerm('')}}
                        >
                          <Avatar
                            img={friend?.profilePicture}
                            size="xs"
                            rounded
                          />
                          <span>{friend?.username}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="p-2 text-gray-500 text-sm text-center">
                      {groupId || groupSelectDetail
                        ? `${settleUpSearchTerm} is not a memeber of this group`
                        : "User not found"}
                    </div>
                  )}
                </div>
              )}

              {payerDetail && (
                <div className="flex flex-wrap gap-2 mt-2">
                    <div
                      className="flex items-center justify-center gap-2 bg-slate-100 text-slate-800 px-2 py-1 rounded-lg"
                    >
                      <Avatar
                        img={
                          payerDetail?.profilePicture ||
                          "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg?w=360"
                        }
                        size="xs"
                        rounded
                      />
                      <span>{payerDetail?.username}</span>
                      <Button
                        color="gray"
                        pill
                        className="p-0 flex justify-center items-center"
                        size="xs"
                        onClick={() => setPayerDetail(null)}
                      >
                        <RxCross2 className="h-3 w-3" />
                      </Button>
                    </div>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="userSearchSettelup" className="whitespace-nowrap">
                Select Recipient:
              </Label>
              <div className="relative mt-1">
                <TextInput
                  type="text"
                  id="userSearchSettelup"
                  value={settleWithSearchTerm}
                  onChange={(e) => setSettleWithSearchTerm(e.target.value)}
                  icon={CiSearch}
                  required
                  sizing="sm"
                  className="w-full"
                  placeholder="Type to search user..."
                />
              </div>

              {settleWithSearchTerm && (
                <div className="absolute z-10 w-11/12 bg-white border rounded-md shadow-lg max-h-48 overflow-auto scrollbar-thin mt-1">
                  {filteredUser?.length > 0 ? (
                    <>
                      {filteredUser?.map((friend) => (
                        <div
                          key={friend._id}
                          className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 w-full"
                          onClick={() => {setRecipientDetail(friend); setSettleWithSearchTerm('')}}
                        >
                          <Avatar
                            img={friend?.profilePicture}
                            size="xs"
                            rounded
                          />
                          <span>{friend?.username}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="p-2 text-gray-500 text-sm text-center">
                      {groupId || groupSelectDetail
                        ? `${settleWithSearchTerm} is not a memeber of this group`
                        : "User not found"}
                    </div>
                  )}
                </div>
              )}

              {recipientDetail && (
                <div className="flex flex-wrap gap-2 mt-2">
                    <div
                      className="flex items-center justify-center gap-2 bg-slate-100 text-slate-800 px-2 py-1 rounded-lg"
                    >
                      <Avatar
                        img={
                          recipientDetail?.profilePicture ||
                          "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg?w=360"
                        }
                        size="xs"
                        rounded
                      />
                      <span>{recipientDetail?.username}</span>
                      <Button
                        color="gray"
                        pill
                        className="p-0 flex justify-center items-center"
                        size="xs"
                        onClick={() => setRecipientDetail(null)}
                      >
                        <RxCross2 className="h-3 w-3" />
                      </Button>
                    </div>
                </div>
              )}
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
                onChange={(e) => setExpenseAmount(Number(e.target.value))}
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
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <div className="w-full">
            <div className="flex justify-end gap-3">
              <Button
                color="gray"
                onClick={() => {
                  setShowModal(false);
                  setGroupSelectDetail(null);
                  setSettleUpSearchTerm("");
                  setSettleWithSearchTerm("");
                  setPayerDetail(null)
                  setRecipientDetail(null)
                  setGroupId(null);
                  setNote("");
                  setExpenseAmount(0);
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
  )
}

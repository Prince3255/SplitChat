import SettleUp from "../model/settleup.model.js";
import User from "../model/user.model.js";
import { ApiError } from "../util/ApiError.js";
import { asyncHandler } from "../util/AsyncHandler.js";
import { ApiResponse } from "../util/ApiResponse.js";
import mongoose from "mongoose";
import Group from "../model/group.model.js";

export const createSettleup = asyncHandler(async (req, res) => {
  const { note, settledBy, settledWith, amount, isGroupExpense, groupId } =
    req.body;

  if (settledBy === null) {
    throw new ApiError(400, "Settled by must be a non-empty array");
  }
  if (settledWith === null) {
    throw new ApiError(400, "Settled with must be a non-empty array");
  }

  if (!amount || amount <= 0)
    throw new ApiError(400, "Valid amount is required");

  if (!isGroupExpense) {
    if (req?.user?._id !== settledBy && req?.user?._id !== settledWith) {
      throw new ApiError(401, "You are not authorized to settle this expense");
    }
  }

  if (
    !mongoose.Types.ObjectId.isValid(settledBy) ||
    !mongoose.Types.ObjectId.isValid(settledWith)
  ) {
    throw new ApiError(
      400,
      "Invalid user ID(s) provided in settledBy or settledWith"
    );
  }

  if (settledBy === settledWith) {
    throw new ApiError(400, "Payer and Recipient cannot be the same");
  }

  if (isGroupExpense) {
    const group = await Group.findById(groupId);
    if (!group) {
      throw new ApiError(404, "Group not found");
    }
    if (!group?.memberId.some((memberId) => memberId.equals(req.user._id))) {
      console.log(memberId);
      throw new ApiError(401, "You are not authorized to settle this expense");
    }
    if (
      !group.memberId.some((memberId) => memberId.equals(settledBy)) &&
      !group.memberId.some((memberId) => memberId.equals(settledWith))
    ) {
      throw new ApiError(
        401,
        "You are not authorized to settleup this expense"
      );
    }
  }

  try {
    const settleUp = new SettleUp({
      note: note || null,
      settledBy,
      settledWith,
      amount,
      isGroupExpense,
      groupId: isGroupExpense ? groupId : null,
    });

    await settleUp.save();

    if (!settleUp) {
      throw new ApiError(500, "Internal server error");
    }

    if (!isGroupExpense) {
      await User.findByIdAndUpdate(settledBy, {
        $addToSet: {
          settleUpExpense: settleUp._id,
        },
      });

      await User.findByIdAndUpdate(settledWith, {
        $addToSet: {
          settleUpExpense: settleUp._id,
        },
      });
    }

    if (isGroupExpense) {
      const group = await Group.findById(groupId);
      if (!group) {
        throw new ApiError(404, "Group not found");
      }

      try {
        await Promise.all(
          group.memberId.map((memberId) =>
            User.findByIdAndUpdate(memberId, {
              $addToSet: {
                settleUpExpense: settleUp._id,
              },
            })
          )
        );
      } catch (error) {
        console.error("Error updating members:", error);
        throw new ApiError(500, "Something went wrong");
      }
    }

    return res
      .status(201)
      .json(new ApiResponse(201, settleUp, "Settle up successfull"));
  } catch (error) {
    console.log("Error in settleup", error.message);
    throw new ApiError(500, error.message);
  }
});

export const getSettleUpDetail = asyncHandler(async (req, res) => {
  const groupId = req?.query?.groupId || null
  const userId = req.user._id

  try {
    const settleupDetail = await SettleUp.getSettleUpDetail(userId, groupId)
    
    return res.status(200).json(new ApiResponse(200, settleupDetail, 'Settle up detail fetched successfully'))
  } catch (error) {
    console.log("Error while getting settle up detail", error.message);
    throw new ApiError(500, error.message);
  }
})

export const getSettleup = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid expense ID provided");
    }

    const settleUp = await SettleUp.findById(id)
      .populate([
        {
          path: "settledBy",
          select: "-password -email",
        },
        {
          path: "settledWith",
          select: "-password -email",
        },
      ])
      .select("-password -email");

    return res
      .status(200)
      .json(new ApiResponse(200, settleUp, "Get settle up successfull"));
  } catch (error) {
    console.log("Error while getting settle up", error.message);
    throw new ApiError(500, error.message);
  }
});

export const updateSettleup = asyncHandler(async (req, res) => {
  const id = req.params.settlupid;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid expense ID provided");
  }

  try {
    if (id !== req.body._id) {
      throw new ApiError(400, "Settleup id doesn't match");
    }

    const { note, settledBy, settledWith, amount, groupId, isGroupExpense } = req.body;

    if (amount < 0 || isNaN(amount)) {
      throw new ApiError(400, "Amount should be a positive number");
    }

    if (
      !mongoose.Types.ObjectId.isValid(settledBy) ||
      !mongoose.Types.ObjectId.isValid(settledWith)
    ) {
      throw new ApiError(
        400,
        "Invalid user ID(s) provided in settledBy or settledWith"
      );
    }

    if (settledBy === null) {
      throw new ApiError(400, "Please select who is payer");
    }

    if (settledWith === null) {
      throw new ApiError(
        400,
        "Please select who is recipient"
      );
    }

    const settleUp = await SettleUp.findById(id);
    if (!settleUp) {
      throw new ApiError(404, "Settle up not found");
    }

    if (!isGroupExpense) {
      if (
        req.user._id.toString() !== settleUp.settledBy.toString() &&
        req.user._id.toString() !== settleUp.settledWith.toString()
      ) {
        throw new ApiError(
          403,
          "You are not authorized to update this settle up"
        );
      }
    }

    if (!isGroupExpense) {
      if (
        req.user._id.toString() !== settledBy.toString() &&
        req.user._id.toString() !== settledWith.toString()
      ) {
        throw new ApiError(
          403,
          "You cannot remove yourself from this settle-up transaction as you are either the payer or the recipient."
        );
      }
    }

    if (isGroupExpense) {
      let group = await Group.findById(groupId || settleUp.groupId) 
      if (!group) {
        throw new ApiError(404, "Group not found");
      }
      if (!group?.memberId?.includes(req.user._id)) {
        throw new ApiError(403, "You are not a member of this group");
      }
    }

    const updatedSettleUp = await SettleUp.findByIdAndUpdate(
      id,
      {
        $set: {
          note: note || settleUp.note,
          settledBy: settledBy || settleUp.settledBy,
          settledWith: settledWith || settleUp.settledWith,
          amount: amount || settleUp.amount,
        },
      },
      { new: true }
    );

    return res
      .status(201)
      .json(
        new ApiResponse(201, updatedSettleUp, "Settle up updated successfully")
      );
  } catch (error) {
    console.log("Error in settle up while updating", error.message);
    throw new ApiError(500, error.message);
  }
});

export const deleteSettleUp = asyncHandler(async (req, res) => {
  const id = req.params.settlupid;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid expense ID provided");
  }

  try {
    const settleUp = await SettleUp.findById(id);
    if (!settleUp) {
      throw new ApiError(404, "Settle up not found");
    }

    if (settleUp) {
      if (settleUp?.isGroupExpense) {
        const group = await Group.findById(settleUp?.groupId);
        if (!group) {
          throw new ApiError(404, "Group not found");
        }
        
        if (!group?.memberId?.includes(req?.user?._id)) {
          throw new ApiError(
            401,
            "You are not authorized to delete these expense"
          );
        }
      }
      else {
        if (
          (req.user._id.toString() !== settleUp.settledBy.toString()) &&
          (req.user._id.toString() !== settleUp.settledWith.toString())
        ) {
          throw new ApiError(
            401,
            "You are not authorized to delete this settle up"
          );
        }
      }
    }

    const settleup1 = await SettleUp.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true, deletedAt: Date.now() } },
      { new: true }
    );

    if (!settleup1) {
      throw new ApiError(500, "Something went wrong");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, settleup1, "settlement deleted successfully"));
  } catch (error) {
    console.log("Error in settle up while deleting", error.message);
    throw new ApiError(500, error.message);
  }
});

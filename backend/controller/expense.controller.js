import Expense from "../model/expense.model.js";
import User from "../model/user.model.js";
import Group from "../model/group.model.js";
import { ApiError } from "../util/ApiError.js";
import { asyncHandler } from "../util/AsyncHandler.js";
import { ApiResponse } from "../util/ApiResponse.js";
import mongoose from "mongoose";

export const createExpense = asyncHandler(async (req, res) => {
  const {
    title,
    amount,
    currency,
    paidby,
    splitbtwn,
    note,
    isGroupExpense,
    groupId,
    expenseType,
  } = req.body;

  try {
    if (!title || !amount || !currency) {
      throw new ApiError(400, "Title, amount and currency are required");
    }

    if (!paidby || typeof paidby !== "string") {
      throw new ApiError(400, "Invalid paidby value");
    }

    if (!Array.isArray(splitbtwn)) {
      throw new ApiError(400, "Invalid splitbtwn value");
    }

    if (!splitbtwn) {
      throw new ApiError(400, "Split between must be include user IDs");
    }

    if (currency && !["USD", "INR"].includes(currency)) {
      throw new ApiError(400, "Invalid currency");
    }

    if (
      !Array.isArray(splitbtwn) ||
      !splitbtwn.every((id) => mongoose.Types.ObjectId.isValid(id))
    ) {
      throw new ApiError(400, "Invalid splitbtwn value");
    }

    if (!mongoose.Types.ObjectId.isValid(paidby)) {
      throw new ApiError(400, "Invalid paidby value");
    }

    if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
      throw new ApiError(400, "Invalid user id");
    }

    if (!isGroupExpense) {
      if (req.user._id !== paidby && !splitbtwn.includes(req.user._id)) {
        throw new ApiError(
          401,
          "You are not authorized to create this expense"
        );
      }
    }

    if (splitbtwn.length === 1) {
      if (paidby === splitbtwn[0]) {
        throw new ApiError(400, "Paid by and split between cannot be the same");
      }
    }

    if (isGroupExpense) {
      const group = await Group.findById(groupId);
      if (!group) {
        throw new ApiError(404, "Group not found");
      }
      if (!group?.memberId?.includes(req.user._id)) {
        throw new ApiError(
          401,
          "You are not authorized to create group expense"
        );
      }
    }

    if (
      req?.user._id === paidby &&
      splitbtwn.length === 1 &&
      splitbtwn[0] === req.user._id
    ) {
      throw new ApiError(400, "You cannot split expense with yourself");
    }

    const expense = new Expense({
      title,
      amount,
      currency: currency || "INR",
      paidby,
      splitbtwn: splitbtwn || [],
      note: note || "",
      isGroupExpense: isGroupExpense || false,
      groupId: groupId || null,
      expenseType: expenseType || "Non group",
    });

    await expense.save();

    if (!expense) {
      return new ApiError(500, "Something went wrong");
    }

    if (expense.paidby) {
      await User.findByIdAndUpdate(expense.paidby, {
        $push: { expense: expense._id },
      });
    }
    if (expense.splitbtwn.length !== 0) {
      for (const userId of expense.splitbtwn) {
        if (userId !== expense.paidby) {
          await User.findByIdAndUpdate(userId, {
            $push: { expense: expense._id },
          });
        }
      }
    }

    if (expense.isGroupExpense) {
      await Group.findByIdAndUpdate(groupId, {
        $push: { expenseId: expense._id },
      });
      // return res.status(201).json(new ApiResponse(201, expense, "Expense added"))
    }

    let expense1 = null;

    try {
      // if (!expense.isGroupExpense) {
      // Validate expense._id
      if (!mongoose.Types.ObjectId.isValid(expense._id)) {
        throw new ApiError(400, "Invalid expense ID");
      }

      // Validate splitbtwn array
      if (!Array.isArray(expense.splitbtwn)) {
        throw new ApiError(400, "Invalid splitbtwn array");
      }

      if (!mongoose.Types.ObjectId.isValid(expense.paidby)) {
        throw new ApiError(400, "Invalid paidby ID");
      }

      expense.splitbtwn.forEach((userId) => {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          throw new ApiError(400, `Invalid user ID in splitbtwn: ${userId}`);
        }
      });

      expense1 = await Expense.findByIdAndUpdate(
        expense._id,
        {
          $addToSet: {
            friend: { $each: [expense.paidby, ...expense.splitbtwn] },
          },
        },
        { new: true }
      );

      if (!expense1) {
        console.log("Expense1:", expense1);
        throw new ApiError(500, "Something went wrong");
      }

      const combinedArray = [
        ...new Set([
          expense.paidby.toString(),
          ...expense.splitbtwn.map((id) => id.toString()),
        ]),
      ].map((id) => new mongoose.Types.ObjectId(id));

      if (combinedArray.length !== 0) {
        for (const userId of combinedArray) {
          let user = userId;
          const filteredArray = combinedArray.filter(
            (userId) => !userId.equals(user)
          );

          await User.findByIdAndUpdate(userId, {
            $addToSet: { friend: { $each: filteredArray } },
          });
        }
      }
    } catch (err) {
      console.error("Error processing expense:", err);
      throw err;
    }

    return res
      .status(201)
      .json(new ApiResponse(201, expense1, "Expense added"));
  } catch (error) {
    console.log("Error in addExpense", error.message);
    throw new ApiError(500, error.message);
  }
});

const getExpenseById1 = async (expenseId, userId) => {
  const expense = await Expense.findById(expenseId);
  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }
  if (!Array.isArray(expense.splitbtwn)) {
    throw new ApiError(500, "Invalid expense data");
  }
  if (
    !expense.splitbtwn.includes(userId) &&
    !expense.isGroupExpense &&
    expense.paidby.toString() !== userId.toString()
  ) {
    throw new ApiError(401, "You are not authorized to access this expense");
  }
  return expense;
};

export const getExpenseById = asyncHandler(async (req, res) => {
  const expenseId = req.params.expenseId;

  try {
    const expense = await getExpenseById1(expenseId, req.user._id);

    if (!expense) {
      throw new ApiError(404, "Expense not found");
    }

    res.status(200).json(new ApiResponse(200, expense, null));
  } catch (error) {
    console.log("Error in getting expense", error.message);
    throw new ApiError(404, error.message);
  }
});

export const updateExpense = asyncHandler(async (req, res) => {
  if (req.params.expenseId !== req.body._id) {
    throw new ApiError(404, "Expense not found");
  }

  try {
    const expense1 = await getExpenseById1(req.params.expenseId, req.user._id);
    if (!expense1) {
      throw new ApiError(404, "Expense not found");
    }

    let flag1 = expense1?.isGroupExpense ? true : false;

    if (
      !expense1.splitbtwn.includes(req.user._id) &&
      expense1.paidby.toString() !== req.user._id.toString() &&
      !flag1
    ) {
      throw new ApiError(401, "You are not authorized to update this expense");
    }

    if (flag1) {
      const groupmemeber = await Group.findById(req.body.groupId);
      if (groupmemeber) {
        if (!groupmemeber?.memberId.includes(req?.user?._id)) {
          throw new ApiError(
            401,
            "You are not authorized to update this expense"
          );
        }
      }
    }

    if (req.body.amount && (isNaN(req.body.amount) || req.body.amount < 0)) {
      throw new ApiError(400, "Invalid amount");
    }

    if (req.body.currency && !["USD", "INR"].includes(req.body.currency)) {
      throw new ApiError(400, "Invalid currency");
    }

    if (req.body.splitbtwn && !Array.isArray(req.body.splitbtwn)) {
      throw new ApiError(400, "splitbtwn must be an array of user IDs");
    }

    if (
      req.body.settleup !== undefined &&
      typeof req.body.settleup !== "boolean"
    ) {
      throw new ApiError(400, "Invalid settleup value");
    }

    if (flag1 === false || req.body.isGroupExpense === false) {
      if (
        req.user._id.toString() !== req?.body?.paidby.toString() &&
        !req?.body?.splitbtwn?.includes(req.user._id)
      ) {
        throw new ApiError(
          403,
          "You cannot remove yourself from this expense as you are either the payer or inlcuded in splitbetween."
        );
      }
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.expenseId,
      {
        $set: {
          title: req.body.title || expense1.title,
          amount: req.body.amount || expense1.amount,
          currency: req.body.currency || expense1.currency,
          paidby: req.body.paidby || expense1.paidby,
          splitbtwn: req.body.splitbtwn || expense1.splitbtwn,
          note: req.body.note || expense1.note,
          isGroupExpense: req.body.isGroupExpense || expense1.isGroupExpense,
          groupId: req.body.groupId || expense1.groupId,
          expenseType: req.body.expenseType || expense1.expenseType,
          coverImage: req.body.coverImage || expense1.coverImage,
          image: req.body.image || expense1.image,
        },
      },
      {
        new: true,
      }
    );

    if (!updatedExpense) {
      throw new ApiError(500, "Something went wrong");
    }

    if (
      !expense1.paidby.equals(updatedExpense.paidby) &&
      !updatedExpense.splitbtwn.some((id) => id.equals(expense1.paidby))
    ) {
      await User.findByIdAndUpdate(expense1.paidby, {
        $pull: {
          expense: req.params.expenseId,
        },
      });
      await Expense.findByIdAndUpdate(updatedExpense._id, {
        $pull: {
          friend: expense1.paidby,
        },
      });
    }
    for (const id of expense1.splitbtwn) {
      if (
        !id.equals(updatedExpense.paidby) &&
        !updatedExpense.splitbtwn.some((updatedId) => id.equals(updatedId))
      ) {
        await User.findByIdAndUpdate(id, {
          $pull: {
            expense: req.params.expenseId,
          },
        });
        await Expense.findByIdAndUpdate(updatedExpense._id, {
          $pull: {
            friend: id,
          },
        });
      }
    }

    if (!updatedExpense.paidby.equals(expense1.paidby)) {
      await User.findByIdAndUpdate(updatedExpense.paidby, {
        $addToSet: { expense: req.params.expenseId },
      });
      await Expense.findByIdAndUpdate(updatedExpense._id, {
        $addToSet: { friend: expense1.paidby },
      });
    }
    for (const updatedId of updatedExpense.splitbtwn) {
      if (!expense1.splitbtwn.some((id) => updatedId.equals(id))) {
        await User.findByIdAndUpdate(updatedId, {
          $addToSet: { expense: req.params.expenseId },
        });
        await Expense.findByIdAndUpdate(updatedExpense._id, {
          $addToSet: { friend: expense1.paidby },
        });
      }
    }
    // if (updatedExpense.splitbtwn.length !== 0) {
    //   await User.updateMany(
    //     {
    //       _id: {
    //         $in: updatedExpense.splitbtwn.filter(
    //           (id) => !id.equals(updatedExpense.paidby)
    //         ),
    //       },
    //     },
    //     { $push: { expense: req.params.expenseId } }
    //   );
    //   await Expense.findByIdAndUpdate(updatedExpense._id, {
    //     $addToSet: {
    //       $push: {
    //         friend: {
    //           $each: updatedExpense.splitbtwn.filter(
    //             (id) => !id.equals(updatedExpense.paidby)
    //           ),
    //         },
    //       },
    //     },
    //   });
    // }

    if (flag1 === false && updatedExpense.isGroupExpense === true) {
      if (
        !Array.isArray(updateExpense.groupId) &&
        updateExpense.groupId.length === 0
      ) {
        throw new ApiError(400, "Group ID is required for group expense");
      }
      await Group.findByIdAndUpdate(updateExpense.groupId, {
        $push: { expenseId: req.params.expenseId },
      });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updatedExpense, "Expense updated"));
  } catch (error) {
    console.log("Error in update expense", error.message);
    throw new ApiError(500, error.message);
  }
});

export const deleteExpense = asyncHandler(async (req, res) => {
  try {
    if (req.params.expenseId !== req.body.expenseId) {
      throw new ApiError(404, "Expense not found");
    }

    const getExpense = await getExpenseById1(
      req.params.expenseId,
      req.user._id
    );

    if (getExpense) {
      if (getExpense?.isGroupExpense) {
        const group = await Group.findById(getExpense?.groupId);
        console.log(group)
        if (!group) {
          throw new ApiError(404, "Group not found");
        }
        if (!group?.memberId?.includes(req.user._id)) {
          throw new ApiError(
            401,
            "You are not authorized to delete these expense"
          );
        }
      } else {
        if (
          req.user._id.toString() !== getExpense.paidby.toString() &&
          req.user._id.toString() !== getExpense?.splitbtwn
        ) {
          throw new ApiError(
            401,
            "You are not authorized to delete these expense"
          );
        }
      }
    }

    const expense = await Expense.findByIdAndUpdate(
      req.params.expenseId,
      {
        $set: { isDeleted: true, deletedAt: new Date() },
      },
      {
        new: true,
      }
    );

    if (!expense) {
      throw new ApiError(404, "Expense not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, expense, "expense deleted successfully"));
  } catch (error) {
    console.log("Error while deleting expense", error.message);
    throw new ApiError(500, error.message);
  }
});

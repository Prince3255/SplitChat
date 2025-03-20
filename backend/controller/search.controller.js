import { asyncHandler } from "../util/AsyncHandler.js";
import Expense from "../model/expense.model.js";
import User from "../model/user.model.js";
import SettleUp from "../model/settleup.model.js";
import Group from "../model/group.model.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { ApiError } from "../util/ApiError.js";

export const getSeacrchResult = asyncHandler(async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm?.trim();

    const searchRegex = searchTerm
      ? { $regex: searchTerm, $options: "i" }
      : null;

    const user = await User.findById(req?.user?._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const expenseQuery = {};
    if (searchRegex) {
      expenseQuery.$and = [
        { title: searchRegex },
        {
          $or: [
            { paidBy: req.user._id },
            { splitbtwn: { $in: [req.user._id] } },
          ],
        },
        {
          isDeleted: false,
        },
      ];
    }
    let expenses = await Expense.find(expenseQuery);

    const filteredExpenses = await Promise.all(
      expenses.map(async (exp) => {
        if (exp?.isGroupExpense) {
          return (
            user?.group.includes(exp.groupId) ||
            exp?.groupId?.memberId?.includes(req?.user?._id)
          );
        }
        return true;
      })
    );

    expenses = expenses.filter((_, index) => filteredExpenses[index]);

    const settleUpQuery = {};
    if (searchRegex) {
      settleUpQuery.$and = [
        { note: searchRegex },
        {
          $or: [{ settledBy: req.user._id }, { settledWith: req.user._id }],
        },
        {
          isDeleted: false,
        },
      ];
    }
    let settleUps = await SettleUp.find(settleUpQuery);
    
    const filteredSettleUp = await Promise.all(
      settleUps.map(async (exp) => {
        if (exp?.isGroupExpense) {
          return (
            user?.group.includes(exp.groupId) ||
            exp?.groupId?.memberId?.includes(req?.user?._id)
          );
        }
        return true;
      })
    );

    settleUps = settleUps.filter((_, index) => filteredSettleUp[index]);

    const groupQuery = {};
    if (searchRegex) {
      groupQuery.$and = [
        { name: searchRegex },
        { memberId: { $in: [req.user._id] } },
        {
          isDeleted: false,
        },
      ];
    }
    const groups = await Group.find(groupQuery);

    const userQuery = searchRegex ? { username: searchRegex } : {};
    const users = await User.find(userQuery).select(
      "_id username profilePicture"
    );

    const data = { users, groups, settleUps, expenses };
    res
      .status(200)
      .json(new ApiResponse(200, data, "Data fetched successfully"));
  } catch (error) {
    console.log("Error while searching", error.message);
    return res.status(400).json(new ApiError(400, error.message));
  }
});

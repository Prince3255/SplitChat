import mongoose, { Schema } from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount must be positive"],
    },
    currency: {
      type: String,
      default: "INR",
    },
    paidby: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    splitbtwn: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    note: {
      type: String,
      default: null,
    },
    isGroupExpense: {
      type: Boolean,
      default: false,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      default: [],
    },
    friend: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    expenseType: {
      type: String,
      enum: [
        "Food",
        "Transportation",
        "Shopping",
        "Entertainment",
        "Non group",
        "Group",
        "Other",
      ],
      default: "Non group",
    },
    coverImage: {
      type: String,
      default: process.env.EXPENSE_COVER_IMAGE,
    },
    image: {
      type: "String",
      default: process.env.EXPENSE_IMAGE,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.statics.getGroupExpenseNotInUser = async function (
  userId,
  groupId
) {
  const User = mongoose.model("User");
  const user = await User.findById(userId).select("expense").lean();
  const userExpenseIds = user?.expense || [];

  return this.aggregate([
    {
      $match: {
        groupId: new mongoose.Types.ObjectId(groupId),
        _id: { $nin: userExpenseIds },
        isDeleted: false
      },
    },
    {
      $lookup: {
        from: "users",
        let: { friendIds: "$friend" },  // Use correct field name
        pipeline: [
          {
            $match: {
              $expr: {
                $in: [{ $toObjectId: "$_id" }, "$$friendIds"],  // Ensure _id matches friend field
              },
            },
          },
          {
            $project: {
              username: 1,
              profilePicture: 1,
              _id: 1,
            },
          },
        ],
        as: "friendDetail",
      },
    },    
    {
      $project: {
        title: 1,
        amount: 1,
        currency: 1,
        paidby: 1,
        splitbtwn: 1,
        note: 1,
        isGroupExpense: 1,
        groupId: 1,
        friendDetail: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);
};

const Expense = mongoose.model("Expense", expenseSchema);


export default Expense;

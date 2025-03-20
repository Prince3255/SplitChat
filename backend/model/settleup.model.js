import mongoose from "mongoose";

const settleupSchema = new mongoose.Schema(
  {
    note: {
      type: String,
    },
    settledBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    settledWith: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    isGroupExpense: {
      type: Boolean,
      default: false,
    },
    groupId: {
      type: mongoose.Types.ObjectId,
      ref: "Group",
      default: [],
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

settleupSchema.statics.getSettleUpDetail = function (userId, groupId = null) {
  const matchCondition = {
    isDeleted: false,
  };

  if (groupId && new mongoose.Types.ObjectId(groupId)) {
    matchCondition.groupId = new mongoose.Types.ObjectId(groupId);
  } else {
    matchCondition.$or = [
      { settledBy: new mongoose.Types.ObjectId(userId) },
      { settledWith: new mongoose.Types.ObjectId(userId) },
    ];
  }

  return this.aggregate([
    {
      $match: matchCondition,
    },
    {
      $lookup: {
        from: "users",
        localField: "settledBy",
        foreignField: "_id",
        as: "settledByDetails",
      },
    },
    {
      $unwind: {
        path: "$settledByDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "settledWith",
        foreignField: "_id",
        as: "settledWithDetails",
      },
    },
    {
      $unwind: {
        path: "$settledWithDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        groupId: 1,
        amount: 1,
        settledBy: 1,
        settledWith: 1,
        settledByDetail: {
          _id: "$settledByDetails._id",
          username: "$settledByDetails.username",
          profilePicture: "$settledByDetails.profilePicture",
        },
        settledWithDetail: {
          _id: "$settledWithDetails._id",
          username: "$settledWithDetails.username",
          profilePicture: "$settledWithDetails.profilePicture",
        },
        note: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);
};

const SettleUp = mongoose.model("SettleUp", settleupSchema);

export default SettleUp;

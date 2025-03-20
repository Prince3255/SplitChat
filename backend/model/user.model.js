import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ApiError } from "../util/ApiError.js";
import SettleUp from "./settleup.model.js";

dotenv.config();

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default:
        "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg?w=360",
    },
    coverImage: {
      type: String,
    },
    isSubscribed: {
      type: Boolean,
      default: false,
    },
    notification: {
      type: Array,
      default: [],
    },
    expense: [
      {
        type: Schema.Types.ObjectId,
        ref: "Expense",
      },
    ],
    group: [
      {
        type: Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
    settleUpExpense: [
      {
        type: Schema.Types.ObjectId,
        ref: "SettledUp",
      },
    ],
    friend: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    throw new ApiError(500, "Something went wrong");
  }
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      profilePicture: this.profilePicture,
      createdAt: this.createdAt.toISOString(),
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.statics.getOverallExpense = function (userId, groupIds = []) {
  return this.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $project: {
        password: 0,
      },
    },
    {
      $lookup: {
        from: "expenses",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ["$paidby", "$$userId"] },
                  { $in: ["$$userId", "$splitbtwn"] },
                ],
              },
              isDeleted: { $ne: true },
              ...(groupIds.length > 0
                ? {
                    groupId: {
                      $in: groupIds.map(
                        (id) => new mongoose.Types.ObjectId(id)
                      ),
                    },
                  }
                : { isGroupExpense: { $ne: true } }),
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "splitbtwn",
              foreignField: "_id",
              as: "splitbtwnUserDetail",
            },
          },
          {
            $project: {
              paidby: 1,
              splitbtwn: 1,
              amount: 1,
              splitbtwnUserDetail: {
                username: 1,
                email: 1,
                _id: 1,
                profilePicture: 1,
              },
              isGroupExpense: 1,
              groupId: 1,
              image: "$image",
              coverImage: "$coverImage",
              title: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
        as: "userExpenses",
      },
    },
    {
      $lookup: {
        from: "settleups",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ["$$userId", "$settledBy"] },
                  { $eq: ["$$userId", "$settledWith"] },
                ],
              },
              isDeleted: { $ne: true },
              ...(groupIds.length > 0
                ? {
                    groupId: {
                      $in: groupIds.map(
                        (id) => new mongoose.Types.ObjectId(id)
                      ),
                    },
                  }
                : {
                    isGroupExpense: {
                      $ne: true,
                    },
                  }),
            },
          },
          {
            $project: {
              note: 1,
              amount: 1,
              settledBy: 1,
              settledWith: 1,
              isGroupExpense: 1,
              groupId: 1,
              groupProfile: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
        as: "settledTransaction",
      },
    },
    {
      $addFields: {
        currentUserId: "$_id",
      },
    },
    {
      $addFields: {
        netExpenses: {
          $reduce: {
            input: "$userExpenses",
            initialValue: {},
            in: {
              $mergeObjects: [
                "$$value",
                {
                  $arrayToObject: {
                    $concatArrays: [
                      {
                        $map: {
                          input: "$$this.splitbtwnUserDetail",
                          as: "user",
                          in: {
                            k: { $toString: "$$user._id" },
                            v: {
                              owed: {
                                $cond: [
                                  { $ne: ["$$user._id", "$currentUserId"] }, // Exclude your ID
                                  {
                                    $add: [
                                      {
                                        $ifNull: [
                                          {
                                            $getField: {
                                              field: "owed",
                                              input: {
                                                $getField: {
                                                  field: {
                                                    $toString: "$$user._id",
                                                  },
                                                  input: "$$value",
                                                },
                                              },
                                            },
                                          },
                                          0,
                                        ],
                                      },
                                      {
                                        $cond: {
                                          if: {
                                            $eq: [
                                              "$$this.paidby",
                                              "$currentUserId",
                                            ],
                                          },
                                          then: {
                                            $divide: [
                                              "$$this.amount",
                                              { $size: "$$this.splitbtwn" },
                                              //
                                            ],
                                          },
                                          else: 0,
                                        },
                                      },
                                    ],
                                  },
                                  0,
                                ],
                              },
                              lent: {
                                $cond: [
                                  { $ne: ["$$user._id", "$currentUserId"] }, // Exclude current user as paidby
                                  {
                                    $add: [
                                      {
                                        $ifNull: [
                                          {
                                            $getField: {
                                              field: "lent",
                                              input: {
                                                $getField: {
                                                  field: {
                                                    $toString: "$$user._id",
                                                  },
                                                  input: "$$value",
                                                },
                                              },
                                            },
                                          },
                                          0,
                                        ],
                                      },
                                      0,
                                    ],
                                  },
                                  0,
                                ],
                              },
                            },
                          },
                        },
                      },
                      [
                        {
                          k: { $toString: "$$this.paidby" },
                          v: {
                            owed: {
                              $ifNull: [
                                {
                                  $getField: {
                                    field: "owed",
                                    input: {
                                      $getField: {
                                        field: { $toString: "$$this.paidby" },
                                        input: "$$value",
                                      },
                                    },
                                  },
                                },
                                0,
                              ],
                            },
                            lent: {
                              $cond: [
                                { $ne: ["$$this.paidby", "$currentUserId"] }, // Exclude current user as paidby
                                {
                                  $add: [
                                    {
                                      $ifNull: [
                                        {
                                          $getField: {
                                            field: "lent",
                                            input: {
                                              $getField: {
                                                field: {
                                                  $toString: "$$this.paidby",
                                                },
                                                input: "$$value",
                                              },
                                            },
                                          },
                                        },
                                        0,
                                      ],
                                    },
                                    {
                                      $divide: [
                                        "$$this.amount",
                                        { $size: "$$this.splitbtwn" },
                                      ],
                                    },
                                  ],
                                },
                                0,
                              ],
                            },
                          },
                        },
                      ],
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },
    {
      $addFields: {
        settledTransaction: { $ifNull: ["$settledTransaction", []] },
      },
    },
    {
      $addFields: {
        netSettleup: {
          $reduce: {
            input: "$settledTransaction",
            initialValue: {},
            in: {
              $mergeObjects: [
                "$$value",
                {
                  $cond: [
                    { $eq: ["$$this.settledBy", "$currentUserId"] },
                    {
                      $arrayToObject: [
                        [
                          {
                            k: { $toString: "$$this.settledWith" },
                            v: {
                              owed: {
                                $add: [
                                  {
                                    $ifNull: [
                                      {
                                        $getField: {
                                          field: "owed",
                                          input: {
                                            $getField: {
                                              field: {
                                                $toString: "$$this.settledWith",
                                              },
                                              input: "$$value",
                                            },
                                          },
                                        },
                                      },
                                      0,
                                    ],
                                  },
                                  "$$this.amount",
                                ],
                              },
                              lent: {
                                $ifNull: [
                                  {
                                    $getField: {
                                      field: "lent",
                                      input: {
                                        $getField: {
                                          field: {
                                            $toString: "$$this.settledWith",
                                          },
                                          input: "$$value",
                                        },
                                      },
                                    },
                                  },
                                  0,
                                ],
                              },
                            },
                          },
                        ],
                      ],
                    },
                    {
                      $cond: [
                        { $eq: ["$$this.settledWith", "$currentUserId"] },
                        {
                          $arrayToObject: [
                            [
                              {
                                k: { $toString: "$$this.settledBy" },
                                v: {
                                  owed: {
                                    $ifNull: [
                                      {
                                        $getField: {
                                          field: "owed",
                                          input: {
                                            $getField: {
                                              field: {
                                                $toString: "$$this.settledBy",
                                              },
                                              input: "$$value",
                                            },
                                          },
                                        },
                                      },
                                      0,
                                    ],
                                  },
                                  lent: {
                                    $add: [
                                      {
                                        $ifNull: [
                                          {
                                            $getField: {
                                              field: "lent",
                                              input: {
                                                $getField: {
                                                  field: {
                                                    $toString:
                                                      "$$this.settledBy",
                                                  },
                                                  input: "$$value",
                                                },
                                              },
                                            },
                                          },
                                          0,
                                        ],
                                      },
                                      "$$this.amount",
                                    ],
                                  },
                                },
                              },
                            ],
                          ],
                        },
                        {},
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    },
    {
      $addFields: {
        combinedKeys: {
          $setUnion: [
            {
              $ifNull: [
                {
                  $map: {
                    input: { $objectToArray: "$netSettleup" },
                    as: "item",
                    in: "$$item.k",
                  },
                },
                [],
              ],
            },
            {
              $ifNull: [
                {
                  $map: {
                    input: { $objectToArray: "$netExpenses" },
                    as: "item",
                    in: "$$item.k",
                  },
                },
                [],
              ],
            },
          ],
        },
      },
    },
    {
      $addFields: {
        settleupAmount: {
          $map: {
            input: "$combinedKeys",
            as: "key",
            in: {
              k: { $toString: "$$key" },
              v: {
                owed: {
                  $add: [
                    {
                      $ifNull: [
                        {
                          $getField: {
                            field: "owed",
                            input: {
                              $getField: {
                                field: "$$key",
                                input: "$netSettleup",
                              },
                            },
                          },
                        },
                        0,
                      ],
                    },
                    {
                      $ifNull: [
                        {
                          $getField: {
                            field: "owed",
                            input: {
                              $getField: {
                                field: "$$key",
                                input: "$netExpenses",
                              },
                            },
                          },
                        },
                        0,
                      ],
                    },
                  ],
                },
                lent: {
                  $add: [
                    {
                      $ifNull: [
                        {
                          $getField: {
                            field: "lent",
                            input: {
                              $getField: {
                                field: "$$key",
                                input: "$netSettleup",
                              },
                            },
                          },
                        },
                        0,
                      ],
                    },
                    {
                      $ifNull: [
                        {
                          $getField: {
                            field: "lent",
                            input: {
                              $getField: {
                                field: "$$key",
                                input: "$netExpenses",
                              },
                            },
                          },
                        },
                        0,
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    {
      $addFields: {
        settledupAmount: { $arrayToObject: "$settleupAmount" },
      },
    },
    {
      $project: {
        total: {
          $map: {
            input: { $ifNull: [{ $objectToArray: "$settledupAmount" }, []] },
            as: "user",
            in: {
              k: "$$user.k",
              v: {
                $cond: {
                  if: { $gt: ["$$user.v.owed", "$$user.v.lent"] },
                  then: {
                    owed: { $subtract: ["$$user.v.owed", "$$user.v.lent"] },
                  },
                  else: {
                    lent: { $subtract: ["$$user.v.lent", "$$user.v.owed"] },
                  },
                },
              },
            },
          },
        },
        userKeys: {
          $map: {
            input: { $ifNull: [{ $objectToArray: "$settledupAmount" }, []] },
            as: "user",
            in: "$$user.k",
          },
        },
        userExpenses: 1,
        settledTransaction: 1,
        netExpenses: 1,
        netSettleup: 1,
      },
    },
    {
      $addFields: {
        userKeys: {
          $map: {
            input: "$userKeys",
            as: "key",
            in: { $toObjectId: "$$key" },
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userKeys",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $addFields: {
        total: {
          $arrayToObject: "$total",
        },
      },
    },
    {
      $project: {
        userExpenses: 1,
        total: 1,
        userDetails: {
          _id: 1,
          username: 1,
          profilePicture: 1,
        },
        settledTransaction: 1,
        netExpenses: 1,
        netSettleup: 1,
      },
    },
  ]);
};

userSchema.statics.getGroupExpense = function (userId) {
  return this.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $project: {
        password: 0,
      },
    },
    {
      $addFields: {
        currentUserId: "$_id",
      },
    },
    {
      $lookup: {
        from: "expenses",
        let: { userId: "$currentUserId", currentUserId: "$currentUserId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ["$paidby", "$$userId"] },
                  { $in: ["$$userId", "$splitbtwn"] },
                ],
              },
              isDeleted: false,
              isGroupExpense: true,
            },
          },
          {
            $addFields: {
              splitbtwnCount: { $size: "$splitbtwn" },
              userOwes: {
                $cond: {
                  if: { $eq: ["$$userId", "$paidby"] },
                  then: {
                    $cond: {
                      if: { $in: ["$$userId", "$splitbtwn"] },
                      then: {
                        $subtract: [
                          "$amount",
                          { $divide: ["$amount", { $size: "$splitbtwn" }] },
                        ],
                      },
                      else: "$amount",
                    },
                  },
                  else: 0,
                },
              },
              userLent: {
                $cond: {
                  if: { $in: ["$$userId", "$splitbtwn"] },
                  then: {
                    $cond: {
                      if: { $eq: ["$$userId", "$paidby"] },
                      then: 0,
                      else: { $divide: ["$amount", { $size: "$splitbtwn" }] },
                    },
                  },
                  else: 0,
                },
              },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "paidby",
              foreignField: "_id",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    profilePicture: 1,
                  },
                },
              ],
              as: "paidByDetails",
            },
          },
          {
            $unwind: {
              path: "$paidByDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "splitbtwn",
              foreignField: "_id",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    profilePicture: 1,
                  },
                },
              ],
              as: "splitBetweenDetails",
            },
          },
        ],
        as: "userExpenses",
      },
    },
    {
      $lookup: {
        from: "settleups",
        let: { userId: "$currentUserId", currentUserId: "$currentUserId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ["$$userId", "$settledBy"] },
                  { $eq: ["$$userId", "$settledWith"] },
                ],
              },
              isDeleted: false,
              isGroupExpense: true,
            },
          },
          {
            $addFields: {
              settleOwed: {
                $cond: {
                  if: { $eq: ["$$userId", "$settledBy"] },
                  then: "$amount",
                  else: 0,
                },
              },
              settleLent: {
                $cond: {
                  if: { $eq: ["$$userId", "$settledWith"] },
                  then: "$amount",
                  else: 0,
                },
              },
            },
          },
        ],
        as: "settledTransactions",
      },
    },
    {
      $unwind: {
        path: "$userExpenses",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        "userExpenses.groupId": { $ne: null },
      },
    },
    {
      $lookup: {
        from: "groups",
        localField: "userExpenses.groupId",
        foreignField: "_id",
        as: "groupProfile",
      },
    },
    {
      $unwind: {
        path: "$groupProfile",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $match: {
        "groupProfile.isDeleted": false, // Only non-deleted groups
        $expr: { $in: ["$currentUserId", "$groupProfile.memberId"] },
      },
    },
    {
      $group: {
        _id: "$userExpenses.groupId",
        totalOwed: { $sum: "$userExpenses.userOwes" },
        totalLent: { $sum: "$userExpenses.userLent" },
        userExpenses: { $push: "$userExpenses" },
        currentUserId: { $first: "$currentUserId" },
      },
    },
    {
      $lookup: {
        from: "settleups",
        localField: "_id",
        foreignField: "groupId",
        as: "settlements",
      },
    },
    {
      $addFields: {
        totalSettlementOwed: {
          $sum: {
            $map: {
              input: "$settlements",
              as: "settlement",
              in: {
                $cond: [
                  { $eq: ["$$settlement.settledBy", "$currentUserId"] },
                  "$$settlement.amount",
                  0,
                ],
              },
            },
          },
        },
        totalSettlementLent: {
          $sum: {
            $map: {
              input: "$settlements",
              as: "settlement",
              in: {
                $cond: [
                  { $eq: ["$$settlement.settledWith", "$currentUserId"] },
                  "$$settlement.amount",
                  0,
                ],
              },
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        totalOwed: 1,
        totalLent: 1,
        settlements: 1,
        currentUserId: 1,
        totalSettlementOwed: 1,
        totalSettlementLent: 1,
        userExpenses: 1,
        settledTransactions: 1,
      },
    },
    {
      $lookup: {
        from: "groups",
        localField: "_id",
        foreignField: "_id",
        as: "groupProfile",
      },
    },
    {
      $unwind: { path: "$groupProfile", preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        groupId: "$_id",
        totalOwed: 1,
        totalLent: 1,
        name: "$groupProfile.name",
        image: "$groupProfile.groupProfile",
        userExpenses: 1,
        settledTransactions: 1,
        totalSettlementOwed: 1,
        totalSettlementLent: 1,
        settlements: 1,
      },
    },
    {
      $sort: {
        name: 1,
      },
    },
  ]);
};

userSchema.statics.getOtherGroupExpDetail = function (userId) {
  return this.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $project: {
        password: 0,
      },
    },
    {
      $addFields: {
        currentUserId: "$_id",
      },
    },
    {
      $lookup: {
        from: "expenses",
        let: { userId: "$currentUserId", currentUserId: "$currentUserId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $ne: ["$paidby", "$$userId"] },
                  { $not: { $in: ["$$userId", "$splitbtwn"] } },
                ],
              },
              isDeleted: false,
              isGroupExpense: true,
            },
          },
          {
            $addFields: {
              splitbtwnCount: { $size: "$splitbtwn" },
              userOwes: 0,
              userLent: 0,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "paidby",
              foreignField: "_id",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    profilePicture: 1,
                  },
                },
              ],
              as: "paidByDetails",
            },
          },
          {
            $unwind: {
              path: "$paidByDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "splitbtwn",
              foreignField: "_id",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    profilePicture: 1,
                  },
                },
              ],
              as: "splitBetweenDetails",
            },
          },
        ],
        as: "userExpenses",
      },
    },
    {
      $lookup: {
        from: "settleups",
        let: { userId: "$currentUserId", currentUserId: "$currentUserId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $ne: ["$$userId", "$settledBy"] },
                  { $ne: ["$$userId", "$settledWith"] },
                ],
              },
              isDeleted: false,
              isGroupExpense: true,
            },
          },
          {
            $addFields: {
              settleOwed: {
                $cond: {
                  if: { $ne: ["$$userId", "$settledBy"] },
                  then: "$amount",
                  else: 0,
                },
              },
              settleLent: {
                $cond: {
                  if: { $ne: ["$$userId", "$settledWith"] },
                  then: "$amount",
                  else: 0,
                },
              },
            },
          },
        ],
        as: "settledTransactions",
      },
    },
    {
      $unwind: {
        path: "$userExpenses",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        "userExpenses.groupId": { $ne: null },
      },
    },
    {
      $lookup: {
        from: "groups",
        localField: "userExpenses.groupId",
        foreignField: "_id",
        as: "groupProfile",
      },
    },
    {
      $unwind: {
        path: "$groupProfile",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $match: {
        "groupProfile.isDeleted": false, // Only non-deleted groups
        $expr: { $in: ["$currentUserId", "$groupProfile.memberId"] },
      },
    },
    {
      $group: {
        _id: "$userExpenses.groupId",
        totalOwed: { $sum: "$userExpenses.userOwes" },
        totalLent: { $sum: "$userExpenses.userLent" },
        userExpenses: { $push: "$userExpenses" },
        currentUserId: { $first: "$currentUserId" },
      },
    },
    {
      $lookup: {
        from: "settleups",
        localField: "_id",
        foreignField: "groupId",
        as: "settlements",
      },
    },
    {
      $addFields: {
        totalSettlementOwed: {
          $sum: {
            $map: {
              input: "$settlements",
              as: "settlement",
              in: {
                $cond: [
                  { $ne: ["$$settlement.settledBy", "$currentUserId"] },
                  "$$settlement.amount",
                  0,
                ],
              },
            },
          },
        },
        totalSettlementLent: {
          $sum: {
            $map: {
              input: "$settlements",
              as: "settlement",
              in: {
                $cond: [
                  { $ne: ["$$settlement.settledWith", "$currentUserId"] },
                  "$$settlement.amount",
                  0,
                ],
              },
            },
          },
        },
      },
    },
    { $unwind: { path: "$settlements", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "settlements.settledBy",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              _id: 1,
              profilePicture: 1,
              username: 1
            }
          }
        ],
        as: "settledByDetails",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "settlements.settledWith",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              _id: 1,
              profilePicture: 1,
              username: 1
            }
          }
        ],
        as: "settledWithDetails",
      },
    },    
    {
      $project: {
        _id: 1,
        totalOwed: 1,
        totalLent: 1,
        settlements: 1,
        currentUserId: 1,
        totalSettlementOwed: 1,
        totalSettlementLent: 1,
        userExpenses: 1,
        settledTransactions: 1,
        settledByDetails: 1,
        settledWithDetails: 1,
      },
    },
    {
      $lookup: {
        from: "groups",
        localField: "_id",
        foreignField: "_id",
        as: "groupProfile",
      },
    },
    {
      $unwind: { path: "$groupProfile", preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        groupId: "$_id",
        totalOwed: 1,
        totalLent: 1,
        name: "$groupProfile.name",
        image: "$groupProfile.groupProfile",
        userExpenses: 1,
        settledTransactions: 1,
        totalSettlementOwed: 1,
        totalSettlementLent: 1,
        settlements: 1,
        settledByDetails: 1,
        settledWithDetails: 1,
      },
    },
    {
      $sort: {
        name: 1,
      },
    },
  ]);
};

userSchema.statics.getSettleupDetail = function (groupIds = []) {
  return SettleUp.aggregate([
    {
      $match: {
        groupId: { $in: groupIds.map((id) => new mongoose.Types.ObjectId(id)) },
      },
    },
    {
      $lookup: {
        from: "users",
        let: { settleById: "$settledBy" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$settleById"] },
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
        as: "settledByDetails",
      },
    },
    {
      $lookup: {
        from: "users",
        let: { settledWithId: "$settledWith" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$settledWithId"] },
            },
          },
          {
            $project: {
              _id: 1,
              username: 1,
              profilePicture: 1,
            },
          },
        ],
        as: "settledWithDetails",
      },
    },
  ]).exec();
};

userSchema.statics.getUserDetail = function (userId) {
  return this.findById(userId)
    .populate("friend", "username profilePicture")
    .select("username profilePicture _id")
    .exec();
};

const User = mongoose.model("User", userSchema);

export default User;

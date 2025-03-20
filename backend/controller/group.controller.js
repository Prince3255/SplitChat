import Group from "../model/group.model.js";
import { ApiError } from "../util/ApiError.js";
import { asyncHandler } from "../util/AsyncHandler.js";
import { ApiResponse } from "../util/ApiResponse.js";
import User from "../model/user.model.js";
import Expense from "../model/expense.model.js";
import mongoose from "mongoose";

export const createGroup = asyncHandler(async (req, res) => {
  try {
    const { name, memberId } = req.body;

    if (!name || name.trim() === "") {
      throw new ApiError(400, "Group name is required");
    }
    let finalMemberId1 = memberId;

    if (!finalMemberId1.includes(req.user._id)) {
      finalMemberId1 = [...finalMemberId1, req.user._id];
    }

    const finalMemberId = finalMemberId1 || req.user._id;

    const group = new Group({ name, memberId: finalMemberId });

    await group.save();

    if (!group) {
      throw new ApiError(500, "Something went wrong");
    }

    // await User.findByIdAndUpdate(group.memberId, {
    //     $push: {
    //         groups: group._id
    //     }
    // })

    if (finalMemberId1) {
      await Promise.all(
        finalMemberId.map(async (id) => {
          await User.findByIdAndUpdate(id, {
            $addToSet: { group: group._id },
          });
        })
      );
    }

    let finalMemberObjectId = finalMemberId.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    if (finalMemberObjectId.length !== 0) {
      for (const userId of finalMemberObjectId) {
        let user = userId;
        const filteredArray = finalMemberObjectId.filter(
          (userId) => !userId.equals(user)
        );

        await User.findByIdAndUpdate(userId, {
          $addToSet: { friend: { $each: filteredArray } },
        });
      }
    }

    return res
      .status(201)
      .json(new ApiResponse(201, group, "Group created successfully"));
  } catch (error) {
    console.log("Error in creating group", error.message);
    return res.status(500).json(new ApiError(500, error.message));
  }
});

export const getGroupDetail = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    throw new ApiError(400, "User id is required");
  }

  try {
    const userDetail = await User.findById(userId);
    if (!userDetail) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    let groupIds = userDetail?.group;

    let groupDetail = [];

    if (groupIds?.length > 0) {
      groupDetail = await Group.getGroupDetail(groupIds);

      if (!groupDetail || groupDetail.length === 0) {
        console.warn(`Group details not found for groupId: ${groupIds}`);
      }
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, groupDetail, "Group detail Retrieved Successfully")
      );
  } catch (error) {
    console.log("Error in getting group details", error.message);
    return res.status(500).json(new ApiError(500, error.message));
  }
});

export const leaveGroup = asyncHandler(async (req, res) => {
  const groupId1 = req.params.groupId;

  if (!groupId1) {
    throw new ApiError(400, "group Id is required");
  }

  try {
    const user = await User.findById(req?.user?._id);

    if (!user) {
      throw new ApiError(404, "user not found");
    }

    const group = await Group.findById(req.params.groupId);

    if (!group) {
      throw new ApiError(404, "Group not found");
    }

    if (group?.memberId && !group?.memberId.includes(req.user._id)) {
      throw new ApiError(403, "You are not a authorized member of this group");
    }

    const groupId = user.group.filter((groupId) => !groupId.equals(groupId1));

    const data = await User.findByIdAndUpdate(
      req?.user?._id,
      { group: groupId },
      { new: true }
    );

    if (data) {
      let memberId = group?.memberId?.filter(
        (memberId) => !memberId.equals(req?.user?._id)
      );

      let groupData = await Group.findByIdAndUpdate(
        groupId1,
        { memberId },
        { new: true }
      );

      if (groupData) {
        return res
          .status(200)
          .json(new ApiResponse(200, null, "You left the group successfully"));
      }
      else {
        throw new ApiError(500, 'Something went wrong')
      }
    }
  } catch (error) {
    console.log("Error while deleting group", error.message);
    throw new ApiError(error.status || 500, error.message);
  }
});

export const getGroupMemberDetail = asyncHandler(async (req, res) => {
  const groupId = req.params.groupId;

  if (!groupId) {
    throw new ApiError(400, "group Id is required");
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json(new ApiError(404, "Group not found"));
    }
    let friend = [];
    const groupMembers = group.memberId;
    const fetchUserDetails = async () => {
      friend = await Promise.all(
        groupMembers.map(async (userId) => {
          if (userId.toString() !== req.user._id.toString()) {
            const userDetail = await User.findById(userId).select(
              "username _id profilePicture"
            );
            return userDetail;
          }
          return null;
        })
      );

      friend = friend.filter((user) => user !== null);
    };

    fetchUserDetails().then(() => {
      const resposnseData = { friend: friend };
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            resposnseData,
            "Group member detail Retrieved Successfully"
          )
        );
    });
  } catch (error) {
    console.log("Error in getting group details", error.message);
    return res.status(500).json(new ApiError(500, "Something went wrong"));
  }
});

export const updateGroup = asyncHandler(async (req, res) => {
  const {
    _id,
    name,
    memberId,
    expenseId,
    groupProfile,
    coverImage,
    groupType,
  } = req.body;

  if (req.params.groupId !== _id) {
    throw new ApiError(404, "Group not found");
  }

  const group = await Group.findById(req.params.groupId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  if (group?.memberId && !group?.memberId.includes(req.user._id)) {
    throw new ApiError(403, "You are not authorized to update this group");
  }

  try {
    if (name && name.trim() === "") {
      throw new ApiError(400, "name is required");
    }

    const validateArrayField = (field, fieldName) => {
      if (field && (!Array.isArray(field) || field.length === 0)) {
        throw new ApiError(400, `${fieldName} must not be empty`);
      }
    };

    validateArrayField(memberId, "memberId");
    validateArrayField(expenseId, "expenseId");
    validateArrayField(groupType, "groupType");

    if (groupProfile && groupProfile.trim() === "") {
      throw new ApiError(400, "group profile is required");
    }

    if (coverImage && coverImage.trim() === "") {
      throw new ApiError(400, "cover image is required");
    }

    let existingMember = group.memberId;
    let updatedMemberId = null;

    if (memberId) {
      const memberIdObjectIds = memberId.map(
        (id) => new mongoose.Types.ObjectId(id)
      );

      const existingMemberObjectIds = existingMember.map((id) =>
        mongoose.Types.ObjectId.isValid(id)
          ? new mongoose.Types.ObjectId(id)
          : id
      );

      updatedMemberId = Array.from(
        new Set([
          ...existingMemberObjectIds.map((id) => id.toString()),
          ...memberIdObjectIds.map((id) => id.toString()),
        ])
      ).map((id) => new mongoose.Types.ObjectId(id)); // Convert Strings Back to ObjectId
    }

    if (memberId) {
      console.log("updatedMemberId1", updatedMemberId);
      updatedMemberId = updatedMemberId.filter((id) =>
        memberId?.some((member) => member?.toString() === id?.toString())
      );
    }

    const group1 = await Group.findByIdAndUpdate(
      req.params.groupId,
      {
        $set: {
          name: name || group.name,
          memberId: updatedMemberId,
          expenseId: expenseId || group.expenseId,
          groupProfile: groupProfile || group.groupProfile,
          coverImage: coverImage || group.coverImage,
          groupType: groupType || group.groupType,
        },
      },
      { new: true }
    );

    if (!group1) {
      throw new ApiError(500, "Something went wrong");
    }

    if (group1?.expenseId) {
      await Promise.all(
        group1.expenseId.map(async (id) => {
          await Expense.findByIdAndUpdate(id, {
            $set: {
              groupId: group1._id,
            },
          });
        })
      );
    }

    if (memberId) {
      for (const id of updatedMemberId) {
        if (!memberId.includes(id)) {
          await User.findByIdAndUpdate(id, {
            $pull: {
              group: req.params.groupId,
            },
          });
        }
      }
      await Promise.all(
        req.body.memberId.map(async (id) => {
          await User.findByIdAndUpdate(id, {
            $addToSet: { group: req.params.groupId },
          });
        })
      );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, group1, "Group updated successfully"));
  } catch (error) {
    console.log("Error in update group ", error.message);
    throw new ApiError(500, error.message);
  }
});

export const deleteGroup = asyncHandler(async (req, res) => {
  const id = req.params.groupId;

  if (id !== req.body._id) {
    throw new ApiError(400, "Group not found");
  }

  try {
    const group = await Group.findByIdAndUpdate(
      id,
      {
        $set: {
          isDeleted: true,
          deletedAt: Date.now(),
        },
      },
      { new: true }
    );

    if (!group) {
      throw new ApiError(404, "Group not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, group, "Group deleted successfully"));
  } catch (error) {
    console.log("Error while deleting group", error.message);
    throw new ApiError(error.status || 500, error.message);
  }
});

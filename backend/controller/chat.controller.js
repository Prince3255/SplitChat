import { ApiError } from "../util/ApiError.js";
import { asyncHandler } from "../util/AsyncHandler.js";
import { ApiResponse } from "../util/ApiResponse.js";
import Chat from "../model/chat.model.js";
import Group from "../model/group.model.js";
import { getReceiverSocketId, io } from "../util/socket.js";

export const sendMessage = asyncHandler(async (req, res) => {
  try {
    const groupId = req?.query?.groupId;

    if (groupId) {
      const { message, imageUrl, audioUrl, videoUrl } = req.body;

      const group = await Group.findById(groupId);

      if (!group) {
        throw new ApiError(404, "No group found");
      }

      if (!group.memberId.some((id) => id.equals(req.user._id))) {
        throw new ApiError("You are not a member of this group");
      }

      const chat = new Chat({
        senderId: req?.user?._id,
        message,
        image: imageUrl || null,
        audio: audioUrl || null,
        video: videoUrl || null,
        isGroupChat: true,
        groupId: groupId,
      });

      await chat.save();

      io.to(groupId).emit("message1", chat);

      return res.status(201).json(new ApiResponse(201, chat, null));
    } else {
      const receiverId = req?.query?.receiverId;

      if (receiverId) {
        const { message, imageUrl, audioUrl, videoUrl } = req.body;

        const chat = new Chat({
          senderId: req?.user?._id,
          message,
          image: imageUrl || null,
          audio: audioUrl || null,
          video: videoUrl || null,
          isGroupChat: false,
          receiverId: receiverId,
        });

        await chat.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("message1", chat);
        }

        return res.status(201).json(new ApiResponse(201, chat, null));
      } else {
        throw new ApiError(404, "Please provide valid sender or receiver id");
      }
    }
  } catch (error) {
    console.log("Error while sending message", error.message);
    throw new ApiError(500, error.message);
  }
});

export const getMessage = asyncHandler(async (req, res) => {
  try {
    const receiverId = req?.query?.receiverId;
    const groupId = req?.query?.groupId;

    if (!receiverId && !groupId) {
      throw new ApiError(400, "receiverId or groupId is required");
    }

    const userId = req.user._id;
    let messages = [];

    if (receiverId) {
      messages = await Chat.find({
        $or: [
          { senderId: userId, receiverId: receiverId },
          { senderId: receiverId, receiverId: userId },
        ],
      }).sort({ createdAt: 1 });
    } else if (groupId) {
      messages = await Chat.find({
        groupId,
        isGroupChat: true,
      }).sort({ createdAt: 1 });
    }

    if (messages.length === 0) {
      // throw new ApiError(404, null);
      return res.status(200).json(new ApiResponse(200, [], null));
    }

    res.status(200).json(new ApiResponse(200, messages, null));
  } catch (error) {
    console.error("Error while fetching messages:", error.message);
    throw new ApiError(500, error.message);
  }
});


export const deleteMessage = asyncHandler(async (req, res) => {
  try {
    const id = req.params.messageId;

    if (!id) {
      throw new ApiError(404, "Message id not found");
    }

    const message = await Chat.findById(id);

    if (!message) {
      throw new ApiError(404, "message not found");
    }

    const deletedMessage = await Chat.findByIdAndDelete(id);

    return res
      .status(200)
      .json(
        new ApiResponse(200, deletedMessage, "message deleted successfull")
      );
  } catch (error) {
    console.log("Error while deleting message", error.message);
    throw new ApiError(500, error.message);
  }
});

export const updateMessage = asyncHandler(async (req, res) => {
  try {
    const id = req.params.messageId;

    if (!id) {
      throw new ApiError(404, "Message id not found");
    }

    const message1 = await Chat.findById(id);

    if (!message1) {
      throw new ApiError(404, "message not found");
    }

    if (!req.body.message || req.body.message.trim() === "") {
      throw new ApiError(404, "No message found");
    }

    const editMessage = await Chat.findByIdAndUpdate(
      id,
      {
        $set: {
          message: req.body.message || message1.message,
          image: req.body.image || message1.image,
        },
      },
      {
        new: true,
      }
    );

    if (!editMessage) {
      throw new ApiError(500, "Something went wrong");
    }

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message1", editMessage);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, editMessage, "Message updated"));
  } catch (error) {
    console.log("Error while updating message", error.message);
    throw new ApiError(500, error.message);
  }
});

export const addReaction = asyncHandler(async (req, res) => {
  const { icon } = req.body;
  const messageId = req.params.messageId;
  const userId = req.user._id;

  try {
    const chat = await Chat.findById(messageId);
    if (!chat) {
      throw new ApiError(404, "Message not found");
    }

    const reaction = chat.reaction.find((r) => r.icon === icon);
    if (reaction) {
      const alreadyReacted = reaction.users.some((u) => u.userId === userId);
      if (alreadyReacted) {
        return;
      }
      reaction.users.push({
        userId,
        username: req.user.username,
        profile: req.user.profilePicture,
      });
    } else {
      const reaction = chat.reaction.find((r) =>
        r.users.some((id) => id.equals(userId))
      );

      if (reaction) {
        reaction.icon = icon;
      } else {
        chat.reaction.push({
          icon,
          users: [
            {
              userId,
              username: req.user.username,
              profile: req.user.profilePicture,
            },
          ],
        });
      }
    }

    await chat.save();

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message1", chat);
    }

    return res.status(200).json(new ApiResponse(200, chat, "Reaction added"));
  } catch (error) {
    console.log("Error in addReaction", error.message);
    throw new ApiError(500, error.message);
  }
});

export const getReaction = asyncHandler(async (req, res) => {
  const messageId = req.params.messageId;

  try {
    const chat = await Chat.findById(messageId).populate(
      "reaction.users.userId",
      "username profilePicture"
    );
    if (!chat) {
      throw new ApiError(404, "Message not found");
    }

    const reaction = chat.isGroupChat
      ? chat.reaction.map((r) => ({
          icon: r.icon,
          count: r.users.length,
          users: r.users,
        }))
      : chat.reaction.map((r) => ({
          icon: r.icon,
          users: r.users,
        }));

    if (!reaction) {
      throw new ApiError(404, "Reaction not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, reaction, "Reaction found"));
  } catch (error) {
    console.log("Error in addReaction", error.message);
    throw new ApiError(500, error.message);
  }
});

export const delteReaction = asyncHandler(async (req, res) => {
  const messageId = req.params.messageId;
  const userId = req.user._id;

  try {
    const chat = await Chat.findById(messageId);
    if (!chat) {
      throw new ApiError(404, "Message not found");
    }

    const reaction = chat.reaction.find((r) => r.icon === req.body.icon);
    if (!reaction) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Reaction not found"));
    }

    reaction.users = reaction.users.filter(
      (r) => r.userId.toString() !== userId.toString()
    );
    if (reaction.users.length === 0) {
      chat.reaction = chat.reaction.filter((r) => r.icon !== req.body.icon);
    }

    await chat.save();
    res.status(200).json(new ApiResponse(200, chat, "Reaction deleted"));
  } catch (error) {
    console.log("Error in addReaction", error.message);
    throw new ApiError(500, error.message);
  }
});

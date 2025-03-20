import mongoose, { Schema } from "mongoose";

const reactionSchema = new mongoose.Schema({
    icon: {
        type: String,
        required: true
    },
    users: [
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            username: {
                type: String,
                required: true
            },
            profile: {
                type: String,
                required: true
            }
        }
    ]
})

const chatSchema = new mongoose.Schema({
    message: {
        type: String
    },
    image: {
        type: String
    },
    audio: {
        type: String
    },
    video: {
        type: String
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: function () {
            return !this.isGroupChat
        }
    },
    isGroupChat: {
        type: Boolean,
        default: false
    },
    groupId: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: function () {
            return !this.receiverId
        }
    },
    reaction: [reactionSchema]
}, {
    timestamps: true
})

const Chat = mongoose.model('Chat', chatSchema)

export default Chat
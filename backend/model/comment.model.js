import mongoose, { Schema } from "mongoose";

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 200,
    },
    like: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    numberOfLike: {
        type: Number,
        default: 0
    },
    postId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})

commentSchema.index({ expenseId: 1 });
commentSchema.index({ settleupId: 1 });
commentSchema.index({ userId: 1 });

const Comment = mongoose.model('Comment', commentSchema)

export default Comment
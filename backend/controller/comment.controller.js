import { ApiError } from "../util/ApiError.js"
import { asyncHandler } from "../util/AsyncHandler.js"
import Expense from "../model/expense.model.js" 
import SettleUp from "../model/settleup.model.js"
import { ApiResponse } from "../util/ApiResponse.js"
import Comment from "../model/comment.model.js"

export const createComment = asyncHandler(async (req, res) => {
    try {
        const { content, postId } = req.body

        if (content.trim() === '') {
            throw new ApiError(400, 'Please provide some content')
        }

        if (!postId) {
            
            throw new ApiError(400, 'postId not provided')
        }

        // if (expenseId) {
        //     const expense = await Expense.findById(expenseId)
        //     if (!expense) {
        //         throw new ApiError(404, 'Expense not found');
        //     }
        //     if (!Array.isArray(expense.splitbtwn)) {
        //         throw new ApiError(500, 'Invalid expense data');
        //     }    
        //     if (!(expense.splitbtwn.includes(req?.user?._id)) && expense.paidby.toString() !== req?.user?._id.toString()) {
        //         throw new ApiError(401, 'You are not authorized to comment on this expense');
        //     }
        // }

        // if (settleupId) {
        //     const settleUp = await SettleUp.findById(settleupId)
        //     if (!settleUp) {
        //         throw new ApiError(404, 'Settle up not found')
        //     }

        //     if (req?.user?._id.toString() !== settleUp.settledBy.toString() && req?.user?._id.toString() !== settleUp.settledWith.toString()) {
        //         throw new ApiError(403, 'You are not authorized to update this settle up')
        //     }
        // }

        const comment = new Comment({
            content,
            postId,
            userId: req?.user?._id
        })

        if (!comment) {
            throw new ApiError(500, 'Something went wrong')
        }

        await comment.save()

        return res.status(201).json(new ApiResponse(201, comment, 'new comment added'))
    } catch (error) {
        console.log('Error while creating comment', error.message)
        throw new ApiError(500, error.message)
    }
})

export const getComment = asyncHandler(async (req, res) => {
    try {
        let comment = await Comment.find({ postId: req?.params?.postId }).sort({ createdAt: -1 })

        if (comment.length === 0) {
            comment = null
        }

        return res.status(200).json(new ApiResponse(200, comment, 'Comment fetched successfull'))
    } catch (error) {
        console.log('Error while creating comment', error.message)
        throw new ApiError(500, error.message)
    }
})

export const likeComment = asyncHandler(async (req, res) => {
    try {
        let comment = await Comment.findById(req?.params?.commentId)
        console.log(comment)
        if (!comment) {
            throw new ApiError(404, 'No comment found')
        }

        const userIndex = comment.like.indexOf(req?.user?._id)

        if (userIndex === -1) {
            comment.numberOfLike += 1;
            comment.like.push(req?.user?._id);
        } else {
            comment.numberOfLike -= 1;
            comment.like.splice(userIndex, 1); // Use index, not `req?.user?._id`
        }        

        comment = await comment.save()
        return res.status(200).json(new ApiResponse(200, comment, null))
    } catch (error) {
        console.log('Error while creating comment', error.message)
        throw new ApiError(500, error.message)
    }
})

export const editComment = asyncHandler(async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId)

        if (!comment) {
            return next(errorHandler(404, 'Comment not found'))
        }

        if (comment?.userId.toString() != req?.user?._id.toString()) {
            return next(errorHandler(403, 'You are not allowed to edit this comment'))
        }

        if(req?.body?.content?.trim() === '') {
            throw new ApiError(400, 'no content found')
        }

        const editComment = await Comment.findByIdAndUpdate(req?.params?.commentId, {
            $set: {
                content: req.body.content
            }
        }, { new: true })

        if (!editComment) {
            throw new ApiError(500, 'Something went wrong')
        }

        return res.status(201).json(new ApiResponse(201, editComment, 'comment updated'))
    } catch (error) {
        console.log('Error while creating comment', error.message)
        throw new ApiError(500, error.message)
    }
})

export const deleteComment = asyncHandler(async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId)

        if (!comment) {
            throw new ApiError(404, 'no comment found')
        }

        if (comment.userId.toString() !== req?.user?._id.toString()) {
            throw new ApiError(403, 'You are not allowed to delete this comment')
        }

        await Comment.findByIdAndDelete(req.params.commentId)
        res.status(200).json(new ApiResponse(200, null, 'Comment deleted successfully'))
    } catch (error) {
        console.log('Error while creating comment', error.message)
        throw new ApiError(500, error.message)
    }
})


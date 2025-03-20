import express from 'express'
import { VerifyUser } from '../util/VerifyUser.js'
import { createComment, deleteComment, editComment, getComment, likeComment } from '../controller/comment.controller.js'

const route = express.Router()

route.post('/create', VerifyUser, createComment)
route.get('/getcomment/:postId', getComment)
route.put('/likecomment/:commentId', VerifyUser, likeComment)
route.put('/editcomment/:commentId', VerifyUser, editComment)
route.delete('/deletecomment/:commentId', VerifyUser, deleteComment)

export default route
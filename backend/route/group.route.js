import express from 'express'
import { VerifyUser } from '../util/VerifyUser.js'
import { createGroup, deleteGroup, getGroupDetail, updateGroup, getGroupMemberDetail, leaveGroup } from '../controller/group.controller.js'

const route = express.Router()

route.get('/:id/detail', VerifyUser, getGroupDetail)
route.get('/:groupId/member', VerifyUser, getGroupMemberDetail)
route.post('/create', VerifyUser, createGroup)
route.put('/update/:groupId', VerifyUser, updateGroup)
route.delete('/delete/:groupId', VerifyUser, deleteGroup)
route.put('/leave/:groupId', VerifyUser, leaveGroup)
// route.post('/edit/:id', VerifyUser, )

export default route
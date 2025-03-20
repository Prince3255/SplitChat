import express from 'express'
import { VerifyUser } from '../util/VerifyUser.js'
import { getUser, updateUser, deleteUser, getUserExpense, getGroupExpense, getUserDetails, searchUser, logoutUser } from '../controller/user.controller.js'

const route = express.Router()

route.get('/search', VerifyUser, searchUser)
route.get('/:id', VerifyUser, getUser)
route.put('/update/:id', VerifyUser, updateUser)
route.delete('/delete/:id', VerifyUser, deleteUser)
route.post('/logout', VerifyUser, logoutUser)
route.post('/:id/expense/user', VerifyUser, getUserExpense)
route.post('/:id/expense/group', VerifyUser, getGroupExpense)
route.get('/:id/detail', VerifyUser, getUserDetails)

export default route
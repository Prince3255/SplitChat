import express from 'express'
import { VerifyUser } from '../util/VerifyUser.js'
import { createExpense, deleteExpense, updateExpense, getExpenseById } from '../controller/expense.controller.js'

const route = express.Router()

route.post('/create', VerifyUser, createExpense)
route.put('/update/:expenseId', VerifyUser, updateExpense)
route.delete('/delete/:expenseId', VerifyUser, deleteExpense)
route.get('/:expenseId', VerifyUser, getExpenseById)

export default route
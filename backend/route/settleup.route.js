import express from 'express'
import { VerifyUser } from '../util/VerifyUser.js'
import { createSettleup, updateSettleup, getSettleup, deleteSettleUp, getSettleUpDetail } from '../controller/settleup.controller.js'

const route = express.Router()

route.get('/settle-up', VerifyUser, getSettleUpDetail)
route.get('/:id', VerifyUser, getSettleup)
route.post('/create', VerifyUser, createSettleup)
route.put('/update/:settlupid', VerifyUser, updateSettleup)
route.delete('/delete/:settlupid', VerifyUser, deleteSettleUp)

export default route
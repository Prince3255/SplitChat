import { getSeacrchResult } from '../controller/search.controller.js'
import express from 'express'
import { VerifyUser } from '../util/VerifyUser.js'

const route = express.Router()

route.get('/', VerifyUser, getSeacrchResult)

export default route
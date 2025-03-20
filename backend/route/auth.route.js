import express from 'express'
import { google, login, signup } from '../controller/auth.controller.js'
import { VerifyUser } from '../util/VerifyUser.js'

const route = express.Router()

route.get('/verify', VerifyUser, (req, res) => {
    res.json({ success: true, user: req.user })
})
route.post('/signup', signup)
route.post('/login', login)
route.post('/google', google)

export default route
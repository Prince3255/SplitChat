import express from 'express';
import { sendOtp, verifyOtp } from '../controller/otp.controller.js';

const route = express.Router();

route.post('/send-otp', sendOtp)
route.post('/verify-otp', verifyOtp)

export default route
import express from 'express'
import { getMessage, sendMessage, deleteMessage, updateMessage, addReaction, getReaction, delteReaction } from '../controller/chat.controller.js'
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest.js';
import { VerifyUser } from '../util/VerifyUser.js'

const route = express.Router()

const sendMessageValidation = [
    body('message').optional().isString().withMessage('Message must be a string'),
    body('image').optional().isString().withMessage('Image URL must be a string'),
    query('groupId').optional().isMongoId().withMessage('Invalid group ID'),
    query('receiverId').optional().isMongoId().withMessage('Invalid receiver ID'),
];

const getMessageValidation = [
    query('groupId').optional().isMongoId().withMessage('Invalid group ID'),

    query('receiverId').optional().isMongoId().withMessage('Invalid receiver ID'),
]

const updateMessageValidation = [
    param('messageId').isMongoId().withMessage('Invalid message ID'),
    body('message').optional().isString().withMessage('Message must be a string'),
    body('image').optional().isString().withMessage('Image URL must be a string'),
];

const deleteMessageValidation = [
    param('messageId').isMongoId().withMessage('Invalid message ID'),
];

route.post('/send', VerifyUser,  sendMessageValidation, validateRequest, sendMessage)
route.get('/', VerifyUser, getMessageValidation, validateRequest, getMessage)
route.delete('/delete/:messageId', VerifyUser, deleteMessageValidation, validateRequest, deleteMessage)
route.put('/update/:messageId', VerifyUser,  updateMessageValidation, validateRequest, updateMessage)
route.post('/reaction/:messageId', VerifyUser, addReaction)
route.get('/reaction/get/:messageId', VerifyUser, getReaction)
route.delete('/reaction/delete/:messageId', VerifyUser, delteReaction)

export default route
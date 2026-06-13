const express = require("express")
const messageRouter = express.Router()

const {
  getAllContacts,
  getMessagesByUserId,
  sendMessage,
  getChatPartners
} = require("../controller/message.controller");
const authMiddleware = require("../middleware/auth.middleware")
const arcjetProtection = require('../middleware/arcjet.middleware')

messageRouter.use(arcjetProtection)

messageRouter.get("/all-contacts", authMiddleware, getAllContacts);
messageRouter.get("/chats", authMiddleware, getChatPartners)
messageRouter.get("/:id", authMiddleware, getMessagesByUserId);
messageRouter.post("/send/:id", authMiddleware, sendMessage);







module.exports = messageRouter
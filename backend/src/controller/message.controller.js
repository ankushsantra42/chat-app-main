const messageModel = require("../models/message.model.js");
const userModel = require("../models/auth.model.js");
const cloudinary = require("../lib/cloudinary.js");
const { getReceiverSocketId, io } = require("../lib/socket.js");



const getAllContacts = async (req,res) =>{
    try{
        const loggedInUserId = req.user.id;
        const filteredUsers = await userModel.find({
          _id: { $ne: loggedInUserId },
        }).select("-password");

        res.status(200).json(filteredUsers);

    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"internal sever error"})
    }

}

const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user.id;
    const { id: userToChatId } = req.params;

    const messages = await messageModel.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id;


    if (!text && !image) {
      return res.status(400).json({ message: "Text and image is required." });
    }
    // if (!image){
    //     return res.status(400).json({message:"Image is required."});
    // }
    if (senderId === receiverId) {
      return res
        .status(400)
        .json({ message: "Cannot send messages to yourself." });
    }
    const receiverExists = await userModel.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl;
    if (image) {
      // upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new messageModel({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error);
    res.status(500).json({success:false, message: "Internal server error" });
  }
};

const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    // find all the messages where the logged-in user is either sender or receiver
    const messages = await messageModel.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString(),
        ),
      ),
    ];

    const chatPartners = await userModel.find({
      _id: { $in: chatPartnerIds },
    }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {getAllContacts,getMessagesByUserId,sendMessage,getChatPartners}
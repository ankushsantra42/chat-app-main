const jwt  = require("jsonwebtoken");
const blackListModel = require("../models/blackList.model")
const userModel = require("../models/auth.model")


const authMiddleware = async (req, res, next)=>{
    try {
        const token = req.cookies.token;

        if (!token) {
          return res.status(400).json({ message: "no token found" });
        }
        const isTokenBlackListed = await blackListModel.findOne({ token });
        if (isTokenBlackListed) {
          return res.status(400).json({ message: "token is blacklisted" });
        }
        const decodeedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const existingUser = await userModel.findById(decodeedToken.id);
        if(!existingUser){
          return res.status(400).json({ message: "user not found" });
        }

        req.user = decodeedToken;
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"internal server error"})
        
    }
}

module.exports = authMiddleware
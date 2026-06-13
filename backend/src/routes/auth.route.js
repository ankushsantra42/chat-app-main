const express = require("express")
const authRouter = express.Router()
const { registerUser, loginUser, logoutUser, getMyProfile, updateProfile } = require("../controller/auth.controller");
const authMiddleware = require("../middleware/auth.middleware")
const arcjetProtection = require("../middleware/arcjet.middleware")




authRouter.use(arcjetProtection)

authRouter.post("/register", registerUser)
authRouter.post("/login", loginUser)
authRouter.post("/logout", logoutUser)
authRouter.get("/me", authMiddleware, getMyProfile)
authRouter.put("/updateProfile", authMiddleware, updateProfile)
authRouter.get("/check-authentication",authMiddleware,(req,res)=>{
    return res.status(200).json(req.user)
})


module.exports = authRouter
const userModel = require("../models/auth.model")
const bcrypt = require("bcryptjs")
// const cookie = require("cookie-parser")
const jwt = require("jsonwebtoken")
const blackListModel = require("../models/blackList.model");
const { sendWelcomeEmail } = require("../emails/emailHandler");
const { ENV } = require("../lib/env");
const cloudinary = require("../lib/cloudinary");



async function registerUser(req,res) {
    try {
      const { fullName, userName, email, password } = req.body;
      if (!fullName || !userName || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }
      //check if the email is valid
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email",
        });
      }
      //check if user is already register using email
      const existingUserByEmail = await userModel.findOne({ email });
      if (existingUserByEmail) {
        return res.status(400).json({
          success: false,
          message: "User already exists using this email",
        });
      }
      //check if the user is already registered using username
      const existingUserByuserName = await userModel.findOne({ userName });
      if (existingUserByuserName) {
        return res.status(400).json({
          success: false,
          message: "Username already exists username",
        });
      }
      //hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      //create new user
      const newUser = await userModel.create({
        fullName,
        userName,
        email,
        password: hashedPassword,
      });

      const token = jwt.sign(
        {
          id: newUser._id,
          userName: newUser.userName,
          fullName: newUser.fullName,
          email: newUser.email,
          uniqueId: Date.now() + Math.random().toString(36).substring(2),
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "7d" },
      );

      res.cookie("token", token, {
        httpOnly: true,
        // secure: true,
        // sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      try {
        //send email to user after successful registration
        await sendWelcomeEmail(newUser.email, newUser.fullName, ENV.CLIENT_URL);
      } catch (emailError) {
        console.log("Email send failed but user is created", emailError);
        // Don't block the user registration if email fails
      } finally {
        return res.status(201).json({
        success: true,
        message: "User created successfully",
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          userName: newUser.userName,
          email: newUser.email,
          profilePicture: newUser.profilePicture,
        },
      });
    } 
      }catch (error) {
        console.log(error)
        res.status(500).json({success:false,message:"something went wrong"})
        
    }
}

async function loginUser(req,res) {
    try {
        const {email,password}=req.body
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }

        const user = await userModel.findOne({email})
        if(!user){
            return res.status(400).json({
                success:false,
                message:"User not found"
            })
        }

        const isPasswordValid = await bcrypt.compare(password,user.password)
        if(!isPasswordValid){
            return res.status(400).json({
                success:false,
                message:"Invalid password"
            })
        }

        const token = jwt.sign(
          {
            id: user._id,
            userName: user.userName,
            fullName: user.fullName,
            email: user.email,
            uniqueId: Date.now() + Math.random().toString(36).substring(2),
          },
          process.env.JWT_SECRET_KEY,
          {expiresIn:"7d"}
        );

        res.cookie("token", token, {
          httpOnly: true,
          // secure: true,
          // sameSite: "strict",
          maxAge: 7*24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
          success: true,
          message: "User logged in successfully",
          user: {
            id: user._id,
            fullName: user.fullName,
            userName: user.userName,
            email: user.email,
            profilePicture:user.profilePicture
          },
        });



    } catch (error) {
        console.log(error)
        res.status(500).json({success:false,message:"something went wrong in login controller"})
        
    }
}

async function logoutUser(req,res) {
    try {
        const token = req.cookies.token;
        if(!token){
            return res.status(400).json({
                success:false,
                message:"no token found"
            })
        }   

        await blackListModel.create({
            token
        })
        res.clearCookie("token")
        return res.status(200).json({
            success:true,
            message:"User logged out successfully"
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({success:false,message:"something went wrong"})
    }
}

async function getMyProfile(req,res) {
    try {
        const user = req.user;
        return res.status(200).json({
            success:true,
            message:"User profile fetched successfully",
            user
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({success:false,message:"something went wrong"})
        
    }
}


const updateProfile = async(req,res)=>{
    try {
        const {profilePicture} = req.body;
        if(!profilePicture){
            return res.status(400).json({
                success:false,
                message:"Profile picture is required"
            })
        }
        const user = await userModel.findById(req.user.id).select("-password");
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }
        if(user.profilePicture){
            await cloudinary.uploader.destroy(user.profilePicture)
        }
        const uploadedImage = await cloudinary.uploader.upload(profilePicture,{
            folder: "user_profile_pictures",
        })
        user.profilePicture = uploadedImage.secure_url;
        await user.save();
        return res.status(200).json({
            success:true,
            message:"Profile picture updated successfully",
            user
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({success:false,message:"something went wrong in updateProfile controller"})
        
    }
}

module.exports = { registerUser, loginUser, logoutUser, getMyProfile, updateProfile}






// module.exports = {registerUser,loginUser,logoutUser}
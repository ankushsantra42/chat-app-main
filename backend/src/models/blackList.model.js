const mongoose = require("mongoose")

const blackListSchema = new mongoose.Schema(
    {
        token:{
            type:String,
            required:true
        },

    },
    {
        timestamps:true
    }
)

const blackListModel = mongoose.model("BlackList",blackListSchema)

module.exports = blackListModel
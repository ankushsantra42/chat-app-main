const mongoose = require("mongoose")

const dbConnect = async() => {

    try{
        const connection = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`connected to db : ${connection.connection.host}`);
        
        
    }catch (error) {
        console.log("Failed to connect to database:", error);
        // process.exit(1); ? 1 means fails 0 means success
    }

}

module.exports = dbConnect
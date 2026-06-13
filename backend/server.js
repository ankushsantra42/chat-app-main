const app = require("./src/app.js");
// const express = require("express")
require("dotenv").config();
const dbConnect = require("./src/db/dbConnect.js");
const { server } = require("./src/lib/socket.js");

dbConnect();

const PORT = process.env.PORT || 4000

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

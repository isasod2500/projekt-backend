const express = require("express")
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken")

require("dotenv").config();

mongoose.set("strictQuery", false);
mongoose.connect(process.env.DATABASE).then(() => {
    console.log(`Connected to mongoDB`);
}).catch((err) => {
    console.error(`error: ${err}`)
});
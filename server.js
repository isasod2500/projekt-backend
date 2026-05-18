const express = require("express");
const bodyParser = require("body-parser")
const routes = require("./routes/routes")
const jwt = require("jsonwebtoken")
const cors = require("cors")
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

app.use(cors({
    origin: "*"
}))
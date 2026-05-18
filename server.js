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

const port = process.env.PORT || 3000;

app.get("/", async (req, res) => {
    res.json({ message: "API NÅDD" })
})

app.get("/admin", authenticateToken, (req, res) => {
    res.json({ message: `Access approved` })
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (token == null) {
        return res.status(401).json({ message: "Not authorised" })
    }
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decrypted) => {
        if (err) return res.status(403).json({ message: `${err}` })
        req.employee = decrypted
        next();
    })
}

app.use("/", routes)

app.listen(port, () => {
    console.log(`Started on ${port}`)
})
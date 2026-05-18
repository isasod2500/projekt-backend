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

//Importera mall för användare och maträtt
const Employee = require("../models/employee.js");
const Dish = require("../models/dish.js");

function validateRegister(req, res, next) {
    const { username, password, firstname, surname, email, admin } = req.body;

    const errors = []

    if(!username || username.length < 6) {
        errors.push(`Användarnamn måste vara minst 6 tecken`)
    }

    if (!password || password.length < 6) {
        errors.push(`Lösenord måste vara minst 8 tecken`)
    }

    if(!firstname || firstname.length < 2) {
        errors.push(`Förnamn måste vara minst 2 tecken`)
    }

    if(!surname || surname.length < 2) {
        errors.push(`Efternamn måste vara minst 2 tecken`)
    }

    if(!email || !email.includes("@")) {
        errors.push(`Felaktigt format på e-post adress`)
    }

    if(!admin) {
        errors.push(`Användarroll måste fyllas i`)
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors })
    }

    next();
}

    //Route för att registrera användare
    router.post("/register", validateRegister, (req, res) => {
        try {
            const { username, password, firstname, surname, email, admin } = req.body;


            if (!username || !password || !firstname || !surname || !email || !admin) {
                return res.status(400).json({ error: `Invalid input, all fields must be entered.` })
            }

        } catch (err) {
            res.status(500).json({ error: `${err}` })
        }
    })

    module.exports = router;
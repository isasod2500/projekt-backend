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
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet(`1234567890`, 4)

function validateRegister(req, res, next) {
    const { password, firstname, surname, admin } = req.body;

    const errors = []

    if (!password || password.length < 6) {
        errors.push(`Lösenord måste vara minst 8 tecken`)
    }

    if (!firstname || firstname.length < 2) {
        errors.push(`Förnamn måste vara minst 2 tecken`)
    }

    if (!surname || surname.length < 2) {
        errors.push(`Efternamn måste vara minst 2 tecken`)
    }

    if (!admin) {
        errors.push(`Användarroll måste fyllas i`)
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors })
    }

    next();
}

//Route för att regiweekdayera användare
router.post("/register", validateRegister, async (req, res) => {
    try {
        const { password, firstname, surname, admin } = req.body;


        if (!password || !firstname || !surname || !admin) {
            return res.status(400).json({ error: `Invalid input, all fields must be entered.` })
        }

        let first = firstname.slice(0, 3).toLowerCase().replace(/[åä]/g, "a").replace(/[ö]/g, "o")
        let sur = surname.slice(0, 3).toLowerCase().replace(/[åä]/g, "a").replace(/[ö]/g, "o")

        const username = `${first}${sur}${nanoid()}`
        const email = `${username}@E4Haket.se`

        const employee = new Employee({ username, password, firstname, surname, email, admin })
        await employee.save();

        res.status(201).json({ message: `User successfully created` })

    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: `Username already taken` })
        }
        res.status(500).json({ error: `${err}` })
    }
})

router.get("/index", async (req, res) => {
    const d = new Date()
    let day = d.getDay()
    try {
        let result = await Dish.find({ "weekday": day });
        return res.json(result)
    } catch (err) {
        return res.status(500).json(err)
    }
})

router.get("/add", (req, res) => {
    return res.status(201).json({ message: `API NÅDD` })
})

router.post("/add", async (req, res) => {
    let errors = {}
    try {
        let { dishname, ingredients, allergens, diet, image, weekday } = req.body;
        if (weekday.includes("Monday")) {
            weekday = 1;
        } else if (weekday.includes("Tuesday")) {
            weekday = 2;
        } else if (weekday.includes("Wednesday")) {
            weekday = 3;
        } else if (weekday.includes("Thursday")) {
            weekday = 4;
        } else if (weekday.includes("Friday")) {
            weekday = 5;
        } else if (weekday.includes("Saturday")) {
            weekday = 6;
        } else if (weekday.includes("Sunday")) {
            weekday = 0;
        } else {
            return res.status(400).json({
                message: "Ogiltig veckodag"
            });
        }

        if (!dishname || !ingredients || !allergens || !diet || weekday === undefined) {
            errors.message = "Saknar information"
            errors.details = "Fyll i obligatorisk fält"

            errors.https_response.message = "Bad request";
            errors.https_response.code = 400

            return res.status(400).json(errors)
        }

        if (!errors.message) {
            let result = await Dish.create({
                dishname,
                ingredients,
                allergens,
                diet,
                image,
                weekday
            });
            return res.status(201).json({ message: `Dish added` })
        }
    } catch (err) {
        console.log(err)
        res.status(400).json(err)
    }
})

module.exports = router;
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
const Review = require("../models/review.js")
const Contact = require("../models/contact.js");
const Order = require("../models/order.js");
const { customAlphabet } = require("nanoid");
const nanoidUser = customAlphabet(`1234567890`, 4);
const nanoidFood = customAlphabet(`1234567890`, 6);
const nanoidOrder = customAlphabet(`1234567890`, 10);

//Kod för att verifiera token
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

//Kod för att verifiera registrering
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

//Route för att registrera användare
router.post("/register", validateRegister, async (req, res) => {
    try {
        const { password, firstname, surname, admin } = req.body;


        if (!password || !firstname || !surname || !admin) {
            return res.status(400).json({ error: `Invalid input, all fields must be entered.` })
        }

        let first = firstname.slice(0, 3).toLowerCase().replace(/[åä]/g, "a").replace(/[ö]/g, "o")
        let sur = surname.slice(0, 3).toLowerCase().replace(/[åä]/g, "a").replace(/[ö]/g, "o")
        const id = `${nanoidUser()}`
        const username = `${first}${sur}${id}`
        const email = `${username}@E4Haket.se`

        const employee = new Employee({ _id: id, username, password, firstname, surname, email, admin })
        await employee.save();

        res.status(201).json({ message: `User successfully created` })

    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: `Username already taken` })
        }
        res.status(500).json({ error: `${err}` })
    }
})

router.get("/login", async (req, res) => {
    res.json({ message: "API NÅDD" });
})

router.post("/login", async (req, res) => {

    const errors = []
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            errors.push(`Username and password must be provided`)
        }
        let employee = await Employee.findOne({ username: username }).select("+password")
        if (!employee) {
            errors.push(`Incorrect username or password`)
        } else {
            const matchingPassword = await employee.comparePassword(password);

            if (!matchingPassword) {
                errors.push(`Incorrect username or password`)
            }
        }




        if (errors.length > 0) {

            return res.status(400).json({
                message: `Valideringsfel`,
                errors
            })
        }

        const payload = { username: employee.username }
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: "2h"
        })

        employee = await Employee.findOne({ username: username });
        const response = {
            employee,
            token
        }

        res.status(200).json(response);
    } catch (err) {
        res.status(401).json({
            error: err.message
        })
    }
})

router.get("/intranet", authenticateToken, async (req, res) => {
    try {
        const employee = await Employee.findOne({ username: req.employee.username })

        if (!employee) {
            return res.status(403).json({ error: `Unauthorised. Username not found.` })
        }

        res.json({
            username: employee.username,
            firstname: employee.firstname,
            surname: employee.surname,
            admin: employee.admin,
        })


    } catch (err) {
        res.status(500).json({
            error: err.message
        })
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

router.get("/add", async (req, res) => {
    try {
        let result = await Dish.find({});
        return res.json(result)
    } catch (err) {
        return res.status(500).json({ error: err })
    }
})

router.post("/add", async (req, res) => {
    let errors = {
        message: "",
        details: "",
        https_response: {}
    }
    try {
        let { dishname, ingredients, allergens, diet, price, image, weekday } = req.body;
        let id = `${nanoidFood()}`
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
                _id: id,
                dishname,
                ingredients,
                allergens,
                diet,
                price,
                image,
                weekday
            });
            return res.status(201).json({ message: `Dish added: ${result}` })
        }
    } catch (err) {
        console.log(err)
        res.status(400).json(err)
    }
})

router.get("/add/:id", async (req, res) => {
    try {
        let { id } = req.params

        console.log(id)

        let dish = await Dish.findById(id)
        console.log(dish)
        return res.status(200).json(dish)

    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})

router.put("/add/:id", async (req, res) => {
    const errors = []
    try {
        let { dishname, ingredients, allergens, diet, price, image, weekday } = req.body;
        let id = req.params.id

        if (weekday.includes("monday")) {
            weekday = 1;
        } else if (weekday.includes("tuesday")) {
            weekday = 2;
        } else if (weekday.includes("wednesday")) {
            weekday = 3;
        } else if (weekday.includes("thursday")) {
            weekday = 4;
        } else if (weekday.includes("friday")) {
            weekday = 5;
        } else if (weekday.includes("saturday")) {
            weekday = 6;
        } else if (weekday.includes("sunday")) {
            weekday = 0;
        } else {
            errors.push(`Veckodag måste fyllas i`)
                
        }

        if (!dishname) {
            errors.push(`Maträttens namn måste fyllas i`)
        }

        if (!ingredients) {
            errors.push(`Ingredienser måste fyllas i`)
        }

        if (!allergens) {
            errors.push(`Allergener måste fyllas i. Om inga finns, skriv 'inga'`)
        }

        if (!price) {
            errors.push(`Pris måste fyllas i`)
        }

        if (errors.length > 0) {

            return res.status(400).json({
                message: `Valideringsfel`,
                errors
            })
        }

        let result = await Dish.updateOne({ "_id": id },
            {
                $set:
                {
                    dishname: dishname,
                    ingredients: ingredients,
                    allergens: allergens,
                    diet: diet,
                    price: price,
                    image: image,
                    weekday: weekday
                }
            }
        )

        return res.status(201).json({ message: `Dish updated` })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: err })
    }
})

router.post("/order", async (req, res) => {
    const errors = [];
    try {


        let { name, email, phone, dishes, totalPrice, message, pickup } = req.body;
        let id = `${nanoidOrder()}`

        if (!name || !name.trim()) {
            errors.push(`Namn måste fyllas i`)
        }

        if (!dishes || dishes.length == 0) {
            errors.push(`Varukorgen är tom - Välj minst en maträtt`)
        }

        if (!pickup.trim()) {
            errors.push(`Önskad upphämtningstid måste fyllas i`)
        }

        if (!phone.trim() && !email.trim()) {
            errors.push(`Ett av kontaktfälten måste fyllas i`)
        }

        if (phone && !/^[0-9+\-\s()]+$/.test(phone)) {
            errors.push(`Felaktigt format i telefonnumret.`)
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push(`Felaktigt format på e-post`)
        }

        if (errors.length > 0) {
            return res.status(400).json({
                message: `Valideringsfel`,
                errors
            })
        }

        if (errors.length == 0) {
            await Order.create({
                _id: id,
                name,
                email,
                phone,
                dishes,
                totalPrice,
                message,
                pickup
            })

            return res.status(201).json({ message: `Beställning skickad!` })
        }

    } catch (err) {
        console.log(err)
    }
})

router.get("/order", async (req, res) => {
    try {
        let result = await Order.find({});
        return res.json(result)
    } catch (err) {
        return res.status(500).json({ error: err })
    }
})

router.put("/order/:id", async (req, res) => {
    try {
        let { id } = req.params
        console.log(id)

        let order = await Order.findById(id)

        let updatedStatus;


        if (order.status === "received") {
            updatedStatus = "pending"
        }

        if (order.status === "pending") {
            updatedStatus = "done";
        }

        if (order.status === "done") {
            updatedStatus = "picked-up"
        }


        let result = await Order.findOneAndUpdate(
            { _id: id },
            { $set: { status: updatedStatus } },
            { new: true }
        );
        console.log(result)
        return res.status(201).json({ message: "Entry updated" })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: err })
    }
})


router.post("/contact", async (req, res) => {
    const errors = []

    try {
        let { firstname, surname, email, phone, message } = req.body;
        console.log(req.body)

        if (!firstname.trim()) {
            errors.push(`Förnamn måste fyllas i`)
        }
        if (!surname.trim()) {
            errors.push(`Efternamn måste fyllas i`)
        }
        if (!message.trim()) {
            errors.push(`Meddelande måste fyllas i.`)
        }
        if (!phone.trim() && !email.trim()) {
            errors.push(`Ett av kontaktfälten måste fyllas i`)
        }
        if (phone && !/^[0-9+\-\s()]+$/.test(phone)) {
            errors.push(`Felaktigt format i telefonnumret.`)
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push(`Felaktigt format på e-post`)
        }

        if (errors.length > 0) {
            return res.status(400).json({
                message: `Valideringsfel`,
                errors
            })
        }


        if (errors.length == 0) {
            await Contact.create({
                firstname,
                surname,
                email,
                phone,
                message
            })

            return res.status(201).json({ message: `Meddelande skickat!` })
        }
    } catch (err) {
        console.log(err)
        res.status(400).json(err)
    }
});

router.post("/review", async (req, res) => {
    const errors = []

    try {
        let { name, email, rating, message, allowAnswer } = req.body;
        console.log(req.body)

        if (!name || !name.trim()) {
            errors.push(`Förnamn måste fyllas i`)
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push(`Felaktigt format på e-post`)
        }

        if (!rating || !rating.trim()) {
            errors.push(`Betyg måste fyllas i`)
        }


        if (errors.length > 0) {
            return res.status(400).json({
                message: `Valideringsfel`,
                errors
            })
        }

        await Review.create({
            name,
            email,
            rating,
            message,
            allowAnswer,
        })

        return res.status(201).json({
            message: "Recension sparad!"
        })
    } catch (err) {

        console.log(err)
        res.status(500).json({
            message: "Serverfel",
            errors: ["Något gick fel"]
        })

    }
})

module.exports = router;
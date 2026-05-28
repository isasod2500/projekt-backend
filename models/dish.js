const mongoose = require("mongoose");
const { nanoid } = require("nanoid");
const { customAlphabet } = require("nanoid");
const dishID = customAlphabet(`1234567890`, 5)


//Modell för måltider
const dishSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => dishID()
    },
    dishname: {
        type: String,
        required: true,
    },
    ingredients: {
        type: String,
        required: true,
    },
    allergens: {
        type: String,
        required: true,
    },
    diet: {
        type: String,
    },
    price: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    weekday: {
        type: String,
        required: true,
    }
});


//Exportera Dish för användning i routes.
const Dish = mongoose.model("Dish", dishSchema)
module.exports = Dish;
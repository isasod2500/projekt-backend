const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

//Modell för måltider
const dishSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => nanoid(),
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
        required: true,
    },
});


//Exportera Dish för användning i routes.
const Dish = mongoose.model("Dish", foodSchema)
module.exports = Dish;
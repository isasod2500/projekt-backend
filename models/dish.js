const mongoose = require("mongoose");

//Modell för måltider
const dishSchema = new mongoose.Schema({
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
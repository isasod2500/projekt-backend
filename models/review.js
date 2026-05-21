const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    nickname: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String, 
        required: true,
        trim: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    created: {
        type: Date,
        default: Date.now
    },
})


//Exportera Dish för användning i routes.
const Review = mongoose.model("Review", reviewSchema)
module.exports = Review;
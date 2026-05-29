const mongoose = require("mongoose")
const { nanoid } = require("nanoid");
const { customAlphabet } = require("nanoid");

const orderID = customAlphabet(`1234567890`, 8)
const Dish = require("../models/dish.js");

const orderSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => orderID(),
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },

    dishes: [
        {   
            _id: String,
            dishname: String,
            price: Number,
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
        },
    ],

    email: {
        type: String,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    pickup: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["received", "preparing", "ready", "picked_up"],
        default: "received",
    },
    created: {
        type: Date,
        default: Date.now
    }
})

const Order = mongoose.model("Order", orderSchema)
module.exports = Order;
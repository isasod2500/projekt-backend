const mongoose = require("mongoose")

const takeawaySchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => nanoid(7),
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },

    dishes: [
        {
            productId: mongoose.Schema.Types.ObjectId,
            name: String,
            price: Number,
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
        }
    ],

    email: {
        type: String,
        trim: true,
    },
    telephone: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
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

const Takeaway = mongoose.model("Takeaway", takeawaySchema)
module.exports = Takeaway;
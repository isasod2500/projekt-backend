const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true,
    },
    surname: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String, 
        required: true,
        trim: true,
    },
    telephone: {
        type: String,
        trim: true,
    },
    message: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        default: Date.now
    },
})

const Contact = mongoose.model("Contact", contactSchema)
module.exports = Contact;

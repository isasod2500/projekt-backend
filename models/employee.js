const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const { customAlphabet } = require("nanoid");

const userID = customAlphabet("1234567890", 4)

//Modell för anställda
const employeeSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => userID,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
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
        unique: true,
        required: true,
        trim: true
    },
    admin: {
        type: Boolean,
        required: true,
    },
    created: {
        type: Date,
        default: Date.now
    }
});

/*"save" funktion som sparar användaren i fall inga error
dyker upp i andra funktioner som inväntar save()*/

employeeSchema.pre("save", async function () {
    try {
        if (this.isNew || this.isModified("password")) {
            const hashedPassword = await bcrypt.hash(this.password, 10);
            this.password = hashedPassword
        }
    } catch (err) {
        throw err
    }
});

//Anställd skapas
employeeSchema.statics.register = async function (username, password, firstname, surname, email, admin) {
    try {
        const employee = new this({
            username,
            password,
            firstname,
            surname,
            email,
            admin
        });
        await employee.save();
        return employee;

    } catch (err) {
        throw err
    }
}

//Hashar inkommande lösenord och jämför med databasens.
employeeSchema.methods.comparePassword = async function(password) {
    try {
        return await bcrypt.compare(password, this.password) 
    } catch (err) {
        throw err
    }
}

//Funktion kollar om användarnamn och lösenord matchar. Ger generiskt fel om matchning inte hittas
employeeSchema.statics.login = async function (username, password) {
    try {
        /*Letar efter anställd som matchar inkommande användarnamn. 
        Password är satt som default att aldrig tas med, så jag kallar explicit på det här.*/
        const employee = await this.findOne({ username: username }).select("+password");

        //Är resultatet falsy (saknas, null eller inte matchar) ges error.
        if(!employee) {
            throw new Error(`Felaktigt användarnamn eller lösenord`)
        }

        //Kallar på comparepassword funktionen ovan och ifall svaret är falsy ges ett fel.
        const matchingPassword = await employee.comparePassword(password);

        if (!matchingPassword) {
            throw new Error(`Felaktigt användarnamn eller lösenord`)
        }

        return employee;
    } catch(err) {
        throw err
    }
}

//Exportera Employee för användning i routes.
const Employee = mongoose.model("Employee", employeeSchema)
module.exports = Employee;
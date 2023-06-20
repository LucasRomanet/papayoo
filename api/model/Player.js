// /backend/data.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { MIN_NAME_LENGTH, MAX_NAME_LENGTH } = require("../utils/const");
const Schema = mongoose.Schema;

// this will be our data base's data structure
const PlayerSchema = new Schema(
    {
        name:  {
                type: String,
                maxlength: MAX_NAME_LENGTH,
                minlength: MIN_NAME_LENGTH
        },
        tag: String,
        password: String,
        games: {
                type: Number,
                default: 0
        },
        score: {
                type: Number,
                default: 0
        },
    },
    { collection : 'player' },
    { timestamps: true }
);

PlayerSchema.pre('save', async function(next) {
        this.password = await bcrypt.hash(this.password, 10);
        next();
});

PlayerSchema.pre('updateOne', updateFunction);

PlayerSchema.pre('updateMany', updateFunction);

async function updateFunction(next) {
        const modifications = this.getUpdate();
        if (modifications.password) {
                modifications.password = await bcrypt.hash(modifications.password, 10);
        }
        next();
}

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Player", PlayerSchema);

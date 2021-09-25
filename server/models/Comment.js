require('dotenv').config();
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commentSchema = new mongoose.Schema({

    documentation: {
        type: Schema.Types.ObjectId,
        ref: "Documentation",
        required: true
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    content: {type: String,
        required: true},

    date: {type: Date,
        required: true}
})

module.exports = mongoose.model("Comment", commentSchema);
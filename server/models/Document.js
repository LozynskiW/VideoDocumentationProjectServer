require('dotenv').config();
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const documentSchema = new mongoose.Schema({

    name: {type: String,
        required: true},

    file: {type: String,
        required: true},

    nextVersion: {
        type: Schema.Types.ObjectId,
        ref: "Document",
        default: null,
        required: false
    },

    documentation: {
        type: Schema.Types.ObjectId,
        ref: "Documentation",
    },

    isPublic: {type: Boolean,
        required: false,
        default: false},

})

module.exports = mongoose.model("Document", documentSchema);
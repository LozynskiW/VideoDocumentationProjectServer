require('dotenv').config();
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const projectSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    avatar: {
        type: String,
        required: false,
        default: process.env.DEFAULT_PROJECT_AVATAR
    },

    description: {
        type: String,
        required: false
    },

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    usersWithAccess: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
    }],

    usersThatAccepted: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
    }],

    documentation: [{
        type: Schema.Types.ObjectId,
        ref: "Documentation",
        required: false,
    }],

    isAccepted: {
        type: Boolean,
        required: false,
        default: false
    },

    isPublic: {
        type: Boolean,
        required: false,
        default: false
    },

})

module.exports = mongoose.model("Project", projectSchema);
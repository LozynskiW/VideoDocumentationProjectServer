require('dotenv').config();
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new mongoose.Schema({

    password: {
        type: String,
        required: true
    },

    firstName: {
        type: String,
        required: true
    },

    secondName: {
        type: String,
        required: false
    },

    lastName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    phoneNumber: {
        type: String,
        required: false
    },

    languages: {
        type: Schema.Types.Map,
        required: false
    },

    avatar: {
        type: String,
        required: false,
        default: process.env.DEFAULT_USER_AVATAR
    },

    job: {
        type: Object,
        required: false
    },

    ownedProjects: [{
        type: Schema.Types.ObjectId,
        of: Schema.Types.ObjectId,
        ref: "Project",
        required: false
    }],

    accessedProjects: [{
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: false
    }],

})

module.exports = mongoose.model("User", userSchema);
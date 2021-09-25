require('dotenv').config();
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const jobSchema = new mongoose.Schema({

    company: {type: String,
        required: true},

    position: {type: String,
        required: true},

})

module.exports = mongoose.model("Job", jobSchema);
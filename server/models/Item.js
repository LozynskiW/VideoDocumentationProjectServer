require('dotenv').config();
const mongoose = require('mongoose')
const Schema = mongoose.Schema

//DEPRECIATED
const itemSchema = new mongoose.Schema({

    name: {type: String,
            required: true},

    avatar: {type: String,
                required: false,
                default: process.env.DEFAULT_ITEM_AVATAR},

    description: {type: String,
                    required: false},

    documentation: {type: Schema.Types.Map,
                    of: Schema.Types.ObjectId,
                    required: false},

})

module.exports = mongoose.model("Item", itemSchema);
require('dotenv').config();
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DocumentationSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    documents: [{
        type: Schema.Types.ObjectId,
        ref: "Document",
        required: false,
    }],
    comments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment",
        required: false,
    }],
})

module.exports = mongoose.model("Documentation", DocumentationSchema);
const Comment = require("../models/Comment");
require('dotenv').config();

exports.getCommentById = async (req, res, next) => {

    // before it goes to auth, so user should be in req.user._id

    let comment;
    let commentId = req.body.commentId

    try {
        comment = await Comment.findById(commentId);
    } catch (err) {
        return res.status(400).json("Error due to searching for comment by id")
    }

    req.body.comment = comment
    next();
}

exports.getAllCommentsForDocumentation = async (req, res) => {

    if (!req.body.documentation) {
        return res.status(400).json("No such documentation")
    }

    let comments = [];

    try {
        comments = await Comment.find({documentation: req.body.documentation._id}).populate(["comments", "user"])

    } catch (err) {
        return res.status(500).json({err: "Error due to creating comment"})
    }
    return res.status(200).json(comments)
}

exports.updateComment = async (req, res) => {

    if (!req.body.comment) {
        return res.status(400).json("No such documentation")
    }

    let newcontent = req.body.content
    let oldComment = req.body.comment

    let query = {
        content: newcontent,
        date: Date.now()
    }

    try {
        await Comment.findByIdAndUpdate(oldComment._id, query);
        return res.status(201).json("Comment updated")
    } catch (err) {
        console.log(err)
        return res.status(400).json("Error due to updating comment by id")
    }

}

exports.deleteComment = async (req, res, next) => {

    if (!req.body.comment) {
        return res.status(400).json("No such comment")
    }

    let commentId = req.body.comment._id

    try {
        await Comment.findByIdAndDelete(commentId);
    } catch (err) {
        return res.status(400).json("Error due to deleting comment by id")
    }
    next();
}

exports.addNewComment = async (req, res, next) => {
    // Id of document to add in req.body.documentId
    //user in req.body.user
    // req.body.newComment = {}
    if (!req.body.documentation) {
        return res.status(400).json("No such documentation")
    }

    if(!req.user) {
        return res.status(400).json("No such user")
    }

    let newComment = req.body.newComment
    newComment.user = req.user._id
    newComment.date = Date.now()
    newComment.documentation = req.body.documentation._id

    try {
        await Comment.create(newComment, function (err, comm) {
            if (err) return res.status(500).json("Error due to creating comment")
            req.body.newComment = comm
            next();
        })
    } catch (err) {
        return res.status(500).json({err: "Error due to creating comment"})
    }
}

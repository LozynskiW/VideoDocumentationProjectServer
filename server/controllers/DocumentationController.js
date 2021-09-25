const Documentation = require('../models/Documentation')

exports.addNewDocumentation = async (req, res, next) => {

    // before it goes to findUserById, so user should be in req.body

    if (!req.user) {
        return res.status(400).json("No such user")
    }

    if (!req.body.projectId) {
        return res.status(400).json("No project to add documentation to")
    }

    let newDocumentation = req.body.documentation
    newDocumentation.owner = req.body.projectId

    try {
        await Documentation.create(newDocumentation, function(err, doc){
            req.body.documentationToAddId = doc._id;
            next()
        });

    } catch (err) {
        console.log(err)
        return res.status(400).json("Error due to adding documentation")
    }
}

exports.findDocumentationById = async (req, res, next) => {

    // before it goes to auth, so user should be in req.user._id

    let documentation;
    let documentationId = req.params.documentationId || req.body.documentationToAddId || req.body.documentationToPullId || req.body.documentationId

    try {
        documentation = await Documentation.findById(documentationId).populate("documents");
    } catch (err) {
        return res.status(400).json("Error due to searching for documentation")
    }

    req.body.documentation = documentation
    next();
}

exports.getDocumentationDetails = async (req, res) => {

    if (!req.body.documentation) {
        return res.status(400).json("No such documentation")
    }

    return res.status(400).json({
        name: req.body.documentation.name,
        owner: req.body.documentation.owner,
        version: req.body.documentation.version,
        documents: req.body.documentation.documents,
        comments: req.body.documentation.comments
    });

}

exports.addNewDocumentToDocumentation = async (req, res, next) => {
    // before it goes to findDocumentationById, so Documentation should be in req.body.documentation
    // Id of document to add in req.body.documentId
    if (!req.body.documentation) {
        return res.status(400).json("No such documentation")
    }

    let newDocument = req.body.newDocument

    try {
        await Documentation.findByIdAndUpdate(req.body.documentation._id,
            { $push: { documents: newDocument._id} },
            {useFindAndModify: true })
    } catch (err) {
        return res.status(500).json({err: "Error due to updating documentation"})
    }

    next();

}

exports.pullDocumentFromDocumentation = async (req, res, next) => {
    // before it goes to findDocumentationById, so Documentation should be in req.body.documentation
    // Id of document to add in req.body.documentId
    if (!req.body.documentation) {
        return res.status(400).json("No such documentation")
    }

    if (!req.body.document) {
        return res.status(400).json("No such document")
    }

    let documentToPull = req.body.document

    try {
        await Documentation.findByIdAndUpdate(req.body.documentation._id,
            { $pull: { documents: {$in: [documentToPull._id]}} },
            {useFindAndModify: true , multi: true})
    } catch (err) {
        return res.status(500).json({err: "Error due to updating documentation"})
    }

    next();

}

exports.updateExistingDocument = async (req, res) => {
    // before it goes to findDocumentationById, so Documentation should be in req.body.documentation
    // Id of document to add in req.body.documentId
    // req.body = {documentToUpdateId, updatedDocument)

    if (!req.body.documentation) {
        return res.status(400).json("No such documentation")
    }

    let documentToUpdateId = req.body.documentToUpdateId
    let updatedDocument = req.body.newDocument;

    try {
        await Document.findByIdAndUpdate(documentToUpdateId, {$set: { nextVersion: updatedDocument._id}})
    } catch (err) {
        return res.status(500).json({err: "Error due to updating documentation"})
    }

}

exports.getAllDocumentsForDocumentation = async (req, res) => {
    // before it goes to findDocumentationById, so Documentation should be in req.body.documentation
    // Id of document to add in req.body.documentId
    // req.body = {documentToUpdateId, updatedDocument)

    if (!req.body.documentation) {
        return res.status(400).json("No such documentation")
    }

    try {

        let documents =  await Documentation.find({owner: req.user._id})

        return res.status(200).json(documents)
    } catch (err) {
        return res.status(500).json({err: "Error due to updating documentation"})
    }

}

exports.getAllDocumentationsForUser = async (req, res) => {
    // before it goes to findDocumentationById, so Documentation should be in req.body.documentation
    // Id of document to add in req.body.documentId
    // req.body = {documentToUpdateId, updatedDocument)

    try {

        let documents =  req.body.documentation.documents

        return res.status(200).json(documents)
    } catch (err) {
        return res.status(500).json({err: "Error due to updating documentation"})
    }

}

exports.bindCommentToDocumentation = async (req, res) => {

    if (!req.body.documentation) {

        return res.status(400).json("No such documentation")
    }

    if (!req.body.newComment) {

        return res.status(400).json("No comment to add")
    }

    let newComment = req.body.newComment

    try {
        await Documentation.findByIdAndUpdate(req.body.documentation._id,
            { $push: { comments: newComment._id} },
            {useFindAndModify: true })
        return res.status(201).json("Comment added to documentation")

    } catch (err) {
        console.log(err)
        return res.status(500).json("Error due to binding comment to documentation")
    }

}

exports.pullCommentAfterDeleting = async (req, res) => {

    if (!req.body.comment._id) {
        return res.status(400).json("No comment to be able to delete")
    }

    if (!req.body.documentation) {

        return res.status(400).json("No such documentation")
    }

    let commentId = req.body.comment._id

    try {
        await Documentation.findByIdAndUpdate(req.body.documentation._id,
            { $pull: { comments: {$in: [commentId]}} },
            { multi: true })
        return res.status(204).json("Comment deleted from documentation")

    } catch (err) {
        console.log(err)
        return res.status(500).json("Error due to deleting comment from documentation")
    }

}

exports.return2xxStatus = (req, res) => {

    if (req.body.documentToUpdateId) {
        return res.status(201).json("Document updated")
    }

    if (req.body.newDocument) {
        return res.status(201).json("New document added to documentation")
    }

    return res.status(200).json("Operation succeeded")
}


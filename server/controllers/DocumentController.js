const Document = require('../models/Document')

exports.findDocumentById = async (req, res, next) => {

    const documentId = req.body.documentId || req.query.documentId;
    let document;

    try {
        document = await Document.findById(documentId);
        //res.status(200).json(user);
    } catch (err) {
        console.log(err)
        return res.status(404).json({err: "No such document"})
    }

    req.body.document = document;
    next();
}

exports.getDocumentDetails = (req, res) => {

    if (!req.body.document) {
        return res.status(404).json({err: "No such document"})
    }

    let document = req.body.document

    return res.status(200).json(document)
}

exports.addNewDocument = async (req, res, next) => {

    let newDocument = req.body.newDocument;
    newDocument.documentation = req.body.documentation._id

    try {
        await Document.create(newDocument, function (err, doc) {
            if (err) return res.status(500).json("Error due to adding document")
            req.body.newDocument = doc
            next();
        });

    } catch (err) {
        return res.status(500).json("Error due to adding document")
    }
}

exports.updateDocumentForDocumentation = async (req, res) => {

    let documentToUpdateId = req.body.documentToUpdateId;
    let updatedDocumentId = req.body.newDocumentId

    try {
        await Document.findByIdAndUpdate(
            documentToUpdateId,
            {$set: { nextVersion: updatedDocumentId}})
        return res.status(201).json("Document successfully updated")
    } catch (err) {
        return res.status(500).json({err: "Error due to updating documentation"})
    }
}


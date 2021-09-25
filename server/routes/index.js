var express = require('express');
var router = express.Router();
require('dotenv').config();

const UserController = require("../controllers/UserController")
const DocumentationController = require("../controllers/DocumentationController")
const DocumentController = require("../controllers/DocumentController")
const CommentController = require('../controllers/CommentController')
const ProjectController = require('../controllers/ProjectController')
const Auth = require('../security/Authentication')


// PUBLIC

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});
// USER

router.post(process.env.SERVER_PATH+'/register', UserController.registerNewUser)
router.post(process.env.SERVER_PATH+'/login', UserController.login)
router.delete(process.env.SERVER_PATH+'/logout', Auth.userAuth, Auth.logout)

// PROTECTED

router.delete(process.env.SERVER_PATH+'/user/delete',
    [
        Auth.userAuth,
        UserController.findUserById
    ], UserController.deleteUserById)

router.put(process.env.SERVER_PATH+'/user/update',
    [
        Auth.userAuth,
        UserController.findUserById
    ], UserController.updateUser)

router.get(process.env.SERVER_PATH+'/user/find/email',
    [
        Auth.userAuth,
        UserController.findUserByEmail
    ], UserController.getUserDetails)

router.post(process.env.SERVER_PATH+'/user/accessLevel',
    [
        Auth.userAuth,
        UserController.findUserById
    ], UserController.getUserAccessLevel)

router.post(process.env.SERVER_PATH+'/user/find/name',
    [
        Auth.userAuth,
        UserController.findUserByNameOrSurname
    ], UserController.getUserDetails)

router.get(process.env.SERVER_PATH+'/user/details/:userId',
    [
        Auth.userAuth,
        UserController.findUserById
    ], UserController.getUserDetails)

router.get(process.env.SERVER_PATH+'/user/details',
    [
        Auth.userAuth,
        UserController.findUserById
    ],
    UserController.getUserDetails)

//Inaccessible
router.get(process.env.SERVER_PATH+'/user/test/all', UserController.getAllUsers)

router.put(process.env.SERVER_PATH+'/user/project/:projectId',
    [
        Auth.userAuth,
        ProjectController.getProjectById,
        UserController.findUserById,
        UserController.checkIfUserAlreadyHasAccessToProject,
        UserController.acceptProject,
        ProjectController.checkIfUserAcceptedProject,
        ProjectController.markProjectAsAcceptedBySingleUser,
        ProjectController.getProjectById,
    ],
    ProjectController.checkIfProjectIsAccepted)

// DOCUMENT

router.post(process.env.SERVER_PATH+'/document', DocumentController.addNewDocument)

router.get(process.env.SERVER_PATH+'/document', DocumentController.findDocumentById, DocumentController.getDocumentDetails)

// DOCUMENTATION

router.post(process.env.SERVER_PATH+'/documentation/newDocumentation',
    Auth.userAuth,
    DocumentationController.addNewDocumentation)

router.post(process.env.SERVER_PATH+'/documentation/:documentationId/addDocument', [
    // req.body.newDocument
    // req.param.documentationId

        Auth.userAuth, // + req.user
        DocumentationController.findDocumentationById, // + req.body.documentation, needs req.param.documentationId
        DocumentController.addNewDocument, // needs req.body.newDocument
        DocumentationController.addNewDocumentToDocumentation // needs req.body.documentation and req.body.newDocument
    ],
    DocumentationController.return2xxStatus)

router.post(process.env.SERVER_PATH+'/documentation/:documentationId/pullDocument', [
        // req.body.newDocument
        // req.param.documentationId

        Auth.userAuth, // + req.user
        DocumentationController.findDocumentationById, // + req.body.documentation, needs req.param.documentationId
        DocumentController.findDocumentById, // needs req.body.newDocument
        DocumentationController.pullDocumentFromDocumentation // needs req.body.documentation and req.body.newDocument
    ],
    DocumentationController.return2xxStatus)
// req.user._id
// req.body.newDocument
// req.body.documentation

router.put(process.env.SERVER_PATH+'/documentation/:documentationId/update', [
        // req.body.documentToUpdateId;
        // req.body.newDocumentId

        Auth.userAuth,
        DocumentationController.findDocumentationById
    ],
    DocumentController.updateDocumentForDocumentation)

router.get(process.env.SERVER_PATH+'/documentation/:documentationId/documents', [
        Auth.userAuth,
        DocumentationController.findDocumentationById
    ],
    DocumentationController.getAllDocumentsForDocumentation)

router.get(process.env.SERVER_PATH+'/documentation/:documentationId', [
        Auth.userAuth,
        DocumentationController.findDocumentationById
    ],
    DocumentationController.getDocumentationDetails)

// COMMENT

//get all comments
router.get(process.env.SERVER_PATH+'/documentation/:documentationId/comments',
    [
        Auth.userAuth,
        DocumentationController.findDocumentationById
    ], CommentController.getAllCommentsForDocumentation)

//add new comment
router.post(process.env.SERVER_PATH+'/documentation/:documentationId/comments',
    [
        Auth.userAuth,
        DocumentationController.findDocumentationById,
        CommentController.addNewComment
    ], DocumentationController.bindCommentToDocumentation)

//update comment
router.put(process.env.SERVER_PATH+'/documentation/:documentationId/comments',
    [
        Auth.userAuth,
        CommentController.getCommentById
    ], CommentController.updateComment)

//delete comment
router.delete(process.env.SERVER_PATH+'/documentation/:documentationId/comments',
    [
        Auth.userAuth,
        CommentController.getCommentById,
        DocumentationController.findDocumentationById,
        CommentController.deleteComment
    ], DocumentationController.pullCommentAfterDeleting)

// PROJECT

router.get(process.env.SERVER_PATH+'/project/:projectId',
    [Auth.userAuth,
    ProjectController.getProjectById
    ],
    ProjectController.getProjectDetails)

router.get(process.env.SERVER_PATH+'/projects/public',
[Auth.userAuth,
    ],
    ProjectController.getAllPublicProjects)

router.get(process.env.SERVER_PATH+'/user/projects/owned',
    [Auth.userAuth,
        UserController.findUserById,
    ],
    ProjectController.getAllOwnedProjectsForUser)

router.get(process.env.SERVER_PATH+'/user/projects/accessed',
    [Auth.userAuth,
        UserController.findUserById,
    ],
    ProjectController.getAllAccessedProjectsForUser)

router.post(process.env.SERVER_PATH+'/project',
    [Auth.userAuth,
        ProjectController.addNewProject
    ],
    UserController.addProjectForOwner)

router.post(process.env.SERVER_PATH+'/project/:projectId/addUser',
    [Auth.userAuth,
        UserController.findUserById,
        ProjectController.getProjectById,
        UserController.checkIfUserAlreadyHasAccessToProject,
        Auth.checkIfUserIsProjectOwner,
        ProjectController.addUserToProject
    ],
    UserController.addProjectToAccessedProjects)

router.post(process.env.SERVER_PATH+'/project/:projectId/deleteUser',
    [Auth.userAuth,
        UserController.findUserById,
        ProjectController.getProjectById,
        UserController.checkIfUserAlreadyHasAccessToProject,
        Auth.checkIfUserIsProjectOwner,
        ProjectController.removeUserFromProject
    ],
    UserController.pullProjectFromAccessedProjects)

router.post(process.env.SERVER_PATH+'/project/:projectId/addDocumentation',
    [Auth.userAuth,
        DocumentationController.addNewDocumentation,
        DocumentationController.findDocumentationById,
        ProjectController.getProjectById,
        Auth.checkIfUserIsProjectOwner,
    ],
    ProjectController.addDocumentationToProject)

router.post(process.env.SERVER_PATH+'/project/:projectId/pullDocumentation',
    [Auth.userAuth,
        DocumentationController.findDocumentationById,
        ProjectController.getProjectById,
        Auth.checkIfUserIsProjectOwner,
    ],
    ProjectController.pullDocumentationFromProject)

router.put(process.env.SERVER_PATH+'/project/:projectId',
    [
        Auth.userAuth,
        ProjectController.getProjectById,
        Auth.checkIfUserIsProjectOwner,
    ],
    ProjectController.editProject)

router.delete(process.env.SERVER_PATH+'/project/:projectId',
    [Auth.userAuth,
        ProjectController.getProjectById
    ],
    ProjectController.deleteProject)

module.exports = router;

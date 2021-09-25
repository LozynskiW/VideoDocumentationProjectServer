const Project = require('../models/Project')

exports.getProjectById = async (req, res, next) => {

    let project;
    let projectId = req.params.projectId

    try {
        project = await Project.findById(projectId).populate(["usersWithAccess", "usersThatAccepted", "documentation", "owner"]);
    } catch (err) {
        return res.status(400).json("Error due to searching project by id")
    }

    req.body.project = project
    next();
}

exports.getProjectDetails = (req, res) => {

    if (!req.body.project) {
        return res.status(400).json("No such project")
    }

    return res.status(200).json(req.body.project)
}

exports.getAllPublicProjects = async (req, res) => {

    let projects;

    try {
        projects = await Project.find({isPublic: true})

    } catch (err) {
        return res.status(500).json({err: "Error due to searching public projects"})
    }
    return res.status(200).json(projects)
}

exports.getAllOwnedProjectsForUser = async (req, res) => {

    if (!req.user) {
        return res.status(400).json("No such user")
    }

    let projects;
    console.log("getAllOwnedProjectsForUser")
    console.log(req.user._id)

    try {
        projects = await Project.find({owner: req.user._id})

    } catch (err) {
        return res.status(500).json({err: "Error due to searching public projects"})
    }
    console.log(projects)
    return res.status(200).json(projects)

}

exports.getAllAccessedProjectsForUser = async (req, res) => {

    if (!req.user) {
        return res.status(400).json("No such user")
    }

    let projects;

    try {
        projects = await Project.find({usersWithAccess: {$in: [req.user._id]}})

    } catch (err) {
        return res.status(500).json({err: "Error due to searching public projects"})
    }
    return res.status(200).json(projects)

}

exports.addNewProject = async (req, res, next) => {

    if (!req.user) {
        return res.status(400).json("No such user")
    }

    let newProject = req.body.newProject
    newProject.owner = req.user._id

    try {
        await Project.create(newProject, function (err, proj) {
            if (err) return res.status(500).json("Error due to creating project")
            req.body.newProject = proj
            next();
        })
    } catch (err) {
        return res.status(500).json({err: "Error due to creating project"})
    }
}

exports.deleteProject = async (req, res) => {

    if (!req.body.project) {
        return res.status(400).json("No such project")
    }

    let projectId = req.body.project._id

    try {
        await Project.findByIdAndDelete(projectId);
        return res.status(204).json("Project deleted")
    } catch (err) {
        return res.status(400).json("Error due to deleting project by id")
    }
}

exports.pullProjectFromUser = async (req, res) => {

    if (!req.body.project) {
        return res.status(400).json("No project to be able to delete")
    }

    let projectToPullId = req.body.project._id

    try {
        await Project.findByIdAndUpdate(req.user._id,
            { $pull: { ownedProjects: {$in: [projectToPullId]}} },
            { multi: true })
        return res.status(204).json("Project deleted from user")

    } catch (err) {
        console.log(err)
        return res.status(500).json("Error due to deleting project from user")
    }
}

exports.addDocumentationToProject = async (req, res) => {

    if (!req.body.project) {
        return res.status(400).json("No such project")
    }

    let documentationCheck = !req.body.project.documentation.filter(d => {return d.equals(req.body.documentation._id)})

    if (documentationCheck.length > 0) {
        return res.status(400).json("Documentation already in project")
    }

    let documentationToAddId = req.body.documentation._id

    try {
        await Project.findByIdAndUpdate(req.body.project._id,
            { $push: { documentation: documentationToAddId} },
            {useFindAndModify: true })
        return res.status(201).json("Documentation added to project")
    } catch (err) {
        return res.status(500).json("Error due to updating documentation")
    }
}

exports.pullDocumentationFromProject = async (req, res) => {

    if (!req.body.documentation._id) {
        return res.status(400).json("No documentation to be able to delete")
    }

    if (!req.body.project) {
        return res.status(400).json("No such project")
    }

    let documentationCheck = !req.body.project.documentation.filter(d => {return d.equals(req.body.documentation._id)})

    if (documentationCheck.length === 0) {
        return res.status(400).json("Documentation not in project, unable to remove")
    }

    let documentationToPullId = req.body.documentation._id

    try {
        await Project.findByIdAndUpdate(req.body.project._id,
            { $pull: { documentation: {$in: [documentationToPullId]}} },
            { multi: true })
        return res.status(204).json("Documentation deleted from project")

    } catch (err) {
        console.log(err)
        return res.status(500).json("Error due to deleting documentation from project")
    }
}

exports.addUserToProject = async (req, res, next) => {

    if (!req.body.project) {
        return res.status(400).json("No such project")
    }

    if (!req.body.user) {
        return res.status(400).json("No user to be able to pull")
    }

    if (!req.body.isProjectOwner) {
        return res.status(400).json("You have to own project to grant access")
    }

    if (req.body.alreadyHasAccess) {
        return res.status(400).json("User already has access to project")
    }

    let userToAddId = req.body.user._id

    try {
        await Project.findByIdAndUpdate(req.body.project._id,
            { $push: { usersWithAccess: userToAddId} },
            {useFindAndModify: true })
        //return res.status(201).json("User granted access to project")
    } catch (err) {
        return res.status(500).json({err: "Error due to updating documentation"})
    }
    next();
}

exports.removeUserFromProject = async (req, res, next) => {

    if (!req.body.user) {
        return res.status(400).json("No user to be able to pull")
    }

    if (!req.body.project) {
        return res.status(400).json("No such project")
    }

    if (!req.body.alreadyHasAccess) {
        return res.status(400).json("User didn't had access to project")
    }

    let userToPullId = req.body.user._id

    try {
        await Project.findByIdAndUpdate(req.body.project._id,
            { $pull: { usersWithAccess: {$in: [userToPullId]}} },
            { multi: true })

    } catch (err) {
        console.log(err)
        return res.status(500).json("Error due to pulling user from project")
    }
    next();
}

exports.editProject = async (req, res) => {

    if (!req.body.project) {
        return res.status(400).json("No such project")
    }

    let projectUpdate = req.body.projectUpdate

    try {
        await Project.findByIdAndUpdate(req.body.project._id,
            { $set: projectUpdate })

        return res.status(201).json("Project edited")

    } catch (err) {
        console.log(err)
        return res.status(500).json("Error due to setting project as public")
    }
}

exports.checkIfUserAcceptedProject = async (req, res, next) => {

    if (!req.body.project) {
        return res.status(400).json("No such project")
    }

    if (!req.body.user) {
        return res.status(400).json("No such user")
    }

    if (req.body.project.usersThatAccepted.map(u=>u._id).includes(req.body.user._id)) {
        req.body.hasUserAccepted = true
    } else {
        req.body.hasUserAccepted = false
    }

    next();
}

exports.markProjectAsAcceptedBySingleUser = async (req, res, next) => {

    if (!req.body.project) {
        return res.status(400).json("No such project")
    }

    if (req.body.hasUserAccepted) {
        if (req.body.accepted)
            return res.status(200).json("Project already accepted")
        if (!req.body.accepted)
            try {
                await Project.findByIdAndUpdate(req.body.project._id,
                    { $pull: { usersThatAccepted: {$in: [req.user._id]}} },
                    { multi: true })
                next()

            } catch (err) {
                console.log(err)
                return res.status(500).json("Error due to pulling user from users that accepted")
            }

    }

    if (!req.body.hasUserAccepted) {
        if (req.body.accepted)
            try {
                await Project.findByIdAndUpdate(req.body.project._id,
                    { $push: { usersThatAccepted: req.user._id} },
                    {useFindAndModify: true })
                next();

            } catch (err) {
                console.log(err)
                return res.status(500).json("Error due to pulling user from users that accepted")
            }
        if (!req.body.accepted) {
            return res.status(200).json("Project is more unaccepted")
        }
    }
}

exports.checkIfProjectIsAccepted = async (req, res) => {

    if (!req.body.project) {
        return res.status(400).json("No such project")
    }

    if (req.body.project.usersWithAccess.length === req.body.project.usersThatAccepted.length) {
        try {
            await Project.findByIdAndUpdate(req.body.project._id,
                { $set: { isAccepted: true} })
            return res.status(200).json("Project accepted")

        } catch (err) {
            console.log(err)
            res.status(500).json(err)
        }

    } else {
        try {
            await Project.findByIdAndUpdate(req.body.project._id,
                { $set: { isAccepted: false} })
            return res.status(200).json("Project unaccepted")

        } catch (err) {
            console.log(err)
            res.status(500).json(err)
        }
        return res.status(200).json("Project unaccepted")
    }
}
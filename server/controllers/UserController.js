const User = require('../models/User');
const userRegistrationHandler = require('../security/Registeration');
const userAuth = require('../security/Authentication');
const jwt = require("jsonwebtoken");
require("dotenv").config()

exports.getAllUsers = async (req, res) => {

    try {
        let allUsers = await User.find({});
        res.status(200).json(allUsers);
    } catch (err) {
        console.log(err)
        res.status(500).json({err: "Error on server side"})
    }
}

exports.findUserById = async (req, res, next) => {

    const userId = req.body.userId || req.params.userId || req.user._id;
    let user;

    try {
        user = await User.findById(userId);
        //res.status(200).json(user);
    } catch (err) {
        res.status(404).json({err: "No such user"})
    }

    req.body.user = user;
    next();
}

exports.findUserByNameOrSurname = async (req, res, next) => {

    const userName= req.body.name;
    let users;

    try {
        if (userName.split(' ').length < 2) {
            users = await User.find({$or:
                    [
                        { firstName: { $regex: userName, $options: "i" } },
                        { lastName: { $regex: userName, $options: "i" } }
                    ]
            })

        } else {
            let firstName = userName.split(' ')[0]
            let surName = userName.split(' ')[1]
            users = await User.find({

                firstName: { $regex: userName, $options: "i" } , lastName: { $regex: userName, $options: "i" }

            })

        }

    } catch (err) {
        res.status(404).json({err: "No users found"})
    }

    if (users !== undefined)
        req.body.users = users;
    else
        req.body.users = [];

    next();

}

exports.findUserByEmail = async (req, res, next) => {

    const userEmail= req.body.email;
    let user;

    try {
        user = await User.findOne({email: userEmail})

    } catch (err) {
        res.status(404).json({err: "No user found"})
    }

    req.body.user = user;
    next();

}

exports.getUserDetails = (req, res) => {

    if(req.body.users) {

        let users = req.body.users;

        return res.status(200).json(users)

    }

    if(req.body.user) {

        let user = req.body.user;

        return res.status(200).json(user)

    }

}

exports.getUserAccessLevel = (req, res) => {

    if(!req.body.user) {

        return res.status(400).json("No such user")

    }

    if (req.body.user.accessedProjects.includes(req.body.projectId)) {
        return res.status(200).json("access")
    }
    if (req.body.user.ownedProjects.includes(req.body.projectId)) {
        return res.status(200).json("owner")
    }
    return res.status(200).json("deny")

}

exports.addProjectForOwner = async (req, res) => {

    if (!req.body.newProject) {
        return res.status(400).json("No such project")
    }

    try {
        await User.findByIdAndUpdate(req.user._id,
            { $push: { ownedProjects: req.body.newProject._id} },
            {useFindAndModify: true })
        return res.status(201).redirect('/user/projects/owned/'+req.body.newProject._id);
    } catch (err) {
        return res.status(500).json({err: "Error due to updating documentation"})
    }
}

exports.addProjectToAccessedProjects = async (req, res) => {

    if (!req.body.project) {
        return res.status(400).json("No such project")
    }

    try {
        console.log(req.body.user._id, req.body.project._id)
        await User.findByIdAndUpdate(req.body.user._id,
            { $push: { accessedProjects: req.body.project._id} },
            {useFindAndModify: true })
        return res.status(201).json("User granted access to project")
    } catch (err) {
        return res.status(500).json({err: "Error due to updating documentation"})
    }
}

exports.pullProjectFromAccessedProjects = async (req, res) => {

    if (!req.body.project) {
        return res.status(400).json("No such project")
    }

    try {
        console.log(req.body.user._id, req.body.project._id)
        await User.findByIdAndUpdate(req.body.user._id,
            { $pull: { accessedProjects: {$in: [req.body.project._id]}} },
            {useFindAndModify: true })
        return res.status(201).json("User denied access from project")
    } catch (err) {
        return res.status(500).json({err: "Error due to updating documentation"})
    }
}

exports.updateUser = async (req, res) => {

    let user = req.body.user;
    let updateForUser = req.body.update;
    let query = {}

    for (let key in updateForUser) {
        if (key === "password") {
            await userRegistrationHandler.updatePasswordForUser({_id: user._id, password: user.password})
            continue
        }

        if (updateForUser[key] !== user[key]) {
            query[key] = updateForUser[key];
        }
    }

    try {
        await User.findByIdAndUpdate(
            user._id,
            query,
            {useFindAndModify: true })
        res.status(201).json("User updated")
    } catch (err) {
        console.log(err)
        res.status(400).json(err)
    }
}

exports.deleteUserById = (req, res) => {

    if (req.body.user._id) {
        User.findByIdAndDelete(req.body.user._id)
        return res.status(204).json("User deleted")
    }

}

exports.registerNewUser = async (req, res) => {

    if (!req.body) {
        console.log("No data sent in request from client on path: /register")
        return res.status(500).json("Server problem")
    }
    console.log(req.body)
    let newUserData = req.body;

    if (await User.findOne({email: newUserData.email}) !== null ) {
        return res.status(400).json("Email already taken")
    }

    try {
        await userRegistrationHandler.encryptUser(newUserData)
        return res.status(201).redirect('/?m=' + encodeURIComponent('User successfully created, you can now log in'))
    } catch (err) {
        console.log(err)
        return res.status(500).json("Server error due to register")
    }
}

exports.login = async (req, res) => {

    let user = req.body; // body: {email, password}

    let userId;

    try {
        userId = await userAuth.checkUser(user);

    } catch (err) {
        console.log(err)
        return res.status(500).json("Server error due to login");

    }

    if (userId) {

        const accessToken = jwt.sign({ role: user.role, _id: userId }, process.env.JWT_SECRET);

        req.body.user = accessToken
        res.cookie("access-token", accessToken, {httpOnly: true})
        return res.status(200).redirect('/');

    } else {
        return res.status(400).json("Login or password are incorrect");
    }
}

exports.checkIfUserAlreadyHasAccessToProject = async (req, res, next) => {

    if (!req.body.user) {
        return res.status(500).json("No user to be able to pull")
    }

    if (!req.body.project) {
        return res.status(500).json("No such project")
    }

    let userAccessCheck;

    try {
        userAccessCheck = await User.findById(req.body.user._id)
    } catch (err) {
        return res.status(500).send("Server error, impossible to check if user is project owner");
    }

    let accessCheck = userAccessCheck.accessedProjects.filter(p => {return p.equals(req.body.project._id)})

    if (accessCheck.length > 0) {
        req.body.alreadyHasAccess = true
    } else {
        req.body.alreadyHasAccess = false
    }

    next();
}

exports.acceptProject = async (req, res, next) => {

    if (!req.body.project) {
        return res.status(400).json("No such project")
    }

    if (!req.body.alreadyHasAccess) {
        return res.status(400).json("User has no access")
    }

    let isAccepted = req.body.isAccepted

    if (isAccepted === true || isAccepted === "true") {
        req.body.accepted = true
    } else {
        req.body.accepted = false
    }

    next();
}

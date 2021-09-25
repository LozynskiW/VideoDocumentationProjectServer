require('dotenv').config();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require("jsonwebtoken");


exports.checkUser = async (user) => {

    let userFromDB = await User.findOne({email: user.email})

    if (userFromDB) {
        const match = await bcrypt.compare(user.password, userFromDB.password);

        if (match) {
            return userFromDB._id
        }
    }
    return false;
}

exports.userAuth = async (req, res, next) => {
    const token = req.body.user || req.query.token || req.headers["access-token"] || req.cookies["access-token"]

    if (!token) {
        return res.status(403).send("Log in to proceed");
    }
    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        const user = await jwt.decode(token)
        req.user = decoded;

    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    next();
}

exports.checkIfUserIsProjectOwner = async (req, res, next) => {

    let ownedProject;

    try {

        ownedProject = await User.find({ ownedProjects: {$in: [req.body.project._id]} })
    } catch (err) {
        return res.status(500).send("Server error, impossible to check if user is project owner");
    }

    if (ownedProject) {
        req.body.isProjectOwner = true
    } else {
        req.body.isProjectOwner = false
    }

    next();
}

exports.logout = (req, res) => {
    const token = req.body.user || req.query.token || req.headers["access-token"] || req.cookies["access-token"]

    if (!token) {
        return res.status(403).send("Can't logout");
    }

    res.cookie("access-token", token,
        {
            maxAge: 0,
            path:"/"
        }).redirect("/")

}
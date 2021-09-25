require('dotenv').config();
const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.encryptUser = async (newUserData) => {

    console.log(parseInt(process.env.SALT_ROUNDS))

    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS));

    const hashedPassword = await bcrypt.hash(newUserData.password, salt)

    console.log(hashedPassword)

    await User.create({

        password: hashedPassword,

        firstName: newUserData.firstName,

        secondName: newUserData.secondName,

        lastName: newUserData.lastName,

        email: newUserData.email,

        phoneNumber: newUserData.phoneNumber,

        languages: newUserData.languages,

        avatar: newUserData.avatar,

        job: newUserData.job,

    })

}

exports.updatePasswordForUser = async (user) => {

    bcrypt.genSalt(process.env.SALT_ROUNDS, function(err, salt) {

        bcrypt.hash(user.password, salt, function(err, hash) {

            User.findByIdAndUpdate(user._id, {
                password: hash
            })
        });
    })
}
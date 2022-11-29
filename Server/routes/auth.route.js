const express = require('express')
const router = express.Router()
const User = require('../models/user')
const middleware = require('../middleware')
const Article = require('../models/article')





router.post('/register', middleware.checkSecret, middleware.checkUser, (req, res) => {
    const user = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    }
    if (user.first_name && user.last_name && user.username && user.password && user.email) {
        const newUser = new User(user)
        newUser.save()
        .then(() => {
            res.send({
                success: true,
            })
        })
        .catch(err => {
            console.log(err)
            res.send({
                success: false,
                message: "Email Already Exists"
            })
        })
    }
    else{
        res.send({
            success: false
        })
    }
})

router.post('/login', middleware.checkSecret, async (req, res) => {
    const user = {
        username: req.body.username,
        password: req.body.password,
    }
    if (user.username && user.password) {
        const foundUser = await User.findOne({
            username: user.username,
        })
        if (foundUser){
            if (user.password === foundUser.password) {
                res.send({
                    success: true,
                    token: middleware.generateToken(foundUser),
                    username: foundUser.username
                })
            } else {
                res.send({
                    success: false,
                    message: "Password Mismatch"
                })
            }   
        }
        else{
            res.send({
                success: false,
                message: "User Not Found"
            })
        }
    }
    else{
        res.send({
            success: false,
            message: "Username or Password not provided"
        })
    }
})


router.post('/deleteuser', middleware.checkSecret, middleware.checkAdmin, (req, res) => {
    const user = {
        username: req.body.username,
        userToDelete: req.body.userToDelete
    }
    if (user.username) {
        User.deleteOne({
            username: user.userToDelete,
        })
        .then(result => {
            // console.log(result)
            console.log("User Deleted")
            res.send({
                success: true,
            })
        })
        .catch(err => {
            console.log(err)
            res.send({
                success: false,
            })
        })
    }
    else{
        res.send({
            success: false
        })
    }
})


router.post('/allUsers', middleware.checkSecret, middleware.checkAdmin, async (req, res) => {
    const info = {
        username: req.body.username,
        token: req.body.token
    }
    if (info.username){
        const foundUsers = await User.find();
        if (foundUsers){
            for (let i = 0;i < foundUsers.length;i++){
                if (foundUsers[i].username == ADMIN_USERNAME){
                    foundUsers.splice(i, 1)
                }
            }
            res.send({
                success: true,
                foundUsers
            })
        }
        else{
            res.send({
                success: false
            })
        }
    }
    else{
        res.send({
            success: false
        })
    }
})


router.post('/logout', middleware.checkSecret, middleware.checkSignIn, (req, res) => {
    res.send({
        success: true,
        message: "Logged Out"
    })
})



router.post('/changePassword', middleware.checkSecret, middleware.checkSignIn, (req, res) => {
    const user = {
        username: req.body.username,
        password: req.body.old_password,
        newPassword: req.body.password
    }
    // console.log(user)
    if (user.username && user.password && user.newPassword) {
        User.findOne({
            username: user.username,
        })
        .then(foundUser => {
            if (foundUser){
                if (user.password === foundUser.password) {
                    foundUser.password = user.newPassword
                    foundUser.save()
                    .then(() => {
                        res.send({
                            success: true,
                            message: "Password Changed",
                            foundUser: foundUser
                        })
                    })
                    .catch(err => {
                        console.log(err)
                        res.send({
                            success: false,
                            message: "Error Changing Password"
                        })
                    })
                }
                else{
                    res.send({
                        success: false,
                        message: "Password Mismatch"
                    })
                }
            }
            else{
                res.send({
                    success: false,
                    message: "User Not Found"
                })
            }
        })
        .catch(err => {
            console.log(err)
            res.send({
                success: false,
                message: "Error Changing Password"
            })
        })
    }
})


router.post('/getUser', middleware.checkSecret, middleware.checkSignIn, (req, res) => {
    const username = req.body.username
    if (username) {
        User.findOne({
            username: username,
        })
        .then(foundUser => {
            if (foundUser){
                res.send({
                    success: true,
                    foundUser
                })
            }
            else{
                res.send({
                    success: false,
                    message: "User Not Found"
                })
            }
        })
        .catch(err => {
            console.log(err)
            res.send({
                success: false,
                message: "Error Getting User"
            })
        })
    }
    else{
        res.send({
            success: false
        })
    }
})



router.post('/getUserProfile', middleware.checkSecret, (req, res) => {
    const user = req.body.user
    if (user) {
        User.findOne({
            username: user
        })
        .then(async (result) => {
            if (result){
                const articleCount = await Article.countDocuments({
                    username: user
                })
                res.send({
                    success: true,
                    user: {
                        username: result.username,
                        first_name: result.first_name,
                        last_name: result.last_name,
                        created_at: result.created_at,
                        articleCount: articleCount,
                        email: result.email
                    }
                })
            }
            else{
                res.send({
                    success: false
                })
            }
        })
        .catch(err => {
            res.send({
                success: false
            })
        })
    }
    else{
        res.send({
            success: false
        })
    }

})


module.exports = router

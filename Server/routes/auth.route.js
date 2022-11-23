const express = require('express')
const router = express.Router()
const User = require('../models/user')
const middleware = require('../middleware')





router.post('/register', middleware.checkUser, (req, res) => {
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

router.post('/login', async (req, res) => {
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


router.post('/deleteuser', middleware.checkAdmin, (req, res) => {
    const user = {
        username: req.body.username,
        userToDelete: req.body.userToDelete
    }
    if (user.username) {
        User.deleteOne({
            username: user.userToDelete,
        })
        .then(result => {
            console.log(result)
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


router.post('/allUsers', middleware.checkAdmin, async (req, res) => {
    const info = {
        username: req.body.username,
        token: req.body.token
    }
    if (info.username){
        const foundUsers = await User.find();
        if (foundUsers){
            for (let i = 0;i < foundUsers.length;i++){
                if (foundUsers[i].username == "thisisadmin"){
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


router.post('/logout', middleware.checkSignIn, (req, res) => {
    res.send({
        success: true,
        message: "Logged Out"
    })
})



// router.post('/updateuser', middleware.checkAdmin, (req, res) => {
//     const user = {
//         username: req.body.username,
//         userToUpdate: req.body.userToUpdate,
//         first_name: req.body.first_name,
//         last_name: req.body.last_name,
//         email: req.body.email,
//         password: req.body.password
//     }
// })


module.exports = router

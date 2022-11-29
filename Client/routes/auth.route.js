const express = require('express');
const router = express.Router();
const request  = require('request')
const dotenv = require('dotenv');


dotenv.config({ path: "../Server/utils/config.env" });
const backend = process.env.BACKEND_URL
const BACKEND_SECRET = process.env.BACKEND_SECRET
const ADMIN_USERNAME = process.env.ADMIN_USERNAME


router.get('/login', (req, res) => {
    res.render('auth/login', {userLoggedIn: req.cookies.username ? true : false, adminLoggedIn: req.cookies.username == ADMIN_USERNAME ? true : false})
})

router.post('/login', (req, res) => {
    var options = {
        url: `${backend}/auth/login`,
        method: 'post',
        body: {
            username: req.body.username,
            password: req.body.password,
            BACKEND_SECRET: BACKEND_SECRET
        },
        json: true
    }
    request(options, (err, response, body) => {
        if(body.success){
            res.clearCookie('username', {path : '/admin'})
            res.clearCookie('token', {path : '/admin'})
            res.cookie('token', body.token, {path: '/'})
            res.cookie('username', body.username, {path: '/'})
            if (body.username === ADMIN_USERNAME) {
                res.redirect('/admin/dashboard')
            }
            else{
                res.redirect('/user/dashboard')
            }
        }
        else{
            // console.log(body)
            if (body.message){
                res.render('error', {message: body.message})
            }
            else{
                res.status(404).render('404')
            }
        }
    })

})

router.get('/register', (req, res) => {
    res.render('auth/register', {userLoggedIn: req.cookies.username ? true : false, adminLoggedIn: req.cookies.username == ADMIN_USERNAME ? true : false})
})

router.post('/register', (req, res) => {
    if (req.body.password === req.body.re_password){
        var options = {
            url: `${backend}/auth/register`,
            method: 'post',
            body: {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                username: req.body.username,
                password: req.body.password,
                email: req.body.email,
                BACKEND_SECRET: BACKEND_SECRET
            },
            json: true
        }
        request(options, (err, response, body) => {
            if(body.success){
                res.redirect('/auth/login')
            }
            else{
                res.render('error', {message: body.message})
            }
        })
    }
})

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.clearCookie('username');
    res.redirect('/');    
})

router.post('/changePassword', (req, res) => {
    var options = {
        url: `${backend}/auth/changePassword`,
        method: 'post',
        body: {
            username: req.cookies.username,
            token: req.cookies.token,
            old_password: req.body.old_password,
            password: req.body.new_password,
            BACKEND_SECRET: BACKEND_SECRET
        },
        json: true
    }
    if (options.body.username && options.body.old_password && options.body.password){
        request(options, (err, response, body) => {
            if (body.success){
                res.render('user/profile', {message: "Password Changed Successfully", first_name: body.foundUser.first_name, last_name: body.foundUser.last_name, email: body.foundUser.email, username: body.foundUser.username, userLoggedIn: req.cookies.username ? true : false, adminLoggedIn: req.cookies.username == ADMIN_USERNAME ? true : false})
            }
            else{
                res.render('error', {message: body.message})
            }
        })
    }
    else{
        res.render('error', {message: "Invalid Request"})
    }
})





module.exports = router;
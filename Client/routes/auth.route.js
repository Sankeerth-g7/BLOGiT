const express = require('express');
const router = express.Router();
const request  = require('request')
const dotenv = require('dotenv');


dotenv.config({ path: "../Server/utils/config.env" });
const backend = process.env.BACKEND_URL
const BACKEND_SECRET = process.env.BACKEND_SECRET


router.get('/login', (req, res) => {
    res.render('auth/login')
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
            if (body.username === 'thisisadmin') {
                res.redirect('/admin/dashboard')
            }
            else{
                res.redirect('/user/dashboard')
            }
        }
        else{
            // console.log(body)
            if (body.message){
                res.render('Error', {message: body.message})
            }
            else{
                res.status(404).render('404')
            }
        }
    })

})

router.get('/register', (req, res) => {
    res.render('auth/register')
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
    var options = {
        url: `${backend}/auth/logout`,
        method: 'post',
        body: {
            username: req.cookies.username,
            token: req.cookies.token,
            BACKEND_SECRET: BACKEND_SECRET
        },
        json: true
    }
    // console.log(options.body.username, options.body.token);
    if (options.body.username && options.body.token){
        request(options, (err, response, body) => {
            if (body.success){
                // console.log("Clearing Cookies");
                res.clearCookie('token');
                res.clearCookie('username');
                res.redirect('/');
            }
        })
    }
    else{
        res.redirect('/')
    }
    
})




module.exports = router;
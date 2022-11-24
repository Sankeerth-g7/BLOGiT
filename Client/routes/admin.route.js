const express = require('express');
const router = express.Router();
const request  = require('request')
const dotenv = require('dotenv');


dotenv.config({ path: "../Server/utils/config.env" });
const backend = process.env.BACKEND_URL
const BACKEND_SECRET = process.env.BACKEND_SECRET


router.get('/dashboard', (req, res) => {
    let options = {
        url: `${backend}/article/getCount`,
        method: 'post',
        body: {
            username: req.cookies.username,
            token: req.cookies.token,
            BACKEND_SECRET: BACKEND_SECRET
        },
        json: true,
    }
    // console.log(options)
    request(options, (err, response, body) => {
        if (body && body.success){
            res.render('admin/dashboard', {userCount: body.userCount, articleCount: body.articleCount})
        }
        else{
            res.redirect('404')
        }
    })
})




router.get('/allBlogs', (req, res) => {
    let options = {
        url: `${backend}/article/getAllArticles`,
        method: 'post',
        body: {
            username: req.cookies.username,
            token: req.cookies.token,
            BACKEND_SECRET: BACKEND_SECRET
        },
        json: true
    }
    request(options, (err, response, body) => {
        if (body.success) {
            var articles = Array()
            for (var i = 0; i < body.foundArticles.length; i++){
                articles.push(body.foundArticles[i])
            }
            articles.sort((o) => { return o.date })
            articles.reverse()
            res.render('admin/allblogs', {articles: articles})
        }
        else{
            res.status(404).render(404)
        }
    })

})

router.get('/users', (req, res) => {
    let options = {
        url: `${backend}/auth/allUsers`,
        method: 'post',
        body: {
            username: req.cookies.username,
            token: req.cookies.token,
            BACKEND_SECRET: BACKEND_SECRET
        },
        json: true
    }
    request(options, (err, response, body) => {
        if (body.success){
        res.render('admin/users', {users: body.foundUsers})
        }
        else{
            res.redirect('/auth/login')
        }
    })    
})

router.get('/blogs', (req, res) => {
    let options = {
        url: `${backend}/article/getUserArticles`,
        method: 'post',
        body: {
            username: req.cookies.username,
            token: req.cookies.token,
            BACKEND_SECRET: BACKEND_SECRET
        },
        json: true
    }
    request(options, (err, response, body) => {
        if (body.success){
            var articles = Array()
            for (var i = 0; i < body.foundArticles.length; i++){
                articles.push(body.foundArticles[i])
            }
            articles.sort((o) => { return o.date })
            articles.reverse()
            // console.log(articles)
            res.render('admin/blogs', {articles: articles})
        }
        else{
            res.redirect('401')
        }
    })
})

router.get('*', (req, res) => {
    res.redirect('/admin/dashboard')
})

router.post('/deleteUser', (req, res) => {
    let options = {
        url: `${backend}/auth/deleteUser`,
        method: 'post',
        body: {
            username: req.cookies.username,
            token: req.cookies.token,
            userToDelete: req.body.userToDelete,
            BACKEND_SECRET: BACKEND_SECRET
        },
        json: true
    }
    request(options, (err, response, body) => {
        if (body.success){
            res.redirect('/admin/users')
        }
        else{
            res.redirect('/auth/login')
        }
    })
})



module.exports = router;
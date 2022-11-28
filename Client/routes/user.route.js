const express = require('express');
const router = express.Router();
const request  = require('request')
const createDomPurify = require('dompurify')
const { JSDOM } = require('jsdom')
const dompurify = createDomPurify(new JSDOM().window)
const { marked } = require('marked')
const dotenv = require('dotenv');




dotenv.config({ path: "../Server/utils/config.env" });


const backend = process.env.BACKEND_URL
const BACKEND_SECRET = process.env.BACKEND_SECRET
const ADMIN_USERNAME = process.env.ADMIN_USERNAME



router.get('/dashboard', (req, res) => {
    let options = {
        url: `${backend}/article/getCountUser`,
        method: 'post',
        body: {
            username: req.cookies.username,
            token: req.cookies.token,
            BACKEND_SECRET: BACKEND_SECRET
        },
        json: true
    }
    request(options, (err, response, body) => {
        if (body && body.success){
            res.render('user/dashboard', {count: body.articleCount, userLoggedIn: req.cookies.username ? true : false, adminLoggedIn: req.cookies.username == ADMIN_USERNAME ? true : false})
        }
        else{
            res.redirect('/auth/login')
        }
    })
})
router.get('/newArticle', (req, res) => {
    res.render('user/newArticle', {userLoggedIn: req.cookies.username ? true : false, adminLoggedIn: req.cookies.username == ADMIN_USERNAME ? true : false})
})


router.post('/newArticle', (req, res) => {
    var options = {
        url: `${backend}/article/newArticle`,
        method: 'post',
        body: {
            title: req.body.title,
            content: req.body.content,
            desc: req.body.desc,
            username: req.cookies.username,
            token: req.cookies.token,
            BACKEND_SECRET: BACKEND_SECRET
        },
        json: true
    }
    // console.log(options)
    request(options, (err, response, body) => {
        // console.log(body)
        if (body && body.success){
            if (req.cookies.username === ADMIN_USERNAME){
                res.redirect('/admin/blogs')
            }else{
                res.redirect('/user/blogs')
            }
        }
        else{
            res.status(404).render('404')
        }
    })
})

router.get('/blogs', (req, res) => {
    var options = {
        url: `${backend}/article/getUserArticles`,
        method: "post",
        body: {
            username: req.cookies.username,
            token: req.cookies.token,
            BACKEND_SECRET: BACKEND_SECRET
        },
        json: true
    }
    // console.log(options)
    request(options, (err, response, body) => {
        // console.log(body)
        if (body && body.success){
            var articles = Array()
            for (var i = 0; i < body.foundArticles.length; i++){
                articles.push(body.foundArticles[i])
            }
            articles.sort((o) => { return o.date })
            articles.reverse()
            res.render('user/blogs', {articles: articles, canEdit: true, userLoggedIn: req.cookies.username ? true : false, adminLoggedIn: req.cookies.username == ADMIN_USERNAME ? true : false})
        }
        else if(body.message == "No Articles To Display"){
            res.render('user/blogs', {articles: [], canEdit: true, userLoggedIn: req.cookies.username ? true : false, adminLoggedIn: req.cookies.username == ADMIN_USERNAME ? true : false})
        }
        else{
            res.status(404).render('404')
        }
    })
})


router.get('/profile', (req, res) => {
    const options = {
        url: `${backend}/auth/getUser`,
        method: 'post',
        body: {
            username: req.cookies.username,
            token: req.cookies.token,
            BACKEND_SECRET: BACKEND_SECRET
        },
        json: true
    }
    request(options, (err, response, body) => {
        // console.log(body)
        if (body && body.success){
            res.render('user/profile', {message: "", first_name: body.foundUser.first_name, last_name: body.foundUser.last_name, email: body.foundUser.email, username: body.foundUser.username, userLoggedIn: req.cookies.username ? true : false, adminLoggedIn: req.cookies.username == ADMIN_USERNAME ? true : false})
        }
        else{
            res.render('error', {message: body.message || "Something Went Wrong"})
        }
    })
    // res.render('user/profile', {message: "", first_name: req.cookies.first_name, last_name: req.cookies.last_name, email: req.cookies.email})
})

router.get('/editArticle/:slug', (req, res) => {
    var options = {
        url: `${backend}/article/getArticle`,
        method: 'post',
        body: {
            slug: req.params.slug,
            username: req.cookies.username,
            token: req.cookies.token,
            BACKEND_SECRET: BACKEND_SECRET
        },
        json: true
    }
    request(options, (err, response, body) => {
        // console.log(body)
        if (body && body.success){
            var markdown = (text) => {
            return dompurify.sanitize(marked(text))
            }
            res.render('user/articleEdit', {article: body.result, markdown: markdown, userLoggedIn: req.cookies.username ? true : false, adminLoggedIn: req.cookies.username == ADMIN_USERNAME ? true : false})
        }
        else{
            res.status(404).render('404')
        }
    })
})



router.post('/editArticle', (req, res) => {
    var options = {
        url: `${backend}/article/editArticle`,
        method: 'post',
        body: {
            title: req.body.title,
            content: req.body.content,
            slug: req.body.slug,
            desc: req.body.desc,
            username: req.cookies.username,
            token: req.cookies.token,
            BACKEND_SECRET: BACKEND_SECRET
        },
        json: true
    }
    request(options, (err, response, body) => {
        if (body && body.success){
            if (req.cookies.username === ADMIN_USERNAME){
                res.redirect('/admin/blogs')
            }else{
                res.redirect('/user/blogs')
            }
        }
        else{
            res.status(404).render('404')
        }
    })
})



router.get('/deleteArticle/:slug', (req, res) => {
    var options = {
        url: `${backend}/article/deleteArticle`,
        method: 'post',
        body: {
            slug: req.params.slug,
            username: req.cookies.username,
            token: req.cookies.token,
            BACKEND_SECRET: BACKEND_SECRET
        },
        json: true
    }
    // console.log(options)
    request(options, (err, response, body) => {
        // console.log(body)
        if (body && body.success){
            if (req.cookies.username === ADMIN_USERNAME){
                res.redirect('/admin/allblogs')
            }else{
            res.redirect('/user/blogs')
            }
        }
        else{
            res.render('404')
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
            res.render('user/allBlogs', {articles: articles, canEdit: false, userLoggedIn: req.cookies.username ? true : false, adminLoggedIn: req.cookies.username == ADMIN_USERNAME ? true : false})
        }
        else{
            res.status(404).render(404)
        }
    })
})



router.get('*', (req, res) => {
    res.redirect('/user/dashboard')
})

module.exports = router;
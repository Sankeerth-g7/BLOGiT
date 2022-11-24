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


router.get('/dashboard', (req, res) => {
    res.render('user/dashboard')
})

router.get('/newArticle', (req, res) => {
    res.render('user/newArticle')
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
        if (body.success){
            if (req.cookies.username === 'thisisadmin'){
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
        if (body.success){
            var articles = Array()
            for (var i = 0; i < body.foundArticles.length; i++){
                articles.push(body.foundArticles[i])
            }
            articles.sort((o) => { return o.date })
            articles.reverse()
            res.render('user/blogs', {articles: articles})
        }
        else if(body.message == "No Articles To Display"){
            res.render('user/blogs', {articles: []})
        }
        else{
            res.status(404).render('401')
        }
    })
})


router.get('/profile', (req, res) => {
    res.render('user/profile')
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
        if (body.success){
            var markdown = (text) => {
            return dompurify.sanitize(marked(text))
            }
            res.render('user/articleEdit', {article: body.result, markdown: markdown})
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
        if (body.success){
            if (req.cookies.username === 'thisisadmin'){
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
        console.log(body)
        if (body.success){
            if (req.cookies.username === 'thisisadmin'){
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


router.get('*', (req, res) => {
    res.redirect('/user/dashboard')
})

module.exports = router;
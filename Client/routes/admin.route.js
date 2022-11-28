const express = require('express');
const router = express.Router();
const request  = require('request')
const dotenv = require('dotenv');


dotenv.config({ path: "../Server/utils/config.env" });
const backend = process.env.BACKEND_URL
const BACKEND_SECRET = process.env.BACKEND_SECRET
const ADMIN_USERNAME = process.env.ADMIN_USERNAME


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
        // console.log(body, err)
        if (body && body.success){
            res.render('admin/dashboard', {userCount: body.userCount, articleCount: body.articleCount, userLoggedIn: req.cookies.username ? true : false, adminLoggedIn: req.cookies.username == ADMIN_USERNAME ? true : false})
        }
        else{
            res.status(404).render('404')
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
            res.render('admin/allBlogs', {articles: articles, userLoggedIn: req.cookies.username ? true : false, adminLoggedIn: req.cookies.username == ADMIN_USERNAME ? true : false})
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
        res.render('admin/users', {users: body.foundUsers, userLoggedIn: req.cookies.username ? true : false, adminLoggedIn: req.cookies.username == ADMIN_USERNAME ? true : false})
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
            res.render('admin/blogs', {articles: articles, userLoggedIn: req.cookies.username ? true : false, adminLoggedIn: req.cookies.username == ADMIN_USERNAME ? true : false})
        }
        else{
            res.redirect('401')
        }
    })
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

router.get('/newArticle', (req, res) => {
    res.render('admin/newArticle', {userLoggedIn: req.cookies.username ? true : false, adminLoggedIn: req.cookies.username == ADMIN_USERNAME ? true : false})
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
            res.render('admin/articleEdit', {article: body.result, markdown: markdown, userLoggedIn: req.cookies.username ? true : false, adminLoggedIn: req.cookies.username == ADMIN_USERNAME ? true : false})
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

router.get('*', (req, res) => {
    res.redirect('/admin/dashboard')
})



module.exports = router;
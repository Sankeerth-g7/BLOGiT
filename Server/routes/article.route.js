const express = require('express');
const router = express.Router();
const Article = require('../models/article');
const User = require('../models/user');
const middleware = require('../middleware');




router.post('/newArticle', middleware.checkSecret, middleware.checkSignIn, middleware.checkArticle, (req, res) => {
    const article = {
        title: req.body.title,
        desc: req.body.desc,
        content: req.body.content,
        username: req.body.username,
    }
    // console.log(article)
    if (article.title && article.content && article.username) {
        const newArticle = new Article(article)
        newArticle.save()
        .then(result => {
            console.log("Creating an article")
            res.send({
                success: true,
                result: result
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


router.post('/editArticle', middleware.checkSecret, middleware.checkSignIn, (req, res) => {
    const info = {
        title: req.body.title,
        desc: req.body.desc,
        content: req.body.content,
        username: req.body.username,
    }
    if (info.username && info.title){
        Article.findOneAndUpdate({
            username: info.username,
            title: info.title
        },{
            title: info.title,
            desc: info.desc,
            content: info.content,
            sanitizedHtml: middleware.changeMarkdown(info.content)
        }, { new: true })
        .then(result => {
            console.log("Editing article")
            res.send({
                success: true,
                result
            })
        })
        .catch(err => {
            console.log(err)
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

router.post('/deleteArticle', middleware.checkSecret, middleware.checkSignIn, (req, res) => {
    const article = {
        slug: req.body.slug,
        username: req.body.username,
    }
    // console.log(article)
    if (article.slug && article.username) {
        Article.findOneAndDelete({
            slug: article.slug,
        })
        .then(result => {
            console.log("Deleting an article")
            res.send({
                success: true,
                result: result
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



router.post('/getArticle', middleware.checkSecret, async (req, res) => {
    const article = {
        slug: req.body.slug,
    }
    // console.log(article)
    if (article.slug) {
        const foundArticle = await Article.findOne({
            slug: article.slug
        })
        // console.log(foundArticle)
        if (foundArticle){
            res.send({
                success: true,
                result: foundArticle
            })
        } else {
            // console.log("Article not found")
            res.send({
                success: false,
            })
        }
    }
    else{
        res.send({
            success: false
        })
    }
})




router.post('/addLike', middleware.checkSecret, middleware.checkSignIn, async (req, res) => {
    const article = {
        title: req.body.title,
        username: req.body.username,
    }
    if (article.title && article.username) {
        const foundArticle = await Article.findOne({
            title: article.title
        })
        if (foundArticle) {
            console.log("Adding a like")
            foundArticle.likes += 1
            foundArticle.save()
            .then(result => {
                res.send({
                    success: true,
                    result: result
                })
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
    }
    else{
        res.send({
            success: false
        })
    }
})


router.post('/addComment', middleware.checkSecret, middleware.checkSignIn, async (req, res) => {
    const info = {
        title: req.body.title,
        username: req.body.username,
        comment: req.body.comment,
        user: req.body.user
    }
    if (info.title && info.username) {
        const foundArticle = await Article.findOne({
            username: info.username,
            title: info.title
        })
        if (foundArticle) {
            console.log("Adding a comment")
            foundArticle.comments.push({
                comment: info.comment,
                user: info.user
            })
            foundArticle.save()
            .then(result => {
                res.send({
                    success: true,
                    result: result
                })
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
    }
    else{
        res.send({
            success: false
        })
    }
})



router.post('/getComments', middleware.checkSecret, async (req, res) => {
    const info = {
        username: req.body.username,
        title: req.body.title,
    }
    // console.log(info)
    if (info.username && info.title){
        const foundArticle = await Article.findOne({
            username: info.username,
            title: info.title
        })
        // console.log(foundArticle)
        if (foundArticle){
            res.send({
                comments: foundArticle.comments
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

router.post('/getAllArticles', middleware.checkSecret, async (req, res) => {
    const foundArticles = await Article.find();
    console.log("Getting all articles")
    if (foundArticles){
        res.send({
            success: true,
            foundArticles
        })
    }
    else{
        res.send({
            success: false,
            message: "No Articles To Display"
        })
    }
})

router.post('/getUserArticles', middleware.checkSecret, middleware.checkSignIn, async (req, res) => {
    const info = {
        username: req.body.username
    }
    if (info.username){
        const foundArticles = await Article.find({
            username: info.username
        })
        if (foundArticles){
            res.send({
                success: true,
                foundArticles
            })
        }
        else{
            res.send({
                success: false,
                message: "No Articles To Display"
            })
        }
    }
    else{
        res.send({
            success: false,
            message: "Username not provided"
        })
    }
})

router.post('/getLikes', middleware.checkSecret, (req, res) => {
    const info = {
        username: req.body.username,
        title: req.body.title
    }
    if (info.username && info.title){
        Article.findOne({
            username: info.username,
            title: info.title
        })
        .then(result => {
            res.send({
                success: true,
                likes: result.likes
            })
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


router.post('/getCount', middleware.checkSecret, middleware.checkAdmin, (req, res) => {
    // console.log("Getting count")
    const userCount = User.countDocuments()
    const articleCount = Article.countDocuments()
    Promise.all([userCount, articleCount])
    .then(result => {
        res.send({
            success: true,
            userCount: result[0],
            articleCount: result[1]
        })
    })
    .catch(err => {
        res.send({
            success: false
        })
    })
})



router.post('/getCountUser', middleware.checkSecret, middleware.checkSignIn, (req, res) => {
    Article.countDocuments({
        username: req.body.username
    })
    .then(result => {
        res.send({
            success: true,
            articleCount: result > 0 ? result : 0
        })  
    })
    .catch(err => {
        res.send({
            success: false
        })
    })
    
})



module.exports = router;
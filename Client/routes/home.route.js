const express = require('express');
const router = express.Router();
const request  = require('request')
const dotenv = require('dotenv');



dotenv.config({ path: "../Server/utils/config.env" });

const backend = process.env.BACKEND_URL
const BACKEND_SECRET = process.env.BACKEND_SECRET
const ADMIN_USERNAME = process.env.ADMIN_USERNAME




router.get('/', (req, res) => {
    res.render('home/index', { userLoggedIn: req.cookies.username ? true : false, adminLoggedIn: req.cookies.username == ADMIN_USERNAME ? true : false});
})

router.get('/blogs', (req, res) => {
    let options = {
        url: `${backend}/article/getAllArticles`,
        method: 'post',
        body: {
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
            // res.send(articles)
            res.render('home/blogs', {articles: articles, userLoggedIn: req.cookies.username ? true : false, adminLoggedIn: req.cookies.username == ADMIN_USERNAME ? true : false})
        }
        else{
            res.status(404).render(404)
        }
    })

})


router.get('/about', (req, res) => {
    res.render('home/about', {userLoggedIn: req.cookies.username ? true : false, adminLoggedIn: req.cookies.username == ADMIN_USERNAME ? true : false})
})


module.exports = router;
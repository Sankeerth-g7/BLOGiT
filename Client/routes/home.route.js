const express = require('express');
const router = express.Router();
const request  = require('request')
const dotenv = require('dotenv');



dotenv.config({ path: "../Server/utils/config.env" });

const backend = process.env.BACKEND_URL
router.get('/', (req, res) => {
    res.render('home/index');
})

router.get('/blogs', (req, res) => {
    let options = {
        url: `${backend}/article/getAllArticles`,
        method: 'post',
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
            res.render('home/blogs', {articles: articles})
        }
        else{
            res.status(404).render(404)
        }
    })

})


router.get('/about', (req, res) => {
    res.render('home/about')
})

module.exports = router;
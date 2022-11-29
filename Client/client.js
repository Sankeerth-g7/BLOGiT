const express = require('express');
const authRouter = require('./routes/auth.route');
const homeRouter = require('./routes/home.route');
const userRouter = require('./routes/user.route');
const adminRouter = require('./routes/admin.route');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const request = require('request')
const dotenv = require('dotenv');
const path = require('path')

dotenv.config({ path: "../Server/utils/config.env" });
const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(cookieParser());


const backend = process.env.BACKEND_URL
const BACKEND_SECRET = process.env.BACKEND_SECRET
const ADMIN_USERNAME = process.env.ADMIN_USERNAME

app.get('/blog/:slug', (req, res) => {
    let options = {
        url: `${backend}/article/getArticle`,
        method: 'post',
        body: {
            username: req.cookies.username,
            slug: req.params.slug,
            BACKEND_SECRET: BACKEND_SECRET
        },
        json: true
    }
    request(options, (err, response, body) => {
        if (body.success) {
            body.result.created_at = new Date(body.result.created_at).toLocaleDateString()
            res.status(200).render('blog', {article: body.result, username: req.cookies.username, userLoggedIn: req.cookies.username ? true : false, adminLoggedIn: req.cookies.username == ADMIN_USERNAME ? true : false})
        }
        else{
            res.render('404')
        }
    })
})


app.get('/:user', (req, res) => {
    let options = {
        url: `${backend}/auth/getUserProfile`,
        method: 'post',
        body: {
            username: req.cookies.username,
            user: req.params.user,
            BACKEND_SECRET: BACKEND_SECRET
        },
        json: true
    }
    request(options, (err, response, body) => {
        if (body && body.success){  
            body.user.created_at = new Date(body.user.created_at).toLocaleDateString()
            res.render('profile', {user: body.user, userLoggedIn: req.cookies.username ? true : false, adminLoggedIn: req.cookies.username == ADMIN_USERNAME ? true : false})
        }
        else{
            res.status(404).render('404')
        }
    })
})


app.use('/auth', authRouter);
app.use('/', homeRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.listen(process.env.PORT || process.env.FRONTEND_PORT || 3000, () => console.log(`Listening on port ${process.env.PORT || process.env.FRONTEND_PORT || 3000}`));
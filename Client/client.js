const express = require('express');
const authRouter = require('./routes/auth.route');
const homeRouter = require('./routes/home.route');
const userRouter = require('./routes/user.route');
const adminRouter = require('./routes/admin.route');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const request = require('request')
const dotenv = require('dotenv');


dotenv.config({ path: "../Server/utils/config.env" });
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(cookieParser());


const backend = process.env.BACKEND_URL

app.get('/blog/:slug', (req, res) => {
    let options = {
        url: `${backend}/article/getArticle`,
        method: 'post',
        body: {
            username: req.cookies.username,
            slug: req.params.slug
        },
        json: true
    }
    request(options, (err, response, body) => {
        if (body.success) {
            body.result.created_at = new Date(body.result.created_at).toLocaleDateString()
            res.status(200).render('blog', {article: body.result, username: req.cookies.username})
        }
        else{
            res.render('blog')
        }
    })
})



app.use('/auth', authRouter);
app.use('/', homeRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.listen(process.env.PORT || 3000, () => console.log('Listening on port 3201'));
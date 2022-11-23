const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const authRouter = require('./routes/auth.route')
const articleRouter = require('./routes/article.route')
const dotenv = require('dotenv');



dotenv.config({ path: "./utils/config.env" });
const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json());

const DATABASE_URI = process.env.DATABASE_URI
// console.log(DATABASE_URI)
const PORT = process.env.PORT || 5002



mongoose.connect(DATABASE_URI, {
  useNewUrlParser: true, useUnifiedTopology: true
})

app.use('/auth', authRouter)
app.use('/article', articleRouter)
app.listen(PORT, () => {
    console.log("Listening at port 5002")
})
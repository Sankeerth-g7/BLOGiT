const jwt = require("jsonwebtoken");
const createDomPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const dompurify = createDomPurify(new JSDOM().window);
const { marked } = require("marked");
const User = require("./models/user");
const Article = require("./models/article");
const dotenv = require('dotenv')


dotenv.config({ path: "./utils/config.env" });

JWT_SECRET = process.env.JWT_SECRET
BACKEND_SECRET = process.env.BACKEND_SECRET;
ADMIN_USERNAME = process.env.ADMIN_USERNAME

exports.generateToken = (user) => {
  const token = jwt.sign(
    {
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  return token;
};

exports.checkUser = async (req, res, next) => {
  const user = await User.findOne({
    username: req.body.username,
  });
  if (user) {
    res.send({
      success: false,
      message: "Username Already Exists",
    });
  } else {
    next();
  }
};


exports.checkSecret = (req, res, next) => {
  const secret = req.body.BACKEND_SECRET;
  if (secret === process.env.BACKEND_SECRET) {
    next();
  }
  else{
    res.send({
      succes: false,
      message: "You are not authorized to access this route"
    })
  }
}



exports.checkAdmin = (req, res, next) => {
  const token = req.body.token;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.username === ADMIN_USERNAME) {
      next();
    } else {
      res.send({
        success: false,
        auth: false
      });
    }
  } catch (err) {
    // console.log(err)
    res.send({
      success: false,
      auth: false
    });
  }
};

exports.checkSignIn = (req, res, next) => {
  const token = req.body.token;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.username || decoded.username === ADMIN_USERNAME) {
      next();
    } else {
      console.log('Auth Failed')
      res.send({
        success: false,
        auth: false
      });
    }
  } catch (err) {
    res.send({
      success: false,
      auth: false
    });
  }
};

exports.checkArticle = async (req, res, next) => {
  const info = {
    username: req.body.username,
    title: req.body.title,
  };
  const foundArticle = await Article.findOne({
    username: info.username,
    title: info.title,
  });
  if (foundArticle) {
    res.send({
      success: false,
      auth: false
    });
  } else {
    next();
  }
};

exports.changeMarkdown = (content) => {
  let clean = dompurify.sanitize(marked(content));
  clean = clean.replaceAll('\n', '<br>')
  return clean;
};

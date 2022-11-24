const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify');
const createDomPurify = require('dompurify')
const { JSDOM } = require('jsdom')
const dompurify = createDomPurify(new JSDOM().window)
const { marked } = require('marked')

const articleSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        required: false,
    },
    content: {
        type: String,
        required: true,
    },
    sanitizedHtml: {
        type: String,
        required: true,
    },
    comments: {
        type: Array,
        required: false,
    },
    likes: {
        type: Number,
        required: false,
        default: 0
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});


articleSchema.pre('validate', function(next) {
    if (this.title) {
      this.slug = slugify(this.title, { lower: true, strict: true })
    }
  
    if (this.content) {
      this.sanitizedHtml = dompurify.sanitize(marked(this.content).replaceAll('\n', '<br>'))
    }
    next()
  })

module.exports = mongoose.model('Article', articleSchema);
const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);



const staticPageSchema = mongoose.Schema({
    title: {
        type: String,
        minlength: '3',
        maxlength: '100',
        required: 'Title is required.'
    },
    pageContent: {
        type: String,
        minlength: 1,
        maxlength: 100000,
        required: 'Page Content is required.'
    }
})

const StaticPage = mongoose.model('StaticPage', staticPageSchema);


function validateStaticPage(staticPage){
    const schema = {
        title: Joi.string().min(3).max(100).required(),
        pageContent: Joi.string().min(1).max(100000).required(),
    }
    return Joi.validate(staticPage, schema);
}

module.exports = {StaticPage, validateStaticPage}
const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);


const companySchema = mongoose.Schema({
    logo: {
        type: String,
        required: 'Logo is required.'
    },
    bannerImage: {
        type: String,
        minlength: 2,
        maxlength: 1000
    },
    name:{
        type: String,
        minlength: 2,
        maxlength: 50,
        required: 'Company name is required'
    },
    description:{
        type: String,
        minlength: 3,
        maxlength: 2000
    },
    verified: {
        type: Boolean,
        default: true
    },
    active: {
        type: Boolean,
        default: true
    }
})


const Company = mongoose.model('Company', companySchema);

const companySchemaValidator = {
    _id: Joi.ObjectId(),
    logo: Joi.string().required(),
    bannerImage: Joi.string().min(2).max(100),
    name: Joi.string().min(2).max(50).required(),
    description: Joi.string().min(3).max(2000),
    active: Joi.boolean()
}

function validateCompany(company){
    return Joi.validate(company, companySchemaValidator);
}

module.exports = {Company, validateCompany}
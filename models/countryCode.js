const mongoose = require("mongoose");
const Joi = require("joi");
const validator = require("validator");
Joi.objectId = require("joi-objectid")(Joi);

const countryCodeSchema = new mongoose.Schema({
    code: {
      type: String,
      required: true,
    },
    countryName: {
      type: String,
      minlength: 1,
      maxlength: 100
    },
})

const CountryCode = mongoose.model('CountryCode', countryCodeSchema);

const countryCodeSchemaValidator = {
    code: Joi.string().required(),
    countryName: Joi.string().min(1).max(100),
}

function validateCountryCode(countryCode){
    return Joi.validate(countryCode, countryCodeSchemaValidator)
}

module.exports = {
    CountryCode,
    validateCountryCode
}
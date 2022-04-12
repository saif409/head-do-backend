const mongoose = require("mongoose");
const Joi = require("joi");
const validator = require("validator");
Joi.objectId = require("joi-objectid")(Joi);

const citySchema = new mongoose.Schema({
    cityName: {
      type: String,
      minlength: 1,
      maxlength: 100,
      required: true,
    },
    description: {
      type: String,
      minlength: 1,
      maxlength: 2000
    },
})

const City = mongoose.model('City', citySchema);

const citySchemaValidator = {
    cityName: Joi.string().min(1).max(100).required(),
    description: Joi.string().min(1).max(2000),
}

function validateCity(city){
    return Joi.validate(city, citySchemaValidator)
}

module.exports = {
    City,
    validateCity
}
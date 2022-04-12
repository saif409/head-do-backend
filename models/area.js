const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const areaSchema = new mongoose.Schema({
    areaName: {
        type: String,
        minlength: 3,   
        maxlength: 500,
        required: true
    },
    district: {
        type: String,
        minlength: 3,
        maxlength: 500,
        required: true
    },
    deliveryCharge: {
        type: Number,
        default: 40
    }
},
{
    timestamps: true
});

const Area = mongoose.model('Area', areaSchema);

const areaSchemaValidator = {
    areaName: Joi.string().min(3).max(500).required(),
    district: Joi.string().min(3).max(500).required(),
    deliveryCharge: Joi.number().required()
}

function validateArea(area){
    return Joi.validate(area, areaSchemaValidator);

}
module.exports = {
    Area,
    validateArea
}
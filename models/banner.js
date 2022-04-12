const mongoose = require("mongoose");
const Joi = require("joi");
Joi.ObjectId = require("joi-objectid")(Joi);


const bannerSchema = mongoose.Schema({
    image: {
        type: String,
        required: 'image is required.'
    },
    url: {
        type: String,
        minlength: 5,
        maxlength: 500
    },
    bannerType: {
        type: String,
        minlength: 2,
        maxlength: 20
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProviderInfo'
    },
    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    }],
    position: {
        type: Number,
        min: 0
    },
    active: {
        type: Boolean,
        default: true
    }
})


const Banner = mongoose.model('Banner', bannerSchema);

const bannerSchemaValidator = {
    image: Joi.string().required(),
    url: Joi.string().min(5).max(500),
    position: Joi.number().min(0),
    bannerType: Joi.string().min(2).max(20),
    categories: Joi.array().items(Joi.ObjectId()),
    active: Joi.boolean()
}

function validateBanners(banner){
    return Joi.validate(banner, bannerSchemaValidator);
}

module.exports = {Banner, validateBanners}
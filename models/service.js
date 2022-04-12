const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);


const serviceSchema = mongoose.Schema({
    title: {
        type: String,
        minlength: 2,
        maxlength: 500,
        required: 'Service title is required.'
    },
    position:{
        type: Number,
        min: 0
    },
    slug: {
        type: String,
        minlength: 2,
        maxlength: 500,
    },
    parent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
    }],
    icon: {
        type: String,
        minlength: 1,
        maxlength: 2000
    },
    hot: {
        type: Boolean,
        default: false 
    },
    hairstyle: {
        type: Boolean,
        default: false
    },
    description: {
        type: String
    },
    beardAndMustache: {
        type: Boolean,
        default: false
    },
    approved: {
        type: Boolean,
        default: false,
    },
    active: {
        type: Boolean,
        default: true
    },
})

const Service = mongoose.model('Service', serviceSchema);

function validateService(service){
    const schema = {
        title: Joi.string().min(2).max(500).required(),
        description: Joi.string().allow('').allow(null),
        position: Joi.number().min(0),
        slug: Joi.string().min(2).max(500).allow(null).allow(''),
        hot: Joi.boolean(),
        parent: Joi.array().items(Joi.string().allow(null).allow('')),
        icon: Joi.string().min(1).max(2000),
        active: Joi.boolean(),
        hairstyle: Joi.boolean(),
        beardAndMustache: Joi.boolean(),
        price: Joi.number().allow(null).allow(''),
        _id: Joi.ObjectId().allow(null).allow('')
    }
    return Joi.validate(service, schema);
}

module.exports = {Service, validateService}
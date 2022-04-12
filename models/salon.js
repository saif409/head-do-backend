const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const validator = require("validator");


const salonSchema = mongoose.Schema({
    title: {
        type: String,
        required: 'Title is required.'
    },
    description: {
        type: String,
        minlength: 3,
        maxlength: 2000
    },
    logo: {
        type: String,
        required: 'Logo is required'
    },
    banner: {
        type: String,
        required: 'Banner is required'
    },
    gallery: [{
        type: String
    }],
    thumbnailImage: {
        type: String,
        required: 'ThumbnailImage is required'
    },
    latitude: {
        type: Number,
    },
    longitude: {
        type: Number,
    },
    streetAddress: {
        type: String,
    },
    specialistList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    serviceList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    }],
    website: {
        type: String,
    },
    phone: {
        type: String,
        unique: true,
        maxlength: 14,
        minlength: 11,
        required: 'Phone number is required'
      },
      email: {
        type: String,
        lowercase: true,
        trim: true,
        validate: {
          validator: validator.isEmail,
          message: "Please enter a valid email address"
        },
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          "Please fill a valid email address"
        ]
      },
    rating: {
        type: Number,
    },
    bankName: {
        type: String
    },
    bankBranchName: {
        type: String
    },
    bankAccountNumber: {
        type: String
    },
    bankAccountHolderName: {
        type: String
    },
    //timeSlot
})


const Salon = mongoose.model('Salon', salonSchema);

const salonSchemaValidator = {
    title: Joi.string(),
    description: Joi.string().min(3).max(2000),
    logo: Joi.string().required(),
    banner: Joi.string().required(),
    gallery: Joi.array().items(Joi.string()),
    thumbnailImage: Joi.string().required(),
    latitude: Joi.number(),
    longitude: Joi.number(),
    streetAddress: Joi.string(),
    specialistList: Joi.array().items(Joi.object().keys()),
    serviceList: Joi.array().items(Joi.object().keys()),
    website: Joi.string(),
    phone: Joi.string().min(11).max(14),
    email: Joi.string().email(),
    rating: Joi.number(),
    bankName: Joi.string().allow(null),
    bankBranchName: Joi.string().allow(null),
    bankAccountNumber: Joi.string().allow(null),
    bankAccountHolderName: Joi.string().allow(null),
}

function validateSalon(salon){
    return Joi.validate(salon, salonSchemaValidator);
}

module.exports = {Salon, validateSalon}
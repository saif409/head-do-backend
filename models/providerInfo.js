
const Joi = require("joi");
const mongoose = require("mongoose");
Joi.ObjectId = require('joi-objectid')(Joi);
const validator = require('validator');

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
        type: String
    },
    hot: {
        type: Boolean,
        default: false
    },
    approved: {
        type: Boolean,
        default: true,
    },
    active: {
        type: Boolean,
        default: true
    },
    price: {
        type: Number,
        default: 1
    },
    totalRating: {
        type: Number,
        default: 0
      },
    totalUserGiveRating: {
        type: Number,
        default: 0
    },
    description: {
        type: String
    },
})

const providerInfoSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    type: {
        type: String,
        enum: ['SALON', 'BARBER', 'MUA', "JOM_FACIAL"],
        required: 'Provider type is required'
    },
    description: {
        type: String,
        minlength: 3,
        maxlength: 2000
    },
    latitude: {
        type: Number,
    },
    longitude: {
        type: Number,
    },
    streetAddress: {
        type: String
    },
    addressLine: {
        type: String
    },
    tradeLicensePdfFile: {
        type: String,
        minlength: 3,
        maxlength: 1000
    },
    TINPdfFile: {
        type: String,
        minlength: 3,
        maxlength: 1000
    },
    salonName: {
        type: String,
        minlength: 2,
        maxlength: 100
    },
    logo: {
        type: String,
    },
    tagLine: {
        type: String
    }, 
    coverPhoto: {
        type: String
    },
    photoGallery: [{
        type: String
    }],
    videos: [{
        type: String
    }],
    verified: {
        type: Boolean,
        default: true
    },
    reasonOfRejection: {
        type: String
    },
    requestForVerification: {
        type: Boolean,
        default: false
    },
    shopUrl: {
        type: String
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
    identityNumber: {
        type: String
    },
    showShopInHomepage: {
        type: Boolean,
        default: false
    },
    position: {
        type: Number,
        // default: 1000
    },
    active: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
    },
    specialistList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    serviceList: [serviceSchema],
    website: {
        type: String,
    },
    dayOff: [String],
    timeToStart: {
        type: Number,
    },
    timeToClose: {
        type: Number
    },
    serviceType: {
        type: String
    },
    clients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    salon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    salonSpecialist: {
        type: Boolean,
        default: false
    },
    totalRating: {
        type: Number,
        default: 0
      },
    totalUserGiveRating: {
        type: Number,
        default: 0
    }
},
{
    timestamps: true
});

const ProviderInfo = mongoose.model("ProviderInfo", providerInfoSchema);

const phoneSchemaValidator = {
    type: Joi.string().valid('PRIMARY', 'SECONDARY'),
    number: Joi.string().min(8).max(14).required(),
    pName: Joi.string(),
    pDesignation: Joi.string(),
    _id: Joi.ObjectId()
}

const validateServiceSchema = {
    _id: Joi.ObjectId().allow(null).allow(''),
    title: Joi.string().min(2).max(500).required(),
    position: Joi.number().min(0),
    slug: Joi.string().min(2).max(50).allow(null),
    hot: Joi.boolean(),
    price: Joi.number(),
    parent: Joi.array().items(Joi.ObjectId().allow(null).allow('')),
    icon: Joi.string().min(1).max(2000).allow(null).allow(''),
    active: Joi.boolean(),
    description: Joi.string().allow('').allow(null)
}

const validateProviderInfoSchema = {
    _id: Joi.ObjectId().allow(null).allow(''),
    type: Joi.string().valid('SALON', 'BARBER', 'MUA', "JOM_FACIAL").allow(null),
    description: Joi.string().min(3).max(2000),
    latitude: Joi.number().allow(null),
    longitude: Joi.number().allow(null),
    streetAddress: Joi.string().allow(null),
    addressLine: Joi.string().allow(null).allow(''),
    tradeLicensePdfFile: Joi.string().min(3).max(1000).allow(null),
    TINPdfFile: Joi.string().min(3).max(1000).allow(null),
    salonName: Joi.string().min(2).max(100),
    logo: Joi.string().min(3).max(1000),
    coverPhoto: Joi.string().min(3).max(1000),
    photoGallery: Joi.array().items(Joi.string()),
    videos: Joi.array().items(Joi.string()),
    phoneList: Joi.array().items(Joi.object().keys(phoneSchemaValidator)),
    shopUrl: Joi.string().min(3).max(100).allow(null),
    bankName: Joi.string().allow(null),
    bankBranchName: Joi.string().allow(null),
    bankAccountNumber: Joi.string().allow(null),
    bankAccountHolderName: Joi.string().allow(null),
    showShopInHomepage: Joi.boolean().allow(null),
    position: Joi.number().allow(null),
    rating: Joi.number().allow(null),
    specialistList: Joi.array().items(Joi.ObjectId().allow(null)).allow(null).allow([]),
    serviceList: Joi.array().items(validateServiceSchema).allow([]),
    website: Joi.string().allow(null).allow(''),
    timeToClose: Joi.string().allow(null).allow(''),
    timeToStart: Joi.string().allow(null).allow(''),
    dayOff: Joi.array().items(Joi.string().allow(null)).allow([]),
    serviceType: Joi.string().valid('MOBILE', 'IN_DOOR', "BOTH").allow(null).allow(''),
    tagLine: Joi.string()
};

function validateProviderInfo(providerInfo) {
    return Joi.validate(providerInfo, validateProviderInfoSchema);
}

function validatePhoneNumberSchema(phoneSchema) {
    return Joi.validate(phoneSchema, phoneSchemaValidator, { abortEarly: false });
}

module.exports = { ProviderInfo,providerInfoSchema, validateProviderInfo, validateProviderInfoSchema, validatePhoneNumberSchema, serviceSchema, validateServiceSchema };

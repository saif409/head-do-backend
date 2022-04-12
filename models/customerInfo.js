
const Joi = require("joi");
const mongoose = require("mongoose");
Joi.ObjectId = require('joi-objectid')(Joi);

const deliveryAddressSchema = new mongoose.Schema({
    title: {
        type: String,
        minlength: 2,   
        maxlength: 15,
        required: 'Title is required.'
    },
    area: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Area'
    },
    streetAddress: {
        type: String,
        minlength: 1,
        maxlength: 100
    }
})

const phoneSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['PRIMARY', 'SECONDARY']
    },
    number: {
        type: String,
        maxlength: 14,
        minlength: 8,
        required: "Phone number is required !"
    }
})

const customerInfoSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    favoriteProviderList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    favoriteHairStyleList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    }],
    favoriteBeardAndMustacheList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    }],
    personalPhotoList: [{
        type: String
    }],
},
{
  timestamps: true
});

const CustomerInfo = mongoose.model("CustomerInfo", customerInfoSchema);

const deliveryAddressValidator = {
    title: Joi.string().min(2).max(15).required(),
    area: Joi.ObjectId().required(),
    streetAddress: Joi.string().min(1).max(100),
    _id: Joi.ObjectId()
}

const phoneSchemaValidator = {
    type: Joi.string().valid('PRIMARY', 'SECONDARY'),
    number: Joi.string().min(8).max(14).required()
}

const validateCustomerInfoSchema = {
    _id: Joi.ObjectId().required(),
    favoriteProviderList: Joi.array().items(Joi.ObjectId()),
    favoriteHairStyleList: Joi.array().items(Joi.ObjectId()),
    favoriteBeardAndMustacheList: Joi.array().items(Joi.ObjectId()),
    personalPhotoList: Joi.array().items(Joi.string())
};

function validateCustomerInfo(customerInfo) {
  return Joi.validate(customerInfo, validateCustomerInfoSchema, {abortEarly: false});
}

function validatePhoneNumberSchema(phoneSchema) {
    return Joi.validate(phoneSchema, phoneSchemaValidator, {abortEarly: false});
}

function validateDeliveryAddressSchema(deliverySchema) {
    return Joi.validate(deliverySchema, deliveryAddressValidator, {abortEarly: false});
}


module.exports = { 
    CustomerInfo, 
    validateCustomerInfo,
    validateCustomerInfoSchema, 
    validatePhoneNumberSchema, 
    validateDeliveryAddressSchema,
    deliveryAddressValidator,
    deliveryAddressSchema
};

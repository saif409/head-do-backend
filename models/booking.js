const mongoose = require("mongoose");
const Joi = require("joi");
const { validateServiceSchema, serviceSchema, providerInfoSchema } = require("./providerInfo");
const { addressSchema, validateAddressSchema, addressValidator } = require("./user");
Joi.ObjectId = require("joi-objectid")(Joi);
const shortid = require("shortid");


const bookingSchema = mongoose.Schema({
    bookingType: {
        type: String,
        enum: ['SALON', 'BARBER', 'MUA', 'JOM_FACIAL', 'WANTED_IMMEDIATELY']
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    specialist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    providerInfo: {
        type: providerInfoSchema
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    startingTime: {
        type: Date
    },
    endingTime: {
        type: Date
    },
    duration: {
        type: Number
    },
    serviceList: [serviceSchema],
    status: {
        type: String,
        enum: ['REQUESTED', 'PENDING', 'CANCELED', 'COMPLETED'],
        default: 'INITIATED'
    },
    gender: {
        type: String,
        enum: ['MALE', 'FEMALE', 'OTHER']
    },
    totalPrice: {
        type: Number
    },
    serviceCharge: {
        type: Number,
        default: 0
    },
    serviceType: {
        type: String,
        enum: ['MOBILE', 'IN_DOOR', "BOTH"]
    },
    address: {
        type: addressSchema
    },
    advancePaymentStatus: {
        type: Boolean,
        default: false
    },
    paid: {
        type: Boolean,
        default: false
    },
    serviceChargePercentage: {
        type: Number,
        default: 20
    },
    minimumAdvancePaymentPercentage: {
        type: Number,
        default: 20
    },
    advancePaymentAmount: {
        type: Number,
        default: 0
    },
    paidInAdvance: {
        type: Number,
        default: 0
    } ,
    orderNumber: {
        type: String,
        default: shortid.generate
    },
    note: {
        type: String
    },
    garbage: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true 
});


const Booking = mongoose.model('Booking', bookingSchema);

const bookingSchemaValidator = {
    _id: Joi.ObjectId().allow('').allow(null),
    bookingType: Joi.string().valid('SALON', 'BARBER', 'MUA', 'JOM_FACIAL', 'WANTED_IMMEDIATELY').allow('').allow(null),
    provider: Joi.ObjectId().allow(null),
    specialist: Joi.ObjectId().allow(null),
    customer: Joi.ObjectId(),
    startingTime: Joi.string(),
    endingTime: Joi.string().allow(null).allow(''),
    duration: Joi.number().allow(null).allow(''),
    serviceList: Joi.array().items(validateServiceSchema),
    status: Joi.string().valid('REQUESTED', 'PENDING', 'CANCELED', 'COMPLETED'),
    gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').allow(null).allow(''),
    totalPrice: Joi.number(),
    address: Joi.object().keys(addressValidator).allow(null),
    serviceType: Joi.string().valid('MOBILE', 'IN_DOOR', "BOTH").allow(null).allow(''),
    note: Joi.string().allow(null).allow('')
}

function validateBookings(booking){
    return Joi.validate(booking, bookingSchemaValidator);
}

module.exports = {Booking, validateBookings}
const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const {
    deliveryAddressSchema,
    deliveryAddressValidator
} = require('./customerInfo');

const productSchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    variant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariant'
    },
    selectedSize: {
        type: String,
        minlength: 1,
        maxlength: 20
    }
})

const orderDetailsListSchema = mongoose.Schema({
    product: {
        type: productSchema
    },
    quantity: {
        type: Number,
        min: 1
    }
})

const cartSchema = mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId
    },
    specialNote: {
        type: String
    },
    deliveryAddress: {
        type: deliveryAddressSchema
    },
    promoCode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PromoCode'
    },
    promoDiscount: {
        type: Number,
        default: 0
    },
    orderDetailsList: [{
        type: orderDetailsListSchema
    }]
})

const Cart = mongoose.model('Cart', cartSchema);

const productSchemaValidator = {
    _id: Joi.ObjectId().required(),
    variant: Joi.ObjectId().allow(null),
    selectedSize: Joi.string().min(1).max(20).allow(null)
}

const orderDetailsListSchemaValidator = {
    product: Joi.object().keys(productSchemaValidator),
    quantity: Joi.number().min(1)
}

const cartSchemaValidator = {
    orderId: Joi.objectId(),
    specialNote: Joi.string(),
    deliveryAddress: Joi.object().keys(deliveryAddressValidator).allow(null),
    orderDetailsList: Joi.array().items(Joi.object().keys(orderDetailsListSchemaValidator)),
    promoCode: Joi.string().allow('').allow(null)
}

function validateCarts(cart) {
    return Joi.validate(cart, cartSchemaValidator);
}

module.exports = { Cart, validateCarts }
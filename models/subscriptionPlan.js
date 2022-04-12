const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const subscriptionPlanSchema = new mongoose.Schema({
    planName: {
        type: String,
        minlength: 3
    },
    chargeType: {
        type: String,
        enum: ['FLAT', 'PERCENTAGE']
    },
    chargeAmount: {
        type: Number,
        default: 0,
        set: value => value === '' || value == null ? 0 : value
      },
    chargePercentage: {
        type: Number,
        default: 0,
        set: value => value === '' || value == null ? 0 : value
    },
    note: {
        type: String
    }
});

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

const subscriptionPlanSchemaValidator = {
    planName: Joi.string().min(3),
    chargeType: Joi.string().valid('FLAT', 'PERCENTAGE'),
    chargeAmount: Joi.number(),
    chargePercentage: Joi.number(),
    note: Joi.string()
}

function validateSubscriptionPlan(subscriptionPlan){
    return Joi.validate(subscriptionPlan, subscriptionPlanSchemaValidator, {abortEarly: false})
}

module.exports = {
    SubscriptionPlan,
    subscriptionPlanSchema,
    subscriptionPlanSchemaValidator,
    validateSubscriptionPlan
}
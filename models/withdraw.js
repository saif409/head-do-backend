const mongoose = require("mongoose");
const Joi = require("joi");
Joi.ObjectId = require("joi-objectid")(Joi);


const withdrawSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    providerBusinessName: {
        type: String,
    },
    amount: {
        type: Number,
        required: 'Amount is required.'
    },
    note: {
        type: String
    },
    paid: {
        type: Boolean,
        default: false
    },
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['PENDING','SUBMITTED_TO_BANK', 'PAID', 'CANCELED'],
        default: 'PENDING'
    }
}, 
{
    timestamps: true
});


const Withdraw = mongoose.model('Withdraw', withdrawSchema);

const withdrawSchemaValidator = {
    user: Joi.ObjectId(),
    amount: Joi.number().min(1).required(),
    note: Joi.string().allow(null).allow(''),
}

function validateWithdraws(withdraw){
    return Joi.validate(withdraw, withdrawSchemaValidator);
}

module.exports = {Withdraw, validateWithdraws}
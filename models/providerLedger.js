const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const providerLedgerSchema = new mongoose.Schema({
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProviderInfo',
        required: true
    },
    refNo: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['CASH', 'MOBILE_BANKING', 'INTERNET_BANKING', 'CARD', 'BANK']
    },
    date: {
        type: Date,
        default: new Date()
    },
    canceled: {
        type: Boolean,
        default: false
    },
    note: {
        type: String
    },
    totalIncomeTillNow: {
        type: Number,
        default: 0
    }
});

const ProviderLedger = mongoose.model('ProviderLedger', providerLedgerSchema);

const providerLedgerSchemaValidator = {
    provider: Joi.ObjectId().required(),
    amount: Joi.number().required(),
    paymentMethod: Joi.string().allow('CASH', 'MOBILE_BANKING', 'INTERNET_BANKING', 'CARD', 'BANK'),
    date: Joi.date(),
    note: Joi.string()
}

function validateProviderLedger(providerLedger){
    return Joi.validate(providerLedger, providerLedgerSchemaValidator);

}
module.exports = {
    ProviderLedger,
    validateProviderLedger
}
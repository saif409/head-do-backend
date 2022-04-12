const mongoose = require("mongoose");
const Joi = require("joi")
Joi.objectId = require("joi-objectid")(Joi);

const providerClientRecordSchema = new mongoose.Schema({
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    lastServiceDate: {
        type: Date
    },
    totalServiceCount: {
        type: Number
    },
    totalAmount: {
        type: Number
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},
{
    timestamps: true 
})

const ProviderClientRecords = mongoose.model('ProviderClientRecords', providerClientRecordSchema);



function validateProviderClientRecords(providerClientRecord){
    return Joi.validate(providerClientRecord)
}

module.exports = {
    ProviderClientRecords,
    validateProviderClientRecords
}
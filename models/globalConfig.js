const mongoose = require("mongoose");
const Joi = require("joi");
const validator = require("validator");
Joi.objectId = require("joi-objectid")(Joi);

const socialMediaSchema = new mongoose.Schema({
      title: {
        type: String,
        required: true
      },
      logo: {
        type: String,
        required: true
      },
      url: {
        type: String,
        minlength: 5,
        required: true
      },

})

const globalConfigSchema = new mongoose.Schema({
    contactEmails:[
        {
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
    
        }
    ],
    socialMediaList: [socialMediaSchema],

    contactPhones:[ {
        type: String,
        minlength: 9,
        maxlength: 14
    }],
    orderNotifyEmails:[ {
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

    }],
    active: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    logo: {
      type: String,
      required: true
    },
    favIcon: {
      type: String,
      required: true
    },
    websiteTitle: {
      type: String,
      required: true
    },
    coverPhoto: {
      type: String,
      required: true
    },
    backgroundImage: {
      type: String,
      required: true
    },
    androidAppVersion: {
      type: String,
      default: '1.0.0'
    },
    iosAppVersion: {
      type: String,
      default: '1.0.0'
    },
    providerServiceChargePercentage: {
      type: Number,
      default: 10
    },
    providerMaximumServiceCharge: {
      type: Number,
      default: 4
    },
    barberMaximumServiceCharge:{
      type: Number,
      default: 2
    },
    referralIncomePercentage: {
      type: Number,
      default: 10
    },
    minimumAdvancePaymentPercentage: {
      type: Number,
      default: 20
    },
    notificationMsgFromVendorToClient: {
      type: String
    },
    logoForLightMode: {
      type: String
    },
    motionText: {
      type: String
    }
}, {
  timestamps: true
})

const GlobalConfig = mongoose.model('GlobalConfig', globalConfigSchema);

const socialMediaSchemaValidator = {
  _id: Joi.ObjectId(),
    title: Joi.string().required(),
    logo: Joi.string().required(),
    url: Joi.string().min(5).required()
}

const globalConfigSchemaValidator = {
    _id: Joi.ObjectId(),
    contactEmails: Joi.array().items(Joi.string().email()),
    contactPhones: Joi.array().items(Joi.string().min(9).max(14)),
    orderNotifyEmails: Joi.array().items(Joi.string().email()),
    socialMediaList: Joi.array().items(Joi.object().keys(socialMediaSchemaValidator)),
    active: Joi.bool(),
    logo: Joi.string().required(),
    backgroundImage: Joi.string().required(),
    coverPhoto: Joi.string().required(),
    favIcon: Joi.string().required(),
    websiteTitle: Joi.string().required(),
    androidAppVersion: Joi.string().required(),
    iosAppVersion: Joi.string().required(),
    providerServiceChargePercentage: Joi.number(),
    providerMaximumServiceCharge: Joi.number(),
    barberMaximumServiceCharge: Joi.number(),
    referralIncomePercentage: Joi.number(),
    minimumAdvancePaymentPercentage: Joi.number(),
    notificationMsgFromVendorToClient: Joi.string(),
    logoForLightMode: Joi.string(),
    motionText: Joi.string().allow('').allow(null)
}

function validateGlobalConfig(globalConfig){
    return Joi.validate(globalConfig, globalConfigSchemaValidator)
}

module.exports = {
    GlobalConfig,
    validateGlobalConfig
}
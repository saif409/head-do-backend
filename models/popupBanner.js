const mongoose = require("mongoose");
const Joi = require("joi");
const validator = require("validator");
Joi.objectId = require("joi-objectid")(Joi);

const popupBannersSchema = new mongoose.Schema({
    title: {
      type: String,
    },
    image: {
        type: String,
      },
    text: {
      type: String,
      minlength: 1,
      maxlength: 2000
    },
    link: {
      type: String,
    },
    showBanner: {
      type: Boolean
    }
})

const PopupBanners = mongoose.model('PopupBanners', popupBannersSchema);

const popupBannersSchemaValidator = {
    title: Joi.string(),
    image: Joi.string(),
    text: Joi.string().min(1).max(2000),
    showBanner: Joi.bool(),
    link: Joi.string().allow('').allow(null)
}

function validatePopupBanners(popupBanners){
    return Joi.validate(popupBanners, popupBannersSchemaValidator)
}

module.exports = {
    PopupBanners,
    validatePopupBanners
}
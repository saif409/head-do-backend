const Joi = require("joi");
const { allow } = require("joi/lib/types/lazy");
const mongoose = require("mongoose");


const ratingSchema = new mongoose.Schema({

    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    rating: {
        type: Number,
        default: 1
    },
    review: {
        type: String
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
 
},
{
  timestamps: true
});

const Rating = mongoose.model("Rating", ratingSchema);

function validateRating(rating) {
  const schema = {
    bookingId: Joi.ObjectId().required(),
    rating: Joi.number().required(),
    review: Joi.string().allow(null).allow(''),
    providerId: Joi.ObjectId().required()
  };

  return Joi.validate(rating, schema);
}

module.exports = { 
    Rating,
    validateRating
};

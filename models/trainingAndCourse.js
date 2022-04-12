const mongoose = require("mongoose");
const Joi = require("joi");
Joi.ObjectId = require("joi-objectid")(Joi);


const trainingAndCourseSchema = mongoose.Schema({
    eventName: {
        type: String
    },
    eventCategory: {
        type: String,
        enum: ['Facial & Spa', 'Barber', 'Hair Salon', 'Make up artist', 'Others']
    },
    venue: {
        type: String
    },
    startingDateAndTime: {
        type: Date,
        default: new Date()
    },
    endingDateAndTime: {
        type: Date,
        default: new Date()
    },
    closingDateForRegistration: {
        type: Date,
        default: new Date()
    },
    price: {
        type: Number
    },
    availableSeats: {
        type: Number
    },
    note: {
        type: String,
        maxlength: 250
    }
}, 
{
    timestamps: true 
});


const TrainingAndCourse = mongoose.model('TrainingAndCourse', trainingAndCourseSchema);

const trainingAndCourseSchemaValidator = {
    eventName: Joi.string().allow('').allow(null),
    eventCategory: Joi.string().valid('Facial & Spa', 'Barber', 'Hair Salon', 'Make up artist', 'Others'),
    venue: Joi.string().allow('').allow(null),
    startingDateAndTime: Joi.string().allow(null).allow(''),
    endingDateAndTime:  Joi.string().allow(null).allow(''),
    closingDateForRegistration:  Joi.string().allow(null).allow(''),
    price: Joi.number(),
    availableSeats: Joi.number(),
    note: Joi.string().max(250).allow(null).allow(''),
    
}

function validateTrainingAndCourse(trainingAndCourse){
    return Joi.validate(trainingAndCourse, trainingAndCourseSchemaValidator);
}

module.exports = {TrainingAndCourse, validateTrainingAndCourse}
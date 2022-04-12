const config = require("config");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
Joi.ObjectId = require("joi-objectid")(Joi);
const mongoose = require("mongoose");

const IssueSchema = new mongoose.Schema({
    description: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['SUBMITTED', 'CHECKED'],
        default: 'SUBMITTED'
    },
    checkedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    images: [{
        type: String
    }],
    reply: {
      type: String
    }
},
{
  timestamps: true 
});

const Issue = mongoose.model("Issue", IssueSchema);

function validateIssue(Issue) {
  const schema = {
    description: Joi.string(),
    user: Joi.ObjectId(),
    status: Joi.string().valid('SUBMITTED', 'CHECKED'),
    checkedBy: Joi.ObjectId(),
    images: Joi.array().items(Joi.string()),
    reply: Joi.string().allow(null).allow("")
  };

  return Joi.validate(Issue, schema); 
}

module.exports = { Issue, validateIssue };

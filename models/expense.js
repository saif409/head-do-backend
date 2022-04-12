const mongoose = require("mongoose");
const Joi = require("joi");
Joi.ObjectId = require("joi-objectid")(Joi);


const expenseSchema = mongoose.Schema({
    expenseType: {
        type: String,
        enum: ['SHOP_RENT', 'ELECTRICITY', 'FOOD', 'TRANSPORTATION', 'UTILITIES', 'ENTERTAINMENT', 'OTHERS', 'EMPLOYEE_SALARY']
    },
    amount: {
        type: Number,
        required: true
    },
    note: {
        type: String,
        minlength: 3,
        maxlength: 500
    }
}, 
{
    timestamps: true 
});


const Expense = mongoose.model('Expense', expenseSchema);

const expenseSchemaValidator = {
    _id: Joi.ObjectId().allow('').allow(null),
    expenseType: Joi.string().valid('SHOP_RENT', 'ELECTRICITY', 'FOOD', 'TRANSPORTATION', 'UTILITIES', 'ENTERTAINMENT', 'OTHERS', 'EMPLOYEE_SALARY'),
    amount: Joi.number(),
    note: Joi.string().min(3).max(500).allow(null).allow('')
}

function validateExpenses(expense){
    return Joi.validate(expense, expenseSchemaValidator);
}

module.exports = {Expense, validateExpenses}
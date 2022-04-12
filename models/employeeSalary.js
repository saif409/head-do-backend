const mongoose = require("mongoose");
const Joi = require("joi");
const validator = require("validator");
Joi.objectId = require("joi-objectid")(Joi);


const employeeInfoSchema = new mongoose.Schema({
    fullName: {
        type: String,
        minlength: 3,
        maxlength: 100,
        required: 'Full name is required '
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    },
    address: {
        type: String
    }
});


const employeeSalarySchema = new mongoose.Schema({
  employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
  },
  amount: {
      type: Number
  },
  employeeInfo: {
      type: employeeInfoSchema
     
  },
  note: {
      type: String,
      minlength: 3,
      maxlength: 500
  }
},{
    timestamps: true 
})

const EmployeeSalary = mongoose.model('EmployeeSalary', employeeSalarySchema);

const employeeInfoSchemaValidator = {
    fullName: Joi.string().min(3).max(100).required(),
    role: Joi.ObjectId(),
    address: Joi.string()
}

const employeeSalarySchemaValidator = {
    employee: Joi.ObjectId(),
    amount: Joi.number(),
    employeeInfo: employeeInfoSchemaValidator,
    note: Joi.string().min(3).max(500)
 
}

function validateEmployeeSalary(employeeSalary){
    return Joi.validate(employeeSalary, employeeSalarySchemaValidator)
}

module.exports = {
    EmployeeSalary,
    validateEmployeeSalary
}
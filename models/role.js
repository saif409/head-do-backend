const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);



const rolesSchema = mongoose.Schema({
    alias: {
        type: String,
        uniq: true,
        minlength: '3',
        maxlength: '20',
        required: 'Alias is required.'
    },
    permissionString: {
        type: String
    }
})

const Role = mongoose.model('Role', rolesSchema);


function validateRole(role){
    const schema = {
        alias: Joi.string().min(3).max(20).required(),
        permissionString: Joi.string(),
        permissionList: Joi.array().items(Joi.object().keys(
            {
                moduleName: Joi.string(),
                permissions: Joi.array().items(Joi.object().keys(
                    {
                        permissionName: Joi.string(),
                        hasPermission: Joi.boolean(),
                        moduleName: Joi.string(),
                        permissionNumber: Joi.number()
                    }
                ))
            }
        ))
    }
    return Joi.validate(role, schema);
}

module.exports = {Role, validateRole}
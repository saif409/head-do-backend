
const {
  Role,
  validateRole
} = require("../models/role");
const _ = require("lodash");
const { PAGE_SIZE } = require("../utils/constants");
const { getCleanData, getQueryParams, hasPermission } = require("../utils/helpers");
const PERMISSION_DATA = require('../middleware/permissionData');
const { User } = require("../models/user");

exports.addRole = async (req, res) => {

    let role = {...req.body};

    const {error} = validateRole(req.body);
    if(error){
        return res.status(400).send(error.details.map(e => e.message));
    }

    const alreadyExists = await Role.findOne({alias: role.alias});
    if(alreadyExists){
        return res.status(400).send(`Role with alias ${role.alias} is already exists.`);
    }

    const permissionString = createPermissionString(req.body.permissionList);
    delete role.permissionList;
    role.permissionString = permissionString;

    var result = await Role(role).save();
    return res.status(200).send(result);

};

exports.updateRole = async (req, res) => {

    const role = getCleanData(req.body);
    const {error} = validateRole(role);
    if(error){
        return res.status(400).send(error.details.map(e => e.message));
    }

    const permissionString = createPermissionString(req.body.permissionList);
    delete role.permissionList;
    role.permissionString = permissionString;

    const result = await Role.findByIdAndUpdate(
        req.params.id,
        {$set: role},
        {useFindAndModify: false}
    )

    if(!result){
        return res.status(404).send(`Can not find role by id ${req.params.id}`);
    }
    await User.updateMany({role: result._id}, {$set: {needToRefreshToken: true}});
  
    return res.status(200).send({...result._doc, ...role});
};

exports.getRoleById = async (req, res) => {
    var id = req.params.id;
    var role = await Role.findById(id);

    const permissionString = role.permissionString;

    let permissions = [];
    for(let p in PERMISSION_DATA){
        const permission = PERMISSION_DATA[p];
        if(hasPermission(p, permissionString)){
            permissions.push({...permission, hasPermission: true});
        }else{
            permissions.push({...permission, hasPermission: false});
        }
    };

    const moduleNames = [...new Set(permissions.map(e => e.moduleName))];

    let moduleWisePermissions = [];

    for(let i=0; i< moduleNames.length; i++){
        const modulePermissions = permissions.filter(e => e.moduleName === moduleNames[i]);
        moduleWisePermissions.push({moduleName: moduleNames[i], permissions: modulePermissions});
    }


    return res.status(200).send({...role._doc, permissionList: moduleWisePermissions});
};

exports.deleteRole = async (req, res) => {
    var id = req.params.id;
  
    var roles = await Role.findById(id);
    if (roles) {
      await roles.deleteOne({_id: id});
      return res.status(200).send(roles);
    } else {
      return res.status(404).send("Role is not found with this id "+ id );
    }
  
  };

exports.getAllPermissions = async (req, res)=> {
    let permissions = [];
    for(let p in PERMISSION_DATA){
        const permission = PERMISSION_DATA[p];
        permissions.push({...permission, hasPermission: false});
    };

    const moduleNames = [...new Set(permissions.map(e => e.moduleName))];

    let moduleWisePermissions = [];

    for(let i=0; i< moduleNames.length; i++){
        const modulePermissions = permissions.filter(e => e.moduleName === moduleNames[i]);
        moduleWisePermissions.push({moduleName: moduleNames[i], permissions: modulePermissions});
    }


    return res.status(200).send(moduleWisePermissions);
}

exports.getUserPermissions = async (req, res) => {

    const permissionString = req.user.permissionString;

    let permissions = [];
    for(let p in PERMISSION_DATA){
        const permission = PERMISSION_DATA[p];
        if(hasPermission(p, permissionString)){
            permissions.push(permission);
        }
    };

    const moduleNames = [...new Set(permissions.map(e => e.moduleName))];

    let moduleWisePermissions = [];

    for(let i=0; i< moduleNames.length; i++){
        const modulePermissions = permissions.filter(e => e.moduleName === moduleNames[i]);
        moduleWisePermissions.push({moduleName: moduleNames[i], permissions: modulePermissions});
    }
    return res.status(200).send(moduleWisePermissions);
};

exports.getRoles = async (req, res) => {

    let page = req.query.page ? parseInt(req.query.page) : 1;
    let size = req.query.size ? parseInt(req.query.size) : PAGE_SIZE;

    if(page < 1 || size < 1){
      return res.status(400).send('Page and size must be a positive number.');
    }

    const skip = (page - 1) * size;
    
    const searchQuery = getQueryParams(req.query);
    const totalElements = await Role.countDocuments(searchQuery);
    var roles = await Role.find(searchQuery).skip(skip).limit(size);

    return res.status(200).send({content: roles, totalElements, page, size});
};

const getAppliedPermissions = (data) => {
    let permissions = data.map(e => e.permissions).flat();
    let permissionData = {};

    for(let i=0; i< permissions.length; i++){
        if(permissions[i].hasPermission){
            permissionData[permissions[i].permissionName] = permissions[i];
        }
    }
    return permissionData;
}

const createPermissionString = (data) => {
    const allPermissions = require('../middleware/permissionData');
    let permissionString = '';
    let tempPermissionString = '';

    let appliedPermissions = getAppliedPermissions(data);

    let serial = 0;
    for(let p in allPermissions){
        // let permission = allPermissions[p];
        if(appliedPermissions[p]){
            tempPermissionString+='1';
        }else{
            tempPermissionString+='0';
        }
        serial++;
        if(serial == 7){
            permissionString+= String.fromCharCode(parseInt(tempPermissionString, 2));
            tempPermissionString = '';
            serial = 0;
        }
    }
    if(tempPermissionString.length){
        if(tempPermissionString.length < 7){
            tempPermissionString = tempPermissionString + '0'.repeat( 7 - tempPermissionString.length )
        }
        permissionString+= String.fromCharCode(parseInt(tempPermissionString, 2));
    }

    return permissionString;

}
const { Role } = require("../models/role");
const { hasPermission } = require("../utils/helpers");
const PERMISSION_DATA = require("./permissionData");

exports.admin = async (req, res, next) => {
  // 401 Unauthorized
  // 403 Forbidden
  if (!req.user.role === 'ADMIN') return res.status(403).send({message: "Access denied."});

  next();
};

exports.salon = async (req, res, next) => {
  if (req.user.role !== 'SALON') return res.status(403).send({message: "Access denied."});

  next();
};

exports.barberOrMua = async (req, res, next) => {
  if (req.user.role !== 'BARBER' && req.user.role !== 'MUA') return res.status(403).send({message: "Access denied."});

  next();
};

exports.superUser = async (req, res, next) => {
  const role = await Role.findById(req.user.role);
  if (role == null || role.alias != 'SUPER USER') return res.status(403).send({message: "Access denied."});

  next();
};


exports.selfOrStaff = async (req, res, next) => {
  const role = await Role.findById(req.user.role);
  if (
    (role && role == 'STAFF') ||
    req.user._id === req.params.userId ||
    req.user._id === req.body._id
    
  )
    next();
  else return res.status(403).send({message: "Access denied. Wrong user."});
};

exports.selfOrAdmin = async (req, res, next) => {
  const role = await Role.findById(req.user.role);
  if (
    (role && role == 'ADMIN') ||
    req.user._id === req.params.userId ||
    req.user._id === req.body._id
    
  )
    next();
  else return res.status(403).send({message: "Access denied. Wrong user."});
};

exports.provider = async (req, res, next) => {
  if(!req.user.isProvider){
    return res.status(403).send({message: 'Access denied. You are not a provider yet. Please be a provider before add your products.'});
  }
  next();
}

exports.checkPermission = (operationName) => {

  
  return async (req, res, next) => {
    return next();
    if(hasPermission(operationName, req.user.permissionString))
      return next();
    else{
      return res.status(403).send({message: 'Permission denied !'});
    }
  };  
}
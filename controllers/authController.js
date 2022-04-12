const bcrypt = require("bcrypt");
const _ = require("lodash");
const Joi = require("joi");
const { User } = require("../models/user");
const PERMISSION_DATA = require("../middleware/permissionData");
const { Role } = require("../models/role");
const { hasPermission } = require("../utils/helpers");

exports.login = async (req, res) => {

  const {error} = validate(req.body);

  if (error) return res.status(400).send({message: error.details.map(e => e.message)});
  
  let user = await User.findOne({ phone: req.body.phone }).populate({
    path: 'customerInfo providerInfo role'});
  if (!user) return res.status(400).send({message: "This phone number is not registered yet. Please signup."});

  // if(user.active == false){
  //   return res.status(403).send({message: 'Your account is deactivated. Please contact with authority.'});
  // }

  if(user.signInType  !== 'PHONE_NUMBER'){
    return res.status(400).send({message: 'You can only sign in by '+ user.signInType.toLowerCase()});
  }

  let updatedData = {
    needToRefreshToken: false,
    active: true
  }

  if( req.body.fcmToken && !user.fcmTokens.includes(req.body.fcmToken)){
    updatedData.fcmTokens = [...user.fcmTokens, req.body.fcmToken]
  }

  await User.findByIdAndUpdate(
    user._id,
    {$set: updatedData},
    {useFindAndModify: false}
  )

  const validPassword = bcrypt.compareSync(req.body.password, user.password);
  if (!validPassword) return res.status(400).send({message: "Invalid password."});

  const token = await user.generateAuthToken();

  return res.status(200).send({user,token});
};

exports.logout = async (req, res) => {
  const fcmToken = req.body.fcmToken;

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: {fcmTokens: fcmToken}
    }
  );

  return res.status(200).send({message: 'Logged out'});
}

exports.refreshToken = async (req, res) => {
  
  let user = await User.findByIdAndUpdate(
    req.user._id,
    {$set: {needToRefreshToken: false}},
    {useFindAndModify: false}
  )

  user = await User.findById(req.user._id).populate({
    path: 'customerInfo providerInfo role',
    populate: {
      path: 'productServices deliveryAddressList area',
      populate: {path: 'area'}
    }});

    if(!user.active){
      return res.status(403).send({message: 'Your account is deactivated. Please contact with authority.'});
    }

  const token = await user.generateAuthToken();

  const role = await Role.findById(user.role._id);
  let permissions = [];

  for(let p in PERMISSION_DATA){
      if(hasPermission(p, role.permissionString)){
          permissions.push(p);
      }
  };

  

  return res.send({user: {...user._doc, permissions },token});
};

function validate(req) {
  const schema = {
    phone: Joi.string()
      .required(),
    password: Joi.string()
      .required(),
      fcmToken: Joi.string().allow('').allow(null)
  };

  return Joi.validate(req, schema);
}

const { User, validateUser, validateUserForSignup,validateUserBankInfo, validateUserForCustomerProfileUpdate, validateUserForUpdate, validateAddressSchema } = require("../models/user");
var mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const _ = require("lodash");
const Joi = require("joi");
const { CustomerInfo,
  validatePhoneNumberSchema, validateDeliveryAddressSchema } = require("../models/customerInfo");
const { PAGE_SIZE } = require("../utils/constants");
const { getQueryParams, getCleanData, hasPermission, get24BaseTime, sendNotificationToSpecificCustomer, getDistanceFromLatLonInKm, sendNotifications } = require("../utils/helpers");
const { Cart } = require("../models/cart");
const { Role } = require("../models/role");
const PERMISSION_DATA = require("../middleware/permissionData");
const nodemailer = require('nodemailer');
const { ProviderInfo, validateProviderInfo, validateServiceSchema } = require("../models/providerInfo");
const { Area } = require("../models/area");
const { provider } = require("../middleware/authorization");
const { response } = require("express");
const { validateService } = require("../models/service");
const { ProviderClientRecords } = require("../models/providerClientRecord");
const { Booking } = require("../models/booking");


exports.alreadyExistsPhoneNumber = async (req, res) => {
  const phone = req.body.phone;

  if (!phone) {
    res.status(400).send({message: 'Phone is required !'});
  }

  const user = await User.findOne({ phone });
  if (user) {
    return res.status(200).send({exist: true});
  }

  return res.status(200).send({exist: false});

}

exports.signup = async (req, res) => {
  req.body = getCleanData(req.body);
  const { error } = validateUserForSignup(req.body);
  if (error) return res.status(400).send({message: error.message});

  let user = await User.findOne({ phone: req.body.phone });
  if (user)
    return res
      .status(400)
      .send({message: "User already registered with this phone number."});

  const _id = mongoose.Types.ObjectId();
  req.body._id = _id;
  req.body.customerInfo = _id;

  if(req.body.type != 'CUSTOMER'){
    req.body.isProvider = true;
  }

  user = new User(req.body);

  const salt = bcrypt.genSaltSync(10);
  user.password = bcrypt.hashSync(user.password, salt);
  user.signInType = 'PHONE_NUMBER';

  await user.save();
  const customerInfo = CustomerInfo({
    _id,
    deliveryAddressList: [],
    phoneList: [{ number: req.body.phone, type: "PRIMARY" }]
  });
  await customerInfo.save();

  if(req.body.type != 'CUSTOMER'){
    const providerInfo = ProviderInfo({
      _id,
      type: req.body.type,
      showUrl: _id
    })
    await providerInfo.save();
  }

  
  


  const token = await user.generateAuthToken();
  return res
    .header()
    .status(200)
    .send({ token, user });
};

exports.socialMediaSignIn = async (req, res) => {
  req.body = getCleanData(req.body);

  let user = await User.findOne({ email: req.body.email }).populate({
    path: 'customerInfo providerInfo role'});
  
  if(user){
    if(user.active == false){
      return res.status(403).send({message: 'Your account is deactivated. Please contact with authority.'});
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

    const token = await user.generateAuthToken();

    return res.status(200).send({user,token});
  }
    

  const _id = mongoose.Types.ObjectId();
  req.body._id = _id;
  req.body.customerInfo = _id;

  req.body.type = 'CUSTOMER';
  // req.body.signInType = 'GOOGLE';
  req.body.isProvider = false;
  
  user = new User(req.body);

  await user.save();
  const customerInfo = CustomerInfo({
    _id,
    deliveryAddressList: [],
    phoneList: [{ number: req.body.phone, type: "PRIMARY" }]
  });

  await customerInfo.save();


  const token = await user.generateAuthToken();
  return res
    .header()
    .status(200)
    .send({ token, user });
};

exports.createProviderInfo = async (req, res) => {

  let alreadyExists = await ProviderInfo.findById(req.user._id);
  const {error} = validateProviderInfo(req.body);
  if(error){
    return res.status(400).send({message: error.message});
  }

  if(req.body.timeToStart){
    req.body.timeToStart = get24BaseTime(req.body.timeToStart)
  }
  
  if(req.body.timeToClose){
    req.body.timeToClose = get24BaseTime(req.body.timeToClose)
  }

  const _preProviderInfo = await ProviderInfo.findById(req.user._id);
  if(_preProviderInfo?.serviceList?.length == 0){
    return res.status(400).send({message: "You need to add some services. At least 1 service is mandatory."});
  }

  let providerInfo = {...req.body, _id: req.user._id, type: req.user.type, shopUrl: req.user._id.toString()};
  if(_preProviderInfo){
    await ProviderInfo.findByIdAndUpdate(
      req.user._id,
      {
        $set: providerInfo
      });
  }else{
    await ProviderInfo(providerInfo).save();
  }

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        providerInfo: req.user._id, 
        serviceType: providerInfo.serviceType, 
        businessName: providerInfo.salonName,
        isProvider: true, 
        pendingProvider: false, 
        serviceType: req.body.serviceType,
        bankName: req.body.bankName,
        bankBranchName: req.body.bankBranchName,
        bankAccountNumber: req.body.bankAccountNumber,
        bankAccountHolderName: req.body.bankAccountHolderName,
      }
      }
  );
  const user = await User.findById(req.user._id).populate('customerInfo providerInfo role');

  return res.status(200).send(user);

}

exports.addOrRemoveFavoriteProviderForCustomer = async (req, res) => {

  if(!req.body.favoriteProvider){
    return res.status(400).send({message: 'Favorite provider is required.'});
  }

  let customerInfo = await CustomerInfo.findById(req.user._id);
  let favoriteProviderList = customerInfo.favoriteProviderList ?? [];
  let message = 'Added to favorite providers';

  if(favoriteProviderList?.map(e => e.toString()).includes(req.body.favoriteProvider)){
     favoriteProviderList = favoriteProviderList.filter( e => e.toString() != req.body.favoriteProvider);
     message = 'Removed from favorite providers';
  }
  else{
    favoriteProviderList.push(req.body.favoriteProvider);
  }

  await CustomerInfo.findByIdAndUpdate(
    req.user._id,
    {
      $set: {favoriteProviderList}
    }
  );

  return res.status(200).send({favoriteProviderList, message});

}

exports.addOrRemoveFavoriteHairstyleForCustomer = async (req, res) => {

  if(!req.body.favoriteHairStyle){
    return res.status(400).send({message: 'Favorite hairstyle is required.'});
  }

  let customerInfo = await CustomerInfo.findById(req.user._id);
  let favoriteHairStyleList = customerInfo.favoriteHairStyleList ?? [];
  let message = 'Added to favorite hairstyle';
  let status = true;

  if(favoriteHairStyleList?.map(e => e.toString()).includes(req.body.favoriteHairStyle)){
     favoriteHairStyleList = favoriteHairStyleList.filter( e => e.toString() != req.body.favoriteHairStyle);
     message = 'Removed from favorite hairstyle';
     status = false;
  }
  else{
    favoriteHairStyleList.push(req.body.favoriteHairStyle);
  }

  await CustomerInfo.findByIdAndUpdate(
    req.user._id,
    {
      $set: {favoriteHairStyleList}
    }
  );

  return res.status(200).send({status, message});

}

exports.getFavoriteHairStylesForCustomer = async (req, res) => {
  const customer = await CustomerInfo.findById(req.user._id).populate('favoriteHairStyleList');

  return res.status(200).send(customer.favoriteHairStyleList ?? []);
}

exports.addOrRemoveFavoriteBeardAndMustacheForCustomer = async (req, res) => {

  if(!req.body.favoriteBeardAndMustache){
    return res.status(400).send({message: 'Favorite hairstyle is required.'});
  }

  let customerInfo = await CustomerInfo.findById(req.user._id);
  let favoriteBeardAndMustacheList = customerInfo.favoriteBeardAndMustacheList ?? [];
  let message = 'Added to favorite beard and mustache';
  let status = true;

  if(favoriteBeardAndMustacheList?.map(e => e.toString()).includes(req.body.favoriteBeardAndMustache)){
     favoriteBeardAndMustacheList = favoriteBeardAndMustacheList.filter( e => e.toString() != req.body.favoriteBeardAndMustache);
     message = 'Removed from favorite beard and mustache';
    status = false;
  }
  else{
    favoriteBeardAndMustacheList.push(req.body.favoriteBeardAndMustache);
  }

  await CustomerInfo.findByIdAndUpdate(
    req.user._id,
    {
      $set: {favoriteBeardAndMustacheList}
    }
  );

  return res.status(200).send({status, message});

}

exports.getFavoriteBeardAndMustachesForCustomer = async (req, res) => {
  const customer = await CustomerInfo.findById(req.user._id).populate('favoriteBeardAndMustacheList');

  return res.status(200).send(customer.favoriteBeardAndMustacheList ?? []);
}


exports.getFavoriteProvidersForCustomer = async (req, res) => {
  const customer = await CustomerInfo.findById(req.user._id).populate({path: 'favoriteProviderList', populate: 'providerInfo'});

  return res.status(200).send(customer.favoriteProviderList ?? []);
}


exports.updateProviderInfoForProvider = async (req, res) => {

  req.body = getCleanData(req.body);

  let exists = await ProviderInfo.findById(req.user._id);
  if(!exists){
    return res.status(400).send({message: 'No provider found.'})
  }

  const {error} = validateProviderInfo(req.body);
  if(error){
    return res.status(400).send({message: error.message});
  }

  if(req.body.timeToStart){
    req.body.timeToStart = get24BaseTime(req.body.timeToStart)
  }

  
  if(req.body.timeToClose){
    req.body.timeToClose = get24BaseTime(req.body.timeToClose)
  }

  const _preProviderInfo = await ProviderInfo.findById(req.user._id);
  if(_preProviderInfo.serviceList?.length == 0){
    return res.status(400).send({message: "You need to add some services. At least 1 service is mandatory."});
  }

  let providerInfo = {...req.body, shopUrl: req.user._id.toString()};

  await ProviderInfo.findByIdAndUpdate(
    req.user._id,
    {
      $set: providerInfo
    },
    {useFindAndModify: false}
  );


  const user = await User.findById(req.user._id).populate('customerInfo providerInfo role');

  if(user.businessName != req.body.salonName || user.serviceType != req.body.serviceType){
    
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {businessName: req.body.salonName, serviceType: req.body.serviceType}
      }
    );
  }

  return res.status(200).send(user);

}

exports.changeUserPassword = async (req, res) => {

  let userId = req.params.userId;
  let newPassword = req.body.newPassword;
  if (!userId || !newPassword) {
    return res.status(400).send({message: 'newPassword is mandatory.'});
  }

  let user = await User.findById(userId);
  if (!user)
    return res
      .status(400)
      .send({message: `User with this id ${userId} is not exists.`});

  const salt = bcrypt.genSaltSync(10);
  newPassword = bcrypt.hashSync(newPassword, salt);

  await User.findByIdAndUpdate(
    userId,
    { $set: { password: newPassword } },
    { useFindAndModify: false }
  )
  return res
    .header()
    .status(200)
    .send({message: 'Password changed successfully.'});
};

exports.changeCustomerPassword = async (req, res) => {

  let phone = req.body.phone;
  let newPassword = req.body.newPassword;
  if (!phone || !newPassword) {
    return res.status(400).send({message: 'phone and newPassword is mandatory.'});
  }

  let user = await User.findOne({ phone });
  if (!user)
    return res
      .status(400)
      .send({message: `User with this id ${userId} is not exists.`});

  const salt = bcrypt.genSaltSync(10);
  newPassword = bcrypt.hashSync(newPassword, salt);

  await User.findOneAndUpdate(
    { phone },
    { $set: { password: newPassword } },
    { useFindAndModify: false }
  )
  return res
    .header()
    .status(200)
    .send({message: 'Password changed successfully.'});
};

exports.getAllUsers = async (req, res) => {
  let page = req.query.page ? parseInt(req.query.page) : 1;
  let size = req.query.size ? parseInt(req.query.size) : PAGE_SIZE;

  if (page < 1 || size < 1) {
    return res.status(400).send({message: 'Page and size must be a positive number.'});
  }

  const skip = (page - 1) * size;
  let showOnlyDue = req.query.showOnlyDue;
  delete req.query.showOnlyDue;
  let searchQuery = getQueryParams(req.query);
  searchQuery.deleted = {$ne: true}

  if(showOnlyDue == 'true'){
    searchQuery.currentBalance = {$gt: 0}
  }
  const totalElements = await User.countDocuments(searchQuery);

  if(req.query.exportExcel){
    let allUsers = await User.find(searchQuery).populate('providerInfo');
    return res.status(200).send(allUsers);
  }

  var users = await User.find(searchQuery).skip(skip).limit(size);

  return res.status(200).send({ content: users, totalElements, page, size });
};


exports.getAllProviderUsers = async (req, res) => {
  let page = req.query.page ? parseInt(req.query.page) : 1;
  let size = req.query.size ? parseInt(req.query.size) : PAGE_SIZE;

  if (page < 1 || size < 1) {
    return res.status(400).send({message: 'Page and size must be a positive number.'});
  }

  const skip = (page - 1) * size;
  let latitude = req.query.latitude;
  let longitude = req.query.longitude;
  delete req.query.latitude;
  delete req.query.longitude;
  let searchQuery = getQueryParams({...req.query, pendingProvider: 'false', isProvider: 'true', salonSpecialist: false});
  searchQuery.providerInfo = {$ne: null};
  searchQuery.deleted = {$ne: true}
  if(req.query.gender)
    searchQuery.gender = req.query.gender;

  const totalElements = await User.countDocuments(searchQuery);

  if(latitude > 0 && longitude > 0){
    let users = await User.find(searchQuery).populate('providerInfo role');

    let nearbyUsers = [];

    for(let i =0; i< users.length; i++){
      let distance = getDistanceFromLatLonInKm(users[i].providerInfo.latitude, users[i].providerInfo.longitude, latitude, longitude);
        nearbyUsers.push({...users[i]._doc, distance});
    }
    
    nearbyUsers = nearbyUsers.sort((a, b) => a.distance > b.distance ? 1 : -1);

    return res.status(200).send({ content: nearbyUsers, totalElements: nearbyUsers.length, page: 1, size: nearbyUsers.length });
  }else{
    let users = await User.find(searchQuery).populate('providerInfo role').skip(skip).limit(size);

    return res.status(200).send({ content: users, totalElements, page, size });
  }
};

exports.getProfile = async (req, res) => {

  const permissionString = req.user.permissionString;

  let permissions = [];
  for (let p in PERMISSION_DATA) {
    if (hasPermission(p, permissionString)) {
      permissions.push(p);
    }
  };

  const user = await User.findById(req.user._id).populate('customerInfo providerInfo role').select('-clients');

  if (!user) {
    return res.status(403).send({message: 'Can not find profile.'});
  }

  return res.status(200).send({...user._doc, permissions});
};

exports.getClients = async (req, res) => {
  // const providerInfo = await ProviderInfo.findById(req.user._id).populate('clients');
  // const clients = providerInfo.clients.filter( e => e.fullName.includes(req.query.fullName??'') && e.phone?.includes(req.query.phone??''));

  let clients = await ProviderClientRecords.find({provider: req.user._id}).populate('client').sort([['lastServiceDate', -1]]);
  clients = clients.filter( e => e.client.fullName.includes(req.query.fullName??'') && e.client.phone?.includes(req.query.phone??''));

  return res.status(200).send(clients);
}



exports.getLiteProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  return res.send(user);
};

exports.updateCustomerProfile = async (req, res) => {

  const id = req.user._id;

  const data = getCleanData(req.body);

  const { error } = validateUserForCustomerProfileUpdate(data);
  if (error) {
    return res.status(400).send({message: error.message});
  }

  let user = _.pick(data, ['fullName','phone', 'email', 'gender', 'dateOfBirth', 'profilePicture', 'active', 'refUserCode']);

  let oldUser = await User.findById(id);
  if(user.refUserCode){

    if(oldUser.refCode == user.refUserCode){
      return res.status(400).send({message: "You can not use your own referral code. Please use another user's referral code."});
    }

    const existsUser = await User.findOne({refCode: user.refUserCode});
    if(!existsUser){
      return res.status(400).send({message: 'Invalid referral code. No user found with this referral code.'});
    }
  }


  if( user.phone && oldUser?.phone !== user.phone){
    const alreadyExists = await User.findOne({phone: user.phone});
    if(alreadyExists){
      return res.status(400).send({message: 'This phone number is already exists for another user.'});
    }
  }

  const result = await User.findByIdAndUpdate(id, { $set: user }, { useFindAndModify: false });

  const providerInfo = await ProviderInfo.findById(result._id);

  return res.status(200).send({...result._doc,...user, providerInfo});
}

exports.updateBankInfo = async (req, res) => {

  const id = req.user._id;

  const data = getCleanData(req.body);

  const { error } = validateUserBankInfo(data);
  if (error) {
    return res.status(400).send({message: error.message});
  }

  const result = await User.findByIdAndUpdate(
    id, 
    { $set: data }, 
    { useFindAndModify: false }
  );

  await ProviderInfo.findByIdAndUpdate(
    id,
    {$set: data},
    {useFindAndModify: false}
  )

  const providerInfo = await ProviderInfo.findById(result._id);

  return res.status(200).send({...result._doc,...data, providerInfo});
}

exports.addPhoneNumber = async (req, res) => {

  const { error } = validatePhoneNumberSchema(req.body);
  if (error) {
    return res.status(400).send({message: error.details.map(e => e.message)});
  }

  const data = { ...req.body, _id: mongoose.Types.ObjectId() }
  await CustomerInfo.findByIdAndUpdate(
    req.user._id,
    { $push: { phoneList: data } },
    { useFindAndModify: false }
  );

  return res.status(200).send(data);

}

exports.editPhoneNumber = async (req, res) => {

  const id = req.params.id;

  const { error } = validatePhoneNumberSchema(req.body);
  if (error) {
    return res.status(400).send({message: error.details.map(e => e.message)});
  }

  await CustomerInfo.findOneAndUpdate(
    { _id: req.user._id, 'phoneList._id': id },
    { $set: { 'phoneList.$': req.body } },
    { useFindAndModify: false }
  );

  return res.status(200).send({message: 'Phone number updated successfully !'});

}

exports.deletePhoneNumber = async (req, res) => {

  const id = req.params.id;

  const result = await CustomerInfo.findByIdAndUpdate(
    req.user._id,
    { $pull: { phoneList: { _id: id } } },
    { useFindAndModify: false }
  );

  return res.status(200).send(result);

}

exports.addAddressList = async (req, res) => {

  const { error } = validateAddressSchema(req.body);
  if (error) {
    return res.status(400).send({message: error.details.map(e => e.message)});
  }

  const _id = mongoose.Types.ObjectId();
  const data = { ...req.body, _id };

  await User.findByIdAndUpdate(
    req.user._id,
    { $push: { addressList: data } },
    { useFindAndModify: false }
  );

  return res.status(200).send({ ...data });

}

exports.addServiceList = async (req, res) => {

  const { error } = validateService(req.body);
  if (error) {
    return res.status(400).send({message: error.message});
  }

  const _id = mongoose.Types.ObjectId();
  const data = { ...req.body, _id };

  await ProviderInfo.findByIdAndUpdate(
    req.user._id,
    { $push: { serviceList: data } },
    { useFindAndModify: false }
  );

  return res.status(200).send({ ...data });

}

exports.getAllAddresses = async (req, res) => {
  const user = await User.findById(req.user._id);
  return res.status(200).send(user.addressList);
}

exports.getAllServices = async (req, res) => {
  const user = await ProviderInfo.findById(req.user._id);
  return res.status(200).send(user.serviceList);
}


exports.getSpecialistList = async (req, res) => {
  const providerInfo = await ProviderInfo.findById(req.params.providerId).populate('specialistList');
  const specialistList = providerInfo.specialistList;
  return res.status(200).send(specialistList ?? []);
}

exports.editAddressList = async (req, res) => {
  const id = req.params.id;

  const { error } = validateAddressSchema(req.body);
  if (error) {
    return res.status(400).send({message: error.details.map(e => e.message)});
  }

  const result = await User.findOneAndUpdate(
    { _id: req.user._id, 'addressList._id': id },
    { $set: { 'addressList.$': req.body } },
    { useFindAndModify: false }
  );

  return res.status(200).send({ ...req.body });

}

exports.editServiceList = async (req, res) => {
  const id = req.params.id;

  const { error } = validateService(req.body);
  if (error) {
    return res.status(400).send({message: error.details.map(e => e.message)});
  }

  const result = await ProviderInfo.findOneAndUpdate(
    { _id: req.user._id, 'serviceList._id': id },
    { $set: { 'serviceList.$': req.body } },
    { useFindAndModify: false }
  );

  return res.status(200).send({ ...req.body });

}

exports.deleteAddress = async (req, res) => {

  const id = req.params.id;

  const result = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { addressList: { _id: id } } },
    { useFindAndModify: false }
  );

  return res.status(200).send(result);

}

exports.deleteService = async (req, res) => {

  const id = req.params.id;

  const result = await ProviderInfo.findByIdAndUpdate(
    req.user._id,
    { $pull: { serviceList: { _id: id } } },
    { useFindAndModify: false }
  );

  return res.status(200).send(result);

}


exports.updatePassword = async (req, res) => {

  const { error } = validateUpdatePassword(req.body);
  if (error) return res.status(400).send({message: error.message});

  const user = await User.findById(req.user._id);
  let validPassword = await bcrypt.compare(req.body.currentPassword, user.password);
  if (!validPassword) return res.status(400).send({message: "Current password did not mach."});

  else {
    validPassword = await bcrypt.compare(req.body.newPassword, user.password);
    if (validPassword)
      return res.status(402).send({message: "Failed ! Your new password is similar to old password."});

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.newPassword, salt);

    let result = await user.save();
    return res.status(200).send(result);
  }

}


const validateUpdatePassword = (data) => {
  const schema = {
    currentPassword: Joi.string().min(6).required(),
    newPassword: Joi.string().min(6).required()
  }
  return Joi.validate(data, schema);
}

exports.addUser = async (req, res) => {

  req.body = getCleanData(req.body);
  if(req.body.type == 'FACIAL & SPA'){
    req.body.type = 'JOM_FACIAL';
  }
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send({message: error.message});

  if(req.query.isSpecialist){
    if(!req.query.providerId){
      return res.status(400).send({message: 'Please send providerId in query params.'})
    }
  }

  let user = await User.findOne({ phone: req.body.phone });
  if (user)
    return res
      .status(400)
      .send({message: "User already registered with this phone number."});

  const _id = mongoose.Types.ObjectId();
  req.body._id = _id;
  req.body.customerInfo = _id;

  if (req.body.type == 'SALON' ||req.body.type == 'BARBER' || req.body.type == 'MUA' || req.body.type == 'JOM_FACIAL'){
    req.body.providerInfo = _id;
    req.body.isProvider = true;
    // req.body.role = req.body.type;
    let provider = {_id, type: req.body.type};
    if(req.query.isSpecialist){

      const providerInfo = await ProviderInfo.findById(req.query.providerId);

      provider.salonName = providerInfo.salonName;
      provider.logo = providerInfo.logo;
      provider.coverPhoto = providerInfo.coverPhoto;
      provider.salon = req.query.providerId;
      provider.salonSpecialist = true;
      provider.specialistList = [];
      provider.serviceList = [];
      provider.clients = [];
      provider.description = req.body.specialistDescription,
      provider.shopUrl = req.body.phone;
      req.body.salon = req.query.providerId;
      req.body.salonSpecialist = true;
    }
    const providerInfo = ProviderInfo(provider);
    await providerInfo.save();
  }else{
    req.body.type = 'ADMIN';
    req.body.isAdmin = true;
  }

  // const role = await Role.findOne({ alias: 'CUSTOMER' });
  // if (!role) {
  //   const roleResult = await Role({ alias: "CUSTOMER" }).save();
  //   req.body.role = roleResult._id;
  // }
  // else {
  //   req.body.role = role._id;
  // }

  user = new User(req.body);

  const salt = bcrypt.genSaltSync(10);
  user.password = bcrypt.hashSync(user.password, salt);

  await user.save();
  const customerInfo = CustomerInfo({
    _id,
    deliveryAddressList: [],
    phoneList: [{ number: req.body.phone, type: "PRIMARY" }]
  });

  await customerInfo.save();

  if(req.query.isSpecialist){

    let _providerInfo = await ProviderInfo.findById(req.query.providerId);
    let _list = [_id];
    if(_providerInfo?.specialistList){
      _list = [..._providerInfo.specialistList, _id];
    }
    await ProviderInfo.findByIdAndUpdate(
      req.query.providerId,
      {
        $set: {specialistList: _list}
      }
    )
  }

  const token = await user.generateAuthToken();
  return res
    .header("x-auth-token", token)
    .status(200)
    .send(user);
};


exports.deleteUser = async (req, res) => {
  const result = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {deleted: true}
    },
    {useFindAndModify: false}
    )
  
  return res.send(result);
};

exports.updateUser = async (req, res) => {
  
  console.log(req.body);

  const { error } = validateUserForUpdate(req.body);
  if (error) return res.status(400).send({message: error.message});
  const userId = req.params.id;

  if(req.body.phone){
    const user = await User.findById(userId);
    if(user.phone != req.body.phone){
      const existsUserByThisPhone = await User.findOne({phone: req.body.phone});
      if(existsUserByThisPhone){
        return res.status(400).send({message: 'User already exists with this phone number.'});
      }
    }
  }

  // req.body.updatedAt = new Date();
  const result = await User.findByIdAndUpdate(userId, {

    $set: { ...req.body, needToRefreshToken: true }
  }, { useFindAndModify: false });

  return res.status(200).send({ ...result._doc, ...req.body });
};

exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).populate({path: 'providerInfo customerInfo role'}).select('-password');
  if (!user) {
    return res.status(404).send({message: 'Can not found user by id ' + req.params.id});
  }
  return res.status(200).send(user);
};

exports.getSelf = async (req, res) => {
  let user = await User.findById(req.user._id);
  return res.status(200).send(user);
};

exports.sendNotificationToUsers = async (req, res) => {
  const data = req.body;

  var notification = {
    'title': data.title,
    'body': data.message
  }

  let isProvider = {$ne: true};
  if(data.type = 'PROVIDER'){
    isProvider = true;
  }

  const users = await User.find({isProvider});
  
  var fcmToken = [];
  if(users && users.length > 0){
    for(let i=0; i< users.length; i++){
      if(users[i].fcmTokens?.length > 0){
        fcmToken = [...fcmToken, ...users[i].fcmTokens];
      }
    }
  }

  if(fcmToken.length > 0){
    var notificationBody = {
      'notification': notification,
      'data': {
        type: 'GENERAL_ANNOUNCEMENT'
      },
      'registration_ids': fcmToken
    }
    
    const result = await sendNotifications(notificationBody);
    if(result.status){
      return res.status(200).send({message: "Notification sent successfully."});
    }else{
      return res.status(400).send({message: result.errorMsg})
    }

  }

}

exports.mailTest = async (req, res) => {
  let transporter = nodemailer.createTransport(
    {
      host: 'mail.privateemail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'info@headdos.com',
        pass: 'Abc13579'
      },
      tls: {
        rejectUnauthorized: false
      },
      logger: true,
      debug: false // include SMTP traffic in the logs
    },
  );

  let message = {
    to: 'ninadnafiul@gmail.com',
    from: 'info@headdos.com',
    subject: 'Mail testing',
    text: 'The mail server is working',
    html: `
        <div>
        <div style = "background-color:black;height:170px;width:220px;text-align:center">
        <img src = "https://api.headdos.com/public/uploads/adminPortal/92021/image-2021-10-31T01-24-45.829Z.png" alt = "Headdos" height= "150px" />
          </div>
            <div>
          <h3>Payment successful for booking number 12345 in headdos</h3>
          
          <p>Total price: 100RM</p>
          <p>Payment received: 20.00RM</p>
          
          <p>Your total due is 80RM. Pay the due amount in cash to the provider.</p>
          
          <hr/>
          
          <p>Provider name: <b>Shi's beauty</b></p>
          <p>Provider address: <b>Khilkhet nikunja 2, road 1, regency tower, 4th floor, Dhaka 1212</b></p>
          <p>Booking time: <b>10:00 Am, 12/01/2022</b></p>
          <br/>
          <p>Customer name: <b>Nafiul islam</b></p>
          <p>Customer address: <b>Khilkhet nikunja2, road 5, Sarkar bari mashjid. dhaka 1212.</b></p>
       </div>
     </div>
   
   
  
 
    `
  };

  transporter.sendMail(message, (error, info) => {
    if (error) {
      console.log('error occurred', error);
      return res.status(500).send(error);
    }
    console.log('Message sent successfully !', info);
    transporter.close();
    return res.status(200).send('message sent successfully!');
    
  })
}

exports.deleteCorruptedDeliveryAddresses = async (req, res) => {
  let users = await User.find().populate({ path: 'customerInfo', populate: { path: 'deliveryAddressList.area' } });

  for (let i = 0; i < users.length; i++) {
    const addresses = users[i].customerInfo.deliveryAddressList.filter(e => e.area != null);
    await CustomerInfo.findByIdAndUpdate(users[i]._id, { $set: { deliveryAddressList: addresses } });

  }

  users = await User.find().populate({ path: 'customerInfo', populate: { path: 'deliveryAddressList.area' } });

  return res.status(200).send(users);
}

exports.addPersonalPhotos = async (req, res) => {
  let customerInfo = await CustomerInfo.findById(req.user._id);

  customerInfo.personalPhotoList.push(req.body.url);

  await CustomerInfo.findByIdAndUpdate(
    req.user._id,
    {
      $set: {personalPhotoList: customerInfo.personalPhotoList}
    }
  );

  return res.status(200).send({message: 'Photo uploaded successfully'});
}

exports.removePersonalPhotos = async (req, res) => {
  let customerInfo = await CustomerInfo.findById(req.user._id);

  customerInfo.personalPhotoList = customerInfo.personalPhotoList.filter(e => e != req.body.url);

  await CustomerInfo.findByIdAndUpdate(
    req.user._id,
    {
      $set: {personalPhotoList: customerInfo.personalPhotoList}
    }
  );

  return res.status(200).send({message: 'Photo removed successfully'});
}

exports.checkRefCode = async (req, res) => {
  const user = await User.findOne({refCode: req.body.refCode});
  if(!user){
    return res.status(200).send({exist: false});
  }

  return res.status(200).send({exist: true});
}

exports.signOut = async (req, res) => {
  const fcmToken = req.body.fcmToken;
  
  if(!fcmToken){
    return res.status(400).send({message: 'No fcm token provided.'});
  }

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: {fcmTokens: fcmToken}
    }
  );

  return res.status(200).send({message: 'Logged out successfully.'});
}

exports.sendNotificationToSpecificCustomer = async (req, res) => {
  const userId = req.params.userId;
  const response = await sendNotificationToSpecificCustomer(userId, req.user._id);
  if(response.status){
    return res.status(200).send({message: 'Notification sent successfully.'});
  }else{
    return res.status(400).send({message: response.errorMsg});
  }
}


exports.refUsagesHistory = async (req, res) => {
  const user = await User.findById(req.user._id);
  const users = await User.find({refUserCode: user.refCode});

  return res.status(200).send(users);
}

exports.checkRefIncome = async (req, res) => {
  const user = await User.findOne({phone: '+60192326796'});
  const users = await User.find({refUserCode: user.refCode});

  let allBookings = [];

  for(let i=0; i<users.length; i++){
    let bookings = await Booking.find({provider: mongoose.Types.ObjectId(users[i]._id), status: 'COMPLETED', garbage: {$ne: true}});
    allBookings.push(...bookings);
  }

  let totalBookingPrice = 0;
  let totalServiceCharge = 0;
  let totalRefIncome = 0;
  for(let i=0; i < allBookings.length; i++){
    totalBookingPrice += allBookings[i].totalPrice;
    totalServiceCharge += allBookings[i].serviceCharge;

    totalRefIncome += ((allBookings[i].serviceCharge * 10) / 100);
  }


  return res.status(200).send({totalBookingPrice, totalServiceCharge, totalRefIncome,user, allBookings});
}

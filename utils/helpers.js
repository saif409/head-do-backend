
const ObjectId = require('mongoose').Types.ObjectId;
const PERMISSION_DATA = require('../middleware/permissionData');
const {User} = require("../models/user");
const { default: axios } = require("axios");

exports.validateUrl = (url) => {
    return url.includes('.com') && url.includes('https://');
}

exports.getQueryParams = (query) => {

    if(query == null) return {};

    delete query.page;
    delete query.size;

    query = this.getCleanData(query);
    for(let q in query){

        if((isNaN(query[q]) || q == 'phone' || q == 'code') && (query[q] != 'true' && query[q] != 'false') && !ObjectId.isValid(query[q])){
            query[q] = { $regex: `.*${query[q]}.*`, $options: 'i'}
        }else if(query[q] == 'true'){
            query[q] =true;
        }else if(query[q] == 'false'){
            query[q] = {'$ne': true}
        }
    }

    return query;
}

exports.getAndQueryParams = (query) => {

  if(query == null) return {};

  delete query.page;
  delete query.size;

  query = this.getCleanData(query);
  let params = [];
  for(let q in query){

      if((isNaN(query[q]) || q == 'phone') && (query[q] != 'true' && query[q] != 'false') && !ObjectId.isValid(query[q])){
          query[q] = { $regex: `.*${query[q]}.*`, $options: 'i'}
      }else if(query[q] == 'true'){
          query[q] =true;
      }else if(query[q] == 'false'){
          query[q] = {'$ne': true}
      }
  }

  return query;
}

exports.getCleanData = (data) => {
    for(let d in data){
        if(data[d] === '' || data[d] == null){
            delete data[d];
        }
    }
    return data;
}
  
exports.hasPermission = (operationName, permissionString) => {
    if(!permissionString){
      return false;
    }
    const permissionNumber = PERMISSION_DATA[operationName].permissionNumber;
  
    const characterPosition = Math.floor(permissionNumber / 7);
    // if(characterPosition >= permissionString.length){
    //   return false;
    // }
    const bitPosition = permissionNumber % 7;
  
    const ascii = permissionString.charCodeAt(characterPosition);
  
    let binary = ascii.toString(2);
    
    if(binary.length < 7){
      binary = '0'.repeat( 7 - binary.length ) + binary;
    }
    if(binary.toString()[bitPosition] == '1'){
      return true;
    }
    return false;
  }

  exports.getDiscountAmount = (data) => {
    if(data.discountType == 'FLAT' && data.discountAmount > 0){
      return data.discountAmount;
    }
    else if(data.discountType == 'PERCENTAGE' && data.discountPercentage > 0){
      return (data.discountPercentage * data.salePrice) / 100;
    }
    return 0;
  }

  exports.getPromoDiscountAmount = (data, totalPrice) => {
    if(data.discountType == 'FLAT' && data.discountAmount > 0){
      return data.discountAmount;
    }
    else if(data.discountType == 'PERCENTAGE' && data.discountPercentage > 0){
      return (data.discountPercentage * totalPrice) / 100;
    }
    return 0;
  }
  
  exports.getPrice = (data) => {
    return data.salePrice - this.getDiscountAmount(data);
  }

  exports.getProductCharge = (product) => {
      let productPrice = this.getPrice(product);

      let charge = 0;
      if(product.subscriptionPlan){
          if(product.subscriptionPlan.chargeType == 'FLAT'){
              charge = product.subscriptionPlan.chargeAmount;
          }else if(product.subscriptionPlan.chargePercentage > 0){
              charge = (productPrice * product.subscriptionPlan.chargePercentage) / 100;
          }
      }

      return charge;
  }

  exports.get24BaseTime = (time) => {
    let _timeToStart = time;
    _timeToStart = _timeToStart.split(':');
    let hour = _timeToStart[0];
    let min = _timeToStart[1].split(' ')[0];
     let am_pm = _timeToStart[1].split(' ')[1];

     if(am_pm == 'PM'){
       hour = parseInt(hour) + 12;
     }
    return parseFloat(`${hour}.${min}`);
  }

  exports.createDateTime = (dateTime) => {
    let date = dateTime.split(' ')[0];
    let time = dateTime.split(' ')[1];
    let amPm = dateTime.split(' ')[2];
    let hour = time.split(':')[0];
    let min = time.split(':')[1];

    if(amPm == 'PM'){
      hour = parseFloat(hour) + 12;
    }
    if(hour.toString().length == 1){
      hour = `0${hour}`;
    }
    if(min.toString().length == 1){
      min = `0${min}`;
    }

    date = date.split('-');
    return `${date[2]}-${date[1]}-${date[0]}T${hour}:${min}:00.000Z`;
  }

  exports.sendNotificationForWantedImmediately = async (serviceType, bookingId) => {

    var notification = {
      'title': 'Hey! Someone want a service immediately',
      'body': 'Check the booking request.'
    }
  
    const users = await User.find({$or: [{serviceType: 'BOTH'}, {serviceType: serviceType}]});
    
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
          type: 'WANTED_IMMEDIATELY',
          bookingId
        },
        'registration_ids': fcmToken
      }
      
      sendNotification(notificationBody);

    }
  
  }

  exports.sendNotificationToSpecificProvider = async (userId, bookingId) => {

    var notification = {
      'title': 'Hey! someone has booked for your service',
      'body': 'Click here to check.'
    }
  
    const user = await User.findById(userId);

    var fcmToken = [...user.fcmTokens];

    if(fcmToken.length > 0){
      var notificationBody = {
        'notification': notification,
        'data': {
          type: 'BOOKING',
          bookingId
        },
        'registration_ids': fcmToken
      }
      
      sendNotification(notificationBody);

    }
  
  }

  exports.sendNotificationToSpecificCustomer = async (userId, providerId) => {

    var notification = {
      'title': 'Hey! I am here to book your services',
      'body': 'Check it out.',
      'type': 'PROVIDER' 
    }
  
    const user = await User.findById(userId);

    var fcmToken = [...user.fcmTokens];

    if(fcmToken.length > 0){
      var notificationBody = {
        'notification': notification,
        'data': {
          type: 'PROVIDER_TO_CUSTOMER',
          providerId
        },
        'registration_ids': fcmToken
      }
      
      const response = await sendNotification(notificationBody);
      return response;
    }

    return {status: false, errorMsg: 'Can not send notification. This user is not logged into any devices.'};
  
  }

  const sendNotification = async (notificationBody) => {
    try{
      const response = await axios.post(
        'https://fcm.googleapis.com/fcm/send',
        notificationBody,
        { 
          headers: {
            "Authorization": `key=AAAAVTZhQ-U:APA91bHS3qMVpX3iBEzFOCHbmrdYS-nJ0NLS65jautd3F_FuaoJbsV8uzUhvDmtIilOZYp9fwHg59DXP8Ugq9IBHtj-pik-6oMDVt8kTYclnORnWuWMucCeXhjzH2iRHVE_wX3mgXES3`,
            "Content-Type": 'application/json'
          }}
        
      );
      return {status: true};
    }catch(error){
      console.log(error);
      return {status: false, errorMsg: error};
    }
  }

  exports.sendNotifications = async (notificationBody) => {
    try{
      const response = await axios.post(
        'https://fcm.googleapis.com/fcm/send',
        notificationBody,
        { 
          headers: {
            "Authorization": `key=AAAAVTZhQ-U:APA91bHS3qMVpX3iBEzFOCHbmrdYS-nJ0NLS65jautd3F_FuaoJbsV8uzUhvDmtIilOZYp9fwHg59DXP8Ugq9IBHtj-pik-6oMDVt8kTYclnORnWuWMucCeXhjzH2iRHVE_wX3mgXES3`,
            "Content-Type": 'application/json'
          }}
        
      );
      return {status: true};
    }catch(error){
      console.log(error);
      return {status: false, errorMsg: error};
    }
  }

  exports.getDistanceFromLatLonInKm = (lat1,lon1,lat2,lon2) => {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }
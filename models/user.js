const config = require("config");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");
const { validateCustomerInfoSchema } = require("./customerInfo");
const { validateProviderInfoSchema } = require("./providerInfo");
const { Role } = require("./role");
const shortid = require("shortid");


const addressSchema = new mongoose.Schema({
 _id: mongoose.Schema.Types.ObjectId,
 title: {
   type: String
 },
  streetAddress: {
      type: String,
      minlength: 1,
      maxlength: 1000
  },
  addressLine: {
    type: String
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  }
})


const userSchema = new mongoose.Schema({

  email: {
    type: String,
    lowercase: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: "Please enter a valid email address"
    },
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address"
    ]
  },
  //phone field will be changed with proper validation
  password: {
    type: String,
    maxlength: 255,
    minlength: 6
  },
  phone: {
    type: String,
  },
  fullName: {
    type: String,
    maxlength: 70,
    minlength: 3,
    required: true,
    trim: true
  },
  businessName: {
    type: String,
    default: ''
  },
  profilePicture: {
    type: String,
    minlength: 3,
    maxlength: 1000
  },
  gender: {
    type: String,
    enum:['MALE', 'FEMALE', 'OTHERS']
  },
  addressList: {
    type: [addressSchema]
  },
  customerInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomerInfo'
  },
  providerInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProviderInfo'
  },
  isProvider: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  needToRefreshToken: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['ADMIN', 'SALON', 'BARBER', 'MUA','JOM_FACIAL', 'CUSTOMER', 'SYSTEM_ADMIN']
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  banned: {
    type: Boolean,
    default: false
  },
  dateOfBirth: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pendingProvider: {
    type: Boolean,
    default: false
  },
  isVaccinated: {
    type: Boolean,
    default: false
  },
  isAgreeToTerms: {
    type: Boolean,
    default: false
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  },
  salon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  salonSpecialist: {
    type: Boolean,
    default: false
  },
  fcmTokens: [{
    type: String
  }],
  signInType: {
    type: String,
    default: 'PHONE_NUMBER',
    enum: ['GOOGLE', 'FACEBOOK', 'PHONE_NUMBER', 'APPLE']
  },
  refCode: {
    type: String,
    default: shortid.generate
  },
  refUserCode: {
    type: String
  },
  totalIncome: {
    type: Number,
    default: 0
  },
  totalCharge: {
    type: Number,
    default: 0
  },
  totalReferralIncome: {
    type: Number,
    default: 0
  },
  totalWithdraw: {
    type: Number,
    default: 0
  },
  totalCashPaymentFromCustomer: {
    type: Number,
    default: 0
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  serviceType: {
    type: String
  },
  primaryAddress: {
    type: String
  },
  deleted: {
    type: Boolean,
    default: false
  },
  bankName: {
    type: String
  },
  bankBranchName: {
      type: String
  },
  bankAccountNumber: {
      type: String
  },
  bankAccountHolderName: {
      type: String
  },
  BIC: {
    type: String
  },
  companyRegNumber: {
    type: String,
  },
  identityNumber: {
    type: String
  },
  showShopInHomepage: {
      type: Boolean,
      default: false
  },
},
{
  timestamps: true
});

userSchema.methods.generateAuthToken = async function () {

  // const role = await Role.findById(this.role);
  const token = jwt.sign(
    {
      _id: this._id,
      role: this.role,
      // permissionString: role.permissionString,
      isProvider: this.isProvider,
      phone: this.phone,
      fullName: this.fullName,
      email: this.email,
      isAdmin: this.isAdmin,
      type: this.type,
      salonSpecialist: this.salonSpecialist
    },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

// var validateEmail = function(email) {
//   var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
//   return re.test(email);
// };

const addressValidator = {
  title: Joi.string().allow(null).allow(''),
  streetAddress: Joi.string().min(1).max(1000),
  addressLine: Joi.string().allow(null).allow(''),
  latitude: Joi.number(),
  longitude: Joi.number(),
  _id: Joi.ObjectId().allow('').allow(null)
}



function validateUser(user) {
  const schema = {
    role: Joi.ObjectId().allow(null).allow(''),
    password: Joi.string()
      .min(6)
      .max(30)
      .required(),
    email: Joi.string()
      .email(),
    phone: Joi.string()
      .required(),
    fullName: Joi.string()
      .max(70)
      .min(2)
      .required(),
      profilePicture: Joi.string().min(3).max(1000),
    gender: Joi.string()
     .valid('MALE', 'FEMALE', 'OTHERS'),
     type: Joi.string().valid('CUSTOMER', 'SALON', 'BARBER','JOM_FACIAL', 'MUA', 'SYSTEM_ADMIN').allow(null),
    addressList: Joi.array().items(addressValidator),
    primaryAddress: Joi.string().allow('').allow(null),
    active: Joi.boolean(),
    isVaccinated: Joi.boolean().allow(null),
    isAgreeToTerms: Joi.boolean().allow(null),
    banned: Joi.boolean(),
    dateOfBirth: Joi.string(),
    active: Joi.boolean().allow(null),
    specialistDescription: Joi.string().allow('').allow(null)
    // type: Joi.string().valid('ADMIN')
  };

  return Joi.validate(user, schema);
}

function validateUserForSignup(user) {
  const schema = {
    password: Joi.string()
      .min(6)
      .max(30)
      .required(),
    email: Joi.string()
      .email(),
    phone: Joi.string()
      .required(),
      refUserCode: Joi.string(),
    fullName: Joi.string()
      .max(70)
      .min(3)
      .required(),
    gender: Joi.string()
     .valid('MALE', 'FEMALE', 'OTHERS').allow(null),
    type: Joi.string().valid('CUSTOMER', 'SALON', 'BARBER','JOM_FACIAL', 'MUA', 'SYSTEM_ADMIN').required(),
    isVaccinated: Joi.boolean().allow(null),
    isAgreeToTerms: Joi.boolean().allow(null),
    active: Joi.boolean().allow(null),
  };

  return Joi.validate(user, schema);
}

function validateUserForUpdate(user) {
  const schema = {
    phone: Joi.string(),
    email: Joi.string()
      .email().allow(null),
    fullName: Joi.string()
      .max(70)
      .min(3).allow(null),
    gender: Joi.string()
      .valid('MALE', 'FEMALE', 'OTHERS').allow(null),
    addressList: Joi.array().items(addressValidator),
    active: Joi.boolean().allow(null),
    banned: Joi.boolean().allow(null),
    profilePicture: Joi.string().min(3).max(1000).allow(null),
    dateOfBirth: Joi.string().allow(null).allow(""),
    pendingProvider: Joi.boolean().allow(null),
    isVaccinated: Joi.boolean().allow(null),
    isAgreeToTerms: Joi.boolean().allow(null),
    role: Joi.ObjectId().allow(null).allow(''),
    primaryAddress: Joi.string().allow('').allow(null),
  };
  return Joi.validate(user, schema);
}

function validateUserForCustomerProfileUpdate(user) {
  const schema = {
    _id: Joi.ObjectId(),
    email: Joi.string()
      .email(),
    phone: Joi.string().required(),
    refUserCode: Joi.string().allow(null),
    fullName: Joi.string()
      .max(70)
      .min(3),
    gender: Joi.string()
      .max(100)
      .min(3).allow(null),
      password: Joi.string(),
      phone: Joi.string(),
      type: Joi.string(),
      customerInfo: Joi.object().keys(validateCustomerInfoSchema),
      providerInfo: Joi.object().keys(validateProviderInfoSchema),
      profilePicture: Joi.string().min(3).max(1000),
      dateOfBirth: Joi.string(),
      isVaccinated: Joi.boolean().allow(null),
      isAgreeToTerms: Joi.boolean().allow(null),
      active: Joi.boolean().allow(null),
  };
  return Joi.validate(user, schema);
}

function validateUserBankInfo(info){
  const schema = {
    bankName: Joi.string().required(),
    bankBranchName: Joi.string().allow(null).allow(''),
    bankAccountNumber: Joi.string().required(),
    bankAccountHolderName: Joi.string().required(),
    identityNumber: Joi.string().required(),
    companyRegNumber: Joi.string().allow('').allow(null),
    BIC: Joi.string().allow(null).allow('')
  }
  return Joi.validate(info, schema);
}


function validateUserForProviderProfileUpdate(user) {
  const schema = {
    _id: Joi.ObjectId(),
    email: Joi.string()
      .email(),
    fullName: Joi.string()
      .max(70)
      .min(3),
    gender: Joi.string()
      .max(100)
      .min(3),
    providerInfo: Joi.object().keys(validateProviderInfoSchema),
    profilePicture: Joi.string().min(3).max(1000),
    active: Joi.boolean().allow(null),
  };
  return Joi.validate(user, schema, { abortEarly: false });
}


function validateAddressSchema(address) {
  return Joi.validate(address, addressValidator);
}


module.exports = { 
  User, 
  validateUser, 
  addressSchema, 
  validateUserForSignup,
  validateUserBankInfo, 
  validateUserForUpdate, 
  validateUserForCustomerProfileUpdate, 
  validateUserForProviderProfileUpdate,  
  validateAddressSchema,
  addressValidator };

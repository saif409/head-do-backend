const { User, validateUserForProviderProfileUpdate } = require("../models/user");
var mongoose = require('mongoose');
const _ = require("lodash");
const { ProviderInfo,
  validatePhoneNumberSchema, validateWarehouseAddressSchema, validateProviderInfo } = require("../models/providerInfo");
const { Role } = require("../models/role");
const { getQueryParams} = require("../utils/helpers");
const { PAGE_SIZE } = require("../utils/constants");
const { ProviderLedger, validateProviderLedger } = require("../models/providerLedger");
const endOfDay = require('date-fns/endOfDay');
const startOfDay = require('date-fns/startOfDay');

exports.updateProviderProfile = async (req, res) => {
  const id = req.user._id;

  const { error } = validateProviderInfo(req.body);
  if (error) {
    return res.status(400).send(error.details.map(e => e.message));
  }

  const providerInfo = await ProviderInfo.findById(id);

  // if (providerInfo.shopUrl !== req.body.shopUrl) {
  //   const shopUrl = await ProviderInfo.find({ shopUrl: req.body.shopUrl });
  //   if (!providerInfo.shopUrl && shopUrl.length > 0) {
  //     return res.status(400).send('This shop url is already exists. Please use a different shop url.')
  //   }
  //   else if (providerInfo.shopUrl && shopUrl.length > 1) {
  //     return res.status(400).send('This shop url is already exists. Please use a different shop url.')
  //   }
  // }

  
  // const address = _.pick(req.body, ['area', 'streetAddress']);
  await User.findByIdAndUpdate(
    id,
    { useFindAndModify: false }
  )

  // if(providerInfo.requestForVerification){
  //   delete req.body.shopUrl;
  // }

  // req.body.requestForVerification = true;
  // req.body.reasonOfRejection = null;

  const result = await ProviderInfo.findByIdAndUpdate(id, { $set: req.body }, { useFindAndModify: false });

  return res.status(200).send(result);
}

exports.getAllShops = async (req, res) => {
  let page = req.query.page ? parseInt(req.query.page) : 1;
  // let size = req.query.size ? parseInt(req.query.size) : PAGE_SIZE;
  let size = 1000;

  if (page < 1 || size < 1) {
    return res.status(400).send('Page and size must be a positive number.');
  }

  req.query.active = true;
  req.query.verified = true;
  let searchQuery = getQueryParams(req.query);

  console.log(searchQuery);

  const skip = (page - 1) * size;
  const totalElements = await ProviderInfo.countDocuments(searchQuery);

  const shops = await ProviderInfo.find(searchQuery).skip(skip).limit(size).sort([['position', 1]]);
  return res.status(200).send({ content: shops, totalElements, page, size });
}

exports.getProviderByShopUrl = async (req, res) => {

  const shop = await ProviderInfo.findOne({ shopUrl: req.params.shopUrl });
  if (!shop) {
    return res.status(404).send('No shop found');
  }

  return res.status(200).send(shop);
}


exports.getProviders = async (req, res) => {

  let page = req.query.page ? parseInt(req.query.page) : 1;
  let size = req.query.size ? parseInt(req.query.size) : PAGE_SIZE;

  if (page < 1 || size < 1) {
    return res.status(400).send('Page and size must be a positive number.');
  }

  let searchQuery = getQueryParams(req.query);

  const skip = (page - 1) * size;
  const totalElements = await ProviderInfo.countDocuments(searchQuery);
  var providers = await ProviderInfo.find(searchQuery).skip(skip).limit(size);

  return res.status(200).send({ content: providers, totalElements, page, size });

}

exports.verifyProvider = async (req, res) => {

  const id = req.params.id;

  if (!req.body.verified) {
    if (!req.body.reasonOfRejection) {
      return res.status(400).send('Please input reason of rejection if the provider is not verified.');
    }
    const result = await ProviderInfo.findByIdAndUpdate(
      id,
      { $set: { verified: false, reasonOfRejection: req.body.reasonOfRejection } },
      { useFindAndModify: false }
    )

    return res.status(200).send(result);
  }

  const role = await Role.findOne({ alias: 'VENDOR' });

  if (!role) {
    return res.status(500).send('VENDOR role is not created yet.')
  }

  await User.findByIdAndUpdate(
    id,
    { $set: { role: role._id, needToRefreshToken: true } },
    { useFindAndModify: false }
  );

  const subscriptionPlan = await SubscriptionPlan.findOne({ planName: 'Default' })

  if (!subscriptionPlan) {
    return res.status(500).send('Default SubscriptionPlan is not created yet.')
  }

  const result = await ProviderInfo.findByIdAndUpdate(
    id,
    { $set: { verified: true, subscriptionPlan: subscriptionPlan._id, reasonOfRejection: null } },
    { useFindAndModify: false }
  );

  return res.status(200).send(result);

}

exports.addPhoneNumber = async (req, res) => {

  const { error } = validatePhoneNumberSchema(req.body);
  if (error) {
    return res.status(400).send(error.details.map(e => e.message));
  }

  const data = { ...req.body, _id: mongoose.Types.ObjectId() }
  await ProviderInfo.findByIdAndUpdate(
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
    return res.status(400).send(error.details.map(e => e.message));
  }

  await ProviderInfo.findOneAndUpdate(
    { _id: req.user._id, 'phoneList._id': id },
    { $set: { 'phoneList.$': req.body } },
    { useFindAndModify: false }
  );

  return res.status(200).send('Phone number updated successfully !');

}

exports.deletePhoneNumber = async (req, res) => {

  const id = req.params.id;

  const result = await ProviderInfo.findByIdAndUpdate(
    req.user._id,
    { $pull: { phoneList: { _id: id } } },
    { useFindAndModify: false }
  );

  return res.status(200).send(result);

}

exports.addDeliveryList = async (req, res) => {

  const { error } = validateWarehouseAddressSchema(req.body);
  if (error) {
    return res.status(400).send(error.details.map(e => e.message));
  }

  const _id = mongoose.Types.ObjectId();
  const data = { ...req.body, _id };

  await ProviderInfo.findByIdAndUpdate(
    req.user._id,
    { $push: { warehouseAddressList: data } },
    { useFindAndModify: false }
  );

  return res.status(200).send(data);

}


exports.editWarehouseAddressList = async (req, res) => {

  const id = req.params.id;

  const { error } = validateWarehouseAddressSchema(req.body);
  if (error) {
    return res.status(400).send(error.details.map(e => e.message));
  }

  const result = await ProviderInfo.findOneAndUpdate(
    { _id: req.user._id, 'warehouseAddressList._id': id },
    { $set: { 'warehouseAddressList.$': req.body } },
    { useFindAndModify: false }
  );

  return res.status(200).send(result);

}

exports.changeSubscriptionPlan = async (req, res) => {

  const { error } = validateSubscriptionPlan(req.body);
  if (error) {
    return res.status(400).send(error.details.map(e => e.message));
  }

  await ProviderInfo.findByIdAndUpdate(
    req.params.providerId,
    { $set: { subscriptionPlan: req.body } },
    { useFindAndModify: false }
  )

  return res.status(200).send('Subscription plan changed successfully');
}

exports.deleteWarehouseAddress = async (req, res) => {

  const id = req.params.id;

  const result = await ProviderInfo.findByIdAndUpdate(
    req.user._id,
    { $pull: { warehouseAddressList: { _id: id } } },
    { useFindAndModify: false }
  );

  return res.status(200).send(result);

}


exports.cancelProviderPayment = async (req, res) => {
  const id = req.params.id;
  const ledgers = await ProviderLedger.findByIdAndUpdate(
    id,
    { $set: { canceled: true } },
    { useFindAndModify: false }
  );
  return res.status(200).send(ledgers);
}

exports.createProviderLedgers = async (req, res) => {
  const id = req.params.providerId;
  const { error } = validateProviderLedger(req.body);
  if (error) {
    return res.status(400).send(error.details.map(e => e.message));
  }

  const ledgerCountToday = await ProviderLedger.countDocuments({
    date: {
      $gte: startOfDay(new Date()),
      $lte: endOfDay(new Date())
    }
  });

  const date = new Date();
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear().toString().slice(2);
  req.body.refNo = `${day}${month}${year}${ledgerCountToday + 1}`;

  const ledger = ProviderLedger({
    ...req.body,
    provider: id
  });
  const result = await ledger.save();
  return res.status(200).send(result);
}


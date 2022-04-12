
var mongoose = require('mongoose');
const _ = require("lodash");
const Joi = require("joi");
const { PAGE_SIZE } = require("../utils/constants");
const { getQueryParams, getCleanData, hasPermission } = require("../utils/helpers");
const { PopupBanners, validatePopupBanners } = require("../models/popupBanner");



exports.getAllPopupBanners = async (req, res) => {
  let page = req.query.page ? parseInt(req.query.page) : 1;
  let size = req.query.size ? parseInt(req.query.size) : PAGE_SIZE;

  if(page < 1 || size < 1){
    return res.status(400).send('Page and size must be a positive number.');
  }

  const skip = (page - 1) * size;
  let searchQuery = getQueryParams(req.query);


  const totalElements = await PopupBanners.countDocuments(searchQuery);
  var popupBanners = await PopupBanners.find().skip(skip).limit(size);

  return res.status(200).send({content: popupBanners, totalElements, page, size});
};

exports.getPopupBannersById = async (req, res) => {
  const popupBanners = await PopupBanners.findById(req.params.id);
  if(!popupBanners){
    return res.status(404).send('Can not found popupBanners by id '+ req.params.id);
  }
  return res.status(200).send(popupBanners);
};

exports.deletePopupBanners = async (req, res) => {
    var id = req.params.id;
  
    var popupBanners = await PopupBanners.findById(id);
    if (popupBanners) {
      await popupBanners.deleteOne({_id: id});
      return res.status(200).send(popupBanners);
    } else {
      return res.status(404).send("Page is not found with this id "+ id );
    }
  
  };

exports.addPopupBanners = async (req, res) => {

    const {error} = validatePopupBanners(req.body);
    if(error){
        return res.status(400).send(error.message);
    }

    if(req.body.showBanner){
      await PopupBanners.updateMany({}, {$set: {showBanner: false}});
    }

    const result = await PopupBanners(req.body).save();

    return res.status(200).send(result);

}

exports.getActiveBanner = async (req, res) => {
  const data = await PopupBanners.findOne({showBanner: true});

  if(!data){
    return res.status(404).send({message: 'No active banners.'});
  }

  return res.status(200).send(data);
}

exports.updatePopupBanners = async (req, res) => {
  
    const data = getCleanData(req.body);
    const {error} = validatePopupBanners(data);
    if(error){
        return res.status(400).send(error.details.map(e => e.message));
    }

    if(req.body.showBanner){
      await PopupBanners.updateMany({}, {$set: {showBanner: false}});
    }

    const result = await PopupBanners.findByIdAndUpdate(
        req.params.id,
        {$set: data},
        {useFindAndModify: false}
    )
  
    return res.status(200).send({...result._doc, ...data});
};

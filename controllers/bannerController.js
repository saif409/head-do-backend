
const {
  Banner,
  validateBanners
} = require("../models/banner");
const _ = require("lodash");
const { PAGE_SIZE } = require("../utils/constants");
const { getCleanData, getQueryParams } = require("../utils/helpers");
const { Service } = require("../models/service");
const { ProviderInfo } = require("../models/providerInfo");
const { Role } = require("../models/role");


exports.addBanner = async (req, res) => {

    let banner = {...req.body};

    const {error} = validateBanners(req.body);
    if(error){
        return res.status(400).send(error.details.map(e => e.message));
    }

    const role = await Role.findById(req.user.role._id);
    if(role.alias === 'VENDOR'){
        banner.provider = req.user._id;
    }
    var result = await Banner(banner).save();
    return res.status(200).send(result);

};

exports.updateBanner = async (req, res) => {

    const data = getCleanData(req.body);
    const {error} = validateBanners(data);
    if(error){
        return res.status(400).send(error.details.map(e => e.message));
    }

    const result = await Banner.findByIdAndUpdate(
        req.params.id,
        {$set: data},
        {useFindAndModify: false}
    )
  
    return res.status(200).send({...result._doc, ...data});
};

exports.getBannerById = async (req, res) => {
    var id = req.params.id;
    var banner = await Banner.findById(id).populate('categories');
    return res.status(200).send(banner);
};

exports.getBanners = async (req, res) => {

    let query = {...req.query};
    delete query.servicesSlug;
    delete query.shopUrl;
    let queryParams = getQueryParams(query);
    
    if(req.query.servicesSlug){
        const services = await Service.findOne({slug: req.query.servicesSlug});
        if(services){
            queryParams = {
                ...queryParams,
                categories: services._id
            }
        }else{
            return res.status(200).send([]);
        }
    }
    if(req.query.shopUrl){
        const provider = await ProviderInfo.findOne({shopUrl: req.query.shopUrl});
        if(provider){
            queryParams = {
                ...queryParams,
                provider: provider._id
            }
        }else{
            return res.status(200).send([]);
        }
    }else{
        queryParams = {
            ...queryParams,
            provider: undefined
        }
    }

    var banners = await Banner.find(queryParams).sort([['position', 1]]).populate('categories');

    return res.status(200).send(banners);
};

exports.getBannersPrivate = async (req, res) => {

    let query = {...req.query};
    delete query.servicesSlug;
    delete query.shopUrl;
    let queryParams = getQueryParams(query);

    if(req.user.role.alias === 'VENDOR'){
        queryParams.provider = req.user._id;
    }else{
        queryParams.provider = undefined;
    }

    if(req.query.servicesSlug){
        const services = await Service.findOne({slug: req.query.servicesSlug});
        if(services){
            queryParams = {
                ...queryParams,
                categories: services._id
            }
        }else{
            return res.status(200).send([]);
        }
    }

    var banners = await Banner.find(queryParams).sort([['position', 1]]).populate('categories');

    return res.status(200).send(banners);
};

exports.deleteBanner = async (req, res) => {
    var id = req.params.id;
    var banner = await Banner.deleteOne({_id: id});
    return res.status(200).send(banner);
};

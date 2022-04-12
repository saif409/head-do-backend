
const {
    CountryCode,
    validateCountryCode
  } = require("../models/countryCode");
  const _ = require("lodash");
  const { PAGE_SIZE } = require("../utils/constants");
  const { getCleanData, getQueryParams } = require("../utils/helpers");
  
  
  exports.addCountryCode = async (req, res) => {
  
      let countryCode = {...req.body};
      console.log(req.body);
  
      const {error} = validateCountryCode(req.body);
      if(error){
          return res.status(400).send(error.details.map(e => e.message));
      }
  
      var newCountryCode = new CountryCode(countryCode);
      await newCountryCode.save();
      return res.status(200).send(newCountryCode);
  
  };
  
  exports.updateCountryCode = async (req, res) => {
  
      const data = getCleanData(req.body);
      const {error} = validateCountryCode(data);
      if(error){
          return res.status(400).send(error.details.map(e => e.message));
      }
  
      const result = await CountryCode.findByIdAndUpdate(
          req.params.id,
          {$set: data},
          {useFindAndModify: false}
      )
    
      return res.status(200).send({...result._doc, ...data});
  };
  
  exports.getCountryCodeById = async (req, res) => {
      var id = req.params.id;
      var countryCode = await CountryCode.findById(id);
  
      if(!countryCode){
        res.status(404).send(`Can not found countryCode by id ${id}`);
      }
  
      return res.status(200).send(countryCode);
  };
  
  exports.getCountryCodes = async (req, res) => {
  
    let searchQuery = getQueryParams(req.query);
    
    var countryCodes = await CountryCode.find(searchQuery);

    return res.status(200).send(countryCodes);
  };
  
  exports.deleteCountryCode = async (req, res) => {
      var id = req.params.id;
    
      var cities = await CountryCode.findById(id);
      if (cities) {
        await cities.deleteOne({_id: id});
        return res.status(200).send(cities);
      } else {
        return res.status(404).send("Page is not found with this id "+ id );
      }
    
    };
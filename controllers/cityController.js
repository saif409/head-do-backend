
const {
    City,
    validateCity
  } = require("../models/city");
  const _ = require("lodash");
  const { PAGE_SIZE } = require("../utils/constants");
  const { getCleanData, getQueryParams } = require("../utils/helpers");
  
  
  exports.addCity = async (req, res) => {
  
      let city = {...req.body};
      console.log(req.body);
  
      const {error} = validateCity(req.body);
      if(error){
          return res.status(400).send(error.details.map(e => e.message));
      }
  
      var newCity = new City(city);
      await newCity.save();
      return res.status(200).send(newCity);
  
  };
  
  exports.updateCity = async (req, res) => {
  
      const data = getCleanData(req.body);
      const {error} = validateCity(data);
      if(error){
          return res.status(400).send(error.details.map(e => e.message));
      }
  
      const result = await City.findByIdAndUpdate(
          req.params.id,
          {$set: data},
          {useFindAndModify: false}
      )
    
      return res.status(200).send({...result._doc, ...data});
  };
  
  exports.getCityById = async (req, res) => {
      var id = req.params.id;
      var city = await City.findById(id);
  
      if(!city){
        res.status(404).send(`Can not found city by id ${id}`);
      }
  
      return res.status(200).send(city);
  };
  
  exports.getCities = async (req, res) => {
  
      var cities = await City.find();
  
      return res.status(200).send(cities);
  };
  
  exports.deleteCity = async (req, res) => {
      var id = req.params.id;
    
      var cities = await City.findById(id);
      if (cities) {
        await cities.deleteOne({_id: id});
        return res.status(200).send(cities);
      } else {
        return res.status(404).send("Page is not found with this id "+ id );
      }
    
    };
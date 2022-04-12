const {
    Salon,
    validateSalon
  } = require("../models/salon");
  const _ = require("lodash");
  const { PAGE_SIZE } = require("../utils/constants");
  const { getCleanData, getQueryParams } = require("../utils/helpers");
  
  
  exports.addSalon = async (req, res) => {
  
      let salon = {...req.body};
  
      const {error} = validateSalon(req.body);
      if(error){
          return res.status(400).send(error.details.map(e => e.message));
      }
  
      let alreadyExists = await Salon.findOne({title: salon.title});
      if(alreadyExists){
          return res.status(400).send(`Salon with name ${salon.title} already exists.`);
      }

      alreadyExists = await Salon.findOne({phone: salon.phone});
      if(alreadyExists){
          return res.status(400).send(`This phone number ${salon.phone} already exists.`);
      }
  
    //   if(req.user.role.alias === 'VENDOR'){
    //       salon.verified = false;
    //   }
  
      var newSalon = new Salon(salon);
      const result = await newSalon.save();

      return res.status(200).send(result);
  
  };
  
  exports.updateSalon = async (req, res) => {
  
      const data = getCleanData(req.body);
      const {error} = validateSalon(data);
      if(error){
          return res.status(400).send(error.details.map(e => e.message));
      }
  
      const result = await Salon.findByIdAndUpdate(
          req.params.id,
          {$set: data},
          {useFindAndModify: false}
      )
    
      return res.status(200).send({...result._doc, ...data});
  };
  
  exports.getSalonById = async (req, res) => {
      var id = req.params.id;
      var salon = await Salon.findById(id);
      return res.status(200).send(salon);
  };
  
  exports.getSalons = async (req, res) => {
  
      let page = req.query.page ? parseInt(req.query.page) : 1;
      let size = req.query.size ? parseInt(req.query.size) : PAGE_SIZE;
  
      if(page < 1 || size < 1){
        return res.status(400).send('Page and size must be a positive number.');
      }
      const skip = (page - 1) * size;
      
  
      const searchQuery = getQueryParams(req.query);
  
      const totalElements = await Salon.countDocuments(searchQuery);
  
      var salons = await Salon.find(searchQuery).skip(skip).limit(size);
  
      return res.status(200).send({content: salons, totalElements, page, size});
  };
  
  exports.salonVerify = async (req, res) => {
      const id = req.params.id;
      let verified = req.body.verified;
      if(verified === null || verified === undefined){
        return res.status(400).send('verified is required');
      }
      const salon = await Salon.findById(id);
      if(!salon){
        return res.status(404).send(`Can not find salon by id ${id}`);
      }
  
      if(!verified){
          await Salon.findByIdAndDelete(id);
          return res.status(200).send('Salon deleted successfully');
      }
  
      salon.verified = true;
      await Salon.findByIdAndUpdate(id, salon);
      return res.status(200).send('Salon verified successfully.');
      
  }
  
  exports.deleteSalon = async (req, res) => {
    var id = req.params.id;
    var salon = await Salon.deleteOne({_id: id});
    return res.status(200).send(salon);
};

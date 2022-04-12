
const {
    GlobalConfig,
    validateGlobalConfig
  } = require("../models/globalConfig");
  const _ = require("lodash");
  const { PAGE_SIZE } = require("../utils/constants");
  const { getCleanData, getQueryParams } = require("../utils/helpers");
  
  
  exports.addGlobalConfig = async (req, res) => {
  
      let globalConfig = {...req.body};
      console.log(req.body);
  
      const {error} = validateGlobalConfig(req.body);
      if(error){
          return res.status(400).send({message: error.message});
      }
  
      var newGlobalConfig = new GlobalConfig(globalConfig);
      await newGlobalConfig.save();
      return res.status(200).send(newGlobalConfig);
  
  };
  
  exports.updateGlobalConfig = async (req, res) => {
  
      const data = getCleanData(req.body);
      const {error} = validateGlobalConfig(data);
      if(error){
          return res.status(400).send({message: error.message});
      }
  
      const result = await GlobalConfig.findByIdAndUpdate(
          req.params.id,
          {$set: data},
          {useFindAndModify: false}
      )
    
      return res.status(200).send({...result._doc, ...data});
  };
  
  exports.getGlobalConfigById = async (req, res) => {
      var id = req.params.id;
      var globalConfig = await GlobalConfig.findById(id);
  
      if(!globalConfig){
        res.status(404).send({message: `Can not found globalConfig by id ${id}`});
      }
  
      return res.status(200).send(globalConfig);
  };
  
  exports.getGlobalConfigs = async (req, res) => {
  
      var globalConfigs = await GlobalConfig.find();
  
      return res.status(200).send(globalConfigs);
  };
  
  exports.getActiveGlobalConfig = async (req, res) => {
  
    var globalConfigs = await GlobalConfig.findOne({active: true});

    return res.status(200).send(globalConfigs);
  };

  exports.deleteGlobalConfig = async (req, res) => {
      var id = req.params.id;
    
      var globalConfigs = await GlobalConfig.findById(id);
      if (globalConfigs) {
        await globalConfigs.deleteOne({_id: id});
        return res.status(200).send(globalConfigs);
      } else {
        return res.status(404).send({message: "Global config is not found with this id "+ id} );
      }
    
    };
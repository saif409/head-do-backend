
const {
    SubscriptionPlan,
    validateSubscriptionPlan
  } = require("../models/subscriptionPlan");
  const _ = require("lodash");
  const { PAGE_SIZE } = require("../utils/constants");
  const { getCleanData, getQueryParams } = require("../utils/helpers");
  
  
  exports.addSubscriptionPlan = async (req, res) => {
  
      let subscriptionPlan = {...req.body};
  
      const {error} = validateSubscriptionPlan(req.body);
      if(error){
          return res.status(400).send(error.details.map(e => e.message));
      }
  
      var newSubscriptionPlan = new SubscriptionPlan(subscriptionPlan);
      await newSubscriptionPlan.save();
      return res.status(200).send(newSubscriptionPlan);
  
  };
  
  exports.updateSubscriptionPlan = async (req, res) => {
  
      const data = getCleanData(req.body);
      const {error} = validateSubscriptionPlan(data);
      if(error){
          return res.status(400).send(error.details.map(e => e.message));
      }
  
      const result = await SubscriptionPlan.findByIdAndUpdate(
          req.params.id,
          {$set: data},
          {useFindAndModify: false}
      )
    
      return res.status(200).send({...result._doc, ...data});
  };
  
  exports.getSubscriptionPlanById = async (req, res) => {
      var id = req.params.id;
      var subscriptionPlan = await SubscriptionPlan.findById(id);
  
      if(!subscriptionPlan){
        res.status(404).send(`Can not found subscriptionPlan by id ${id}`);
      }
  
      return res.status(200).send(subscriptionPlan);
  };
  
  exports.getSubscriptionPlans = async (req, res) => {

    let page = req.query.page ? parseInt(req.query.page) : 1;
    let size = req.query.size ? parseInt(req.query.size) : PAGE_SIZE;

    if(page < 1 || size < 1){
      return res.status(400).send('Page and size must be a positive number.');
    }
    const skip = (page - 1) * size;
    

    const searchQuery = getQueryParams(req.query);
    const totalElements = await SubscriptionPlan.countDocuments(searchQuery);

    var subscriptionPlans = await SubscriptionPlan.find(searchQuery).skip(skip).limit(size);

    return res.status(200).send({content: subscriptionPlans, totalElements, page, size});
};
  
  exports.deleteSubscriptionPlan = async (req, res) => {
      var id = req.params.id;
    
      var subscriptionPlans = await SubscriptionPlan.findById(id);
      if (subscriptionPlans) {
        await subscriptionPlans.deleteOne({_id: id});
        return res.status(200).send(subscriptionPlans);
      } else {
        return res.status(404).send("Page is not found with this id "+ id );
      }
    
    };
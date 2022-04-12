
const {
    TrainingAndCourse,
    validateTrainingAndCourse
  } = require("../models/trainingAndCourse");
  const _ = require("lodash");
  const { PAGE_SIZE } = require("../utils/constants");
  const { getCleanData, getQueryParams } = require("../utils/helpers");
  
  
  exports.addTrainingAndCourse = async (req, res) => {
  
      let trainingAndCourse = {...req.body};
      console.log(req.body);
  
      const {error} = validateTrainingAndCourse(req.body);
      if(error){
          return res.status(400).send(error.details.map(e => e.message));
      }
  
      var newTrainingAndCourse = new TrainingAndCourse(trainingAndCourse);
      await newTrainingAndCourse.save();
      return res.status(200).send(newTrainingAndCourse);
  
  };
  
  exports.updateTrainingAndCourse = async (req, res) => {
    const {error} = validateTrainingAndCourse(req.body);

    if(error){
        return res.status(400).send({message: error.message});
    }

    req.body = getCleanData(req.body);
    const result = await Expense.findByIdAndUpdate(
        req.params.id,
        {$set: req.body}
    );
    console.log("deasdad",req.body);
    return res.status(200).send({...result._doc, ...req.body});
}
  
  exports.getTrainingAndCourseById = async (req, res) => {
      var id = req.params.id;
      var trainingAndCourse = await TrainingAndCourse.findById(id);
  
      if(!trainingAndCourse){
        res.status(404).send(`Can not found trainingAndCourse by id ${id}`);
      }
  
      return res.status(200).send(trainingAndCourse);
  };
  
  exports.getTrainingAndCourses = async (req, res) => {
    let page = req.query.page ? parseInt(req.query.page) : 1;
    let size = req.query.size ? parseInt(req.query.size) : PAGE_SIZE;

    if(page < 1 || size < 1){
      return res.status(400).send('Page and size must be a positive number.');
    }
    delete req.query.page;
    delete req.query.size;

    const skip = (page - 1) * size;

    const queryParams = getQueryParams(getCleanData(req.query));

    const totalElements = await TrainingAndCourse.countDocuments(queryParams);
    var trainingAndCourse = await TrainingAndCourse.find(queryParams).skip(skip).limit(size);

    return res.status(200).send({content: trainingAndCourse, totalElements, page, size});
};
  exports.deleteTrainingAndCourse = async (req, res) => {
      var id = req.params.id;
    
      var trainingAndCourse = await TrainingAndCourse.findById(id);
      if (trainingAndCourse) {
        await trainingAndCourse.deleteOne({_id: id});
        return res.status(200).send(trainingAndCourse);
      } else {
        return res.status(404).send("Page is not found with this id "+ id );
      }
    
    };
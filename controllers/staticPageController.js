const {
  StaticPage,
  validateStaticPage
} = require("../models/staticPage");
const _ = require("lodash");
const { getCleanData, getQueryParams } = require("../utils/helpers");


exports.addStaticPage = async (req, res) => {

    let staticPage = {...req.body};

    const {error} = validateStaticPage(req.body);
    if(error){
        return res.status(400).send(error.details.map(e => e.message));
    }

    var result = await StaticPage(staticPage).save();
    return res.status(200).send(result);

};

exports.updateStaticPage = async (req, res) => {

    const data = getCleanData(req.body);
    const {error} = validateStaticPage(data);
    if(error){
        return res.status(400).send(error.details.map(e => e.message));
    }

    const result = await StaticPage.findByIdAndUpdate(
        req.params.id,
        {$set: data},
        {useFindAndModify: false}
    )
  
    return res.status(200).send({...result._doc, ...data});
};

exports.getStaticPageById = async (req, res) => {
    
    var id = req.params.id;
    var staticPage = await StaticPage.findById(id);
    if(!staticPage){
        return res.status(404).send("Can not get static page by id " + id);
    }
    return res.status(200).send(staticPage);
};

exports.getByTitle = async (req, res) => {
    var title = req.params.title;
    var staticPage = await StaticPage.findOne({title});
    if(!staticPage){
        return res.status(404).send({message: "No page found for " + title});
    }
    return res.status(200).send(staticPage);
};

exports.getStaticPages = async (req, res) => {

    const queryParams = getQueryParams(req.query);
    var staticPages = await StaticPage.find(queryParams);

    return res.status(200).send(staticPages);
};

exports.deleteStaticPage = async (req, res) => {
    var id = req.params.id;
  
    var staticPage = await StaticPage.findById(id);
    if (staticPage) {
      await staticPage.deleteOne({_id: id});
      return res.status(200).send(staticPage);
    } else {
      return res.status(404).send("Page is not found with this id "+ id );
    }
  
  };
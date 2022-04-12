
const {
  Service,
  validateService
} = require("../models/service");
const _ = require("lodash");
const { PAGE_SIZE } = require("../utils/constants");
const { getCleanData, getQueryParams } = require("../utils/helpers");
const { Role } = require("../models/role");
const { query } = require("winston");


exports.addService = async (req, res) => {

    let service = {...req.body};
    service.approved = false;

    const {error} = validateService(req.body);
    if(error){
        return res.status(400).send(error.details.map(e => e.message));
    }

    const alreadyExists = await Service.findOne({title: req.body.title});
    if(alreadyExists){
        return res.status(400).send(`Service with title ${req.body.title} is already exists.`);
    }

    service.approved = true;

    if(service.parent && service.parent.length){
        let _parents = [];
        for(let i=0;i< service.parent.length; i++){
            const _c = await Service.findOne({title: service.parent[i]});
            if(_c){
                _parents.push(_c._id);
            }
        }
        service.parent = _parents;
    }
   
    
    const result = await new Service(service).save();
    return res.status(200).send(result);

};

exports.updateService = async (req, res) => {

    const {error} = validateService(req.body);
    if(error){
        return res.status(400).send(error.details.map(e => e.message));
    }

    let service = req.body;

    if(service.parent && service.parent.length){
        let _parents = [];
        for(let i=0;i< service.parent.length; i++){
            const _c = await Service.findOne({title: service.parent[i]});
            if(_c){
                _parents.push(_c._id);
            }
        }
        service.parent = _parents;
    }

    const result = await Service.findByIdAndUpdate(
        req.params.id,
        {$set: service},
        {useFindAndModify: false}
    );

    if(!result){
        return res.status(400).send(`Service with this id ${req.params.id} does not exist.`);
    }
  
    return res.status(200).send({...result._doc, ...req.body});
};

exports.getServiceById = async (req, res) => {
    var id = req.params.id;
    var service = await Service.findById(id).populate('parent');
    if(!service){
        return res.status(400).send(`Service with this id ${req.params.id} does not exist.`);
    }
    return res.status(200).send(service);
};

exports.getServices = async (req, res) => {
    let page = req.query.page ? parseInt(req.query.page) : 1;
    let size = req.query.size ? parseInt(req.query.size) : PAGE_SIZE;

    if(page < 1 || size < 1){
      return res.status(400).send('Page and size must be a positive number.');
    }
    delete req.query.page;
    delete req.query.size;

    let parent = req.query.parent;

    delete req.query.parent;

    const skip = (page - 1) * size;

    const queryParams = getQueryParams(getCleanData(req.query));
    // if(queryParams.approved === false){
    //     queryParams.approved = {$ne: true};
    // }else{
    //     queryParams.approved = true;
    // }

    if(parent){
        parent = await Service.findOne({title: parent});
        if(!parent){
            return res.status(200).send({content: [], totalElements: 0, page, size});
        }
        else{
            queryParams.parent = parent._id;
        }
    }

    const totalElements = await Service.countDocuments(queryParams);
    var service = await Service.find(queryParams).sort([['position', 1]]).skip(skip).limit(size);

    return res.status(200).send({content: service, totalElements, page, size});
};

exports.getParentServices = async (req, res) => {
    var categories = await Service.find({$or: [{parent: []}, {parent: null}], approved: true, active: true}).sort([['position', 1]]);

    if(categories && categories.length > 0){
        for(let i= 0; i< categories.length; i++){
            let children = await Service.find({parent: categories[i]._id, approved: true, active: true}).sort([['position', 1]]);
            
            if(children && children.length > 0){
                for(let i= 0; i< children.length; i++){
                    let children2 = await Service.find({parent: children[i]._id, approved: true, active: true}).sort([['position', 1]]);
                    
                    if(children2 && children2.length > 0){
                        for(let i= 0; i< children2.length; i++){
                            let children3 = await Service.find({parent: children2[i]._id, approved: true, active: true}).sort([['position', 1]]);
                            children2[i]._doc.children = children3;
                        }
                    }
        
                    children[i]._doc.children = children2;
                }
            }

            categories[i]._doc.children = children;
        }
    }

    return res.status(200).send(categories);
};

exports.approveService = async (req, res) => {

    const approved = req.query.approved;

    if(!approved){
        return res.status(400).send(`Query parameter 'approved' is required.`);
    }if(approved != 'true' && approved != 'false'){
        return res.status(400).send(`Query parameter 'approved' should be a boolean value.`);
    }

    const result = await Service.findByIdAndUpdate(
        req.params.id,
        {$set: {approved}},
        {useFindAndModify: false}
    )

    return res.status(200).send({...result._doc, approved});
}

exports.makeHotService = async (req, res) => {

    const hot = req.query.hot;

    if(!hot){
        return res.status(400).send(`Query parameter 'hot' is required.`);
    }if(hot != 'true' && hot != 'false'){
        return res.status(400).send(`Query parameter 'hot' should be a boolean value.`);
    }

    const result = await Service.findByIdAndUpdate(
        req.params.id,
        {$set: {hot}},
        {useFindAndModify: false}
    )

    return res.status(200).send({...result._doc, hot});
}

exports.deleteService = async (req, res) => {
    const id = req.params.id;

    const service = await Service.findById(id);
    if(!service){
        return res.status(404).send(`Service not found by id ${id}.`);
    }

    const result = await Service.deleteOne({_id: id});
    const deleteParentRes = await Service.updateMany({parent: id}, {$set: {parent: null}});
    return res.status(200).send(result);
}
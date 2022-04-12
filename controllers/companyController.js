
const {
  Company,
  validateCompany
} = require("../models/company");
const _ = require("lodash");
const { PAGE_SIZE } = require("../utils/constants");
const { getCleanData, getQueryParams } = require("../utils/helpers");


exports.addCompany = async (req, res) => {

    let company = {...req.body};

    const {error} = validateCompany(req.body);
    if(error){
        return res.status(400).send(error.details.map(e => e.message));
    }

    const alreadyExists = await Company.findOne({name: company.name});
    if(alreadyExists){
        return res.status(400).send(`Company with name ${company.name} already exists.`);
    }

    if(req.user.role.alias === 'VENDOR'){
        company.verified = false;
    }

    var newCompany = new Company(company);
    await newCompany.save();

    return res.status(200).send(req.user.role.alias === 'VENDOR' ?
        "Your added company is under verification chanel. This company can be verified or not verified." :
        "Company added successfully"
    );

};

exports.updateCompany = async (req, res) => {

    const data = getCleanData(req.body);
    const {error} = validateCompany(data);
    if(error){
        return res.status(400).send(error.details.map(e => e.message));
    }

    const result = await Company.findByIdAndUpdate(
        req.params.id,
        {$set: data},
        {useFindAndModify: false}
    )
  
    return res.status(200).send({...result._doc, ...data});
};

exports.getCompanyById = async (req, res) => {
    var id = req.params.id;
    var company = await Company.findById(id);
    return res.status(200).send(company);
};

exports.getCompanies = async (req, res) => {

    let page = req.query.page ? parseInt(req.query.page) : 1;
    let size = req.query.size ? parseInt(req.query.size) : PAGE_SIZE;

    if(page < 1 || size < 1){
      return res.status(400).send('Page and size must be a positive number.');
    }
    const skip = (page - 1) * size;
    

    const searchQuery = getQueryParams(req.query);

    const totalElements = await Company.countDocuments(searchQuery);

    var companies = await Company.find(searchQuery).skip(skip).limit(size);

    return res.status(200).send({content: companies, totalElements, page, size});
};

exports.companyVerify = async (req, res) => {
    const id = req.params.id;
    let verified = req.body.verified;
    if(verified === null || verified === undefined){
      return res.status(400).send('verified is required');
    }
    const company = await Company.findById(id);
    if(!company){
      return res.status(404).send(`Can not find company by id ${id}`);
    }

    if(!verified){
        await Company.findByIdAndDelete(id);
        return res.status(200).send('Company deleted successfully');
    }

    company.verified = true;
    await Company.findByIdAndUpdate(id, company);
    return res.status(200).send('Company verified successfully.');
    
}

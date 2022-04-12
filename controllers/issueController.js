
var mongoose = require('mongoose');
const _ = require("lodash");
const Joi = require("joi");
const { PAGE_SIZE } = require("../utils/constants");
const { getQueryParams, getCleanData, hasPermission } = require("../utils/helpers");
const { Issue, validateIssue } = require("../models/issue");
const nodemailer = require('nodemailer');


exports.getAllIssues = async (req, res) => {
  let page = req.query.page ? parseInt(req.query.page) : 1;
  let size = req.query.size ? parseInt(req.query.size) : PAGE_SIZE;

  if(page < 1 || size < 1){
    return res.status(400).send('Page and size must be a positive number.');
  }

  const skip = (page - 1) * size;
  let searchQuery = getQueryParams(req.query);

  if(req.user.type != 'ADMIN'){
    searchQuery.user = req.user._id;
  }

  const totalElements = await Issue.countDocuments(searchQuery);
  var issues = await Issue.find(searchQuery).sort([['createdAt', -1]]).skip(skip).limit(size);

  return res.status(200).send({content: issues, totalElements, page, size});
};

exports.getIssueById = async (req, res) => {
  const issue = await Issue.findById(req.params.id).populate('user checkedBy');
  if(!issue){
    return res.status(404).send('Can not found issue by id '+ req.params.id);
  }
  return res.status(200).send(issue);
};

exports.checkIssueById = async (req, res) => {

  if(req.user.type != 'ADMIN'){
    return res.status(400).send("You don't have permission to check this issue.");
  }

  const result = await Issue.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        checkedBy: req.user._id,
        reply: req.body.reply,
        status: 'CHECKED'
      }
    }
  );

  return res.status(200).send({...result._doc, status: 'CHECKED'});
}

exports.createIssues = async (req, res) => {

    const {error} = validateIssue(req.body);
    if(error){
        return res.status(400).send(error.message);
    }

    req.body.user = req.user._id;

    const result = await Issue(req.body).save();

    return res.status(200).send(result);

}

// exports.mailTest = async (req, res) => {
//   let transporter = nodemailer.createTransport(
//     {
//         host: 'mail.privateemail.com',
//         port: 587,
//         secure: false,
//         auth: {
//             user: 'info@tazree.com',
//             pass: 'Abc13579'
//         },
//         tls:{
//           rejectUnauthorized: false
//         },
//         logger: true,
//         debug: false // include SMTP traffic in the logs
//     },
//   );

//   let message = {
//     to: 'ninadnafiul@gmail.com',
//     from: 'info@tazree.com',
//     subject: 'Mail testing',
//     text: 'The mail server is working'
//   };

//   transporter.sendMail(message, (error, info) => {
//     if(error){
//       console.log('error occurred', error);
//       return res.status(500).send(error);
//     }
//     console.log('Message sent successfully !', info);
//     transporter.close();
//   })
// }
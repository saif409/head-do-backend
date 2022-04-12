const winston = require('winston');

module.exports = function(err, req, res, next){
  winston.error(err.message, err);
  // console.log(err);

  // error
  // warn
  // info
  // verbose
  // debug 
  // silly

  return res.status(500).send({message: 'Internal server error ! Please try again later.'});
}
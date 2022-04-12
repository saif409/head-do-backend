const winston = require('winston');
const mongoose = require('mongoose');

module.exports = function () {
  mongoose.connect('mongodb://localhost/head-do')
  // .then(() => console.log('Connected to MongoDB...'));
    .then(() => winston.info('Connected to MongoDB...'));
}
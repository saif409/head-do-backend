const express = require('express');
const users = require('../routes/users');
const providers = require('../routes/providers');
const auth = require('../routes/auth');
const error = require('../middleware/error');
const services = require('../routes/services');
const banners = require('../routes/banners');
const roles = require('../routes/roles');
const companies = require('../routes/companies');
const salons = require('../routes/salons');
const imagesUploader = require('../routes/imageUploaders');
const staticPages = require('../routes/staticPages');
const globalConfigs = require('../routes/globalConfigs');
const subscriptionPlans = require('../routes/subscriptionPlans');
const dashboard = require('../routes/dashboardData');
const cities = require('../routes/cities');
const countryCodes = require('../routes/countryCodes');
const bookings = require('../routes/bookings');
const expenses = require('../routes/expenses');
const withdraw = require('../routes/withdraw');
const employeeSalaries = require('../routes/employeeSalaries');
const ratings = require('../routes/ratings');
const issues = require('../routes/issues');
const transactions = require('../routes/transactions');
const popupBanners = require('../routes/popupBanners');
const trainingAndCourses = require('../routes/trainingAndCourses');

const API_VERSION = '1.0.0';
const ROOT_URL = `/api/v/${API_VERSION}`;

module.exports = function(app) {
  app.use(express.json());
  app.use(`${ROOT_URL}/users`, users);
  app.use(`${ROOT_URL}/providers`, providers);
  app.use(`${ROOT_URL}/auth`, auth);
  app.use(`${ROOT_URL}/services`, services);
  app.use(`${ROOT_URL}/banners`, banners);
  app.use(`${ROOT_URL}/companies`, companies);
  app.use(`${ROOT_URL}/salons`, salons);
  app.use(`${ROOT_URL}/roles`, roles);
  app.use(`${ROOT_URL}/upload`, imagesUploader);
  app.use(`${ROOT_URL}/static-pages`, staticPages);
  app.use(`${ROOT_URL}/global-configs`, globalConfigs);
  app.use(`${ROOT_URL}/subscription-plans`, subscriptionPlans);
  app.use(`${ROOT_URL}/cities`, cities);
  app.use(`${ROOT_URL}/country-codes`, countryCodes);
  app.use(`${ROOT_URL}/bookings`, bookings);
  app.use(`${ROOT_URL}/expenses`, expenses);
  app.use(`${ROOT_URL}/employee-salaries`, employeeSalaries);
  app.use(`${ROOT_URL}/withdraws`, withdraw);
  app.use(`${ROOT_URL}/dashboard-data`, dashboard);
  app.use(`${ROOT_URL}/ratings`, ratings),
  app.use(`${ROOT_URL}/issues`, issues),
  app.use(`${ROOT_URL}/transactions`, transactions),
  app.use(`${ROOT_URL}/popup-banners`, popupBanners),
  app.use(`${ROOT_URL}/training-courses`, trainingAndCourses),

  app.use(error);
}
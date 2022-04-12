
const {
    EmployeeSalary,
    validateEmployeeSalary
  } = require("../models/employeeSalary");
  const _ = require("lodash");
  const { PAGE_SIZE } = require("../utils/constants");
  const { getCleanData, getQueryParams } = require("../utils/helpers");
const { User } = require("../models/user");
  
  
  exports.addEmployeeSalary = async (req, res) => {
  
      let employeeSalary = {...req.body};

      
  
      const {error} = validateEmployeeSalary(req.body);
      if(error){
          return res.status(400).send(error.details.map(e => e.message));
      }
  
      const employee = await User.findById(employeeSalary.employee);
      if(!employee){
        return res.status(404).send('No employee found with this id.');
      }

      employeeSalary.employeeInfo = {
        fullName: employee.fullName,
        role: employee.role,
        address: employee.address
      }

      var newEmployeeSalary = new EmployeeSalary(employeeSalary);
      await newEmployeeSalary.save();
      return res.status(200).send(newEmployeeSalary);
  
  };
  
  exports.updateEmployeeSalary = async (req, res) => {
  
      const data = getCleanData(req.body);
      const {error} = validateEmployeeSalary(data);
      if(error){
          return res.status(400).send(error.details.map(e => e.message));
      }
  
      const result = await EmployeeSalary.findByIdAndUpdate(
          req.params.id,
          {$set: data},
          {useFindAndModify: false}
      )
    
      return res.status(200).send({...result._doc, ...data});
  };
  
  exports.getEmployeeSalaryById = async (req, res) => {
      var id = req.params.id;
      var employeeSalary = await EmployeeSalary.findById(id).populate('employee');
  
      if(!employeeSalary){
        res.status(404).send(`Can not found employee salary by id ${id}`);
      }
  
      return res.status(200).send(employeeSalary);
  };
  
  exports.getEmployeeSalaries = async (req, res) => {
      
    let page = req.query.page ? parseInt(req.query.page) : 1;
    let size = req.query.size ? parseInt(req.query.size) : PAGE_SIZE;
  
    if (page < 1 || size < 1) {
      return res.status(400).send({message: 'Page and size must be a positive number.'});
    }
  
    const skip = (page - 1) * size;
    let searchQuery = getQueryParams(req.query);
  
    const totalElements = await EmployeeSalary.countDocuments(searchQuery);
      var employeeSalaries = await EmployeeSalary.find(searchQuery).skip(skip).limit(size);
  
      return res.status(200).send({content: employeeSalaries, totalElements, page, size});
  };
  
  exports.deleteEmployeeSalary = async (req, res) => {
      var id = req.params.id;
    
      var employeeSalaries = await EmployeeSalary.findById(id);
      if (employeeSalaries) {
        await employeeSalaries.deleteOne({_id: id});
        return res.status(200).send(employeeSalaries);
      } else {
        return res.status(404).send("Page is not found with this id "+ id );
      }
    
    };
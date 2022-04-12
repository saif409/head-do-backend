const { validateExpenses, Expense } = require("../models/expense");
const { getCleanData, get24BaseTime, getQueryParams } = require("../utils/helpers");
const endOfDay = require('date-fns/endOfDay');
const startOfDay = require('date-fns/startOfDay');

exports.getAllExpenses = async (req, res) => {

    let page = req.query.page ? parseInt(req.query.page) : 1;
  let size = req.query.size ? parseInt(req.query.size) : PAGE_SIZE;

  const from = req.query.from;
  const to = req.query.to;
  const expenseType = req.query.expenseType;

  delete req.query.from;
  delete req.query.to;
  delete req.query.expenseType;

  let searchQuery = getQueryParams(req.query);

  if(from || to){
    searchQuery.createdAt = {
        $gte: startOfDay(from ? Date.parse(from) : Date.parse('01 Jan 1970 00:00:00 GMT')),
        $lte: endOfDay(to ? Date.parse(to) : Date.parse('01 Jan 3000 00:00:00 GMT'))
      }
    }

    if(expenseType){
        searchQuery.expenseType = expenseType;
    }

  if (page < 1 || size < 1) {
    return res.status(400).send({message: 'Page and size must be a positive number.'});
  }

  const skip = (page - 1) * size;

  const totalElements = await Expense.countDocuments(searchQuery);

    const expenses = await Expense.find(searchQuery).sort([['createdAt', -1]]).skip(skip).limit(size);
    return res.status(200).send({content: expenses, totalElements, page, size});
}

exports.getExpenseById = async (req, res) => {
    
    const expense = await Expense.findById(req.params.id);

    if(!expense){
        return res.status(404).send('No expense found');
    }

    return res.status(200).send(expense);

}

exports.createExpense = async (req, res) => {
    const {error} = validateExpenses(req.body);

    if(error){
        return res.status(400).send({message: error.message});
    }

    req.body = getCleanData(req.body);
    const result = await Expense(req.body).save();

    return res.status(200).send(result);
}

exports.updateExpense = async (req, res) => {
    const {error} = validateExpenses(req.body);

    if(error){
        return res.status(400).send({message: error.message});
    }

    req.body = getCleanData(req.body);
    const result = await Expense.findByIdAndUpdate(
        req.params.id,
        {$set: req.body}
    );

    return res.status(200).send({...result._doc, ...req.body});
}

exports.deleteExpense = async (req, res) => {


    const result = await Expense.deleteOne({_id: req.params.id});

    return res.status(200).send({message: 'Expense deleted successfully'});
}
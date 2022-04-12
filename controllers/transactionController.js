
const {
    Transaction,
    validateTransaction
  } = require("../models/transaction");
  const _ = require("lodash");
  const { PAGE_SIZE } = require("../utils/constants");
  const { getCleanData, getQueryParams } = require("../utils/helpers");
  const endOfDay = require('date-fns/endOfDay');
const startOfDay = require('date-fns/startOfDay');
const { Booking } = require("../models/booking");
  
  
  exports.addTransaction = async (req, res) => {
  
      let transaction = {...req.body};
      console.log(req.body);
  
      const {error} = validateTransaction(req.body);
      if(error){
          return res.status(400).send(error.details.map(e => e.message));
      }
  
      var newTransaction = new Transaction(transaction);
      await newTransaction.save();
      return res.status(200).send(newTransaction);
  
  };
  
  exports.updateTransaction = async (req, res) => {
  
      const data = getCleanData(req.body);
      const {error} = validateTransaction(data);
      if(error){
          return res.status(400).send(error.details.map(e => e.message));
      }
  
      const result = await Transaction.findByIdAndUpdate(
          req.params.id,
          {$set: data},
          {useFindAndModify: false}
      )
    
      return res.status(200).send({...result._doc, ...data});
  };
  
  exports.getTransactionById = async (req, res) => {
      var id = req.params.id;
      var transaction = await Transaction.findById(id);
  
      if(!transaction){
        res.status(404).send(`Can not found transaction by id ${id}`);
      }

      const booking = await Booking.findOne({OrderNumber: transaction.OrderNumber}).populate('customer provider')

      transaction._doc.booking = booking;

      if(booking.provider?.refUserCode){
        const refUser = await User.findOne({refCode: booking.provider.refUserCode});
        transaction._doc.refUser = refUser;
        transaction.refUser = refUser;
      }
  
      return res.status(200).send(transaction);
  };

  exports.getTransactionByOrderNumber = async (req, res) => {
    var transaction = await Transaction.findOne({OrderNumber: req.params.orderNumber, TxnStatus: 0});

    if(!transaction){
      res.status(404).send(`Can not found transaction by orderNumber ${req.params.orderNumber}`);
    }

    return res.status(200).send(transaction);
};
  
  exports.getTransactions = async (req, res) => {

    let page = req.query.page ? parseInt(req.query.page) : 1;
    let size = req.query.size ? parseInt(req.query.size) : PAGE_SIZE;

    if (page < 1 || size < 1) {
        return res.status(400).send({message: 'Page and size must be a positive number.'});
    }

    const from = req.query.from;
    const to = req.query.to;
    const exportExcel = req.query.exportExcel;
    const TxnStatus = req.query.TxnStatus;

    delete req.query.from;
    delete req.query.to;
    delete req.query.exportExcel;
    delete req.query.TxnStatus;

    let searchQuery = getQueryParams(req.query);

    if(from || to){
        searchQuery.createdAt = {
            $gte: startOfDay(from ? new Date(from) : Date.parse('01 Jan 1970 00:00:00 GMT')),
            $lte: endOfDay(to ? new Date(to) : Date.parse('01 Jan 3000 00:00:00 GMT'))
          }
    }

    if(TxnStatus){
      searchQuery.TxnStatus = parseInt(TxnStatus);
    }

    const skip = (page - 1) * size;

    if(exportExcel){
      attr = await Transaction.aggregate([
        {
          "$match": searchQuery
        },
        {
          "$lookup": {
            from: 'bookings',
            localField: 'OrderNumber',
            foreignField: 'orderNumber',
            as: 'booking'
          }
        },
        {
          "$lookup": {
            from: 'providerinfos',
            localField: 'booking.provider',
            foreignField: '_id',
            as: 'provider'
          }
        },
        {
          "$lookup": {
            from: 'users',
            localField: 'booking.provider',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          "$group": {
            _id: "$provider",
            serviceCharge: {"$sum": "$headdoServiceCharge"},
            paymentReceived: {"$sum": "$Amount"},
            content: {"$push": "$$ROOT"}
          }
        },
        {"$sort": {'createdAt': -1}}
      ])

      return res.status(200).send(attr ?? []);
    }
    let totalElements = await Transaction.countDocuments(searchQuery);
  
      // var transactions = await Transaction.find(searchQuery).sort([['createdAt', -1]]).skip(skip).limit(size);
  
      console.log("search query ===> ", searchQuery);
    var transactions = await Transaction.aggregate([
      {
        "$match": searchQuery
      },
      {
        "$lookup": {
          from: 'bookings',
          localField: 'OrderNumber',
          foreignField: 'orderNumber',
          as: 'booking'
        }
      },
      {
        "$lookup": {
          from: 'providerinfos',
          localField: 'booking.provider',
          foreignField: '_id',
          as: 'providerInfo'
        }
      },
      {
        "$lookup": {
          from: 'users',
          localField: 'booking.provider',
          foreignField: '_id',
          as: 'provider'
        }
      },
      {
        "$lookup": {
          from: 'users',
          localField: 'booking.customer',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {"$sort": {'createdAt': -1}},
      {"$skip": skip},
      {"$limit": size}
    ])

    // console.log('Transaction ==> ', transactions);


    return res.status(200).send({content: transactions, page, size, totalElements});
  };
  
  exports.deleteTransaction = async (req, res) => {
      var id = req.params.id;
    
      var cities = await Transaction.findById(id);
      if (cities) {
        await cities.deleteOne({_id: id});
        return res.status(200).send(cities);
      } else {
        return res.status(404).send("Page is not found with this id "+ id );
      }
    
    };

    exports.refundPayment = async (req, res) => {
      var OrderNumber = req.params.orderNumber;
      const result = await Transaction.findOneAndUpdate(
        {OrderNumber, TxnStatus: 0},
        {
          $set: {refunded: true}
        }
      );

      return res.status(200).send(result);
    }
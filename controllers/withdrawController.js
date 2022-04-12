const { User } = require("../models/user");
const { ProviderInfo } = require("../models/providerInfo");
const { Withdraw, validateWithdraws } = require("../models/withdraw");
const { getQueryParams } = require("../utils/helpers");
const endOfDay = require('date-fns/endOfDay');
const startOfDay = require('date-fns/startOfDay');
const { PAGE_SIZE } = require("../utils/constants");
const mongoose = require("mongoose");

exports.getAllWithdraw = async (req, res) => {

    let page = req.query.page ? parseInt(req.query.page) : 1;
    let size = req.query.size ? parseInt(req.query.size) : PAGE_SIZE;
  
    if (page < 1 || size < 1) {
      return res.status(400).send({message: 'Page and size must be a positive number.'});
    }
  
    const from = req.query.from;
    const to = req.query.to;
    const exportExcel = req.query.exportExcel;
    const ids = req.query.ids?.map(e => mongoose.Types.ObjectId(e));
    delete req.query.from;
    delete req.query.to;
    delete req.query.exportExcel;
    delete req.query.ids;

    const skip = (page - 1) * size;
    let searchQuery = getQueryParams(req.query);

    if(from || to){
        searchQuery.createdAt = {
            $gte: startOfDay(from ? Date.parse(from) : Date.parse('01 Jan 1970 00:00:00 GMT')),
            $lte: endOfDay(to ? Date.parse(to) : Date.parse('01 Jan 3000 00:00:00 GMT'))
          }
    }

    if(req.user.type != 'ADMIN'){
        searchQuery.user = req.user._id
    }

    if(exportExcel){
      console.log('ids ==> ', ids);
        searchQuery._id = {$in: ids};
        attr = await Withdraw.aggregate([
          {
            "$match": searchQuery
          },
          {
            "$lookup": {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            "$group": {
              _id: "$user",
              amount: {"$sum": "$amount"},
            }
          },
          {"$sort": {'createdAt': -1}}
        ])
  
        return res.status(200).send(attr ?? []);
      }

    const totalElements = await Withdraw.countDocuments(searchQuery);
    var data = await Withdraw.find(searchQuery).sort([['createdAt', -1]]).skip(skip).limit(size);
  
    return res.status(200).send({ content: data, totalElements, page, size });
}

exports.updateWithdraws = async (req, res) => {
    await Withdraw.updateMany({_id: {$in: req.body.withdraws}}, {
        $set: {status: req.body.status},
    });

    return res.status(200).send('All dues are cleared.');
}

exports.createWithdraw = async (req, res) => {

    const {error} = validateWithdraws(req.body);
    if(error){
        res.status(400).send({message: error.message});
    }
    
    req.body.user = req.user._id;
    const provider = await ProviderInfo.findById(req.user._id);

    req.body.providerBusinessName = provider.salonName

    const result = await Withdraw(req.body).save();
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $inc: {currentBalance: -(parseFloat(req.body.amount)), totalWithdraw: parseFloat(req.body.amount)}
        }
    )

    // const users = await User.find({isProvider: true, currentBalance: {$gt: 0}});

    // for(let i=0;i< users.length; i++){
    //     const user = users[i];
    //     await Withdraw({
    //         user: user._id,
    //         amount: user.currentBalance
    //     }).save();

    //     await User.findByIdAndUpdate(
    //         user._id,
    //         {
    //             $set: {
    //                 currentBalance: 0,
    //                 totalWithdraw: user.totalWithdraw + user.currentBalance
    //             }
    //         }
    //     );
    // }
  
    return res.status(200).send(result);
}

exports.getWithdrawById = async (req, res) => {
    const withdraw = await Withdraw.findById(req.params.id).populate('user');

    if(!withdraw){
        return res.status(200).send({"message": "No withdraw find with this id"});
    }

    return res.status(200).send(withdraw);
}
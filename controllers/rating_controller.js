const mongoose = require("mongoose");
const { ProviderInfo } = require("../models/providerInfo");
const { validateRating, Rating } = require("../models/rating");
const { User } = require("../models/user");


exports.createRating = async (req, res) => {
    const {error} = validateRating(req.body);

    if(error){
        return res.status(400).send({message: error.message});
    }

    const user = await User.findById(req.user._id);
    if(user.isProvider){
        return res.status(400).send({message: 'You are a provider. So you can not give any rating.'});
    }

    const result = await Rating({...req.body, user: req.user._id}).save();

    await ProviderInfo.findByIdAndUpdate(
        req.body.providerId,
        {
           
            $inc: {totalRating: req.body.rating, totalUserGiveRating: 1},
            
        }
    )

    return res.status(200).send(result);
}

exports.getProviderReview = async (req, res) => {
    const ratings = await Rating.find({providerId: req.params.id}).populate('user');

    return res.status(200).send(ratings);
}

exports.getRatingByBooking= async (req, res) => {
    const rating = await Rating.findOne({bookingId: req.params.id}).populate('user');

    if(!rating){
        return res.status(404).send({message: 'No rating found'});
    }

    return res.status(200).send(rating);
}

exports.updateRating = async (req, res) => {

    const rating = await Rating.findById(req.params.id);

    const user = await User.findById(req.user._id);
    if(user.isProvider){
        return res.status(400).send({message: 'You are a provider. So you can not update any rating.'});
    }
    
    const result = await Rating.findByIdAndUpdate(
        req.params.id,
        {
            $set: req.body
        },
    )

    await ProviderInfo.findByIdAndUpdate(
        req.body.providerId,
        {
            
            $inc: { totalRating: -rating.rating, totalRating: req.body.rating}
            
        }
    )

    return res.status(200).send({...result, ...req.body})

}
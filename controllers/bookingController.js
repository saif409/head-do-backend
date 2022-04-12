const mongoose = require("mongoose");
const { validateBookings, Booking } = require("../models/booking");
const { ProviderInfo } = require("../models/providerInfo");
const { getCleanData, get24BaseTime, getQueryParams, createDateTime, sendNotificationForWantedImmediately, sendNotificationToSpecificProvider } = require("../utils/helpers");
const endOfDay = require('date-fns/endOfDay');
const startOfDay = require('date-fns/startOfDay');
const {User} = require("../models/user");
const { GlobalConfig } = require("../models/globalConfig");
const { validateRating } = require("../models/rating");
const { Transaction } = require("../models/transaction");
const { ProviderClientRecords } = require("../models/providerClientRecord");
const nodemailer = require('nodemailer');


exports.getAllBookings = async (req, res) => {

    let page = req.query.page ? parseInt(req.query.page) : 1;
    let size = req.query.size ? parseInt(req.query.size) : PAGE_SIZE;

    if (page < 1 || size < 1) {
        return res.status(400).send({message: 'Page and size must be a positive number.'});
    }

    const status = req.query.status;
    const serviceType = req.query.serviceType;
    const customerName = req.query.customerName;
    const customerPhone = req.query.customerPhone;
    const businessName = req.query.businessName;
    const from = req.query.from;
    const to = req.query.to;
    const specialist = req.query.specialist;

    delete req.query.status;
    delete req.query.serviceType;
    delete req.query.customerName;
    delete req.query.customerPhone;
    delete req.query.from;
    delete req.query.to;
    delete req.query.businessName;
    delete req.query.specialist;

    req.query.garbage = 'false';

    const skip = (page - 1) * size;
    let searchQuery = getQueryParams(req.query);
    if(status){
        searchQuery.status = status;
    }

    if(from || to){
        searchQuery.startingTime = {
            $gte: startOfDay(from ? new Date(from) : Date.parse('01 Jan 1970 00:00:00 GMT')),
            $lte: endOfDay(to ? new Date(to) : Date.parse('01 Jan 3000 00:00:00 GMT'))
          }
    }

    if(businessName){
        const provider = await User.findOne({businessName: {$regex: `.*${businessName}.*`, $options: 'i'}});
        if(provider){
            searchQuery.provider = provider._id;
        }else{
            return res.status(200).send({content: [], totalElements: 0, page, size});
        }
    }

    if(customerName){
        const customer = await User.findOne({fullName:  {$regex: `.*${customerName}.*`, $options: 'i'}});
        if(customer){
            searchQuery.customer = customer._id;
        }else{
            return res.status(200).send({content: [], totalElements: 0, page, size});
        }
    }

    if(customerPhone){
        const customer = await User.findOne({phone:  {$regex: `.*${customerPhone}.*`}});
        if(customer){
            searchQuery.customer = customer._id;
        }else{
            return res.status(200).send({content: [], totalElements: 0, page, size});
        }
    }

    if(serviceType){
        if(serviceType == 'MOBILE'){
            searchQuery.serviceType = { $or: [{serviceType: 'BOTH'}, {serviceType: 'MOBILE'}] }
        }else if(serviceType == 'IN_DOOR'){
            searchQuery.serviceType = { $or: [{serviceType: 'BOTH'}, {serviceType: 'IN_DOOR'}] }
        }
    }

    if(req.user.salonSpecialist){
        searchQuery.specialist = mongoose.Types.ObjectId(req.user._id);
    }
    if(specialist){
        searchQuery.specialist = mongoose.Types.ObjectId(specialist);
    }
    else if(['SALON', 'BARBER', 'MUA','JOM_FACIAL'].includes(req.user.type) && req.query.status !== 'REQUESTED' ){
        
        searchQuery.provider = mongoose.Types.ObjectId(req.user._id);
    }
    
    else if(req.user.type == 'CUSTOMER'){
        searchQuery.customer = mongoose.Types.ObjectId(req.user._id);
    }

    const totalElements = await Booking.countDocuments(searchQuery);

    const bookings = await Booking.find(searchQuery).populate('provider customer').sort([['createdAt', -1]]).skip(skip).limit(size);


    return res.status(200).send({content: bookings, totalElements, page, size});
}

exports.getBookingById = async (req, res) => {
    
    const booking = await Booking.findById(req.params.id).populate({path: 'customer provider specialist', populate: 'providerInfo'});

    if(!booking){
        return res.status(404).send('No booking found');
    }

    return res.status(200).send(booking);

}

const getTotalPrice = (serviceList) => {
    let totalPrice = 0;
    for(let i=0; i< serviceList.length; i++){
        totalPrice += parseFloat(serviceList[i].price);
    }

    return totalPrice;
}

exports.createBooking = async (req, res) => {
    const {error} = validateBookings(req.body);

    if(error){
        return res.status(400).send({message: error.message});
    }

    req.body = getCleanData(req.body);

    const providerInfo = await ProviderInfo.findById(req.body.provider);

    req.body.startingTime = createDateTime(req.body.startingTime);

    const totalPrice = getTotalPrice(req.body.serviceList);
    req.body.totalPrice = totalPrice;
    const globalConfig = await GlobalConfig.findOne({active: true});

    let charge = (totalPrice * globalConfig.providerServiceChargePercentage) / 100;
    
    if(providerInfo?.type == 'BARBER'){
        if(charge > globalConfig.barberMaximumServiceCharge){
            charge = globalConfig.barberMaximumServiceCharge;
        }
    }else{
        if(charge > globalConfig.providerMaximumServiceCharge){
            charge = globalConfig.providerMaximumServiceCharge;
        }
    }

    req.body.serviceCharge = charge;
    req.body.serviceChargePercentage = globalConfig.providerServiceChargePercentage;
    req.body.minimumAdvancePaymentPercentage = globalConfig.minimumAdvancePaymentPercentage;
    req.body.advancePaymentAmount = (totalPrice * globalConfig.minimumAdvancePaymentPercentage) / 100;

    req.body.providerInfo = providerInfo;
    const createdFromProvider = req.query.createdFromProvider
    if(req.body.bookingType !== 'WANTED_IMMEDIATELY'){
        req.body.garbage = createdFromProvider == 'true' ? false : true;
    }else{
        req.body.garbage = false;
    }

    //2 lines only for test
    // req.body.advancePaymentStatus = true;
    // req.body.paidInAdvance = req.body.advancePaymentAmount;
    

    const result = await Booking(req.body).save();
    // const result = await Booking({...req.body, advancePaymentStatus: true}).save();

    if(req.body.bookingType == 'WANTED_IMMEDIATELY'){
        sendNotificationForWantedImmediately(req.body.serviceType, result._id);
    }
    else if(createdFromProvider == 'true'){
        console.log("here --> created from provider", createdFromProvider);
        sendNotificationToSpecificProvider(req.body.customer, result._id);
    }

    return res.status(200).send(result);
}

exports.updateBooking = async (req, res) => {
    const {error} = validateBookings(req.body);

    if(error){
        return res.status(400).send({message: error.message});
    }

    let booking = await Booking.findById(req.params.id).populate('customer');
    if(!booking){
        return res.status(404).send({message: 'No booking found'});
    }
    if(booking.status == 'COMPLETED'){
        return res.status(400).send({message: 'Can not update, this booking was completed.'})
    }
    if(booking.status == 'CANCELED'){
        return res.status(400).send({message: 'Can not update, this booking was canceled.'})
    }

    if(req.body.status == 'COMPLETED'){
        if(req.body.provider){
            const providerInfo = await ProviderInfo.findById(req.body.provider);
            if(booking.provider == null){
                req.body.providerInfo = providerInfo; 
            }
            let clientRecord = await ProviderClientRecords.findOne(
                {client: booking.customer, provider: booking.provider}
            );
            if(!clientRecord){
                await ProviderClientRecords({
                    client: booking.customer,
                    lastServiceDate: Date(),
                    totalServiceCount: 1,
                    totalAmount: booking.totalPrice,
                    provider: booking.provider
                }).save();
            }else{
                await ProviderClientRecords.findOneAndUpdate(
                    {client: booking.customer, provider: booking.provider},
                    {
                        $set: {
                            lastServiceDate: Date()
                        },
                        $inc: {
                            totalServiceCount: 1,
                            totalAmount: booking.totalPrice
                        }
                    }
                    );
            }
        }
    }

    req.body.totalPrice = getTotalPrice(req.body.serviceList);

    if(req.body.status == 'COMPLETED'){
        await completeBooking(req.body.provider, req.body.totalPrice, booking.specialist, booking);
        await sendCompleteBookingMail({...booking._doc, ...req.body, customer: booking._doc.customer});
        req.body.paid = true;
    }

    const result = await Booking.findByIdAndUpdate(
        req.params.id,
        {$set: req.body}
    );

    return res.status(200).send({...result._doc, ...req.body});
}

const completeBooking = async (providerId, totalPrice, specialist, booking) => {

    const globalConfig = await GlobalConfig.findOne({active:true});

    let charge = booking.serviceCharge; //(totalPrice * globalConfig.providerServiceChargePercentage) / 100;
    // if(charge > globalConfig.providerMaximumServiceCharge){
    //     charge = globalConfig.providerMaximumServiceCharge;
    // }

    let refIncome = (charge * globalConfig.referralIncomePercentage) / 100;

    const providerUser = await User.findById(providerId);
    if(providerUser.refUserCode){
        await User.findOneAndUpdate(
            {refCode: providerUser.refUserCode},
            {
                $inc: {
                    totalReferralIncome: refIncome,
                    currentBalance: refIncome
                },
            }
        )
    }

    let cashPayment = booking.paid ? 0 : totalPrice - booking.advancePaymentAmount;

    await User.findByIdAndUpdate(
        providerId,
        {
            $inc: {
                totalIncome: totalPrice,
                totalCharge: charge,
                currentBalance: totalPrice - charge - cashPayment,
                totalCashPaymentFromCustomer: cashPayment
            },
        
        }
    )

    if(specialist){
        await User.findByIdAndUpdate(
            specialist,
            {
                $inc: {
                    totalIncome: totalPrice,
                    totalCharge: charge,
                    currentBalance: totalPrice - charge
                },
            
            }
        )
    }
}

exports.getBookedTimes = async (req, res) => {
    
    const date = createDateTime(req.query.date);

    const specialist = req.query.specialist;
    let queryParams = {
        garbage: {$ne: true},
        status: 'PENDING',
        startingTime: {
            $gte: new Date(date),
            $lte: endOfDay(new Date(date))
        }
    };

    if(specialist == 'true'){
        queryParams.specialist = mongoose.Types.ObjectId(req.params.providerId);
    }else{
        queryParams.provider = mongoose.Types.ObjectId(req.params.providerId);
    }
    const bookings = await Booking.find(queryParams);

    let times = bookings.map(e => e.startingTime?.toISOString().split('T')[1].split(':')[0]);

    return res.status(200).send({times});
}

exports.paymentReceive = async (req, res) => {
    return res.status(200).send("payment received");
}

exports.paymentBackendApi = async (req, res) => {
    
    await Transaction(req.body).save();

    if(req.body.TxnStatus == 0){
        const result = await Booking.findOneAndUpdate(
            {orderNumber: req.body.OrderNumber},
            {
                $set: {
                    paid: true
                }
            }
        )
    }else{
        return res.status(400).send('failed');
    }

    return res.status(200).send("‘RECEIVEOK’")
}

exports.advancePaymentBackendApi = async (req, res) => {
    console.log("backend url --> ",req.body);
    
    const booking = await Booking.findOne({orderNumber: req.body.OrderNumber}).populate('customer');

    let fullPaid = parseFloat(booking.totalPrice) === parseFloat(req.body.Amount)

    console.log('totalPrice --> ', booking.totalPrice, 'Amount --> ', req.body.Amount);

    req.body.headdoServiceCharge = booking.serviceCharge;
    req.body.headdoServiceChargePercentage = booking.serviceChargePercentage;
    req.body.fullPaid = fullPaid;
    req.body.totalPrice = booking.totalPrice;

    await Transaction(req.body).save();

    if(req.body.TxnStatus == 0){
        await Booking.findOneAndUpdate(
            {orderNumber: req.body.OrderNumber},
            {
                $set: {
                    advancePaymentStatus: true,
                    paid: fullPaid,
                    paidInAdvance: req.body.Amount,
                    garbage: false
                }
            }
        );
        sendNotificationToSpecificProvider(booking.provider, booking._id);
        sendBookingSuccessEmail(booking, req.body.Amount);

    }else{
        // await Booking.deleteOne({orderNumber: req.body.OrderNumber});
        return res.status(400).send('failed');
    }

    

    return res.status(200).send("‘RECEIVEOK’")
}

const sendBookingSuccessEmail = async (booking, amount) => {
    let transporter = nodemailer.createTransport(
        {
          host: 'mail.privateemail.com',
          port: 587,
          secure: false,
          auth: {
            user: 'info@headdos.com',
            pass: 'Abc13579'
          },
          tls: {
            rejectUnauthorized: false
          },
          logger: true,
          debug: false // include SMTP traffic in the logs
        },
      );

      const customer = await User.findById(booking.customer);
      booking.customer = customer;
    
      let message = {
        to: booking.customer.email,
        from: 'info@headdos.com',
        subject: 'Headdos booking confirmation message.',
        text: 'Your booking is confirmed.',
        html: `
            <div>
            <div style = "background-color:black;height:170px;width:220px;text-align:center">
            <img src = "https://api.headdos.com/public/uploads/adminPortal/92021/image-2021-10-31T01-24-45.829Z.png" alt = "Headdos" height= "150px" />
              </div>
                <div>
              <h3>Payment successful for booking number ${booking.orderNumber} in headdos</h3>
              
              <p>Total price: RM ${booking.totalPrice.toFixed(2)}</p>
              <p>Payment received: RM ${amount.toFixed(2)}</p>
              
              <p>Your total due is RM ${(booking.totalPrice - amount).toFixed(2)}. Pay the due amount in cash to the provider.</p>
              
              <hr/>
              
              <p>Provider name: <b>${booking.providerInfo.salonName}</b></p>
              <p>Provider address: <b>${booking.providerInfo?.addressLine ?? booking.providerInfo?.streetAddress}</b></p>
              <p>Booking time: <b>${booking.startingTime}/b></p>
              <br/>
              <p>Customer name: <b>${booking.customer?.fullName}</b></p>
              <p>Customer address: <b>${booking?.address?.addressLine ?? booking.address?.streetAddress}</b></p>
           </div>
         </div>
        `
      };
    
      transporter.sendMail(message, (error, info) => {
        if (error) {
          console.log('error occurred', error);
        //   return res.status(500).send(error);
        }
        console.log('Message sent successfully !', info);
        transporter.close();
        // return res.status(200).send('message sent successfully!');
        
      });
}

const sendCompleteBookingMail = (booking) => {
    let transporter = nodemailer.createTransport(
        {
          host: 'mail.privateemail.com',
          port: 587,
          secure: false,
          auth: {
            user: 'info@headdos.com',
            pass: 'Abc13579'
          },
          tls: {
            rejectUnauthorized: false
          },
          logger: true,
          debug: false // include SMTP traffic in the logs
        },
      );
    
      let message = {
        to: booking.customer.email,
        from: 'info@headdos.com',
        subject: 'Headdos booking is completed.',
        text: 'Your booking is completed.',
        html: `
            <div>
            <div style = "background-color:black;height:170px;width:220px;text-align:center">
            <img src = "https://api.headdos.com/public/uploads/adminPortal/92021/image-2021-10-31T01-24-45.829Z.png" alt = "Headdos" height= "150px" />
              </div>
                <div>
              <h3>Booking number ${booking.orderNumber} in headdos has been completed.</h3>
              
              <p>Total price: RM ${booking.totalPrice?.toFixed(2)}</p>
              <p>Online payment: RM ${booking.paidInAdvance?.toFixed(2)}</p>
              
              <p>Cash payment to provider: RM ${(booking.totalPrice - booking.paidInAdvance??0).toFixed(2)}.</p>
              
              <hr/>
              
              <p>Provider name: <b>${booking.providerInfo.salonName}</b></p>
              <p>Provider address: <b>${booking.providerInfo?.addressLine ?? booking.providerInfo?.streetAddress}</b></p>
              <p>Booking time: <b>${booking.startingTime}/b></p>
              <br/>
              <p>Customer name: <b>${booking.customer?.fullName}</b></p>
              <p>Customer address: <b>${booking?.address?.addressLine ?? booking.address?.streetAddress}</b></p>
           </div>
         </div>
        `
      };
    
      transporter.sendMail(message, (error, info) => {
        if (error) {
          console.log('error occurred', error);
        //   return res.status(500).send(error);
        }else{
        console.log('Message sent successfully !', info);
        }
        transporter.close();
        // return res.status(200).send('message sent successfully!');
        return;
        
      });
}

exports.addGarbageField = async (req, res) => {
    const bookings = await Booking.find();

    for(let i=0; i< bookings.length; i++){
        await Booking.findByIdAndUpdate(
            bookings[i]._id,
            {$set: {garbage: bookings[i].advancePaymentStatus}},
        )
    }

    return res.status(200).send({message: "garbage field added according to advance payment status."});
}

const { Booking } = require("../models/booking");
const { User } = require("../models/user");
const { UserLiveTrack } = require("../models/userLiveTrack");

exports.getNotifications = async (req, res) => {

};

exports.getDashboardData = async (req, res) => {
    const userId = req.user._id;

    let queryForPendingBooking = req.user.salonSpecialist ? 
    {specialist: userId, status: "PENDING", garbage: false} :
    {provider: userId, status: "PENDING", garbage: false};

    let queryForCompletedBooking = req.user.salonSpecialist ? 
    {specialist: userId, status: "COMPLETED", garbage: false} :
    {provider: userId, status: "COMPLETED", garbage: false};

    const pendingBookingCount = await Booking.countDocuments(queryForPendingBooking);
    const totalBookingCount = await Booking.countDocuments(queryForCompletedBooking);

    return res.status(200).send({pendingBookingCount, totalBookingCount});
}

exports.getLiveUserCount = async (req, res) => {

    var minutesToAdd=7;
    var currentDate = new Date();
    var pastDate = new Date(currentDate.getTime() - minutesToAdd*60000);

    const liveUserTrack = await UserLiveTrack.countDocuments(
        {
            lastVisitTime: {$gte: pastDate}
        }
    );

    const userCount = await User.countDocuments();

    return res.status(200).send({liveUser: liveUserTrack, totalUser: userCount});

}

exports.bookingGraphByDay = async (req, res) => {
    var minutesToAdd= req.query.previousDay || 100;

    var dateFrom = new Date();
    
    dateFrom.setDate(dateFrom.getDate() - minutesToAdd);
    
    dateFrom.setHours(0);
    dateFrom.setSeconds(0);
    dateFrom.setMinutes(0);

    let matchQuery = {
        $and: [
            {status: 'COMPLETED'},
            {createdAt: {$gte: dateFrom}}
        ]
    }

    const query = [
        {"$match": matchQuery},
        
        { "$group": {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            totalSale: {
                $sum: "$totalPrice"
            }
          },
        },
        {"$sort": {createdAt: -1}},
     ]
    let attrs = await Booking.aggregate(query);

    return res.status(200).send(attrs);
}

exports.customerRegGraphByDay = async (req, res) => {

    var minutesToAdd= req.query.previousDay || 700;
    var dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - minutesToAdd);
    dateFrom.setHours(0);
    dateFrom.setSeconds(0);
    dateFrom.setMinutes(0);

    let attrs = await User.aggregate([
        {"$match": {
            createdAt: {$gte: dateFrom},
            isProvider: {$ne: true}
        }},
        
        { "$group": {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: {
                $sum: 1
            }
          },
        },
        {"$sort": {_id: 1}},
     ])

    return res.status(200).send(attrs);
}

exports.providerRegGraphByDay = async (req, res) => {

    var minutesToAdd= req.query.previousDay || 200;
    var dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - minutesToAdd);
    dateFrom.setHours(0);
    dateFrom.setSeconds(0);
    dateFrom.setMinutes(0);

    let attrs = await User.aggregate([
        {"$match": {
            createdAt: {$gte: dateFrom},
            isProvider:true
        }},
        
        { "$group": {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: {
                $sum: 1
            }
          },
        },
        {"$sort": {_id: 1}},
     ])

    return res.status(200).send(attrs);
}


exports.avgNumberOfOrdersPerCustomers = async (req, res) => {
    const users = await User.countDocuments();
    const orders = await FullOrder.countDocuments();

    if(orders == 0){
        return res.status(200).send({avgNumber: 0});
    }
    return res.status(200).send({avgNumber: (orders / users)});
}

exports.adminDashboardInfo = async (req, res) => {
    let totalPendingBookings = await Booking.countDocuments({status: 'PENDING'});
    let totalCanceledBookings = await Booking.countDocuments({status: 'CANCELED'});
    let totalCompletedBookings = await Booking.countDocuments({status: 'COMPLETED'});

    let totalCustomer = await User.countDocuments({type: 'CUSTOMER'});
    let totalBarber = await User.countDocuments({type: 'BARBER'});
    let totalSalon = await User.countDocuments({type: 'SALON'});
    let totalMua = await User.countDocuments({type: 'MUA'});
    let totalJomFacial = await User.countDocuments({type: 'JOM_FACIAL'});

    const query = [
        { "$group": {
            _id: null,
            totalPrice: {
                $sum: "$totalPrice"
            },
            totalCharge: {
                $sum: "$serviceCharge"
            }
          },
        }
     ]
    let attrs = await Booking.aggregate(query);

    const data = {
        totalPendingBookings,
        totalCanceledBookings,
        totalCompletedBookings,
        totalCustomer,
        totalBarber,
        totalSalon,
        totalMua,
        totalJomFacial,
        totalBookingPrice: attrs[0].totalPrice,
        totalIncome: attrs[0].totalCharge
    }

    return res.status(200).send(data);


}
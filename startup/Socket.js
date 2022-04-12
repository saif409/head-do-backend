
const config = require('config');
const { hasPermission } = require('../utils/helpers');
const PERMISSIONS = require('../middleware/permissionString');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

module.exports = function (http) {

  var io = require('socket.io')(http, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      // extraHeaders: ["x-auth-token"]
    },
  });

  let users = [];
  let admin = null;
  io.use((socket, next) => {

    const decoded = jwt.verify(socket.handshake.auth.token, config.get('jwtPrivateKey'));
    socket.user = decoded;
    if (!socket.user) {
      return next(new Error("invalid token"));
    }
    next();
  });

  io.on('connection', async (socket) => { // socket object may be used to send specific messages to the new connected client
    const chatUser = await ChatUser.findById(socket.user._id);
    if (!chatUser) {
      await ChatUser({
        _id: socket.user._id,
        user: socket.user._id,
      }).save();
    }

    const hasPermissionToChatWithCustomer = hasPermission(PERMISSIONS.CHATTING_WITH_CUSTOMERS, socket.user.permissionString);

    if (hasPermissionToChatWithCustomer) {
      if (admin) {
        return next(new Error(`${admin.fullName} is already handling customer chatting.`));
      }
      admin = { ...socket.user, socketId: socket.id };
    } else {


      const messages = await Message.find({
        $or: [{ sentBy: mongoose.Types.ObjectId(socket.user._id) },
        { sentTo: mongoose.Types.ObjectId(socket.user._id) }]
      }).skip(0).limit(20).sort([['sentAt', 1]]);

      users = users.filter(e => e.user._id !== socket.user._id);
      users.push({ user: socket.user, messages, socketId: socket.id });
      // if(!users.find(e => e._id === socket.user._id)){
      //   users.push(socket.user);
      // }
    }
    console.log(admin.socketId, users);
    socket.emit("users", users);


    socket.onAny((event, ...args) => {
      console.log(event, args);
    });

    socket.on('send-message', async data => {
      console.log('msg-->', data);
      data = {
        ...data,
        sentBy: socket.user._id,
      }
      if (!hasPermissionToChatWithCustomer) {
        data.sentTo = admin._id;
        socket.to(admin.socketId).emit('message', data);
      }
      else {
        socket.to(data.sentToSocketId).emit('message', data);
      }

      await Message(data).save();
    })

    socket.on('disconnect', function () {
      console.log('user ' + socket.user._id + ' disconnected');
      users = users.filter(e => e.user._id !== socket.user._id);
      if (admin && socket.user._id === admin._id) {
        admin = null;
      }
      // remove saved socket from users object
      // delete users[socket.id];
    });
  });
}



/**
 * installing npm modules
 */
const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const io = require('socket.io')(http);
const ejs = require("ejs");
const morgan = require("morgan");
const mongoose = require("mongoose");
const jwtAuth = require('socketio-jwt-auth');
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const config = require("./config/config");
const db = require("./config/database");
const User = require("./models/users");
const Chat = require("./models/chat");
const SocketIOFileUpload = require('socketio-file-upload');

/**
 * additional configuration for app
 */
app.use(SocketIOFileUpload.router);
app.use(morgan("dev"))
app.use("/static", express.static("./node_modules"));
app.use("/files", express.static("./uploads"));
app.use(cookieParser())
app.set('view engine', 'ejs');



/**
 * additional configuration
 */
mongoose.connect(config.db, {useUnifiedTopology: true, useNewUrlParser: true})
    .then((status) => {
        console.log("connected")
    })
    .catch((err) => {
        console.log(err)
    })





/**
 * socket.io configuration for chating app behaviour /** ************************************************************
 */
io.use(function(socket, next){
  if (socket.handshake.query && socket.handshake.query.token){
    jwt.verify(socket.handshake.query.token, config.secret, function(err, decoded) {
      if(err) return next(new Error('Authentication error'));
      socket.decoded = decoded;
      next();
    });
  } else {
      next(new Error('Authentication error'));
  }    
})

.on("connection", (socket) => {
  console.log("connected", socket.id)
  db.online(socket.handshake.query.name, function(users){
      console.log(users)
      io.emit("user added", users, socket.handshake.query.name, "Online")
      // io.emit("group list", db.groups);
  })

  /**
   ******************************************************* uploading files
   */
  var uploader = new SocketIOFileUpload();
    uploader.dir = __dirname + "/uploads";
    uploader.listen(socket);
  var currentFileId;

    uploader.on("start", function(event) {
      console.log(event.file.name)
      console.log(event.file.mtime)
      console.log(event.file.encoding)
      console.log(event.file.meta)
      console.log(event.file.success)
      console.log(event.file.bytesLoaded)
      console.log(event.file.id)
      currentFileId = event.file.id;
    })

    uploader.on("progress", function(event){
      // console.log(event.file)
      // console.log(event.buffer)
    })

    socket.on("abord file uploading", (msg) => {
      uploader.abort(currentFileId, socket);
    })

    uploader.on("complete", function(event){
      // console.log(event.file)
      console.log(event.interrupt)
    })

    // Do something when a file is saved:
    uploader.on("saved", function(event){
        console.log("saving here ==")
        console.log(event.file);
        io.emit("receive file", "http://localhost:8000/files/" + event.file.name, event.file.name)
        console.log(event.file.bytesLoaded)
    });
 
    // Error handler:
    uploader.on("error", function(event){
      // console.log(event.file)
      console.log("Error from uploader", event.error);
    });

  /**************************************************************** */

  socket.on("create room", (person) => {
    socket.join(person, () => {
      console.log("created user " + person)
      socket.emit("joined", "created user " + person);
    })
  });

  socket.on("create group", (group, person) => {
    socket.join(group, () => {
      db.addGroup(group, function(groups){
        io.emit("notify", person, groups, group, " created one group name : " + group);
        console.log("group added : " + group)
      })
    })
  })

  socket.on("send message", (data) => {
    Chat.updateOne(
      { _id : "5e1dc3981c9d4400003c78d1" }, { $push : { chats : {from:data.from, to: data.room, message: data.msg, date: "01/14/2020"}} }
    )
    .exec( (err, item) => {
        if (err) {
          console.log(err)
          return socket.emit("send message error", err);
        }
        socket.broadcast.to(data.room).emit("send message", `${data.from} : ${data.msg}`);
    })
  })

  socket.on("direct send", (room, msg) => {
    console.log("direct message coming till here")
    io.to(room).emit("direct sent", msg);
  })

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  })

  socket.on("get chats", (id) => {
    Chat.getChat(id, function(err, chat){
      socket.emit("receive chats", chat.chats);
    })
  })

  socket.on("disconnect", () => {
      db.offline(socket.handshake.query.name, function(users){
        console.log(users)
        io.emit("user added", users, socket.handshake.query.name, "Offline")
      })
  })

})






 


/**
 * routers for listening on application
 */

app.get("/", (req, res) => {
  res.redirect("/login");
})









































app.get("/favicon.ico", (req, res) => {
  res.send("favicon.ico")
})

/**
 * bottom side of application listening on port
 */
const port = process.env.PORT || 8000;
http.listen(port, function(){
  console.log(`listening on *:${port}`);
});


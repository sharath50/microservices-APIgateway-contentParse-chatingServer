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
.on("connection", onConnect, onError, onDisconnect, onDisconnecting, onPing, onPong);

/* 
All the events we have in socket.io

error
connect
disconnect
disconnecting
newListener
removeListener
ping
pong

*/

/* wrote in the same order ==  admin, user , whom, group, chat, chatId   */

let OnlineUsers = []; /* This is the list of users who are online  */

function onConnect(socket) => {
	// This will consoles the data to the console
	console.log("connected", socket.id)
	
	// check the the user is in our database or notify
	socket.on("initialize user", (user) => {
		// need to hit database to check the user and his data
		// --- code goes here
		
		// need to add the user to the user name room
		socket.join(user.name, () => {
			
			// add username to the array OnlineUsers = []
			// socket.handshake.query.name --> take this for reference
	
			// emit this event to everyone that he/she is online
			io.emit("user initialized", user);
			
		});
	})
	
	// sending private chat to the perticular user
	socket.on("private chat send", (user, whom, chat) => {
		// upload chat to database
		io.to(whom.name).emit("private chat receive", user, chat);
	})
	
	// sending group chat to the perticular group
	socket.on("reply on group send", (user, whom, group, chat, chatId) => {
		// upload chat to database
		io.to(group.name).emit("reply on group receive", user, whom, chat, chatId);
	})
	
	// ****************************/* below section is about group chating */***********************
	
	// creating the new group
	socket.on("create new group", (admin, group) => {
		socket.join(group.name, () => {
			// create a new group name in database and mension admin name
			socket.emit("new group created", group)
		});
	})
	
	// adding the user to the group through admin
	socket.on("add user to group", (admin, user, group) => {
		// update the group information in database at users list
		// check whether {admin} is admin of the group {group}, add {user} to user list
		socket.emit("user added to group", user, group)  /*  								NOTE : this needs to be implemented specially we need to notify the user that he/she added to the group  */
	})
	
	// sending group chat to the perticular group
	socket.on("group chat send", (user, group, chat) => {
		// upload chat to database
		io.to(group.name).emit("group chat receive", user, chat);
	})
	
	// sending group chat to the perticular group
	socket.on("group chat at mention send", (user, whom, group, chat) => {
		// upload chat to database
		io.to(group.name).emit("group chat at mention receive", user, whom, chat);
	})
	
	// sending group chat to the perticular group
	socket.on("reply on private chat send", (user, whom, chat, chatId) => {
		// upload chat to database
		io.to(whom.name).emit("reply on private chat receive", user, chat, chatId);
	})
	
	
	// ****************************/* below section is about file uploading */***********************
	
	let uploader = new SocketIOFileUpload();
		uploader.dir = __dirname + "/uploads";
		uploader.listen(socket);
		
	// the starting of the upload process
	uploader.on("start", function(event) {
		// event.file, event.mtime, event.encoding, event.meta, event.success, event.bytesLoaded, event.id
	})
	
	// in all next events event.base, event.pathName is available
	
	// the starting of the upload process
	uploader.on("progress", function(event) {
		// event.file, event.buffer
	})
	
	// the starting of the upload process
	uploader.on("complete", function(event) {
		// event.file, event.interrupt
	})
	
	// the starting of the upload process
	uploader.on("saved", function(event) {
		// event.file
	})
	
	// the starting of the upload process
	uploader.on("error", function(event) {
		// event.file, event.error
	})
	
	
})

function onDisconnect(socket) => {
	// remove username from the array OnlineUsers = []
	// socket.handshake.query.name --> take this for reference
	
	// emit this event to everyone that he/she is offline 
	io.emit("user added", users, socket.handshake.query.name, "Offline")
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

    uploader.on("start", function(event) {
      console.log(event.file.name)
      console.log(event.file.mtime)
      console.log(event.file.encoding)
      console.log(event.file.meta)
      console.log(event.file.success)
      console.log(event.file.bytesLoaded)
      console.log(event.file.id)
    })

    uploader.on("progress", function(event){
      // console.log(event.file)
      // console.log(event.buffer)
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

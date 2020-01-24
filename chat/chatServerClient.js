
/* To read the token data from the cookie of the browser */

function getCookie(cname) {
       var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
}


/* This is initializing the socket.io client */ 

const socket = io("http://localhost:8000/", {
    query: {
        name : {/* pass the name of the user */}, /* This is optional, we are going to initialize the user */
        token: getCookie("Authorization")
    }
});

// emit this event to intialize the room in his name to listen to chat on his room
socket.emit("initialize user", user);
socket.on("user initialized", (user) => {
	// active this user as he/she is online if that is group or private chat and show user is online at user list
})

// send the private chat message here
socket.emit("private chat send", user, whom, chat);
socket.on("private chat receive", (user, chat) => {
	// show the chat in this current {user} section
})

// send the private chat message here
socket.emit("reply on private chat send", user, whom, chat, chatId);
socket.on("reply on private chat receive", (user, chat, chatId) => {
	// show the chat in this current {user} section with replied message to {chatId}
})

// ****************************/* below section is about group chating */***********************


// create the group here
socket.emit("create new group", admin, group);
socket.on("new group created", (group) => {
	// show the notification to me, i created the group
})

// add user to group here
socket.emit("add user to group", admin, user, group);
socket.on("user added to group", (user, group) => {
	// show the notification to me, i added the {user} to {group}
})

// send message to group here
socket.emit("group chat send", user, group, chat);
socket.on("group chat receive", (user, chat) => {
	// show the chat in this current {group} section
})

// send message to group with at mention here
socket.emit("group chat at mention send", user, whom, group, chat);
socket.on("group chat at mention receive", (user, whom, chat) => {
	// show the chat in this current {group} section to {whome} using at mention
})

// send message to group with at mention here
socket.emit("reply on group send", user, whom, group, chat, chatId);
socket.on("reply on group receive", (user, whom, chat, chatId) => {
	// show the chat in this current {group} section with replied message to {chatId}
})

// ****************************/* below section is about file uploading */***********************

<script src="/static/socket.io-client/dist/socket.io.js"></script>
<script src="http://localhost:8000/siofu/client.js"></script>

/* This is initializing the socket.io-file-upload client */

var siofu = new SocketIOFileUpload(socket, {
            chunkSize: 1024 * 10,
            maxFileSize : 1024 * 1000
        });
		
		// Configure the three ways that SocketIOFileUpload can read files:
        siofu.listenOnSubmit(document.getElementById("upload_btn"), document.getElementById("upload_input"));
        siofu.listenOnInput(document.getElementById("upload_input"));
		instance.listenOnDrop(document.getElementById("file_drop"));
		
		// if we need to send array of files for multiple select
        document.getElementById('upload_btn').addEventListener('click', siofu.prompt, false);
    
		// to cancel the upload we can do this 													NOTE : not tested i will test soon
        document.getElementById('cancel_btn').addEventListener('click', () => {
          socket.emit("cancel upload")
		  // to abord the uploading from server side
        })
		
		// 
        siofu.addEventListener('choose', function(event) {
			// event.files is available in this event
			// as per the documentation we can abord the upload 								NOTE : not tested 
			return true;
        });

        siofu.addEventListener('start', function(event) {
			// event.file is available in this event
          console.log(event.file.name)
        });
    
        // Do something on upload progress:
        siofu.addEventListener("progress", function(event){
			// event.bytesLoaded, event.file is available in this event
            var percent = event.bytesLoaded / event.file.size * 100;
            document.getElementById("progress").style.width = percent.toFixed(2) * 2 + "px";
            // console.log("File is", percent.toFixed(2), "percent loaded");
        });
		
		siofu.addEventListener("load", function(data){
			// event.file, event.reader, event.name is available in this event
			
		})
			
		// Do something when a file is uploaded:
		siofu.addEventListener("complete", function(data){
			// event.file, event.success, event.detail is available in this event
			console.log(event.success);
            console.log(event.file);
		})
    
        siofu.addEventListener("error", function(data){
			// event.message, event.file, event.code is available in this event
            if (data.code === 1) {
                alert("Don't upload such a big file");
            }
        });



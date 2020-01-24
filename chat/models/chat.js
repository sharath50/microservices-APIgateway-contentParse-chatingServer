const mongoose = require("mongoose");
const db = require('../config/database').db;

var chatSchema = mongoose.Schema({
    chatId :{
        type : String,
        required : true,
        unique : true
    },
    chats : [
        {
            from : { type: String, required : true},
            to : {type: String, required : true},
            message : {type: String, required : true},
            date : {type:Date, require:true}
        }
    ]
})

const Chat = module.exports = mongoose.model("Chat", chatSchema);

/**
 * to manage the user from database
 */
module.exports.getChat = function(chatId , cb){
    Chat.findOne({chatId:chatId}, cb);
}

module.exports.createChats = function(newUser , cb){
    newChat.save(cb);
}


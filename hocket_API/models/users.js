const mongoose = require("mongoose");
const db = require('../config/database').db;
const bcryptjs = require("bcryptjs");

var userSchema = mongoose.Schema({
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    } 
})

const User = module.exports = mongoose.model("User", userSchema);

/**
 * to manage the user from database
 */
module.exports.getUserById = function(id , cb){
    User.findById(id, cb);
}

module.exports.getUserByEmail = function(email , cb){
    User.findOne({email:email}, cb);
}

module.exports.createUser = function(newUser , cb){
    bcryptjs.genSalt(10, function(err, salt){
        bcryptjs.hash(newUser.password, salt, function(err, hash){
            if (err) throw err;
            newUser.password = hash;
            newUser.save(cb);
        })
    })
}

module.exports.comparePassword = function(myPassword, hash, cb){
    bcryptjs.compare(myPassword, hash, function(err, isMatch){
        if (err) throw err;
        cb(null, isMatch);
    })
}
const mongoose = require("mongoose");
const db = require('../config/database').db;


var blockedTokenSchema = mongoose.Schema({
    tokens : [
        String
    ]
});

const BlockedToken = mongoose.model("blockedToken", blockedTokenSchema);

module.exports = BlockedToken;


module.exports = usersOnline = [];
module.exports = groups = [];

userHandle = {};

userHandle.online = function(name, cb){
    if (!usersOnline.includes(name)){
        usersOnline.push(name)
    }
    cb(usersOnline);
}

userHandle.offline = function(name, cb){
    if (usersOnline.includes(name)) {
        usersOnline.splice(usersOnline.indexOf(name),1)
    }
    cb(usersOnline);
}

userHandle.addGroup = function(name, cb){
    if (!groups.includes(name)){
        groups.push(name)
    }
    cb(groups);
}

userHandle.removeGroup = function(name, cb){
    if (groups.includes(name)) {
        groups.splice(groups.indexOf(name),1)
    }
    cb(groups);
}

module.exports = userHandle;




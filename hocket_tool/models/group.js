/**
 * installing dependancies
 */
const mongoose = require("mongoose");
const Project = require("./project");

var groupSchema = mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    creator : {
        type : String
    },
    parentId : {
        type : String
    },
    tasksId : [
        String
    ]
})

const Group = module.exports = mongoose.model("Group", groupSchema);

module.exports.createGroup = function(newGroup, parentId, cb){
    newGroup.save(function(err, group){
        if (err || !group){
            return cb(true, null)
        } else {
            Project.updateOne(
                { _id : parentId }, { $push : { groupsId : group._id } }
            )
            .exec( (err, item) => {
                if (err || !item){
                    return cb(true, null)
                } else {
                    return cb(null, group)
                }
            })
        }
    })
}

module.exports.getAllGroups = function(parentId, cb){
    Project.findById(parentId, function(err, project){
        if (err || !project){
            return cb(true, null)
        } else {
            Group.find({_id:project.groupsId}, cb)
        }
    })
}

module.exports.readGroup = function(id, cb){
    Group.findById(id, cb)
}

module.exports.renameGroup = function(id, title, cb){
    Group.findById(id, function(err, group){
        if (err || !group){
            cb(true , null)
        } else {
            group.title = title;
            group.save(cb);
        }
    });
}


module.exports.deleteGroup = function(id,cb){
    Group.findByIdAndDelete(id, cb);
}

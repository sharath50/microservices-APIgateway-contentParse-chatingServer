/**
 * installing dependancies
 */
const mongoose = require("mongoose");
const Project = require("./project");
const Group = require("./group");

var taskSchema = mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    assigner : {
        type : String
    },
    assignie : {
        type : String
    },
    status : {
        type : String
    },
    start_date : {
        type : Date
    },
    end_date : {
        type : Date
    },
    label : {
        type : String
    },
    rating : {
        type : Number
    },
    parentId : {
        type : String
    }
})

const Task = module.exports = mongoose.model("Task", taskSchema);


module.exports.createTask = function(newTask, parentId, cb){
    newTask.save(function(err, task){
        if (err || !task){
            return cb(true, null)
        } else {
            Group.updateOne(
                { _id : parentId }, { $push : { tasksId : task._id } }
            )
            .exec( (err, item) => {
                if (err || !item){
                    return cb(true, null)
                } else {
                    return cb(null, task)
                }
            })
        }
    })
}

module.exports.getAllTasks = function(parentId, cb){
    Group.findById(parentId, function(err, group){
        if (err || !group){
            return cb(true, null)
        } else {
            Task.find({_id:group.tasksId}, cb)
        }
    })
}

module.exports.readTask = function(id, cb){
    Task.findById(id, cb)
}

module.exports.renameTask = function(id, title, cb){
    Task.findById(id, function(err, task){
        if (err || !task){
            cb(true , null)
        } else {
            task.title = title;
            task.save(cb);
        }
    });
}

module.exports.updateTaskAssignie = function(id, assignie, cb){
    Task.findById(id, function(err, task){
        if (err || !task){
            cb(true , null)
        } else {
            task.assignie = assignie;
            task.save(cb);
        }
    });
}

module.exports.updateTaskStatus = function(id, status, cb){
    Task.findById(id, function(err, task){
        if (err || !task){
            cb(true , null)
        } else {
            task.status = status;
            task.save(cb);
        }
    });
}

module.exports.updateTaskStartDate = function(id, startDate, cb){
    Task.findById(id, function(err, task){
        if (err || !task){
            cb(true , null)
        } else {
            task.startDate = startDate;
            task.save(cb);
        }
    });
}

module.exports.updateTaskEndDate = function(id, endDate, cb){
    Task.findById(id, function(err, task){
        if (err || !task){
            cb(true , null)
        } else {
            task.endDate = endDate;
            task.save(cb);
        }
    });
}

module.exports.updateTaskLabel = function(id, label, cb){
    Task.findById(id, function(err, task){
        if (err || !task){
            cb(true , null)
        } else {
            task.label = label;
            task.save(cb);
        }
    });
}

module.exports.updateTaskRating = function(id, rating, cb){
    Task.findById(id, function(err, task){
        if (err || !task){
            cb(true , null)
        } else {
            task.rating = rating;
            task.save(cb);
        }
    });
}

module.exports.deleteTask = function(id, cb){
    Task.findByIdAndDelete(id, cb);
}

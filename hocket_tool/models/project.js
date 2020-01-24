/**
 * installing dependancies
 */
const mongoose = require("mongoose");

var projectSchema = mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    creator : {
        type : String
    },
    groupsId : [
        String
    ]
})

const Project = module.exports = mongoose.model("Project", projectSchema);

module.exports.createProject = function(newProject, cb){
    newProject.save(cb);
}

module.exports.getAllProjects = function(cb){
    Project.find({}, cb);
}

module.exports.readProject = function(id, cb){
    Project.findById(id, cb);
}

module.exports.renameProject = function(id, title, cb){
    Project.findById(id, function(err, project){
        if (err && !project){
            cb("not able to open the document" , null)
        } else {
            project.title = title;
            project.save(cb);
        }
    });
    // Project.findByIdAndUpdate(id, { $set: { title:title }}, cb);
}

module.exports.deleteProject = function(id, cb){
    Project.findByIdAndDelete(id, cb);
}

/**
 * installing dependancies here
 */
const router = require("express").Router();
const Project = require("../models/project");

router.post("/create", function(req, res){
    let {title, creator} = req.body;
    let newProject = new Project({
        title,
        creator
    })
    Project.createProject(newProject, function(err, project){
        if (err && !project) {
            console.log(err)
            return res.json({success:false, message:"could not able to create project"})
        } else {
            return res.json({success:true, message:"project created", newProject});
        }
    })
})




router.get("/get", function(req, res){
    Project.getAllProjects(function(err, projects){
        if (err && !projects){
            return res.json({success:false, message:"could not able to get projects"})
        } else {
            return res.json({success:true, message:"ok", projects})
        }
    })
})


router.get("/read/:id", function(req, res){
    let id = req.params.id;
    Project.readProject(id, function(err, project){
        if (err && !project){
            return res.json({success:false, message:"could not able to read project"})
        } else {
            return res.json({success:true, message:"ok", project})
        }
    })
})


router.put("/rename/:id", function(req, res){
    let id = req.params.id,
        {title} = req.body;
    Project.renameProject(id, title, function(err, project){
        if (err && !project){
            return res.json({success:false, message:"could not able to rename the project", err : err})
        } else {
            return res.json({success:true, message:"project renamed successfully", project})
        }
    })
})


router.delete("/delete/:id", function(req, res){
    let id = req.params.id;
    Project.deleteProject(id, function(err, project){
        if (err){
            return res.json({success:false, message:"could not able to delete project"})
        } else if (!project) {
            return res.json({success:false, message:"project not existed"})
        } else {
            return res.json({success:false, message:"project deleted successfully"})
        }
    });
})







module.exports = router;

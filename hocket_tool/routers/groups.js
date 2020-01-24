/**
 * installing dependancies here
 */
const router = require("express").Router();
const Group = require("../models/group");
// const Project = require("../models/project");

router.post("/create/:parentId", function(req, res){
    let parentId = req.params.parentId,
        {title, creator} = req.body;
    let newGroup = new Group({
        title,
        creator,
        parentId
    })
    Group.createGroup(newGroup, parentId, function(err, group){
        if (err && !group) { // change it to this way !err && group
            console.log(err)
            return res.json({success:false, message:"could not able to create group"})
        } else { // continue if block code goes here this else block code goes to if
            return res.json({success:true, message:"group created", group});
        }
    })
})


router.get("/get/:parentId", function(req, res){
    let parentId = req.params.parentId;
    Group.getAllGroups(parentId, function(err, groups){
        if (err && !groups){
            return res.json({success:false, message:"could not able to get groups"})
        } else {
            return res.json({success:true, message:"ok", groups})
        }
    })
})


router.get("/read/:id", function(req, res){
    let id = req.params.id;
    Group.readGroup(id, function(err, group){
        if (err && !group){
            return res.json({success:false, message:"could not able to read group"})
        } else {
            return res.json({success:true, message:"ok", group})
        }
    })
})


router.put("/rename/:id", function(req, res){
    let id = req.params.id,
        {title} = req.body;
    Group.renameGroup(id, title, function(err, group){
        if (err && !group){
            return res.json({success:false, message:"could not able to rename the group", err : err})
        } else {
            return res.json({success:true, message:"group renamed successfully", group})
        }
    })
})


router.delete("/delete/:id", function(req, res){
    let id = req.params.id;
    Group.deleteGroup(id, function(err, group){
        if (err){
            return res.json({success:false, message:"could not able to delete group"})
        } else if (!group) {
            return res.json({success:false, message:"group not existed"})
        } else {
            return res.json({success:false, message:"group deleted successfully"})
        }
    })
})







module.exports = router;
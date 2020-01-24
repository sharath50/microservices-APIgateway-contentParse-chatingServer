/**
 * installing dependancies here
 */
const router = require("express").Router();
const Task = require("../models/task");
// const Project = require("../models/project");

router.post("/create/:parentId", function(req, res){
    let parentId = req.params.parentId,
        {title, assigner, assignie } = req.body;
    let newTask = new Task({
        title,
        assigner,
        assignie,
        parentId
    })
    Task.createTask(newTask, parentId, function(err, task){
        if (err && !task) {
            return res.json({success:false, message:"could not able to create task"})
        } else {
            return res.json({success:true, message:"task created", task});
        }
    })
})


router.get("/get/:parentId", function(req, res){
    let parentId = req.params.parentId;
    Task.getAllTasks(parentId, function(err, tasks){
        if (err && !tasks){
            return res.json({success:false, message:"could not able to get tasks"})
        } else {
            return res.json({success:true, message:"ok", tasks})
        }
    })
})


router.get("/read/:id", function(req, res){
    let id = req.params.id;
    Task.readTask(id, function(err, task){
        if (err && !task){
            return res.json({success:false, message:"could not able to read task"})
        } else {
            return res.json({success:true, message:"ok", task})
        }
    })
})


router.put("/rename/:id", function(req, res){
    let id = req.params.id,
        {title} = req.body;
    Task.renameTask(id, title, function(err, task){
        if (err && !task){
            return res.json({success:false, message:"could not able to rename the task", err : err})
        } else {
            return res.json({success:true, message:"task renamed successfully", task})
        }
    })
})


router.put("/assignie/:id", function(req, res){
    let id = req.params.id,
        {assignie} = req.body;
    Task.updateTaskAssignie(id, assignie, function(err, task){
        if (err && !task){
            return res.json({success:false, message:"could not able to update the assignie", err : err})
        } else {
            return res.json({success:true, message:"task assignie successfully updated", task})
        }
    })
})

router.put("/status/:id", function(req, res){
    let id = req.params.id,
        {status} = req.body;
    Task.updateTaskStatus(id, status, function(err, task){
        if (err && !task){
            return res.json({success:false, message:"could not able to update the status", err : err})
        } else {
            return res.json({success:true, message:"task status successfully updated", task})
        }
    })
})

router.put("/startDate/:id", function(req, res){
    let id = req.params.id,
        {startDate} = req.body;
    Task.updateTaskStartDate(id, startDate, function(err, task){
        if (err && !task){
            return res.json({success:false, message:"could not able to update the start date", err : err})
        } else {
            return res.json({success:true, message:"task start date successfully updated", task})
        }
    })
})

router.put("/endDate/:id", function(req, res){
    let id = req.params.id,
        {endDate} = req.body;
    Task.updateTaskEndDate(id, endDate, function(err, task){
        if (err && !task){
            return res.json({success:false, message:"could not able to update the end date", err : err})
        } else {
            return res.json({success:true, message:"task end date successfully updated", task})
        }
    })
})

router.put("/label/:id", function(req, res){
    let id = req.params.id,
        {label} = req.body;
    Task.updateTaskLabel(id, label, function(err, task){
        if (err && !task){
            return res.json({success:false, message:"could not able to update the label", err : err})
        } else {
            return res.json({success:true, message:"task label successfully updated", task})
        }
    })
})

router.put("/rating/:id", function(req, res){
    let id = req.params.id,
        {rating} = req.body;
    Task.updateTaskRating(id, rating, function(err, task){
        if (err && !task){
            return res.json({success:false, message:"could not able to update the rating", err : err})
        } else {
            return res.json({success:true, message:"task rating successfully updated", task})
        }
    })
})

router.delete("/delete/:id", function(req, res){
    let id = req.params.id,
        {title} = req.body;
    Task.deleteTask(id, function(err, task){
        if (err){
            return res.json({success:false, message:"could not able to delete task"})
        } else if (!task) {
            return res.json({success:false, message:"task not existed"})
        } else {
            return res.json({success:false, message:"task deleted successfully"})
        }
    })
})







module.exports = router;

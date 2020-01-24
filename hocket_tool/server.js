
/**
 *  initializing the clustering process
 */
var cluster = require('cluster');


if (cluster.isMaster) {
    let numCPUs = require('os').cpus().length-3;
    console.log(`Master ${process.pid} is running`);
  
    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
  
    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
      cluster.fork();
    });
  
} else {
    
/**
 *  server starts from here
 */
const express = require("express"),
        app = express(),
        mongoose = require("mongoose"),
        morgan = require("morgan"),
        cors = require("cors"),
        bodyparser = require("body-parser"),
        path = require("path"),
        axios = require("axios"),
        ejs = require("ejs"),
        config = require("./config/database"),
        projectRouter = require("./routers/projects"),
        groupRouter = require("./routers/groups"),
        taskRouter = require("./routers/tasks");


app.use(morgan("dev"))
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'ejs');
app.use("/static", express.static("./node_modules"));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(morgan('dev'))
app.use(cors());


/**
 * additional configuration
 */
mongoose.connect(config.db, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((status) => {
        console.log("connected")
    })
    .catch((err) => {
        console.log(err)
    })

/**
 * routers starts from here
 */
app.get("/", function(req, res){
    res.redirect("/dashboard")
})

app.get("/dashboard", function(req, res){
    user = JSON.parse(req.query.user);
    res.render("dashboard", {user:user.name});
});

app.get("/tasks", function(req, res){
    user = JSON.parse(req.query.user);
    res.render("tasks", {user:user.name});
});


/**
 *  routers for project management tool 
 */
app.use("/project", projectRouter);
app.use("/group", groupRouter);
app.use("/task", taskRouter);


/**
 *  this is pasing front end files for chat service 
 */
app.get("/chat/:user", function(req, res){
    res.render(req.params.user, {user:req.params.user});
});









/**
 *  testing clustering and multiple worker processes
 */
app.get("/test", function(req, res){
    let num = 5222222222222222222222222222 * 25622222222222222222222222222;
    console.log(process.pid)
    res.end(num.toString() + " ---- " + process.pid);
})

app.get("/exit", function(req, res){
    res.end("kill")
    process.exit();
})



/**
 *  implementation of worker threads for CPU heavy operations
 */
const { Worker, isMainThread, MessageChannel } = require('worker_threads');

app.get("/calc", function(req, res){

    if (isMainThread) {
        const worker = new Worker(`${__dirname}/worker/calculate.js`)
        const subChannel = new MessageChannel()
        subChannel.port2.on("message", (message) => console.log(message));
        worker.postMessage({port:subChannel.port1}, [subChannel.port1])
    }
    console.log("sending response")
    res.send("respose made")

})



/**
 * listening on port
 */
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
    console.log(`Hocket tool is running on port : ${port}`)
})
console.log(`Worker ${process.pid} started`);


/**
 * server ends here bellow is close tag of else block from clustering
 */
}

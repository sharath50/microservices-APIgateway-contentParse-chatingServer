"use strict";
/**
 * including npm modules
 */
const express = require("express"),
        app = express(),
        mongoose = require("mongoose"),
        morgan = require("morgan"), 
        passport = require("passport"),
        passjwt = require("passport-jwt"),
        jwt = require("jsonwebtoken"),
        cors = require("cors"),
        bcryptjs = require("bcryptjs"),
        config = require("./config/database"),
        bodyparser = require("body-parser"),
        User = require('./models/users'),
        path = require("path"),
        axios = require("axios"),
        ejs = require("ejs"),
        cookieParser = require('cookie-parser'),
        BlockedToken = require("./models/blockedToken"),
        CryptoJS = require("crypto-js"),
        logger = require("./config/logger");
     




app.use(cookieParser());
app.use("/static", express.static("./node_modules"));
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'ejs');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(morgan('dev'));
app.use(cors());
require("./config/passport")(passport);
app.use(passport.initialize());



/**
 * additional configuration
 */
mongoose.connect(config.db, {useUnifiedTopology: true, useNewUrlParser: true})
    .then((status) => {
        console.log("connected")
    })
    .catch((err) => {
        console.log(err)
    })

/**
 * redis client configuration
 */
const redis = require("redis"),
        client = redis.createClient();

client
    .on("connect", () => {
        console.log("redis connected successfully")
    })
    .on("error", () => {
        console.log("redis connection error accured")
    })


/**
 *  redis caching goes here
 */
const fetch = require("node-fetch");

app.get('/photosCache', (req, res) => {
 
    // key to store results in Redis store
    const photosRedisKey = 'user:photos';
 
    // Try fetching the result from Redis first in case we have it cached
    return client.get(photosRedisKey, (err, photos) => {
 
        // If that key exists in Redis store
        if (photos) {
            console.log("found")
 
            return res.json({ source: 'cache', data: JSON.parse(photos) })
 
        } else { // Key does not exist in Redis store
 
            console.log("not found")
            // Fetch directly from remote api
            fetch('https://jsonplaceholder.typicode.com/photos')
                .then(response => response.json())
                .then(photos => {
 
                    // Save the  API response in Redis store,  data expire time in 3600 seconds, it means one hour
                    client.setex(photosRedisKey, 3600, JSON.stringify(photos))
 
                    // Send JSON response to client
                    return res.json({ source: 'api', data: photos })
 
                })
                .catch(error => {
                    // log error message
                    console.log(error)
                    // send error to the client 
                    return res.json(error.toString())
                })
        }
    });
});




/** 
 * rate limiting configuration
 * ==================================================================================================================
 */
// const expressLimiter = require('express-limiter')(app, redis);

// app.get('/api', function (req, res) {
//     res.json({
//         status:"Testing",
//         message:"Request rate limiting test"
//     })
// })


// expressLimiter({
//     path: '/api',
//     method: 'get',
//     lookup: ['connection.remoteAddress'],
//     // 5 requests per 15 minutes
//     total: 5,
//     expire: 1000 * 60 * 15,
//     whitelist: function (req) {
//         return false;
//     },
//     skipHeaders: true,
//     onRateLimited: function (req, res, next) {
//         next({ message: 'Rate limit exceeded', status: 429 })
//     }
// })






const expressRateLimit = require("express-rate-limit");
const rateLimiter = new expressRateLimit({
    windowMs: 10 * 1000, // 15 minutes
    max: 5, // limit each IP to 100 requests per windowMs
    message: {"error" : "Too many accounts created from this IP, please try again after an hour"},
    statusCode: 429,
    headers : true,
    handler : function(req, res, next){
        next(res.render("message", {success:false, message:"Request Limit Exceeded"}))
    },
    onLimitReached : function(){
        // return true
    },
    skipFailedRequests : true,
    skip : function(){
        return false;
    }
});

app.use(rateLimiter)
app.use((req, res, next)=>{
    logger.info(req.body)
    let oldSend = res.send
    res.send = function(data){
        logger.info(data)
        oldSend.apply(res, arguments)
    }
    logger.info()
    next()
})
app.get("/api", (req,res)=>{
    logger.error("this is the error from api")
    res.end("ok")
})

app.get("/api2", (req,res)=>{
    logger.log({level : "error", message : "this is the error from api2"})
    res.end("ok")
})





/**
 * routers starts from here
 * =======================================================================================================================================
 */
app.get("/", function(req, res){
    res.redirect("login");
})

app.get("/signup", function(req, res){
    res.render("signup");
})

app.get("/login", function(req, res){
    res.render("login");
})


const decryption = function(req, res, next){
    let { email, password }  = req.body;
    console.log(email, "******" , password);
    let decryptedEmail = CryptoJS.AES.decrypt(email, config.secretKey).toString(CryptoJS.enc.Utf8);
    let decryptedPassword = CryptoJS.AES.decrypt(password, config.secretKey).toString(CryptoJS.enc.Utf8);
    console.log(decryptedEmail, decryptedPassword);
    return res.send("ok");
}


app.post('/signup', decryption, function(req, res){
    let newUser = new User({
        email : req.body.email,
        password : req.body.password
    })
    User.createUser(newUser, function(err, user){
        if (err) {
            res.render("message", {success : false, message : "User is not registered"})
        } else {
            res.render("message", {success : true, message : "User is registered"})
        }
    })
})

app.post('/login', function(req, res){
    let email = req.body.email;
    let password = req.body.password;
    console.log(email, password)
    User.getUserByEmail(email, function(err, user){
        if (err) throw err;
        if (!user){
            return res.render("message", {success:false, message:"User or Password is not found"})
        }
        User.comparePassword(password, user.password, function(err, isMatch){
            if (err) throw err;
            if (isMatch){
                let token = jwt.sign(user.toJSON(), config.secret, {expiresIn: "24h"});
                // res.header("Athorization", 'JWT ' + token)
                res.cookie('Authorization', token, { maxAge: 86400000})
                res.redirect("/dashboard")
            } else {
                res.render("message", {success : false, message : "password does not match"})
            }
        })
    })
})

const checkForBlockedToken = function(req, res, next){
    if (req && req.cookies && req.cookies['Authorization'] != ""){
        var token = req.cookies['Authorization'];
    } else {
        return next();
    }
    BlockedToken.findById("5e170c5252ac8b3f4cf40f34", function(err, user){
        if (err) return res.render("message", {success:false, message:"problem in server"});
            if (user && user.tokens.includes(token)){
                return res.render("message", {success:false, message:"this token expired please login to get access"})
            } else {
                return next();
            }
    })
}

app.get("/dashboard", checkForBlockedToken,  passport.authenticate('jwt', {failureRedirect: '/login', session: false}), 
function(req, res){
    axios.get(`http://localhost:5000/dashboard`, {
        headers: {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': "*"
        },
        params : {
            user : req.user
        }
    })
    .then((response) => {
        res.send(response.data);
    }).catch((err) => {
        res.send(err)
    })
});

app.get("/tasks", checkForBlockedToken, passport.authenticate('jwt', {failureRedirect: '/login', session: false}), 
function(req, res){
    axios.get('http://localhost:5000/tasks', {
        headers: {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': "*"
        },
        params : {
            user : req.user
        }
    })
    .then((response) => {
        res.send(response.data);
    }).catch((err) => {
        res.send(err)
    })
});

app.get("/chat", checkForBlockedToken, passport.authenticate('jwt', {failureRedirect: '/login', session: false}), 
function(req, res){
    axios.get(`http://localhost:5000/chat/${req.query.user}`, {
        headers: {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': "*"
        }
    })
    .then((response) => {
        res.send(response.data);
    }).catch((err) => {
        res.send(err)
    })
});

const blockToken = function(req, res, next){
    let token = req && req.cookies? req.cookies['Authorization'] : "";
    if (token !== undefined){
        BlockedToken.updateOne(
            { _id : "5e170c5252ac8b3f4cf40f34" }, { $push : { tokens : token } }
            )
        .exec( (err, item) => {
            if (err) return res.render("message", {success:false, message:"Coud not able to log out"});
            return next();
        })
    } else {
        return next()
    }
}

const clearCookieFromClient = function(req, res, next){
    req.logout();
    res.clearCookie('Authorization');
    next();
}

app.get("/logout", blockToken , clearCookieFromClient, function(req, res){
    console.log("logging out")
    res.redirect('/');
});








/**
 * app listening on port
 */
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`API Gateway is running on port : ${port}`)
})


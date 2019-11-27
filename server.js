const express = require('express');
const app = express();
var bodyParser = require('body-parser')
var mqtt    = require('mqtt');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//const mongoose = require('mongoose');
//mongoose.connect('mongodb+srv://sharath:Sh95856030@tm-cluster-qbvb2.mongodb.net/hocketIO?retryWrites=true&w=majority', {useNewUrlParser: true});

// getting request to the main page...
app.get('/', (request, response) => {
    // response to front end...
    response.status(200).json({
        "message":"welcome to the new app",
        "status":"ok"
    });
});

// app.get('/testingMongo', (request, response) => {
//     // creating a document in mongo client...
//     const Cat = mongoose.model('Cat', { name: String });
//     new Cat({ name: 'Zildjian' })
//     .save().then((err , resp) => {
//         if (err) {
//             response.status(400).json({
//                 "error":err,
//                 "status":"error"
//             })
//         } else {
//             response.status(200).json({
//                 "response":resp,
//                 "status":"success"
//             })
//         }
//     });
// });


// setting up the mqtt service
var in_options = {
    port : process.env.PORT || 1884,
    host: 'mqtts://13.233.198.133',
    rejectUnauthorized: false, // suggested to give false
    username: "ubuntu",
    password: "hocket",
    keepalive: 60,
}

var options = {retain:true,qos:2};
var topic="pluto/switch";
var message;
var action;

var client  = mqtt.connect('mqtts://13.233.198.133', in_options); // 192.168.43.134 : 9001
console.log("connected flag  " + client.connected); // to confirm the connection -- not needed

client.on('connect' , () => {
    console.log('connected ' + client.connected);
    console.log("subscribing to topics");
    client.subscribe(topic,options, (err , granted) => {
        if (err) console.log(err)
        if (granted) console.log('subscription granted to ' + topic + ' ' + JSON.stringify(granted))
    });
});

//handle errors
client.on("error",function(error){
    console.log("Can't connect" + error);
    // process.exit(1)
});


app.post('/dialogFlow', (request, response) => {
    
    console.log(request.body.queryResult.intent.displayName);
    action = request.body.queryResult.intent.displayName === "Turning_on"?true:false;
    console.log(action);
    let action_value = action?"turned on":"turned off";
    console.log(action_value);
    
    function publish(topic,msg,options){
        console.log("publishing",msg);
        client.publish(topic,msg,options);
    }

    // receiving the data from the webhook...
    if (request.body.queryResult.allRequiredParamsPresent){
        var place = request.body.queryResult.parameters.places;
        var device = request.body.queryResult.parameters.devices;
        // configuring the request...
        message = `{"node":${place},"pin":${device},"value":${action}}`;
        console.log('publishing...')
        publish(topic,message,options);

        //handle incoming messages
        client.on('message',function(topic, message){
            console.log("message is " + message.toString());
            console.log("topic is "+ topic);
            success_resp(`here we go ${place} ${device} ${action_value}`);
        });
    }

    function success_resp(speech){
        return response.json({
            "fulfillmentText": speech,
            "fulfillmentMessages": [
                {
                    "text": {
                        "text": [
                            speech,
                        ]
                    }
                }
            ],
        });
    }
});







// listening for the requests on port...
let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('listening on port : ' + port);
});

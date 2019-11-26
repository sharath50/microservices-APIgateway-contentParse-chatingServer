const express = require('express');
const app = express();
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://sharath:Sh95856030@tm-cluster-qbvb2.mongodb.net/hocketIO?retryWrites=true&w=majority', {useNewUrlParser: true});

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


app.post('/dialogFlow', (request, response) => {

    // receiving the data from the webhook...
    var speech = request.body.queryResult
          ? `here we go ${request.body.queryResult.parameters.places} ${request.body.queryResult.parameters.devices} turned on`
          : "Seems like some problem. Speak again.";
        
     // console.log("Request: ", request);
    // console.log('places ->' , request.body.queryResult.parameters.places)
    // console.log('devices ->' , request.body.queryResult.parameters.devices)

    return response.json({
        // payload: speechResponse,
        //data: speechResponse,
        // fulfillmentText: "hello this is from heroku app",
        // speech: speech,
        // displayText: speech,
        // source: "webhook-echo-sample"
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

});








































// listening for the requests on port...
let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('listening on port : ' + port);
});
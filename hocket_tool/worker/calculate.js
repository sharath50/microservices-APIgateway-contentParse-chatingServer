const { parentPort, MessagePort } = require('worker_threads');

parentPort.on("message", function(message){
    console.log("starting threaded operation");
    let i = 0;
    while (i < 100000){
        let j = 0;
        while (j < 100000) {
            j++
        }
        i++
    }
    message.port.postMessage("operation done");
    console.log("threaded operation ended");
    message.port.close();
})





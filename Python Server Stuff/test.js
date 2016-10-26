var zerorpc = require("zerorpc");

var client = new zerorpc.Client();
client.connect("localhost:5043");
//calls the method on the python object
client.invoke("hello", "World", function(error, reply, streaming) {
    if(error){
        console.log("ERROR: ", error);
    }
    console.log(reply);
});
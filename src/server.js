var http = require('http');
var url = require('url')
//create a server object:
http.createServer(function (req, res) {
    var q = url.parse( req.url, true);
    console.log("q", q)
    if (q.pathname == "/abc") {
      if (req.method == "GET") {
        res.write('Hello World!, abc'); //write a response to the client
        res.end(); //end the response
      }
    }

    if (q.pathname == "/") {
      res.write('Đây là trang chủ'); //write a response to the client
      res.end(); //end the response
    }


    res.end(); //end the response

}).listen(8080); //the server object listens on port 8080
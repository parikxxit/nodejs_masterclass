// Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var server = http.createServer(function (req, res) {
    /*
     * Get all the required data for the url
     *
     */
    var parsedUrl = url.parse(req.url, true);
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');
    var queryStringObject = parsedUrl.query;
    var method = req.method.toLowerCase();
    var headers = req.headers;
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function (data) {
        buffer += decoder.write(data);
    })
    req.on('end', function () {
        
        var requestedHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : router.notFound;
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        }
         requestedHandler(data, function (statusCode, payload) {
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
            payload = typeof (payload) == 'object' ? payload : {};
            var payloadString = JSON.stringify(payload);
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log('returning this response ', statusCode, payloadString)
        }); 
        //Logs
        console.log('request recived on path : ' + trimmedPath + ' with ' + method + ' method with these query string parameter ', queryStringObject);
        console.log('request recived for header', headers);
        console.log('request for payload', buffer);
        
    })
});

var port = 3001;
server.listen(port, function () {
    console.log(`server is running on port ${port}`)
})

// creating handelers
var handlers = {};
handlers.hello = function (data, callback) {
    callback(200, {
        'msg': 'foo bar and fizz buzz are the best examples'
    });
};
handlers.notFound = function (data, callback) {
    callback(404, {
        'msg': 'you lost track buddy'
    });
}
// creating the route
var router = {
    'hello': handlers.hello,
    'notFound': handlers.notFound
};
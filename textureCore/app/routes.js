//app/routes.js
 
var fs = require('fs');

//expose the routes to our app with module.exports

module.exports = function(app){
    //api -----------------------------

    //application------------------------------------
    app.get('/', function(req,res){
    	res.sendfile('./index.html'); //load the single partials file (ngular will handle page changes on the front-ends)
    });
    //application------------------------------------
    app.get('/index', function(req,res){
        res.sendfile('./index.html'); //load the single partials file (ngular will handle page changes on the front-ends)
    });

    app.get('/index/filenames', function(req, res) {
        res.json(getAllFileNames());
    });
}

function getAllFileNames(){
    var dir = './public/pdf/'; // your directory

    var files = fs.readdirSync(dir);
    //console.log(files)
    return files;

}
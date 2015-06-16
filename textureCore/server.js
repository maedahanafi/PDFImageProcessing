//server.js
var pgconnectionString =process.env.DATABASE_URL || "postgres://postgres:sesamestreet1@localhost:5432/texturedb" ; // || */"dbname=dbpsu0p5m1q0kt host=ec2-54-225-135-30.compute-1.amazonaws.com port=5432 user=qtplrjwwlajlru password=ReRrKSl0A8-mILhyUgJ43A8C8d sslmode=require";

//Database
var pgdb = require('./app/pgdatabase').database;
var pgconn = null//new pgdb(pgconnectionString);
//pgconn.databaseConnect();

//set up
var express = require('express');
var app = express();	//create our app w/ express
var morgan = require('morgan');
var bodyParser = require('body-parser');	//pull information from HT ML POST (express4)
var methodOverride = require('method-override');	//simulate DELETE and PUT (express4)

//app.set('partials', __dirname + '/public')
//app.set('view engine', 'jade')

app.use(express.static(__dirname + '/public')); //set static files location /public/img for users
app.use(morgan('dev')); //log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));    //parse application/x-www-form-urlencoded
app.use(bodyParser.json()); //parser application/json
app.use(bodyParser.json({type:'application/vnd.api+json'}));    //parse application/vnd.api+json
app.use(methodOverride());

//routes =====================================================
//load the routes
require('./app/pdfroutes')(app, pgconn);
require('./app/routes')(app);

//TODO add in routes for NER/Graph results

//listening (start app with node server.js)	========================
var port = 8000;
app.listen(port);
console.log("App listening on port "+port);


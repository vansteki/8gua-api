var Hapi = require('hapi');
var Joi = require('joi');
var MongoClient = require('mongodb').MongoClient;

// Create a server with a host and port
var server = new Hapi.Server('localhost', 8000);

// Define the route
var hello = {
	handler: function (request) {
		request.reply({ greeting: 'hello world' });
	}
};

var db_fetchData = function(y,m,d, request){
	var createDay = y + '-' + m + '-' + d;

	MongoClient.connect("mongodb://[ID]:[PASS]@linus.mongohq.com:10054/[DB]", function(err, db) {
		if(err) { return console.dir(err); }
		else
		 	db.collection('collection name', function(err, collection) { 
		 	// db.XD.find({date:'1/23',pushCount:'6'},{date:1,author:1,pushCount:1}).limit(10)
		 		 collection.find({date:createDay}).sort({_id : -1}).limit(10).toArray(function(err, items) {
		 		 	//console.log(items);
		 		 	request.reply(items);
		 		 });
		 	});
	});
}

var validation = function(obj){

	// var S = Joi.Types.String;
	var I = Joi.Types.Number;

	var rules = {
		'y': I().min(2000).max(2015),
		'm': I().min(1).max(12),
		'd': I().min(1).max(31)
	};

	var res = Joi.validate(obj, rules, function (err) {
		if (err) return 0;
		else return 1;
		});

	return res;
}

var getData = function (request) {
	console.log(request.params.y + '/' + request.params.m + '/' + request.params.d);
	var obj = {
		y: request.params.y,
		m: request.params.m,
		d: request.params.d
	};
	// request.reply(obj);
	var isVali = validation(obj);
	console.log('validation: ' + isVali);
	if(isVali)	db_fetchData(request.params.y, request.params.m, request.params.d, request);
}


// Add the route
server.addRoute({
	method: 'GET',
	path: '/hello',
	config: hello
});

server.addRoute({
	path: '/{y}/{m}/{d}',
	method: 'GET',
	handler: getData
});

server.start();


/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var banquo = require('banquo');
var config = require('./config.json');
var AWS = require('aws-sdk');
var s3_config = require('./s3.json');
AWS.config.loadFromPath(s3_config.credentials);
console.log(s3_config.credentials)
var s3 = new AWS.S3();

var app = express();


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);


function whiteListHost(domain){
	domain = domain.replace(':' + app.get('port'), '');
	return (config.host_whitelist.indexOf(domain) != -1) ? true : false;
}

function errorResponse(res, type, more_info){
	more_info = (more_info) ? more_info : ''
	res.jsonp(500, { error: config.error_msgs[type] + more_info })
	return false;
}

function percentDecode(string){
	console.log(string)
	return string.replace(/__/g, '/');
}

function assembleSettings(opts){
	console.log('opts', opts)
	opts = percentDecode(opts);
	opts = opts.split('&');
	var settings = {};
	for(var i = 0; i < opts.length; i++){
		 var opt_arr = opts[i].split('=');
		if (config.opts_whitelist.indexOf(opt_arr[0]) != -1){
			settings[opt_arr[0]] = opt_arr[1];
		}else{
			return {status: false, error: opt_arr[0]};
		}
	}
	return {status: true, settings: settings};

}

function uploadToS3(image_data, timestamp){

	var key_info = s3_config.output_path + timestamp + s3_config.file_name;

	var img_blog = new Buffer(image_data, 'base64')
  var data = {
    Bucket: s3_config.bucket,
    Key: key_info,
    Body: img_blog,
    ACL: 'public-read',
    ContentType: 'image/png',
    ContentLength: img_blog.length
  };

  s3.client.putObject( data , function (resp) {
    if (resp == null){
    	console.log('Successful upload: ' + key_info);
    }else{
      console.log('ERROR IN ' + timespance);
    };
  });
}

app.enable("jsonp callback");
app.get("/:opts", function(req, res) {
	console.log(req.params.opts)
	if (whiteListHost(req.get('host'))){
		var result = assembleSettings(req.params.opts);

		if (result.status){
			banquo.capture(result.settings, function(image_data){
				var timestamp = new Date().getTime();
				res.jsonp(200, {image_data: image_data, timestamp: timestamp});
				uploadToS3(image_data, timestamp);
			});
		}else{
			errorResponse(res, 'opts', result.error);
		}

	}else{
		errorResponse(res, 'domain');
		console.log('Attempt from unauthorized domain: ' + req.get('host'));
	}
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var banquo = require('banquo');
var config = require('./config.json')

var AWS,
    s3;

var app = express();

var error_msgs =  {
	"opts": "Please check the syntax and spelling of the variables you are passing in the url hash: ",
	"domain": "You are attempting to access this server from an unauthorized domain. To install this service on your own server, see it on Github: http://github.com/ajam/banquo-server"
}

var opts_whitelist = ["mode", "url", "viewport_width", "delay", "selector", "css_hide", "css_file", "out_file"];

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

function errorResponse(res, type, more_info){
	more_info = (more_info) ? more_info : ''
	res.jsonp(500, { error: error_msgs[type] + more_info })
	return false;
}

function assembleSettings(url, opts){
	opts = opts.split('&');
	var settings = {};
	settings.url = url;
	for(var i = 0; i < opts.length; i++){
		 var opt_arr = opts[i].split('=');
		if (opts_whitelist.indexOf(opt_arr[0]) != -1){
			settings[opt_arr[0]] = opt_arr[1];
		}else{
			return {status: false, error: opt_arr[0]};
		}
	}
	return {status: true, settings: settings};

}

function uploadToS3(image_data, timestamp){
	AWS = require('aws-sdk');
	AWS.config.loadFromPath(config.credentials);
	s3 = new AWS.S3();

	var key_info = config.output_path + config.file_name + timestamp + '.png';

	var img_blog = new Buffer(image_data, 'base64')
  var data = {
    Bucket: config.bucket,
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
      console.log('ERROR IN ' + timestamp);
    };
  });
}

app.enable("jsonp callback");
app.get("/:url/:opts", function(req, res) {
	if (config.disable_whitelist || config.referer_whitelist.indexOf(String(req.headers.referer)) != -1){
		var result = assembleSettings(req.params.url, req.params.opts);
		if (result.status){
			banquo.capture(result.settings, function(image_data){
				var timestamp = new Date().getTime();
				res.jsonp(200, {image_data: image_data, timestamp: timestamp});
				if (config.upload_to_s3){
					uploadToS3(image_data, timestamp);
				}
			});
		}else{
			errorResponse(res, 'opts', result.error);
		}
	}else{
		errorResponse(res, 'domain', result.error);
	}

});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

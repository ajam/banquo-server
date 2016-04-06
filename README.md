# Banquo server

**This repository is no longer being maintained. Please use [https://github.com/mhkeller/banquo-server2](https://github.com/mhkeller/banquo-server2).**

Banquo server is a Node Express.js server set to run the [Banquo](http://github.com/mhkeller/banquo) library as a service.

### Dependencies

You'll need [Node.js](http://nodejs.org/) and [PhantomJS](http://phantomjs.org/). If you're installing it on EC2 here are some good installation instructions. Make sure to change the version numbers to the current versions.

[Node.js on EC2](http://iconof.com/blog/how-to-install-setup-node-js-on-amazon-aws-ec2-complete-guide/)

[PhantomJS on EC2](http://phantomjs.org/build.html)

### Installation

````bash
git clone https://github.com/ajam/banquo-server.git
````

Then

````bash
cd banquo-server && npm install
````

### Configuring

To only allow traffic from whitelisted domains, enter the full path of the sites you are expecting to use this service in `config.json`. Whitelisting is disabled by default because it is difficult to test locally since you won't always get a value for `req.headers.referer`. Best to only enable this when you move to production.

You also have the option of uploading a `png` to S3 in addition to returning it as a base64 encoded string. To do this, fill out the fields in the config file.


### Starting the service

Install Forever

````bash
npm install -g forever
````

`cd` to `banquo server` directory.

Start the server, default is port 3000
`forever start app.js`


### Using the service

Let's say your server lives at `banquo.com`, the call has the following stucture:

````
http://banquo.com:3000/:url/:options
````

So

````
banquo.com:3000/america.aljazeera.com/viewport_width=1000&delay=1000&selector=#map-canvas&css_hide=.map-zoom`
````

That won't quite work, though, make sure you wrap your options with [`encodeURIComponent()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent).

A full client set up would look something like this:

````js
var url = 'america.aljazeera.com',
		options = 'viewport_width=1000&delay=1000&selector=#map-canvas&css_hide=.map-zoom';

function sendScreenshot(url, options){
	return $.ajax({
		url: 'http://banquo.com:3000/' + encodeURIComponent(url) + '/' + encodeURIComponent(options),
    dataType: 'JSONP',
    callback: 'callback'
	});

}

sendScreenshot(url, options)
	.done(function(response){
		console.log(response.image_data, response.timestamp);
	})
	.fail(function(err){
		console.log(err);
	})

````

Or, if you want to be fancy, store your options as an object and write a function that converts them to a `&` delimited string. But how you set up the client is whatever makes sense for you.

These are your options that you can pass to Banquo.

Key | Required | Default | Options | Description
--- | --- | --- | --- | ---
url |yes| null | *String* | The website you want to screenshot.
viewport_width |no| 1440 | *Number (pixels)* | The desired browser width. Settings this to a higher number will increase processing time.
delay |no| 1000 | *Number (milliseconds)* | How long to wait after the page has loaded before taking the screenshot. PhantomJS apparently waits for the page to load but if you have a map or other data calculations going on, you'll need to specify a wait time.
selector |no| `body` | *URI-component-encoded CSS selector* | The div you want to screenshot.
css_hide |no| null | *URI-component-encoded CSS selector* | Any divs you want to hide, such as zoom buttons on map.

### The response

Your Banquo Server should now be returning you a JSONP response of image data and a UNIX timestamp. The timestamp is useful if you've uploaded the image to S3 since it will bake out the image with the following format name: `screenshot-1383626366826.png`


### Contact

Any questions? Contact me here:

michael.keller@aljazeera.net

[@mhkeller](http://twitter.com/mhkeller)

Pull requests welcome.

# Banquo

Banquo builds off of [Depict](https://github.com/kevinschaul/depict), a node library designed to use PhantomJS to take screenshots of interactive visualizations. Banquo is slightly different in that it is built to be called on a Node.js server and returns a base64-encoded version of the screenshot as jsonp, as opposed to saving the screenshot to a file.

As a result, Banquo doesn't run on the command line, as Depict does, but instead is called like so from another Node.js script

````
var opts = {
    mode: 'base64',
    url: 'america.aljazeera.com',
    viewport_width: 1440,
    delay: 1000,
    selector: '#map-canvas'
}
banquo.capture(opts, function(image_data){
    console.log(image_data);
})
````

You can set up your own service with banquo by cloning [banquo-server](http://github.com/ajam/banquo-server)
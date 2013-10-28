# Banquo server

Banquo server is a Node Express.js server set to run the [Banquo](http://github.com/mhkeller/banquo) library as a service.

### Installation

`git clone` the repo onto your server.

Run

`cd banquo-server && npm install`


### Starting the service

Install Forever
````
npm install -g forever
````

`cd` to `banquo server` directory.

Start the server, default is port 3000
`forever start app.js`


### Using the service

Let's say your server lives at `banquo.com`, you pass your percent-encoded options in through the URL hash such as:
`banquo.com:3000/mode=save&url=america.aljazeera.com&viewport_width=2400&delay=1000&selector=%23map-canvas&css_hide=.map-zoom&out_file=map.png`

These are your options

Key | Options | Description
--- | --- | ---
mode | `base64`, `save` | `base64` (default) will return image data as jsonp. `save` will save your screenshot as a PNG.
url | *String* | The website you want to screenshot.
viewport_width | *Number (pixels)* | The desired browser width.
delay | *Number (milliseconds)* | How long to wait after the page has loaded before taking the screenshot. PhantomJS apparently waits for the page to load but if you have a map or other data calculations going on, you'll need to specify a wait time.
selector | *Percent-encoded CSS selector* | The div you want to screenshot. Defaults to 'body' if not specified.
css_hide | *Percent-encoded CSS selector* | Any divs you want to hide, such as zoom buttons on map. Defaults to none.
out_file | *String* | For `save` mode, the name of the file to write.
xio.js
======
version 0.0.1

A consistent data repository strategy for local and remote resources.

## What it does

xio.js is a library that enables you to read and write data to/from data stores and remote servers using a consistent interface convention. It enables you to write code that can be more easily migrated between storage locations and/or URIs.

The convention is a bit unique using `xio[action][repository](key, value)`. This is different from the usual convention of `[object][method](key, value)`.

### Why?!

As a bit of an experiment, it seems to read and write better. Rather than taking a repository and reading and writing from/to it, the perspective is flipped and you are focusing on *what you need to do* while the target becomes more like a *parameter* at least in thought. The goal is to dumb down CRUD operation concepts and repositories so that, rather than repositories having an unknown set of operations with unknown interface styles and other features, instead, your standard CRUD operations, which are predictable, have a set of valid repository targets.

Meanwhile, when you define a repository with xio.define(), it returns an object that contains the operations (`get()`, `post()`, etc) that it supports. So if you really want to use the conventional *repository*[*method*](*key*, *value*) approach, you still can!

### Download

Download here: https://github.com/stimpy77/xio.js/blob/master/src/xio.js

### Basic verbs

See xio.verbs:

- get(key)
- set(key, value); used only by localStorage, sessionStorage, and cookie
- put(key, data); defaults to "set" behavior when using localStorage, sessionStorage, or cookie
- post(key, data); defaults to "set" behavior when using localStorage, sessionStorage, or cookie
- delete(key)
- et al; HTTP verbs would apply

### Examples

    // initialize

	var xio = (window || exports).Xio(); // initialize a module instance named "xio";

#### localStorage

    xio.set.local("my_key", "my_value");
    var val = xio.get.local("my_key")();
    xio.delete.local("my_key");

    // or, get using asynchronous conventions, ..    
    var val;
    xio.get.local("my_key").success(function(v) 
        val = v;
    });

    // PATCH support!? (todo; not yet implemented)
    xio.set.local("my_key", {
        first: "Bob",
        last: "Jones"
    }).complete(function() {
		xio.patch.local("my_key", {
			last: "Jonas" // keep first name
		});
    });
  
#### sessionStorage

    xio.set.session("my_key", "my_value");
    var val = xio.get.session("my_key")();
    xio.delete.session("my_key");
	
#### cookie

    xio.set.cookie(...)
	
.. supports these arguments: `(key, value, expires, path, domain)`

Alternatively, retaining only the `xio.set[target](key, value)`, you can automatically returned helper replacer functions:

    xio.set[target](skey, svalue)
        .expires(Date.now() + 30 * 24 * 60 * 60000))
        .path("/")
        .domain("mysite.com");

Note that using this approach, while more expressive and potentially more convertible to other CRUD targets, also results in each helper function deleting the previous value to set the value with the new adjustment.
  
##### session cookie

    xio.set.cookie("my_key", "my_value");
    var val = xio.get.cookie("my_key")();
    xio.delete.cookie("my_key");

##### persistent cookie

    xio.set.cookie("my_key", "my_value", new Date(Date.now() + 30 * 24 * 60 * 60000));
    var val = xio.get.cookie("my_key")();
    xio.delete.cookie("my_key");

#### web server resource (asynchronous GET)

    xio.define("specresource", {
                    url: "spec/res/{0}",
                    methods: [xio.verbs.get],
                    dataType: 'json'
                });
    var val;
    xio.get.specresource("myResourceAction").success(function(v) { // gets http://host_server/spec/res/myResourceAction
        val = v;
    }).complete(function() {
        // continue processing with populated val
    });

#### web server resource (synchronous GET)

    xio.define("synchronous_specresources", {
                    url: "spec/res/{0}",
                    methods: [xio.verbs.get],
                    dataType: 'json',
                    async: false // <<==!!!!!
                });
    var val = xio.get.synchronous_specresources("myResourceAction")(); // gets http://host_server/spec/res/myResourceAction

#### web server resource POST

    xio.define("contactsvc", {
                    url: "svcapi/contact/{0}",
                    methods: [ xio.verbs.get, xio.verbs.post ],
                    dataType: 'json'
                });
    var myModel = {
        first: "Fred",
        last: "Flinstone"
    }
    var val = xio.post.contactsvc(null, myModel).success(function(id) { // posts to http://host_server/svcapi/contact/
        // model has been posted, new ID returned
        // validate:
        xio.get.contactsvc(id).success(function(contact) {  // gets from http://host_server/svcapi/contact/{id}
            expect(contact.first).toBe("Fred");
        });
    });

#### web server resource (DELETE)

    xio.delete.myresourceContainer("myresource");

#### web server resource (PUT)

    xio.define("contactsvc", {
                    url: "svcapi/contact/{0}",
                    methods: [ xio.verbs.get, xio.verbs.post, xio.verbs.put ],
                    dataType: 'json'
                });
    var myModel = {
        first: "Fred",
        last: "Flinstone"
    }
    var val = xio.post.contactsvc(null, myModel).success(function(id) { // posts to http://host_server/svcapi/contact/
        // model has been posted, new ID returned
        // now modify:
		myModel = {
            first: "Carl",
            last: "Zeuss"
        }
        xio.put.contactsvc(id, myModel).success(function() {  /* .. */ }).error(function() { /* .. */ });
    });

#### web server resource (PATCH) (todo; not yet tested/implemetned)

    xio.define("contactsvc", {
                    url: "svcapi/contact/{0}",
                    methods: [ xio.verbs.get, xio.verbs.post, xio.verbs.patch ],
                    dataType: 'json'
                });
    var myModel = {
        first: "Fred",
        last: "Flinstone"
    }
    var val = xio.post.contactsvc(null, myModel).success(function(id) { // posts to http://host_server/svcapi/contact/
        // model has been posted, new ID returned
        // now modify:
		var myModification = {
            first: "Phil" // leave the last name intact
        }
        xio.patch.contactsvc(id, myModification).success(function() {  /* .. */ }).error(function() { /* .. */ });
    });

#### custom implementation and redefinition

    xio.define("custom1", {
	    get: function(key) { return "teh value for " + key};
	});
	xio.get.custom1("tehkey").success(function(v) { alert(v); } ); // alerts "teh value for tehkey";
    xio.redefine("custom1", xio.verbs.get, function(key) { return "teh better value for " + key; });
	xio.get.custom1("tehkey").success(function(v) { alert(v); } ); // alerts "teh better value for tehkey"
	var custom1 = 
	    xio.redefine("custom1", {
			url: "customurl/{0}",
			methods: [xio.verbs.post],
			get: function(key) { return "custom getter still"; }
		});
	xio.post.custom1("tehkey", "val"); // asynchronously posts to URL http://host_server/customurl/tehkey
	xio.get.custom1("tehkey").success(function(v) { alert(v); } ); // alerts "custom getter still"

	// oh by the way,
	for (var p in custom1) {
	    if (custom1.hasOwnProperty(p)) {
		    console.log("custom1." + p); // should emit custom1.get and custom1.post
		}
	}

## Dependencies

jQuery is required for now, for XHR-based operations. This dependency requirement might be dropped in the future.

## Future intentions

### PATCH support

See documentation above, there are to-do notes in there.

### WebSockets and WebRTC support

The original motivation to produce an I/O library was actually to implement a WebSockets client that can fallback to long polling, and that has no dependency upon jQuery. Instead, what has so far become implemented has been a standard AJAX interface that depends upon jQuery. Go figure.

If and when WebSocket support gets added, the next step will be WebRTC. 

Meanwhile, jQuery needs to be replaced with something that works fine on nodejs. 

Additionally, in a completely isolated parallel path, if no progress is made by the ASP.NET SignalR team to make the SignalR client freed from jQuery, xio.js might become tailored to be a somewhat code compatible client implementation or a support library for a separate SignalR client implementation.

## Other notes

If you run the Jasmine tests, make sure the .json file type is set up as a mime type. For example, IIS and IIS Express will return a 403 otherwise. Google reveals this: http://michaellhayden.blogspot.com/2012/07/add-json-mime-type-to-iis-express.html

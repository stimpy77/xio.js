XIO (xio.js)
======
version 0.1 initial prototype (all 35-or-so tests pass)

A consistent data repository strategy for local and remote resources.

## What it does

xio.js is a Javascript resource that supports reading and writing data to/from local data stores and remote servers using a consistent interface convention. One can write code that can be more easily migrated between storage locations and/or URIs, and repository operations are simplified into a simple set of verbs.

It supports localStorage, sessionStorage, cookies, and RESTful AJAX calls, using the same interface and conventions.

### Optionally asynchronous

Whether you're working with localStorage or an XHR resource, each operation returns a [promise](http://martinfowler.com/bliki/JavascriptPromise.html).

When the action is synchronous, such as in working with localStorage, it returns a "synchronous promise" which is essentially a function that can optionally be immediately invoked and it will wrap `.success(value)` and return the value.

The examples below are the same, only because XIO knows that the localStorage implementation of get is synchronous.

Aynchronous convention: `var val; xio.get.local('mykey').success(function(v) { val = v; });`

Synchronous convention: `var val = xio.get.local('mykey')();`

### Generated operation interfaces

Whenever a new repository is defined using XIO, a set of supported verb and their implemented functions is returned and can be used as a repository object. For example:

    var myRepository = xio.define('myRepository', { url: '/myRepository?key={0}', methods: ["GET", "POST", "PUT", "DELETE"]});

.. would populate the variable `myRepository` with:

    {
        get: function(key) { /* .. */ },
        post: function(key, value) { /* .. */ },
        put: function(key, value) { /* .. */ },
        delete: function(key) { /* .. */ }
    }

.. and each of these would return a [promise](http://martinfowler.com/bliki/JavascriptPromise.html).

### XIO's alternative convention

But the built-in convention is a bit unique using `xio[action][repository](key, value)` (i.e. `xio.post.myRepository("mykey", {first: "Bob", last: "Bison"})`, which, again, returns a promise. 

This syntactical convention, with the verb preceding the repository, is different from the usual convention of `_object.method(key, value)`.

#### Why?!

The primary reason was to be able to isolate the repository from the operation, so that one could theoretically swap out one repository for another with minimal or no changes to CRUD code. For example, 

    var repository = "local"; // use localStorage for now; 
	                          // replace with "my_restful_service" when ready 
							  // to integrate with the server
	xio.post[repository](key, value).complete(function() {

	    xio.get[repository](key).success(function(val) {
		    console.log(val);
		});

	});

Note here how "repository" is something that can move around. The goal, therefore, is to make disparate repositories such as localStorage and RESTful web service targets support the same features using the same interface.

As a bit of an experiment, this convention of xio[verb][repository] also seems to read and write a little better, even if it's a bit weird at first to see. The thinking is similar to the `verb-target` convention in PowerShell. Rather than taking a repository and reading and writing from/to it, the perspective is flipped and you are focusing on *what you need to do* while the target becomes more like a *parameter* at least in thought. The goal is to dumb down CRUD operation concepts and repositories so that, rather than repositories having an unknown set of operations with unknown interface styles and other features, instead, your standard CRUD operations, which are predictable, have a set of valid repository targets that support those operations.

This approach would have been entirely unnecessary and pointless if Javascript inherently supported interfaces, because then we could just define a CRUD interface and write all our repositories against those CRUD operations. But it doesn't, and indeed with the convention of closures and modules, it really can't.

Meanwhile, when you define a repository with xio.define(), as was described above and detailed again below, it returns an object that contains the operations (`get()`, `post()`, etc) that it supports. So if you really want to use the conventional `repository[method](key, value)` approach, you still can!

### Download

Download here: https://raw.github.com/stimpy77/xio.js/master/src/xio.js

### To use the whole package (by cloning this repository)

.. and to run the Jasmine tests, you will need Visual Studio 2012 and a registration of the .json file type with IIS / IIS Express MIME types. Open the xio.js.csproj file.

### Dependencies

jQuery is required for now, for XHR-based operations, so it's not quite ready for node.js. This dependency requirement might be dropped in the future.

### Basic verbs

See `xio.verbs`:

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

The following is a plan-to-have ..

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

Alternatively, retaining only the `xio.set["cookie"](key, value)`, you can automatically returned helper replacer functions:

    xio.set["cookie"](skey, svalue)
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

#### web server resource (basics)

    var define_result =
	    xio.define("basic_sample", {
                    url: "my/url/{0}/{1}",
                    methods: [ xio.verbs.get, xio.verbs.post, xio.verbs.put, xio.verbs.delete ],
                    dataType: 'json',
					async: false
                });
    var promise = xio.get.basic_sample([4,12]).success(function(result) {
	   // ..
	});
	// alternatively ..
    var promise_ = define_result.get([4,12]).success(function(result) {
	   // ..
	});

The `define()` function creates a verb handler or route.

The `url` property is an expression that is formatted with the `key` parameter of any XHR-based CRUD operation. The `key` parameter can be a string (or number) or an array of strings (or numbers, which are convertible to strings). This value will be applied to the `url` property using the same convention as the typical string formatters in other languages such as C#'s `string.Format()`.

Where the `methods` property is defined as an array of "GET", "POST", etc, for each one mapping to standard XIO verbs an XHR route will be internally created on behalf of the rest of the options defined in the options object that is passed in as a parameter to `define()`. The return value of `define()` is an object that lists all of the various operations that were wrapped for XIO (i.e. `get()`, `post()`, etc).

The rest of the options are used, for now, as a jQuery's $.ajax(..., `options`) parameter. The `async` property defaults to false. When `async` is `true`, the returned promise is wrapped with a "synchronous promise", which you can *optionally* immediately invoke with parens (`()`) which will return the value that is normally passed into `.success(function (value) { .. }`.

In the above example, `define_result` is an object that looks like this:

    {
	    get: function(key) { /* .. */ },
	    post: function(key, value) { /* .. */ },
	    put: function(key, value) { /* .. */ },
	    delete: function(key) { /* .. */ }
	}

In fact,

    define_result.get === xio.get.basic_sample

.. should evaluate to `true`.

Sample 2:

	var ops = xio.define("basic_sample2", {
                    get: function(key) { return "value"; },
                    post: function(key,value) { return "ok"; }
                });
    var promise = xio.get["basic_sample2"]("mykey").success(function(result) {
	   // ..
	});

In this example, the `get()` and `post()` operations are explicitly declared into the defined verb handler and wrapped with a promise, rather than internally wrapped into XHR/AJAX calls. You can mix-and-match both generated XHR calls (with the `url` and `methods` properties) as well as custom implementations (with explicit `get`/`post`/etc properties) in the options argument. Custom implementations will override any generated implementations if they conflict.

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
	    if (custom1.hasOwnProperty(p) && typeof(custom1[p]) == "function") {
		    console.log("custom1." + p); // should emit custom1.get and custom1.post
		}
	}

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

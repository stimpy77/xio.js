XIO (xio.js)
======
version 0.1.3 (all 52-or-so spec tests pass)

A consistent data repository strategy for local and remote resources.

## What it does

xio.js is a Javascript resource that supports reading and writing data to/from local data stores and remote servers using a consistent interface convention. One can write code that can be more easily migrated between storage locations and/or URIs, and repository operations are simplified into a simple set of verbs.

To write and read to and from local storage,
    
    xio.set.local("mykey", "myvalue");
    var value = xio.get.local("mykey")();
    
To write and read to and from a session cookie,

    xio.set.cookie("mykey", "myvalue");
    var value = xio.get.cookie("mykey")();
    
To write and read to and from a web service (as optionally synchronous; see below),

    xio.post.mywebservice("mykey", "myvalue");
    var value = xio.get.mywebservice("mykey")();

See the pattern? It supports localStorage, sessionStorage, cookies, and RESTful AJAX calls, using the same interface and conventions.

It also supports generating XHR functions and providing implementations that look like:

    mywebservice.post("mykey", "myvalue");
    var value = mywebservice.get("mykey")(); // assumes synchronous; see below

XIO also supports:

- custom actions 

    `xio.mycustomaction.mytargethandler(..)`

- custom events 

    `xio.event("myevent", function() { .. }); // subscribe`

    `xio.event("myevent", 3, 9); // raise`

- asynchronous web worker promises

    `xio.worker(function() { /* something that's super slow runs in an OS thread */ return "hello world"; })`

    `    .success(function(result) { console.log(result); })`

    `    .start();`

These are just some quick samples. You will need to scroll down to review the documentation for these features and more. The Wiki will be set up after XIO's continued accumulation of features drastically slows down.


### Optionally synchronous (asynchronous by default)

Whether you're working with localStorage or an XHR resource, each operation returns a [promise](http://martinfowler.com/bliki/JavascriptPromise.html).

When the action is synchronous, such as in working with localStorage, it returns a "synchronous promise" which is essentially a function that can optionally be immediately invoked and it will wrap `.success(value)` and return the value. This also works with XHR when `async: false` is passed in with the options during setup (`define(..)`).

The examples below are the same, only because XIO knows that the localStorage implementation of get is synchronous.

Aynchronous convention: `var val; xio.get.local('mykey').success(function(v) { val = v; });`

Synchronous convention: `var val = xio.get.local('mykey')();`

### Generated operation interfaces

Whenever a new repository is defined using XIO, a set of supported verb and their implemented functions is returned and can be used as a repository object. For example:

    var myRepository = xio.define('myRepository', { 
        url: '/myRepository?key={0}',
        methods: ["GET", "POST", "PUT", "DELETE"]
    });

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

	    xio.get[repository](key, function(val) {
		    console.log(val);
		});

	});

Note here how "repository" is something that can move around. The goal, therefore, is to make disparate repositories such as localStorage and RESTful web service targets support the same features using the same interface.

As a bit of an experiment, this convention of xio[verb][repository] also seems to read and write a little better, even if it's a bit weird at first to see. The thinking is similar to the `verb-target` convention in PowerShell. Rather than taking a repository and working with it independently with assertions that it will have some CRUD operations available, the perspective is flipped and you are focusing on *what you need to do*, the verbs, first, while the target becomes more like a *parameter* or a known implementation of that operation. The goal is to dumb down CRUD operation concepts and repositories and refocus on the operations themselves so that, rather than repositories having an unknown set of operations with unknown interface styles and other features, instead, your standard CRUD operations, which are predictable, have a set of valid repository targets that support those operations.

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
- patch(key, patchdata); implemented based on JSON/Javascript literals field sets (send only deltas)

### Examples

    // initialize

	var xio = Xio(); // initialize a module instance named "xio";

#### localStorage

    xio.set.local("my_key", "my_value");
    var val = xio.get.local("my_key")();
    xio.delete.local("my_key");

    // or, get using asynchronous conventions, ..    
    var val;
    xio.get.local("my_key").success(function(v) 
        val = v;
    }).error(function(e) { alert('error'); });

	// or

    xio.get.local("my_key", function(v) 
        val = v; // success
    }, function(e) {
		alert('error');
	});

	// also, local patch
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

In this example, the `get()` and `post()` operations are explicitly declared into the defined verb handler and wrapped with a promise, rather than internally wrapped into XHR/AJAX calls. If an explicit definition returns a promise (i.e. an object with `.success` and `.complete`), the returned promise will not be wrapped. You can mix-and-match both generated XHR calls (with the `url` and `methods` properties) as well as custom implementations (with explicit `get`/`post`/etc properties) in the options argument. Custom implementations will override any generated implementations if they conflict.

#### web server resource (asynchronous GET)

    xio.define("specresource", {
                    url: "spec/res/{0}",
                    methods: [xio.verbs.get],
                    dataType: 'json'
                });
    var val;
    xio.get.specresource("myResourceAction" /* can also put success and error callbacks as final params */ )
	    .success(function(v) { // gets http://host_server/spec/res/myResourceAction
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
    var val = xio.post.contactsvc(null, myModel /* can also put success and error callbacks as final params */ )
	    .success(function(id) { // posts to http://host_server/svcapi/contact/
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
    var val = xio.post.contactsvc(null, myModel /* can also put success and error callbacks as final params */ )
	    .success(function(id) { // posts to http://host_server/svcapi/contact/
            // model has been posted, new ID returned
            // now modify:
		    myModel = {
                first: "Carl",
                last: "Zeuss"
            };
            xio.put.contactsvc(id, myModel).success(function() {  /* .. */ }).error(function() { /* .. */ });
        });

#### web server resource (PATCH)

    xio.define("contactsvc", {
                    url: "svcapi/contact/{0}",
                    methods: [ xio.verbs.get, xio.verbs.post, xio.verbs.patch ],
                    dataType: 'json'
                });
    var myModel = {
        first: "Fred",
        last: "Flinstone"
    }
    var val = xio.post.contactsvc(null, myModel /* can also put success and error callbacks as final params */ )
	    .success(function(id) { // posts to http://host_server/svcapi/contact/
            // model has been posted, new ID returned
            // now modify:
		    var myModification = {
                first: "Phil" // leave the last name intact
            }
            xio.patch.contactsvc(id, myModification).success(function() {  /* .. */ }).error(function() { /* .. */ });
        });

#### client-side HTTP cache invalidation

In the event an HTTP response from an XHR response is cached, the items are invalidated if any XIO XHR response includes the header X-Invalidate-Cache-Item with the item's URL as the header value. For more information, see http://www.jondavis.net/techblog/post/2013/08/10/A-Consistent-Approach-To-Client-Side-Cache-Invalidation.aspx

#### global xhr success, error, and complete events

    xio.xhrSuccess(function(eventinfo, data, textStatus, xhr) { alert("some AJAX call just worked!"); });
    xio.xhrError(function(eventinfo, xhr, textStatus, errorThrown) { alert("some AJAX call just failed!"); });
    xio.xhrComplete(function(eventinfo, xhr, textStatus) { alert("some AJAX call just completed (success or not)!"); });
	
#### custom implementation and redefinition

    xio.define("custom1", {
	    get: function(key) { return "teh value for " + key};
	});
	xio.get.custom1("tehkey", function(v) { alert(v); } ); // alerts "teh value for tehkey";
    xio.redefine("custom1", xio.verbs.get, function(key) { return "teh better value for " + key; });
	xio.get.custom1("tehkey", function(v) { alert(v); } ); // alerts "teh better value for tehkey"
	var custom1 = 
	    xio.redefine("custom1", {
			url: "customurl/{0}",
			methods: [xio.verbs.post],
			get: function(key) { return "custom getter still"; }
		});
	xio.post.custom1("tehkey", "val"); // asynchronously posts to URL http://host_server/customurl/tehkey
	xio.get.custom1("tehkey", function(v) { alert(v); } ); // alerts "custom getter still"

	// oh by the way,
	for (var p in custom1) {
	    if (custom1.hasOwnProperty(p) && typeof(custom1[p]) == "function") {
		    console.log("custom1." + p); // should emit custom1.get and custom1.post
		}
	}

    // now let's add a custom action, a whole new "verb" to stack promise handlers onto
    var myCustomActionHandler = xio.define("myCustomActionHandler", {
        actions: ["customaction1"],  // declare a new local action 
                                     // (not HTTP method; notice it's "actions" not "methods")
        customaction1: function() {
            return "foobar myCustomActionHandler";
        }
    });
    var myOtherHandler = xio.define("myOtherHandler", {
        actions: ["customaction1"],
        customaction1: function() {
            return "whizbang myOtherHandler";
        }
    });
    xio.customaction1.myCustomActionHandler().success(function(result) {
        console.log(result); // outputs "foobar myCustomActionHandler"
	});
    xio.customaction1.myOtherHandler().success(function(result) {
        console.log(result); // outputs "whizbang myOtherHandler"
	});

#### basic custom events

    xio.event("myevent", function(e, arg1, arg2) {
        console.log("first subscription (" + arg1 + ")");
	});
    xio.event("myevent", function(e, arg1, arg2) {
        console.log("second subscription (" + (arg1 + arg2) + ")");
	});
    xio.event("myevent", 3, 4); // logs "first subscription (3), second subscription (7)"
                                // explanation: to raise the event, don't pass a function type as the 
                                // second param, and the params will propagate

#### web worker (asynchronous function)

    var myworkerwrapper = xio.worker(function() { /* do something crazy slow */ return 42; });
    myworkerwrapper.success(function (v) { result = v; });
	myworkerwrapper.error(function(e) { alert("error occurred in background task: " + e); } );
	myworkerwrapper.message(function(m) { console.log("Message from worker: " + m); } );
    myworkerwrapper.start();

    // send a message to the worker
    myworkerwrapper.post("Hi.");

    // we can also fuss with the Worker object itself
	var actualWebWorker = myworkerwrapper.worker;
    actualWebWorker.addEventListener('message', function(e) {
	  console.log('Worker said: ', e.data);
	}, false);

The web workers feature in XIO serializes the function passed in; you cannot use closures. The function passed in is wrapped with basic flow control to support starting with .start() and to package the response to the promise.

To use inline web workers as demonstrated here from within Internet Explorer (any version, including v11) you will need to ensure that the file **xio-iex.js** is available on the server and that `xio.config.parentDirectory` points to the containing directory relative to the page's base path.

To be true to the W3C's intended nature of web workers, you can alternatively pass as the .worker(..) parameter an HTTP file path to a web worker script, or pass an actual Worker object. 

    var workerpromise = xio.worker('scripts/myscript.js');
    workerpromise.success(function (v) { result = v; });
	workerpromise.error(function(e) { alert("error occurred in background task: " + e); } );
    workerpromise.start();

In order for this to work, you must structure your script as follows: 

    // to start:
    var start = function() { /* your script starts here */ };
	self.onmessage = function (d) {
		if (d.data == "start") start();
	}

    // to send up a success to the promise:
    postMessage({ result: "success", data: 42 }); // where 42 here is your success payload

    // to manually send up an error to the promise:
    postMessage({ result: "error", error: "an error occurred, dude"});

These messages will cause termination of the worker.

## Future intentions


### WebSockets and WebRTC support

The original motivation to produce an I/O library was actually to implement a WebSockets client that can fallback to long polling, and that has no dependency upon jQuery. Instead, what has so far become implemented has been a standard AJAX interface that depends upon jQuery. Go figure.

If and when WebSocket support gets added, the next step will be WebRTC. 

Meanwhile, jQuery needs to be replaced with something that works fine on nodejs. 

Additionally, in a completely isolated parallel path, if no progress is made by the ASP.NET SignalR team to make the SignalR client freed from jQuery, xio.js might become tailored to be a somewhat code compatible client implementation or a support library for a separate SignalR client implementation.

### Service Bus, Queuing, and background tasks support
 
At an extremely lightweight scale, I do want to implement some service bus and queue features. For remote service integration, this would just be more verbs to sit on top of the existing CRUD operations, as well as WebSockets / long polling / SignalR integration. This is all fairly vague right now because I am not sure yet what it will look like. 

~~On a local level, however, I am considering integrating with [Web Workers](https://developer.mozilla.org/en-US/docs/Web/Guide/Performance/Using_web_workers). It might be nice to use XIO to manage deferred I/O via the Web Workers feature. There are major limitations to Web Workers, however, such as no access to the DOM, so I am not sure yet.~~

I have added Web Workers, and for this feature the next need is to wrap "postMessage" messaging with the super fast [Transferable Objects](https://www.google.com/search?q=%22web+worker%22+transferable+objects) specification. This would require a change in how web worker code sends data back, but as long as postMessage remains supported that should be fine.

## Other notes

If you run the Jasmine tests, make sure the .json file type is set up as a mime type. For example, IIS and IIS Express will return a 403 otherwise. Google reveals this: http://michaellhayden.blogspot.com/2012/07/add-json-mime-type-to-iis-express.html

### License

The license for XIO is pending, as it's not as important to me as getting some initial feedback. It will definitely be an 
attribution-based license. If you use xio.js as-is, unchanged, with the comments at top, you definitely may use it for 
any project. I will drop in a license (probably Apache 2 or BSD or Creative Commons Attribution or somesuch) in the 
near future.
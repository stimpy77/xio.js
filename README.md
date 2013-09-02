xio.js
======
version 0.0.1

A consistent data CRUD API strategy for local and remote resources.

## What it does

xio.js is a library that enables you to read and write data to/from data stores and remote servers using a consistent interface. It enables you to write code that can be more easily migrated between storage locations and/or URIs.

### Basic verbs

See xio.verbs:

- get(key)
- set(key, value); used only by localStorage, sessionStorage, and cookie
- put(key, data); defaults to "set" behavior when using localStorage, sessionStorage, or cookie
- post(key, data); defaults to "set" behavior when using localStorage, sessionStorage, or cookie
- delete(key)
- et al; HTTP verbs would apply

### Examples

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

#### web server resource (DELETE) (todo; not yet tested/implemetned)

    xio.delete.myresourceContainer("myresource");

#### web server resource (PUT) (todo; not yet tested/implemetned)

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


## Dependencies

jQuery is required for now, for XHR-based operations. This dependency requirement might be dropped in the future.

## Future intentions

HTTP GET and POST have been conceptualized and tested. The DELETE, PUT and PATCH operations are still pending tests. PATCH applied to localStorage given a stringified data model as the stored value could be very interesting and useful so it is also in the queue to be added.

## Side notes

If you run the Jasmine tests, make sure the .json file type is set up as a mime type. For example, IIS and IIS Express will return a 403 otherwise. Google reveals this: http://michaellhayden.blogspot.com/2012/07/add-json-mime-type-to-iis-express.html

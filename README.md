# xio.js
======
version 0.0.1

A consistent data CRUD API strategy for local and remote resources.

## What it does

xio.js is a library that enables you to read and write data to/from data stores and remote servers using a consistent interface. It enables you to write code that can be more easily migrated between storage locations and/or URIs.

### Examples

#### localStorage

    xio.set.local("my_key", "my_value");
    var val = xio.get.local("my_key")();
    xio.delete.local("my_key");
  
#### sessionStorage

    xio.set.session("my_key", "my_value");
    var val = xio.get.session("my_key")();
    xio.delete.session("my_key");
  
#### session cookie

    xio.set.cookie("my_key", "my_value");
    var val = xio.get.cookie("my_key")();
    xio.delete.cookie("my_key");

#### persistent cookie

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
    xio.get.specresource("myResourceAction").success(v) { // gets http://host_server/spec/res/myResourceAction
        val = v;
    }).complete(function() {
        // continue processing with populated val
    });

#### web server resource (synchronous GET)

    xio.define("synchronous_specresources", {
                    url: "spec/res/{0}",
                    methods: [xio.verbs.get],
                    dataType: 'json',
                    async: false
                });
    var val = xio.get.synchronous_specresources("myResourceAction")(); // gets http://host_server/spec/res/myResourceAction


## Dependencies

jQuery is required for now, for XHR-based operations. This dependency requirement might be dropped in the future.

## Future intentions

A streamlined interface for all common RESTful HTTP methods is intended and expected to be tested. Hopefully xio.js as it is already implemented will serve as useful for basic local CRUD operations.

## Side notes

If you run the Jasmine tests, make sure the .json file type is set up as a mime type. IIS Express will return a 403 otherwise. Google reveals this: http://michaellhayden.blogspot.com/2012/07/add-json-mime-type-to-iis-express.html
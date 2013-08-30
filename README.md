# xio.js
version 0.0.1
======

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

#### web server resource (synchronous GET)

    xio.define("sampledata2", {
                    url: "spec/res/get.json",
                    methods: [xio.verbs.get],
                    dataType: 'json',
                    async: false
                });
    var val = xio.get.sampledata2()();

#### web server resource (asynchronous GET)

    xio.define("sampledata2", {
                    url: "spec/res/get.json",
                    methods: [xio.verbs.get],
                    dataType: 'json'
                });
    var val;
    xio.get.sampledata2().success(v) {
        val = v;
    }).complete(function() {
        // continue processing with populated val
    });


## Dependencies

jQuery is required for now, for XHR-based operations. This dependency requirement might be dropped in the future.

## Future intentions

A streamlined interface for all common RESTful HTTP methods is intended and expected to be tested. Hopefully xio.js as it is already implemented will serve as useful for basic local CRUD operations.

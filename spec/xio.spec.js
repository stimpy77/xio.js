
// this 'spec' requires IIS / IIS Express and the .json file type to be added to its MIME types

expect = expect || function () { }; // resolve inspection for IDE
describe("xio", function() {

    describe("xiospec", function() {
        it("should init", function () {
            Xio.debug = true;
            (window || exports).xio = (window || exports).xio || Xio();
            expect(this).toBeDefined();
            $.ajax("spec/svr/KeyValueStore?method=clear", {
                type: "POST",
                async: false
            }).error(function (x,t,e) {
                alert(e);
            });
        });
    });

    ////////////////////////////////////////////////////////////////////////

    describe("localstorage", function() {

        describe("xio.put.local(k,v)", function() {
            it("should store data into localStorage", function() {
                var key = Date.now().valueOf().toString();
                var value = "xio localStorage setter works";
                var target = "local";
                xio.put[target](key, value);
                var result = localStorage.getItem(key);
                if (result) localStorage.removeItem(key); // cleanup
                expect(result).toBe(value);
            });
        });

        describe("xio.set.local(k,v)", function () {
            it("should store data into localStorage", function () {
                var key = Date.now().valueOf().toString();
                var value = "xio localStorage setter works";
                var target = "local";
                xio.set[target](key, value);
                var result = localStorage.getItem(key);
                if (result) localStorage.removeItem(key); // cleanup
                expect(result).toBe(value);
            });
        });

        describe("xio.set.local([multi,key],v)", function () {
            it("should store data into localStorage with multi-key array", function () {
                var key = [Date.now().valueOf(), 3, 9];
                var value = "xio localStorage setter works";
                var target = "local";
                xio.set[target](key, value);
                var result = localStorage.getItem(key[0].toString() + '-' + key[1].toString() + '-' + key[2].toString());
                if (result) localStorage.removeItem(key); // cleanup
                expect(result).toBe(value);
            });
        });

        describe("xio.set.local(k,obj)", function () {
            it("should store a serialized object into localStorage", function () {
                var key = Date.now().valueOf().toString();
                var value = { first: "Doug", last: "Heinous" };
                var target = "local";
                xio.set[target](key, value);
                var result = localStorage.getItem(key);
                if (result) localStorage.removeItem(key); // cleanup
                expect(result).toBe(JSON.stringify(value));
            });
        });

        describe("xio.get.local(k)", function () {
            it("should retrieve data from localStorage", function () {
                var key = Date.now().valueOf().toString();
                var value = "xio localStorage getter works";
                var fromSource = "local";
                localStorage.setItem(key, value);
                var result = xio.get[fromSource](key)();  // synchronous
                if (result) localStorage.removeItem(key); // cleanup
                expect(result).toBe(value);
            });
        });

        describe("xio.get.local([multi,key])", function () {
            it("should retrieve data from localStorage with multi-key array", function () {
                var key = [Date.now().valueOf(), 9, 7];
                var value = "xio localStorage getter works";
                var fromSource = "local";
                localStorage.setItem(key[0].toString() + "-" + key[1].toString() + "-" + key[2].toString(), value);
                var result = xio.get[fromSource](key)();  // synchronous
                if (result) localStorage.removeItem(key); // cleanup
                expect(result).toBe(value);
            });
        });

        describe("xio.get.local(k) async pattern via success", function () {
            it("should retrieve data from localStorage", function () {
                var key = Date.now().valueOf().toString();
                var value = "xio localStorage getter works";
                var fromSource = "local";
                localStorage.setItem(key, value);
                var result;
                xio.get[fromSource](key).success(function (value) { result = value; });
                if (result) localStorage.removeItem(key); // cleanup
                expect(result).toBe(value);
            });
        });

        describe("xio.get.local(k) async pattern via error", function () {
            it("should fail to retrieve data from localStorage", function () {
                var key = Date.now().valueOf().toString();
                var value = "xio localStorage getter works";
                var fromSource = "local";
                //localStorage.setItem(key, value);
                var result, error, failed;
                var successResult = xio.get[fromSource](key).success(function (value) { result = value; });
                successResult.error(function () { error = true; }).fail(function () { failed = true; });
                if (result) localStorage.removeItem(key); // cleanup
                expect(result).not.toBe(value);
                expect(error).toBe(true);
                expect(failed).toBe(true);
            });
        });

        describe("xio.delete.local(k)", function() {
            it("should delete data from localStorage", function() {
                var key = Date.now().valueOf().toString();
                var value = "xio localStorage delete";
                var fromSource = "local";
                localStorage.setItem(key, value);
                xio["delete"][fromSource](key);
                var result = localStorage.getItem(key);
                expect(result).toBeFalsy();
            });
        });

        describe("xio.patch.local", function () {
            it("should patch a model being provided only subset of fields; other fields should be retained", function () {
                var key = Date.now().toString();
                var data = {
                    first: "Billy",
                    last: "Bob"
                };
                localStorage.setItem(key, JSON.stringify(data));
                
                data = { last: "Joe" };

                xio.patch.local(key, data).success(function(v) {
                    expect(v).not.toBeFalsy();
                    expect(v.last).toBe("Joe");
                    expect(v.first).toBe("Billy");
                });
            });
        });

    });

    ////////////////////////////////////////////////////////////////////////

    describe("sessionstorage", function() {

        describe("xio.put.session(k,v)", function() {
            it("should store data into sessionStorage", function() {
                var key = Date.now().valueOf().toString();
                var value = "xio sessionStorage setter works";
                var target = "session";
                xio.put[target](key, value);
                var result = sessionStorage.getItem(key);
                if (result) sessionStorage.removeItem(key); // cleanup
                expect(result).toBe(value);
            });
        });

        describe("xio.set.session(k,v)", function() {
            it("should store data into sessionStorage", function() {
                var key = Date.now().valueOf().toString();
                var value = "xio sessionStorage setter works";
                var target = "session";
                xio.set[target](key, value);
                var result = sessionStorage.getItem(key);
                if (result) sessionStorage.removeItem(key); // cleanup
                expect(result).toBe(value);
            });
        });

        describe("xio.set.session(k,obj)", function () {
            it("should store a serialized object into sessionStorage", function () {
                var key = Date.now().valueOf().toString();
                var value = { first: "Doug", last: "Heinous" };
                var target = "session";
                xio.set[target](key, value);
                var result = sessionStorage.getItem(key);
                if (result) sessionStorage.removeItem(key); // cleanup
                expect(result).toBe(JSON.stringify(value));
            });
        });

        describe("xio.get.session(k)", function() {
            it("should retrieve data from sessionStorage", function() {
                var key = Date.now().valueOf().toString();
                var value = "xio sessionstorage getter works";
                var fromSource = "session";
                sessionStorage.setItem(key, value);
                var result = xio.get[fromSource](key)();
                if (result) sessionStorage.removeItem(key); // cleanup
                expect(result).toBe(value);
            });
        });

        describe("xio.delete.session(k)", function() {
            it("should delete data from sessionStorage", function() {
                var key = Date.now().valueOf().toString();
                var value = "xio sessionStorage delete";
                var fromSource = "session";
                sessionStorage.setItem(key, value);
                xio["delete"][fromSource](key);
                var result = sessionStorage.getItem(key);
                expect(result).toBeFalsy();
            });
        });

        describe("xio.patch.session", function () {
            it("should patch a model being provided only subset of fields; other fields should be retained", function () {
                var key = Date.now().toString();
                var data = {
                    first: "Billy",
                    last: "Bob"
                };
                sessionStorage.setItem(key, JSON.stringify(data));

                data = { last: "Joe" };

                xio.patch.session(key, data).success(function (v) {
                    expect(v).not.toBeFalsy();
                    expect(v.last).toBe("Joe");
                    expect(v.first).toBe("Billy");
                });
            });
        });

    });

    ////////////////////////////////////////////////////////////////////////

    describe("cookies", function() {

        describe("xio.put.cookie(k,v)", function() {
            it("should store data into a cookie", function() {
                var key = "_" + Date.now().valueOf().toString();
                var value = "xio cookie setter works";
                var target = "cookie";
                xio.put[target](key, value);
                var result = document.cookie;

                // cleanup
                document.cookie = encodeURIComponent(key) + "=-;expires=" + (new Date("Jan 1, 1970")).toUTCString();

                expect(result).toContain(encodeURIComponent(key) + "=" + encodeURIComponent(value));

            });
        });


        describe("xio.set.cookie(k,obj)", function () {
            it("should store data obj into cookie", function () {
                var key = Date.now().valueOf().toString();
                var value = { first: "Bill", last: "Regus" };
                var target = "cookie";
                xio.set[target](key, value);
                var result = decodeURIComponent(document.cookie);

                // cleanup
                document.cookie = encodeURIComponent(key) + "=-;expires=" + (new Date("Jan 1, 1970")).toUTCString();

                expect(result).toContain("\"first\"");
                expect(result).toContain("\"Regus\"");
            });
        });

        describe("xio.put.cookie(k,v).expires() as redefine args builder", function() {
            it("should store data into a cookie with a path argument", function() {
                var key = "_" + Date.now().valueOf().toString();
                var value = "xio cookie setter works";
                var target = "cookie";
                xio.put[target](key, value).expires(new Date("Jan 1, 2200"));;
                var result = document.cookie;

                // cleanup
                document.cookie = encodeURIComponent(key) + "=-;expires=" + (new Date("Jan 1, 1970")).toUTCString();

                expect(result).toContain(encodeURIComponent(key) + "=" + encodeURIComponent(value));

                // validate expiration after the cleanup happened
                result = document.cookie;
                expect(result).not.toContain(encodeURIComponent(key) + "=" + encodeURIComponent(value));
            });
        });

        describe("xio.put.cookie(k,v).path() as redefine args builder", function() {
            it("should store data into a cookie with a path argument (!! INCOMPLETE TEST !!)", function() {
                var key = "_" + Date.now().valueOf().toString();
                var value = "xio cookie setter works";
                var target = "cookie";
                xio.put[target](key, value).path("/");
                var result = document.cookie;

                // cleanup
                document.cookie = encodeURIComponent(key) + "=-;path=/;expires=" + (new Date("Jan 1, 1970")).toUTCString();

                expect(result).toContain(encodeURIComponent(key) + "=" + encodeURIComponent(value));
            });
        });


        describe("xio.put.cookie(k,v).expires().path() as redefine args builder", function() {
            it("should store data into a persistent cookie with a path argument (!! INCOMPLETE TEST !!)", function() {
                var key = "_" + Date.now().valueOf().toString();
                var value = "xio cookie setter works";
                var target = "cookie";
                var expiration = new Date(Date.now().valueOf() + 60000);
                xio.put[target](key, value).expires(expiration).path("/");
                var result = document.cookie;

                // cleanup
                document.cookie = encodeURIComponent(key) + "=-;path=/;expires=" + (new Date("Jan 1, 1970")).toUTCString();

                expect(result).toContain(encodeURIComponent(key) + "=" + encodeURIComponent(value));
            });
        });

        describe("xio.delete.cookie(k,v)", function() {
            it("should delete a cookie", function() {
                var key = "_" + Date.now().valueOf().toString();
                var value = "xio cookie delete";
                var fromSource = "cookie";
                document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value);
                var result = document.cookie;
                expect(result).toContain(encodeURIComponent(key) + "=" + encodeURIComponent(value));
                xio["delete"][fromSource](key);
                result = document.cookie;
                expect(result).not.toContain(encodeURIComponent(key) + "=" + encodeURIComponent(value));
            });
        });

        describe("xio.patch.cookie", function () {
            it("should patch a model being provided only subset of fields; other fields should be retained", function () {
                var key = Date.now().toString();
                var data = {
                    first: "Billy",
                    last: "Bob"
                };
                document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(JSON.stringify(data));

                data = { last: "Joe" };

                xio.patch.cookie(key, data).success(function (v) {
                    expect(v).not.toBeFalsy();
                    expect(v.last).toBe("Joe");
                    expect(v.first).toBe("Billy");
                });
            });
        });
    });

    ////////////////////////////////////////////////////////////////////////

    describe("xio.define()", function() {
        it("should allow me to define a route", function() {
            xio.define("fakeroute", {
                url: "ignore/this",
                methods: [xio.verbs.get]
            });
            expect(xio.get.fakeroute).not.toBeFalsy();
            expect(typeof (xio.get.fakeroute)).toBe("function");
        });

        it("should return a set of methods that can be invoked as functions", function () {
            var definition = xio.define("threemethods", {
                methods: [xio.verbs.get, xio.verbs.post, xio.verbs.put]
            });
            expect(definition).not.toBeFalsy();
            expect(typeof (definition.get)).toBe("function");
            expect(typeof (definition.post)).toBe("function");
            expect(typeof (definition.put)).toBe("function");
            expect(definition["delete"]).toBeFalsy();
        });

        it("should allow me to declare my own implementation", function () {
            var getcalled, postcalled, putcalled, deletecalled;
            var def = xio.define("myownthree", {
                "get": function (key) { getcalled = key=="a"; },
                "post": function (key, value) { postcalled = key=="b" && value=="c"; },
                "put": function (key, value) { putcalled = key=="d" && value=="e"; },
                "delete": function (key) { deletecalled = key=="f"; }
            });
            def.get("a");
            expect(getcalled).toBe(true);
            expect(postcalled).toBeFalsy();
            expect(putcalled).toBeFalsy();
            expect(deletecalled).toBeFalsy();
            def.post("b", "c");
            expect(postcalled).toBe(true);
            expect(putcalled).toBeFalsy();
            expect(deletecalled).toBeFalsy();
            def.put("d", "e");
            expect(putcalled).toBe(true);
            expect(deletecalled).toBeFalsy();
            def["delete"]("f");
            expect(deletecalled).toBe(true);
        });

        it("should allow me to re-declare an implementation", function () {
            var definition1 = xio.define("threemethods2", {
                methods: [xio.verbs.get, xio.verbs.post, xio.verbs.put]
            });
            expect(definition1.get).not.toBeFalsy();
            expect(definition1.put).not.toBeFalsy();
            var definition2 = xio.redefine("threemethods2", {
                methods: [xio.verbs.get, xio.verbs.post]
            });
            expect(definition2.get).not.toBeFalsy();
            expect(definition2.put).toBeFalsy();
        });

        it("should allow me to redefine a single verb implementation", function () {
            var definition1 = xio.define("threemethods3", {
                methods: [xio.verbs.get, xio.verbs.post, xio.verbs.put]
            });
            var def1_get = definition1.get;
            var def1_put = definition1.put;
            expect(def1_put).not.toBeFalsy();
            var executed = false;
            var myNewPutDef = function (key, value) { executed = true; };
            var definition2 = xio.redefine("threemethods3", xio.verbs.put, myNewPutDef);
            expect(definition2.get).toBe(def1_get);
            expect(definition2.put).not.toBe(def1_put);
            definition2.put("a", "b");
            expect(executed).toBe(true);
        });
    });

    ////////////////////////////////////////////////////////////////////////
    describe("xhr", function() {
        describe("xio.get.xhr", function() {
            describe("async", function () {
                it("should return data from a route", function () {
                    var v = xio.verbs;
                    xio.define("resources", {
                        url: "spec/res/{0}",
                        methods: [v.get],
                        dataType: 'json'
                    });
                    var result;
                    var state;
                    xio.get.resources("get.json").success(function (v) {
                        result = v;
                        state = "success";
                    }).error(function (e) {
                        expect("error").toBeFalsy(" ~ by the way, you need to make sure to add .json file extension to IIS / IIS Express's mime types");
                        state = "error";
                    }).complete(function () {
                        expect(result).not.toBeFalsy();
                        expect(result.first).not.toBeFalsy();
                        expect(result.last).not.toBeFalsy();
                    });
                    var t = this;
                    waitsFor(function () {
                        return state !== undefined;
                    }, "Unhandled xhr error occurred, check console", 500)
                });
            });
            describe("2nd param as fn", function () {
                it("should execute as success", function () {
                    var v = xio.verbs;
                    xio.define("resources2fnparam", {
                        url: "spec/res/{0}",
                        methods: [v.get],
                        dataType: 'json'
                    });
                    var result;
                    var state;
                    xio.get.resources2fnparam("get.json", function (v) {
                        result = v;
                        state = "success";
                    }).error(function (e) {
                        expect("error").toBeFalsy(" ~ by the way, you need to make sure to add .json file extension to IIS / IIS Express's mime types");
                        state = "error";
                    }).complete(function () {
                        expect(result).not.toBeFalsy();
                        expect(result.first).not.toBeFalsy();
                        expect(result.last).not.toBeFalsy();
                    });
                    var t = this;
                    waitsFor(function () {
                        return state !== undefined;
                    }, "Unhandled xhr error occurred, check console", 500)
                });
            });

            describe("404", function () {

                it("should cause error condition", function () {
                    var v = xio.verbs;
                    xio.define("resources2", {
                        url: "spec/res/{0}",
                        methods: [v.get],
                        dataType: 'json'
                    });
                    var result;
                    var state;
                    xio.get.resources2("gimme404").success(function (v) {
                        state = "success";
                        expect(v).toBe("error");
                    }).error(function (e) {
                        result = e;
                        expect(e).toBe(e); // happy
                        state = "error";
                    }).complete(function () {
                        expect(state).toBe("error")
                    });
                    waitsFor(function () {
                        return state !== undefined;
                    }, "Unhandled xhr error occurred, check console", 500);
                });
            });

            describe("synchronous", function () {

                it("should return data from a route", function () {
                    var v = xio.verbs;
                    xio.define("synchronous_resources", {
                        url: "spec/svr/Sample1/{0}",
                        methods: [v.get],
                        async: false // synchronous
                    });
                    var id = "mykey";
                    var result = xio.get.synchronous_resources(id)();
                    expect(result).not.toBeFalsy();
                    expect(result.name).not.toBeFalsy();
                    expect(result.value).not.toBeFalsy();
                    expect(result.name).toBe(id);
                    expect(result.value).toContain(id);
                });
            });

            describe("multi-key request", function () {

                it("should return data from a route", function () {
                    var v = xio.verbs;
                    xio.define("multiparam", {
                        url: "spec/svr/MultiParam/{0}/{1}/{2}",
                        methods: [v.get],
                        async: false // synchronous
                    });
                    var compositeKey = ["a", "b", "c"];
                    var result;
                    xio.get.multiparam(compositeKey).success(function (retval) {
                        result = retval;
                    })
                    .error(function (error) {
                        result = "error";
                    })
                    .complete(function () {
                        expect(result).not.toBeFalsy();
                        expect(result.param1).toBe("a");
                        expect(result.param2).toBe("b");
                        expect(result.param3).toBe("c");
                    });
                });
            });

            
            describe("cached", function () {

                it("should stay cached, and invalidate with X-Invalidate-Cache-Item", function () {
                    var state;
                    xio.define("cachedSample", {
                        url: "/spec/svr/CachedSample/{0}",
                        methods: [xio.verbs.get, xio.verbs.post]

                    });
                    xio.get.cachedSample("").success(function (result1) {
                        xio.get.cachedSample("").success(function (result2) {
                            expect(result2).toBe(result1);
                            xio.post.cachedSample("Invalidate").complete(function () {
                                xio.get.cachedSample("").success(function (result3) {
                                    expect(result3).not.toBe(result1);
                                    state = "complete1";
                                });
                            }).error(function () {
                                //debugger;
                                expect("error").toBeFalsy();
                            });
                        });
                    });

                    waitsFor(function () {
                        return state !== undefined;
                    }, "unknown failure (timeout)", 600);
                });

            });

        });

        describe("xio.post.xhr", function () {

            it("should post string to a route", function () {
                var v = xio.verbs;
                xio.define("keyvaluestore", {
                    url: "spec/svr/KeyValueStore/{0}",
                    methods: [v.get,v.post],
                    async: false // synchronous
                });
                var key = "post1";
                var value = "val1";
                var result;
                var state;
                xio.post.keyvaluestore(key, value).success(function (retval) {
                    $.getJSON("spec/svr/KeyValueStore/" + key, function(v) {
                        result = v;
                        expect(result).toBe(value);
                        state = "success";
                        
                        // cleanup
                        $.ajax("spec/svr/KeyValueStore/" + key + "?method=DELETE", {
                            type: "DELETE"
                        });
                    }).fail(function() {
                        result = "error";
                        expect(result).not.toBe("error");
                        state = "fail";
                    });

                })
                .error(function (error) {
                    result = "error";
                    expect(result).not.toBe("error");
                    state = "fail";
                });

                waitsFor(function () {
                    return state !== undefined;
                }, "unknown failure (timeout)", 500);
            });

            it("should post model to a route", function () {
                var v = xio.verbs;
                xio.define("keyvaluestore2", {
                    url: "spec/svr/KeyValueStore/{0}",
                    methods: [v.get, v.post]
                });
                var key = 0; // hack, would prefer null to generate "" but the server side test doesn't resolve the route
                var model = { akey: "avalue" };
                var result;
                var state;
                xio.post.keyvaluestore2(key, model)
                    .success(function(newkey) {
                        key = newkey;
                        $.getJSON("spec/svr/KeyValueStore/" + key, function (v) {
                            result = typeof(v) == "string" ? JSON.parse(v) : v;
                            expect(result).not.toBeFalsy();
                            expect(result.akey).toBe("avalue");

                            // cleanup
                            $.ajax("spec/svr/KeyValueStore/" + key + "?method=DELETE", {
                                type: "DELETE"
                            });
                        }).fail(function() {
                            result = "error";
                            expect(result).not.toBe("error");
                        });
                        state = "success";
                    })
                    .error(function(error) {
                        result = "error";
                        expect(result).not.toBe("error");
                        state = "error";
                    });
                
                waitsFor(function () {
                    return state !== undefined;
                }, "unknown failure (timeout)", 500);
            });
        });

        describe("xio.put.xhr", function () {


            it("should put string to a route", function () {
                var v = xio.verbs;
                xio.define("keyvaluestore_puttest1", {
                    url: "spec/svr/KeyValueStore/{0}",
                    methods: [v.get, v.post, v.put],
                    async: false // synchronous
                });
                var key = "post1";
                var value = "val1";
                var result;
                var state;
                xio.post.keyvaluestore_puttest1(key, value).success(function (retval) {
                    $.getJSON("spec/svr/KeyValueStore/" + key, function (v) {
                        result = v;
                        expect(result).toBe(value);
                        state = "success";

                        value = "val2";

                        xio.put.keyvaluestore_puttest1(key, value).success(function (retval) {
                            $.getJSON("spec/svr/KeyValueStore/" + key, function (v) {
                                result = v;
                                expect(result).toBe(value);
                            }).fail(function () {
                                result = "error";
                                expect(result).not.toBe("error");
                            }).complete(function() {
                                // cleanup
                                $.ajax("spec/svr/KeyValueStore/" + key + "?method=DELETE", {
                                    type: "DELETE"
                                });
                                state = "complete";
                            });

                        })
                        .error(function (error) {
                            result = "error";
                            expect(result).not.toBe("error");
                            state = "error";
                        });

                    }).fail(function () {
                        result = "error";
                        expect(result).not.toBe("error");
                        state = "fail";
                    });

                })
                .error(function (error) {
                    result = "error";
                    expect(result).not.toBe("error");
                    state = "error";
                });

                waitsFor(function () {
                    return state !== undefined;
                }, "unknown failure (timeout)", 1000);
            });

            it("should put model to a route", function () {
                var v = xio.verbs;
                xio.define("keyvaluestore_puttest2", {
                    url: "spec/svr/KeyValueStore/{0}",
                    methods: [v.get, v.post, v.put]
                });
                var key = 0; // hack, would prefer null to generate "" for placeholder but the server side test doesn't resolve the route
                var model = { akey: "avalue" };
                var result;
                var state;
                xio.post.keyvaluestore_puttest2(key, model)
                    .success(function (newkey) {
                        key = newkey;
                        $.getJSON("spec/svr/KeyValueStore/" + key, function (v) {
                            result = typeof (v) == "string" ? JSON.parse(v) : v;
                            expect(result).not.toBeFalsy();
                            expect(result.akey).toBe("avalue");

                            model.akey = "newvalue";
                            xio.put.keyvaluestore_puttest2(key, model)
                                .success(function () {
                                    $.getJSON("spec/svr/KeyValueStore/" + key, function (v) {
                                        result = typeof (v) == "string" ? JSON.parse(v) : v;
                                        expect(result).not.toBeFalsy();
                                        expect(result.akey).toBe("newvalue");
                                        state = "success";
                                    });
                                }).complete(function () {
                                    // cleanup
                                    $.ajax("spec/svr/KeyValueStore/" + key + "?method=DELETE", {
                                        type: "DELETE"
                                    });
                                });
                        }).fail(function () {
                            result = "error";
                            expect(result).not.toBe("error");
                        });
                        state = "success";
                    })
                    .error(function (error) {
                        result = "error";
                        expect(result).not.toBe("error");
                        state = "error";
                    });

                waitsFor(function () {
                    return state === "success";
                }, "unknown failure (timeout)", 500);
            });
        });

        describe("xio.delete.xhr", function () {

            it("should delete from server", function () {
                var v = xio.verbs;
                xio.define("keyvaluestore3", {
                    url: "spec/svr/KeyValueStore/{0}",
                    methods: [v["delete"]]
                });

                $.ajax("/spec/svr/KeyValueStore/deletetest", {
                    type: "POST",
                    data: "this is a value",
                    async: false
                });

                var state;
                var result;
                xio["delete"].keyvaluestore3("deletetest").complete(function () {
                    $.getJSON("/spec/svr/KeyValueStore/deletetest").success(function (v) {
                        result = v;
                    }).complete(function () {
                        state = "complete";
                        expect(result).toBeFalsy();
                    });
                });

                waitsFor(function () {
                    return state !== undefined;
                }, "unknown failure (timeout)", 700);
            });

        });

        describe("xio.patch.xhr", function() {
            it("should patch a model being provided only subset of fields; other fields should be retained", function() {
                var key = Date.now().toString();
                var state;
                var data = {
                    first: "Billy",
                    last: "Bob"
                };
                $.post("spec/svr/KeyValueStore/" + key, data, function (r) {
                    data = { last: "Joe" };

                    var v = xio.verbs;
                    xio.define("patchtest", {
                        url: "spec/svr/KeyValueStore/{0}",
                        methods: [v.patch],
                        dataType: "json"
                    });
                    
                    xio.patch.patchtest(key, data).success(function(r2) {

                        $.getJSON("spec/svr/KeyValueStore/" + key, function (v) {
                            state = "success";
                            expect(v).not.toBeFalsy();
                            expect(v.last).toBe("Joe");
                            expect(v.first).toBe("Billy");
                        });

                    });
                });

                waitsFor(function () {
                    return state !== undefined;
                }, "unknown failure (timeout)", 700);
            });
        });

        describe("xio.xhrSuccess", function () {
            it("should capture success", function () {
                var succeeded1;
                var succeeded2;
                xio.xhrSuccess(function () {
                    succeeded1 = true;
                });
                xio.xhrSuccess(function () {
                    succeeded2 = true;
                });
                xio.define("resources4success", {
                    url: "spec/res/{0}",
                    methods: [xio.verbs.get],
                    dataType: 'json'
                });
                xio.get.resources4success("get.json");

                waitsFor(function () {
                    return succeeded1 && succeeded2;
                }, "xio.xhrSuccess subscription failed", 250);
            });
        });


        describe("xio.xhrComplete", function () {
            it("should capture complete", function () {
                var succeeded1;
                var succeeded2;
                xio.xhrComplete(function () {
                    succeeded1 = true;
                });
                xio.xhrComplete(function () {
                    succeeded2 = true;
                });
                xio.define("resources4complete", {
                    url: "spec/res/{0}",
                    methods: [xio.verbs.get],
                    dataType: 'json'
                });
                xio.get.resources4complete("get.json");

                waitsFor(function () {
                    return succeeded1 && succeeded2;
                }, "xio.xhrComplete subscription failed", 250);
            });

            it("should follow success", function () {
                var i = 0;
                var n = 0;
                xio.xhrSuccess(function () {
                    i = 1;
                });
                xio.xhrComplete(function () {
                    n = i * 2;
                });
                xio.define("resources4successcomplete", {
                    url: "spec/res/{0}",
                    methods: [xio.verbs.get],
                    dataType: 'json'
                });
                xio.get.resources4successcomplete("get.json");

                waitsFor(function () {
                    return i == 1 && n == 2;
                }, "xio.xhrComplete did not follow success", 250);
            });
        });

        describe("xio.xhrError", function () {
            it("should capture error", function () {
                var succeeded1;
                var succeeded2;
                xio.xhrError(function () {
                    succeeded1 = true;
                });
                xio.xhrError(function () {
                    succeeded2 = true;
                });
                xio.define("resources4error", {
                    url: "spec/res/{0}",
                    methods: [xio.verbs.get],
                    dataType: 'json'
                });
                xio.get.resources4complete("gimme404erroragain");

                waitsFor(function () {
                    return succeeded1 && succeeded2;
                }, "xio.xhrComplete subscription failed", 250);
            });

            it("should precede complete", function () {
                var i = 0;
                var n = 0;
                xio.xhrError(function () {
                    i = 1;
                });
                xio.xhrComplete(function () {
                    n = i * 2;
                });
                xio.define("resources4errorcomplete", {
                    url: "spec/res/{0}",
                    methods: [xio.verbs.get],
                    dataType: 'json'
                });
                xio.get.resources4successcomplete("gimme404erroragain");

                waitsFor(function () {
                    return i == 1 && n == 2;
                }, "xio.xhrComplete did not follow success", 250);
            });
        });
    });
    
    ////////////////////////////////////////////////////////////////////////
   
    describe("xio.event", function () {
        it("should subscribe and execute", function () {
            var result=0;
            var result2;
            xio.event("hello", function (e, v) {
                result = v;
            });
            xio.event("hello", function (e, v) {
                result2 = v+result;
            });
            xio.event("hello", 3);

            expect(result).toBe(3);
            expect(result2).toBe(6);

            // readme
            xio.event("myevent", function (e, arg1, arg2) {
                console.log("first subscription (" + arg1 + ")");
            });
            xio.event("myevent", function (e, arg1, arg2) {
                console.log("second subscription (" + (arg1 + arg2) + ")");
            });
            xio.event("myevent", 3, 4); // logs "first subscription (3), second subscription (7)"
        });
    });

    describe("xio.[customaction]", function () {
        it("should allow custom verbs to be declared with promise results", function () {
            var handler = xio.define("myCustomActionHandler", {
                actions: ["myCustomAction", "myFailingAction"],
                "myCustomAction": function () {
                    return "success";
                },
                "myFailingAction": function () {
                    throw "failure";
                }
            });
            expect(handler).not.toBeFalsy();
            expect(handler.myCustomAction).toBe(xio.myCustomAction.myCustomActionHandler);
            expect(handler.myFailingAction).toBe(xio.myFailingAction.myCustomActionHandler);
            var successResult, failResult;
            handler.myCustomAction().success(function () {
                successResult = true;
            }).error(function () {
                successResult = false;
            });
            handler.myFailingAction().success(function () {
                failResult = false;
            }).error(function () {
                failResult = true;
            });
            expect(successResult).toBe(true);
            expect(failResult).toBe(true);
        });

        it("should allow custom verbs to be redefined with promise results", function () {
            var handler = xio.define("myCustomActionHandler2", {
                actions: ["myCustomAction", "myFailingAction"],
                "myCustomAction": function () {
                    return "success";
                },
                "myFailingAction": function () {
                    throw "failure";
                }
            });
            handler = xio.redefine("myCustomActionHandler2", {
                actions: ["myCustomAction", "myFailingAction"],
                "myCustomAction": function () {
                    return "success2";
                },
                "myFailingAction": function () {
                    throw "failure2";
                }
            });
            expect(handler).not.toBeFalsy();
            expect(handler.myCustomAction).toBe(xio.myCustomAction.myCustomActionHandler2);
            expect(handler.myFailingAction).toBe(xio.myFailingAction.myCustomActionHandler2);
            var successResult, failResult;
            handler.myCustomAction().success(function (v) {
                successResult = v == "success2";
            }).error(function () {
                successResult = false;
            });
            handler.myFailingAction().success(function () {
                failResult = false;
            }).error(function (e) {
                failResult = e.toString() == "failure2";
            });
            expect(successResult).toBe(true);
            expect(failResult).toBe(true);
        });
    });
    
    describe("xio.worker", function () {
        it("should take a web worker and kick it off, returning a promise", function () {
            var result;
            var threeSecondBlock = function () {
                function block1second() {
                    var x = Date.now().valueOf();
                    while (Date.now().valueOf() - x < 500) { }
                }
                for (var i = 0; i < 1; i++) {
                    block1second();
                }
                return 500;
            };
            var workerpromise = xio.worker(threeSecondBlock);
            workerpromise.success(function (v) { result = v; });
            workerpromise.start();
            waitsFor(function () { return result == 500; }, 1000);
        });

        it("should take a script reference and kick return a promise", function () {
            var refpromise = xio.worker("spec/workerthing.js");
            var result;
            refpromise.success(function (v) {
                result = v;
                expect(v).toBe(42);
            });
            refpromise.start();
            waitsFor(function () { return result == 42; }, 1000);
        });
    });
});
expect=expect||function(){}; // resolve inspection for IDE
describe("xio", function() {

    describe("xiospec", function() {
        it("should init", function() {
            expect(this).toBeDefined();
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

        describe("xio.set.local(k,v)", function() {
            it("should store data into localStorage", function() {
                var key = Date.now().valueOf().toString();
                var value = "xio localStorage setter works";
                var target = "local";
                xio.set[target](key, value);
                var result = localStorage.getItem(key);
                if (result) localStorage.removeItem(key); // cleanup
                expect(result).toBe(value);
            });
        });

        describe("xio.get.local(k)", function() {
            it("should retrieve data from localStorage", function() {
                var key = Date.now().valueOf().toString();
                var value = "xio localStorage getter works";
                var fromSource = "local";
                localStorage.setItem(key, value);
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
                xio.delete[fromSource](key);
                var result = localStorage.getItem(key);
                expect(result).toBeFalsy();
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
                xio.delete[fromSource](key);
                var result = sessionStorage.getItem(key);
                expect(result).toBeFalsy();
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
                xio.delete[fromSource](key);
                result = document.cookie;
                expect(result).not.toContain(encodeURIComponent(key) + "=" + encodeURIComponent(value));
            });
        });
    });

    ////////////////////////////////////////////////////////////////////////

    describe("xio.defineRoute()", function() {
        it("should allow me to define a route", function() {
            xio.define("fakeroute", {
                url: "ignore/this",
                methods: [xio.verbs.get]
            });
        });
    });

    ////////////////////////////////////////////////////////////////////////
    describe("xhr", function() {
        describe("xio.get.xhr", function() {

            it("async should return data from a route", function () {
                var v = xio.verbs;
                xio.define("resources", {
                    url: "spec/res/{0}",
                    methods: [v.get],
                    dataType: 'json'
                });
                var result;
                xio.get.resources("get.json").success(function(v) {
                    result = v;
                }).complete(function() {
                    expect(result).not.toBeFalsy();
                    expect(result.first).not.toBeFalsy();
                    expect(result.last).not.toBeFalsy();
                });
            });

            it("synchronous should return data from a route", function() {
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
            

            it("multi-key request should return data from a route", function () {
                var v = xio.verbs;
                xio.define("multiparam", {
                    url: "spec/svr/MultiParam/{0}",
                    methods: [v.get],
                    async: false // synchronous
                });
                var compositeKey = xio.formatString("{0}/{1}/{2}", "a", "b", "c");
                var result;
                xio.get.multiparam(compositeKey).success(function (retval) {
                    result = retval;
                })
                .error(function(error) {
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
                xio.post.keyvaluestore(key, value).success(function (retval) {
                    $.getJSON("spec/svr/KeyValueStore/" + key, function(v) {
                        result = v;
                        expect(result).toBe(value);
                        
                        // cleanup
                        $.ajax("spec/svr/KeyValueStore/" + key + "?method=DELETE", {
                            type: "DELETE"
                        });
                    }).fail(function() {
                        result = "error";
                        expect(result).not.toBe("error");
                    });

                })
                .error(function (error) {
                    result = "error";
                    expect(result).not.toBe("error");
                });
            });

            it("should post model to a route", function () {
                var v = xio.verbs;
                xio.define("keyvaluestore2", {
                    url: "spec/svr/KeyValueStore/{0}",
                    methods: [v.get, v.post]
                });
                var key = "post2";
                var model = { akey: "avalue" };
                var result;
                xio.post.keyvaluestore2(key, model).success(function (retval) {
                    $.getJSON("spec/svr/KeyValueStore/" + key, function (v) {
                        result = v;
                        expect(result).not.toBeFalsy();
                        expect(result.akey).toBe("avalue");

                        // cleanup
                        $.ajax("spec/svr/KeyValueStore/" + key + "?method=DELETE", {
                            type: "DELETE"
                        });
                    }).fail(function () {
                        result = "error";
                        expect(result).not.toBe("error");
                    });

                })
                .error(function (error) {
                    result = "error";
                    expect(result).not.toBe("error");
                });
            });
        });
    });

});
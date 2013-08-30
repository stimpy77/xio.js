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

        describe("xio.get.xhr", function() {

            it("synchronous should return data from a route", function() {
                var v = xio.verbs;
                xio.define("sampledata", {
                    url: "spec/res/get.json",
                    methods: [v.get],
                    async: false
                });
                var result = xio.get.sampledata()(); // synchronous
                expect(result).not.toBeFalsy();
                expect(result.first).not.toBeFalsy();
                expect(result.last).not.toBeFalsy();
            });
        });

        describe("xio.get.xhr async", function() {

            it("should return data from a route", function() {
                var v = xio.verbs;
                xio.define("sampledata2", {
                    url: "spec/res/get.json",
                    methods: [v.get],
                    dataType: 'json'
                });
                var result;
                xio.get.sampledata2().success(function(v) {
                    result = v;
                }).complete(function() {
                    expect(result).not.toBeFalsy();
                    expect(result.first).not.toBeFalsy();
                    expect(result.last).not.toBeFalsy();
                });
            });
        });

    });
});
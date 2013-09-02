(function($) {

    if (!$) throw "jQuery must be referenced before xio.js is loaded.";

    // localStorage
    function localSetDefinition(key, value) {
        localStorage.setItem(key, value);
    }
    function localGetDefinition(key) {
        var result = localStorage.getItem(key);
        return result !== undefined && result !== null
            ? synchronousPromiseResult({ success: function (callback) { callback.call(this, result); } })
            : synchronousPromiseResult({ error: function (callback) { callback.call(this, "Not found"); } });
    }

    function localDeleteDefinition(key) {
        localStorage.removeItem(key);
    }



    // sessionStorage
    function sessionSetDefinition(key, value) {
        sessionStorage.setItem(key, value);
    }

    function sessionGetDefinition(key) {
        var result = sessionStorage.getItem(key);
        return result !== undefined && result !== null
            ? synchronousPromiseResult({ success: function (callback) { callback.call(this, result); } })
            : synchronousPromiseResult({ error: function (callback) { callback.call(this, "Not found"); } });
    }

    function sessionDeleteDefinition(key) {
        sessionStorage.removeItem(key);
    }


    // cookie
    function cookieSetDefinition(key, value, expires, path, domain) {
        if (window.location.href.indexOf("file:///") == 0) {
            throw "Cannot set a cookie on a local file system document. Use a web server.";
        }
        var cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value);
        if (expires) {
            var expiry = expires;
            switch (expires.constructor) {
                case Number:
                    expiry = expires === Infinity
                        ? ";expires=Fri, 31 Dec 9999 23:59:59 GMT"
                        : ";max-age=" + expiry
                case Date:
                    expiry = ";expires=" + new Date(expires).toUTCString();
                    break;
                case String:
                    expiry = ";expires=" + expires;
                    break;
            }
            cookie += expiry;
        }
        if (domain) {
            cookie += ";domain=" + encodeURIComponent(domain);
        }
        if (path) {
            cookie += ";path=" + path;
        }
        document.cookie = cookie;

        // parameter builder convenience functions
        return {
            expires: function(vexpires) {
                cookieDeleteDefinition(key, path, domain);
                return cookieSetDefinition(key, value, vexpires, path, domain);
            },
            path: function(vpath) {
                cookieDeleteDefinition(key, path, domain);
                return cookieSetDefinition(key, value, expires, vpath, domain);
            },
            domain: function(vdomain) {
                cookieDeleteDefinition(key, path, domain);
                return cookieSetDefinition(key, value, expires, path, vdomain);
            }
        };
    }

    function cookieDeleteDefinition(key, path, domain) {
        cookieSetDefinition(key, "-", new Date("Jan 1, 1970"), path, domain);
    }

    function cookieGetDefinition(key) {
        // from mozilla (!!)
        var ret = decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
        return ret
            ? synchronousPromiseResult({ success: function(callback) { callback.call(this, ret); } })
            : synchronousPromiseResult({ error: function (callback) { callback.call(this, "Not found"); } });
    }

    function synchronousPromiseResult(promise) { // bit of a hack to make synchronous operations appear asynchronous
        promise = promise || {};
        promise.success = promise.success || nocall;
        var ret;
        ret = function() {
            var result;
            promise.success(function(value) {
                result = value;
                return ret;
            });
            if (result === undefined && promise.readyState === 4) {
                switch (promise.getResponseHeader("Content-Type")) {
                    case "application/x-javascript":
                    case "application/json":
                        result = JSON.parse(promise.responseText);
                        break;
                    default:
                        result = promise.responseText;
                }
            }
            return result;
        };
        var autocall = function (callback) { callback.call(this); return ret; }; // execute and return my psuedo-promise; also, this?
        var nocall = function () { return ret; }; // do nothing and return my pseudo-promise
        var wrapcall = function(callee) { // wrap the promise's handler to return my psuedo-promise
            return callee
                ? function(usercallback) {
                    callee.call(this, usercallback); // this?
                    return ret;
                }
                : null;
        };
        ret.success = wrapcall(promise.success) || nocall;
        ret.error = wrapcall(promise.error) || nocall;
        ret.fail = wrapcall(promise.fail) || wrapcall(promise.error) || nocall;
        ret.done = wrapcall(promise.done) || autocall;
        ret.always = wrapcall(promise.always) || autocall;
        ret.complete = ret.always;
        return ret;
    }

    // put
    var putDefinitions = {
        local: localSetDefinition,
        session: sessionSetDefinition,
        cookie: cookieSetDefinition
    };

    // post
    var postDefinitions = {
        local: localSetDefinition,
        session: sessionSetDefinition,
        cookie: cookieSetDefinition
    };

    // set
    var setDefinitions = {
        local: localSetDefinition,
        session: sessionSetDefinition,
        cookie: cookieSetDefinition
    };

    // get
    var getDefinitions = {
        local: localGetDefinition,
        session: sessionGetDefinition,
        cookie: cookieGetDefinition
    };

    // delete
    var deleteDefinitions = {
        local: localDeleteDefinition,
        session: sessionDeleteDefinition,
        cookie: cookieDeleteDefinition
    };

    var verbHandles = {
        "put": putDefinitions,
        "set": setDefinitions,
        "get": getDefinitions,
        "delete": deleteDefinitions,
        "post": postDefinitions
    };

    // routing and actions
    var verbs = {
        "get": "GET",
        "post": "POST",
        "put": "PUT",
        "delete": "DELETE",
        "patch": "PATCH"
        // etc etc
    };
    var defineRoute = function(name, definition) {
        if (!definition.methods) {
            definition.methods = ["GET"];
        }
        for (var index in definition.methods) {
            var actionVerb = definition.methods[index];
            var handlers = verbHandles[actionVerb.toLowerCase()];
            if (handlers) {
                if (handlers[name]) throw "A " + actionVerb + " route named \"" + name + "\" already exists.";
                handlers[name] = createRoutedHandler(actionVerb, definition);
            }
        }
    };

    function formatString(str) {
        if (/\{\d+\}/.test(str)) {
            for (var i = 1; i < arguments.length; i++) {
                str = str.replace(new RegExp("\\{" + (i-1) + "\\}", 'g'), arguments[i] || "0");
            }
        }
        return str;
    }

    function stringify(obj) {
        if (!JSON || !JSON.stringify) {
            throw "json2.js is required; please reference it.";
        }
        return JSON.stringify(obj);
    }

    function createRoutedHandler(verb, definition) {

        return function(key, data) {

            var options = definition || {};
            var url = definition.url;
            var args = [url];
            if (key === null || typeof(key) == "string") args.push(key);
            else { // assume array of composite key items for formatter
                for (var i in key) args.push(key[i]);
            }
            
            url = formatString.apply(null, args);
            var method = verb;



            // jquery implementation (todo: drop jquery dependency)
            var jqoptions = {};
            for (var p in options) {
                if (options.hasOwnProperty(p) && p !== 'url' && p !== 'methods') {
                    jqoptions[p] = options[p];
                }
            }
            jqoptions.type = method;
            data = data || jqoptions.data;
            if (typeof(data) === "string" && data.indexOf("=") == -1) data = "value=" + data;
            if (typeof(data) === "object") data = stringify(data);
            jqoptions.data = data;
            if (options.async === false) {
                // return immediately
                var response = $.ajax(url, jqoptions);
                return synchronousPromiseResult(response);
            }
            return $.ajax(url, jqoptions);
        };
    }
    this.xio = {

        // action implementations
        "get": getDefinitions,
        "post": postDefinitions,
        "put": putDefinitions,
        "set": setDefinitions,
        "delete": deleteDefinitions,

        "define": defineRoute,
        
        // util
        "formatString": formatString,

        // reference
        "verbs": verbs
    };

})(jQuery);
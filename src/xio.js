(function($) {

    if (!$) throw "jQuery must be referenced before xio.js is loaded.";

    // localStorage
    function localSetDefinition(key, value) {
        localStorage.setItem(key, value);
    }
    function localGetDefinition(key) {
        var result = localStorage.getItem(key);
        return synchronousPromiseResult({success: function(callback) {callback.call(this, result)}});
    }

    function localDeleteDefinition(key) {
        localStorage.removeItem(key);
    }



    // sessionStorage
    function sessionSetDefinition(key, value) {
        sessionStorage.setItem(key, value);
    }

    function sessionGetDefinition(key) {
        return synchronousPromiseResult({success: function(callback) {callback.call(this, sessionStorage.getItem(key))}});
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
        }
    }

    function cookieDeleteDefinition(key, path, domain) {
        cookieSetDefinition(key, "-", new Date("Jan 1, 1970"), path, domain);
    }

    function cookieGetDefinition(key) {
        // from mozilla (!!)
        var ret = decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
        return synchronousPromiseResult({success: function(callback) {callback.call(this, ret); } });
    }

    function synchronousPromiseResult(promise) {
        promise = promise || {};
        promise.success = promise.success || function() {};
        var ret = function() {
            var result;
            promise.success(function(value) {
                result = value;
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
        ret.success = promise.success;
        ret.done = promise.done || function() {};
        ret.fail = promise.fail || function() {};
        ret.always = promise.always || function() {};
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
    }

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
    }

    // delete
    var deleteDefinitions = {
        local: localDeleteDefinition,
        session: sessionDeleteDefinition,
        cookie: cookieDeleteDefinition
    }

    var verbHandles = {
        "put": putDefinitions,
        "set": setDefinitions,
        "get": getDefinitions,
        "delete": deleteDefinitions
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
    }

    function strprepad(n,w,c) { 
        n=n.toString();
        while (n.length < w) n = c + n;
        return n;
    }

    function createRoutedHandler(verb, definition) {

        return function(formatters) {

            var options = definition || {};
            var url = definition.url;
            if (/\{\d+\}/.test(url)) {
                for (var i=0; i<arguments.length; i++) {
                    url = url.replace(new RegExp("\\{" + (i) + "\\}", 'g'), arguments[i]);
                }
            }
            var method = verb;



            // jquery implementation (todo: drop jquery dependency)
            var jqoptions = {};
            for (var p in options) {
                if (options.hasOwnProperty(p)) {
                    jqoptions[p] = options[p];
                }
            }
            jqoptions.type = method;
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

        // reference
        "verbs": verbs
    };

})(jQuery);
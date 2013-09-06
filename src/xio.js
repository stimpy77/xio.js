// xio.js
// http://github.com/stimpy77/xio.js
// version 0.1.1
// send feedback to jon@jondavis.net

var __xiodependencies = [jQuery, JSON]; // args list for IIFE on next line
(function ($, JSON) {
    var globals = this; // window || exports
    globals.Xio = function () {
        if (!$) throw "jQuery must be referenced before xio.js is loaded.";

        var configuration = {
            clientCacheInvalidationLocation: 'session'
        };

        function formatKey(key) {
            if ($.type(key) == "array") {
                key = $.makeArray(key);
                for (var i in key) {
                    key[i] = key[i].toString();
                }
                key = key.join('-');
            }
            return key;
        }

        // localStorage
        function localSetDefinition(key, value) {
            key = formatKey(key);
            if (typeof (value) == "object") {
                value = stringify(value);
            }
            localStorage.setItem(key, value);
        }
        function localGetDefinition(key) {
            key = formatKey(key);
            var result = localStorage.getItem(key);
            if (result && ((result.indexOf("{") == 0 && result.indexOf("}") == result.length - 1) ||
                          (result.indexOf("[") == 0 && result.indexOf("]") == result.length - 1))) {
                try {
                    result = parseJSON(result);
                }
                catch (error) { }
            }
            return result !== undefined && result !== null
                ? synchronousPromiseResult({ success: function (callback) { callback.call(this, result); } })       // this?
                : synchronousPromiseResult({ error: function (callback) { callback.call(this, "Not found"); } });   // this?
        }

        function localDeleteDefinition(key) {
            key = formatKey(key);
            localStorage.removeItem(key);
        }

        function localPatchDefinition(key, patchdata) {
            key = formatKey(key);
            var data = localStorage.getItem(key);
            if (data !== null && data !== undefined) {
                var newdata = patchData(data, patchdata);
                localSetDefinition(key, newdata);
                return synchronousPromiseResult({ success: function (callback) { callback.call(this, newdata); } });    // this?
            } else {
                return synchronousPromiseResult({ error: function (callback) { callback.call(this, "Not found"); } });  // this?
            }
        }

        function patchData(unparsed, patchdata, preparsed) {
            var data = unparsed;
            if (data && !preparsed && (
                (data.indexOf("{") == 0 && data.indexOf("}") == data.length - 1) ||
                (data.indexOf("[") == 0 && data.indexOf("]") == data.length - 1))) {
                try {
                    data = parseJSON(data);
                } catch (error) { }
            }

            if (typeof (data) == "object" && patchdata && typeof (patchdata) == "object") {
                for (var p in patchdata) {
                    if (patchdata.hasOwnProperty(p)) {
                        data[p] = patchdata[p];
                    }
                }
            }
            return data;
        }

        // sessionStorage
        function sessionSetDefinition(key, value) {
            key = formatKey(key);
            if (typeof (value) == "object") {
                value = stringify(value);
            }
            sessionStorage.setItem(key, value);
        }

        function sessionGetDefinition(key) {
            key = formatKey(key);
            var result = sessionStorage.getItem(key);
            if (result && ((result.indexOf("{") == 0 && result.indexOf("}") == result.length - 1) ||
                          (result.indexOf("[") == 0 && result.indexOf("]") == result.length - 1))) {
                try {
                    result = parseJSON(result);
                }
                catch (error) { }
            }
            return result !== undefined && result !== null
                ? synchronousPromiseResult({ success: function (callback) { callback.call(this, result); } })       // this?
                : synchronousPromiseResult({ error: function (callback) { callback.call(this, "Not found"); } });   // this?
        }

        function sessionDeleteDefinition(key) {
            key = formatKey(key);
            sessionStorage.removeItem(key);
        }

        function sessionPatchDefinition(key, patchdata) {
            key = formatKey(key);
            var data = sessionStorage.getItem(key);
            if (data !== null && data !== undefined) {
                var newdata = patchData(data, patchdata);
                sessionSetDefinition(key, newdata);
                return synchronousPromiseResult({ success: function (callback) { callback.call(this, newdata); } });    // this?
            } else {
                return synchronousPromiseResult({ error: function (callback) { callback.call(this, "Not found"); } });  // this?
            }
        }

        // cookie
        function cookieSetDefinition(key, value, expires, path, domain) {
            key = formatKey(key);
            if (typeof (value) == "object") {
                value = stringify(value);
            }
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
                expires: function (vexpires) {
                    cookieDeleteDefinition(key, path, domain);
                    return cookieSetDefinition(key, value, vexpires, path, domain);
                },
                path: function (vpath) {
                    cookieDeleteDefinition(key, path, domain);
                    return cookieSetDefinition(key, value, expires, vpath, domain);
                },
                domain: function (vdomain) {
                    cookieDeleteDefinition(key, path, domain);
                    return cookieSetDefinition(key, value, expires, path, vdomain);
                }
            };
        }

        function cookieDeleteDefinition(key, path, domain) {
            key = formatKey(key);
            cookieSetDefinition(key, "-", new Date("Jan 1, 1970"), path, domain);
        }

        function cookieGetDefinition(key) {
            key = formatKey(key);
            // from mozilla (!!)
            var result = decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
            if (result && ((result.indexOf("{") == 0 && result.indexOf("}") == result.length - 1) ||
                          (result.indexOf("[") == 0 && result.indexOf("]") == result.length - 1))) {
                try {
                    result = parseJSON(result);
                }
                catch (error) { }
            }
            return result
                ? synchronousPromiseResult({ success: function (callback) { callback.call(this, result); } })       // this?
                : synchronousPromiseResult({ error: function (callback) { callback.call(this, "Not found"); } });   // this?
        }

        function cookiePatchDefinition(key, patchdata) {
            key = formatKey(key);
            var data = cookieGetDefinition(key)();
            if (data !== null && data !== undefined) {
                var newdata = patchData(data, patchdata, true);
                cookieSetDefinition(key, newdata);
                return synchronousPromiseResult({ success: function (callback) { callback.call(this, newdata); } });    // this?
            } else {
                return synchronousPromiseResult({ error: function (callback) { callback.call(this, "Not found"); } });  // this?
            }
        }

        function synchronousPromiseResult(promise) { // bit of a hack to make synchronous operations appear asynchronous
            promise = promise || {};
            var ret;
            var autocall = function (callback) { callback.call(this); return ret; }; // execute and return my psuedo-promise; also, this?
            var nocall = function () { return ret; }; // do nothing and return my pseudo-promise
            var wrapcall = function (callee) { // wrap the promise's handler to return my psuedo-promise
                return callee
                    ? function (usercallback) {
                        callee.call(this, usercallback); // this?
                        return ret;
                    }
                    : null;
            };
            promise.success = promise.success || nocall;
            ret = function () {
                var result;
                promise.success(function (value) {
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

        // patch
        var patchDefinitions = {
            local: localPatchDefinition,
            session: sessionPatchDefinition,
            cookie: cookiePatchDefinition
        };

        var verbHandles = {
            "put": putDefinitions,
            "set": setDefinitions,
            "get": getDefinitions,
            "delete": deleteDefinitions,
            "post": postDefinitions,
            "patch": patchDefinitions
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

        function isPromise(o) { // a bit of a hack? is this what constitutes a promise?
            if (typeof (o) !== "object") return false;
            if (!o.success || typeof (o.success) !== "function") return false;
            if (!o.complete || typeof (o.complete) !== "function") return false;
            return true;
        }

        function formatString(str) {
            if (/\{\d+\}/.test(str)) {
                for (var i = 1; i < arguments.length; i++) {
                    var arg = encodeURIComponent(arguments[i].toString());
                    str = str.replace(new RegExp("\\{" + (i - 1) + "\\}", 'g'), arg || "");
                }
            }
            return str;
        }

        function parseJSON(obj) {
            if (!JSON || !JSON.stringify) {
                throw "json2.js is required; please reference it.";
            }
            return JSON.parse(obj);
        }

        function stringify(obj) {
            if (!JSON || !JSON.stringify) {
                throw "json2.js is required; please reference it.";
            }
            return JSON.stringify(obj);
        }

        var define = function (name, options) {
            var custom = {}, customqty;
            for (var v in verbs) {
                if (options[v] !== undefined && typeof (options[v]) == "function") {
                    custom[v] = options[v];
                    customqty++;
                }
            }
            if (!options.methods) {
                options.methods = customqty == 0 ? ["GET"] : [];
            }
            var retset = { options: options };
            // add autogenerated implementations
            for (var index in options.methods) {
                var actionVerb = options.methods[index];
                var verbmember = actionVerb.toLowerCase();
                var handlers = verbs[verbmember] ? verbHandles[verbmember] : null;
                if (handlers) {
                    if (handlers[name]) throw "A " + actionVerb + " route named \"" + name + "\" already exists.";
                    retset[verbmember] = handlers[name] = createRoutedHandler(actionVerb, options);
                }
            }
            // add custom implementations
            for (var v in custom) {
                if (custom.hasOwnProperty(v)) {
                    var actionVerb = verbs[v];
                    var verbmember = v;
                    var handlers = verbs[verbmember] ? verbHandles[verbmember] : null;
                    if (handlers) {
                        if (handlers[name]) throw "A " + actionVerb + " route named \"" + name + "\" already exists.";
                        retset[verbmember] = handlers[name] = createCustomHandler(actionVerb, custom[v], options);
                    }
                }
            }

            return retset;
        };

        function redefine(definition_name, /* optional */ verb, implementation, options) {
            if (typeof (verb) !== "string") {
                options = implementation;
                implementation = verb;
                verb = undefined;

                for (var v in verbs) {
                    if (verbHandles[v] && verbHandles[v][definition_name]) {
                        delete verbHandles[v][definition_name];
                    }
                }
                return define(definition_name, implementation || options);
            }

            else {
                verb = verb.toLowerCase();
                if (!verbs[verb] || !verbHandles[verb]) throw "Verb not supported: " + verb;
                var handleset = {};
                for (var v in verbs) {
                    if (verbHandles[v] && verbHandles[v][definition_name]) {
                        handleset[v] = verbHandles[v][definition_name];
                    }
                }
                if (typeof (implementation) == "function") {
                    var options = arguments.length > 3 ? arguments[3] : null;
                    handleset[verb] = verbHandles[verb][definition_name] = createCustomHandler(verb, implementation, options);
                    return handleset;
                }
                else {
                    throw "implementation argument must be a function if a verb is specified"
                }
            }
        }

        function createCustomHandler(verb, fn, options) {
            return function (key, data) {
                var catcherr;
                try {
                    var ret = fn.apply(this, arguments); // this?
                } catch (error) {
                    catcherr = error;
                    return synchronousPromiseResult({ error: function (callback) { callback.call(this, error); } }); // this?
                }

                if (isPromise(ret)) return ret;
                return synchronousPromiseResult({ success: function (callback) { callback.call(this, ret); } }); // this?

            };
        }

        var ajaxinit;
        function ajax(url, jqoptions) {
            if (!ajaxinit) {
                $(document).ajaxError(raise_xhrError);
                $(document).ajaxSuccess(raise_xhrSuccess);
                $(document).ajaxComplete(raise_xhrComplete);
                ajaxinit = true;
            }
            url = cachebust(url); // see cache-busting section below
            return $.ajax(url, jqoptions);
        }


        /////////////////////
        /// cache-busting
        // info: http://www.jondavis.net/techblog/post/2013/08/10/A-Consistent-Approach-To-Client-Side-Cache-Invalidation.aspx

        // since we may be using IIS/ASP.NET which ignores case on the path, we need a function to force lower-case on the path  
        function prepurl(u) {
            return u.split('?')[0].toLowerCase() + (u.indexOf("?") > -1 ? "?" + u.split('?')[1] : "");
        }

        function handleInvalidationFlags(xhr) {

            // capture HTTP header  
            var invalidatedItemsHeader = xhr.getResponseHeader("X-Invalidate-Cache-Item");
            if (!invalidatedItemsHeader) return;
            invalidatedItemsHeader = invalidatedItemsHeader.split(';');

            // get invalidation flags from session storage  
            var invalidatedItems = getDefinitions[configuration.clientCacheInvalidationLocation]("invalidated-http-cache-items")();
            invalidatedItems = invalidatedItems ? invalidatedItems : {};

            // update invalidation flags data set  
            for (var i in invalidatedItemsHeader) {
                invalidatedItems[prepurl(invalidatedItemsHeader[i])] = Date.now();
            }

            // store revised invalidation flags data set back into session storage  
            setDefinitions[configuration.clientCacheInvalidationLocation]("invalidated-http-cache-items", stringify(invalidatedItems));
        }

        function cachebust(url) {
            // get invalidation flags from session storage  
            var invalidatedItems = getDefinitions[configuration.clientCacheInvalidationLocation]("invalidated-http-cache-items")();
            invalidatedItems = invalidatedItems ? invalidatedItems : {};

            // if item match, return concatonated URL  
            var invalidated = invalidatedItems[prepurl(url)];
            if (invalidated) {
                return url + (url.indexOf("?") > -1 ? "&" : "?") + "_=" + invalidated;
            }
            // no match; return unmodified  
            return url;
        }
        /// end cache-busting
        /////////////////////

        function raise_xhrError(event, xhr, settings) {
            xhrError(event, xhr, settings);
        }

        function xhrError(event, xhr, settings) {

        }

        function raise_xhrSuccess(event, xhr, settings) {
            xhrSuccess(event, xhr, settings);
        }

        function xhrSuccess(event, xhr, settings) {
            handleInvalidationFlags(xhr);
        }

        function raise_xhrComplete(event, xhr, settings) {
            xhrComplete(event, xhr, settings);
        }

        function xhrComplete(event, xhr, settings) {

        }


        function subscribe_xhrerror(fn) { // nesting 
            var xc = xhrError;
            xhrError = function () {
                xc.apply(this, arguments);
                fn.apply(this, arguments);
            }
        }

        function subscribe_xhrsuccess(fn) { // nesting 
            var xc = xhrSuccess;
            xhrSuccess = function () {
                xc.apply(this, arguments);
                fn.apply(this, arguments);
            }
        }

        function subscribe_xhrcomplete(fn) { // nesting 
            var xc = xhrComplete;
            xhrComplete = function () {
                xc.apply(this, arguments);
                fn.apply(this, arguments);
            }
        }

        function createRoutedHandler(verb, options) {

            return function (key, data) {

                options = options || {};
                var url = options.url;
                var args = [url];
                if (key === null || typeof (key) == "string" || typeof (key) == "number") args.push(key);
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
                //if (typeof(data) === "string" && data.indexOf("=") == -1) data = "value=" + data;
                //if (typeof (data) == "object") data = stringify(data);
                jqoptions.data = data;
                if (options.async === false) {
                    // return immediately
                    var response = ajax(url, jqoptions);
                    return synchronousPromiseResult(response);
                }
                return ajax(url, jqoptions);
            };
        }
        return {

            config: configuration,

            // action implementations
            "get": getDefinitions,
            "post": postDefinitions,
            "put": putDefinitions,
            "set": setDefinitions,
            "delete": deleteDefinitions,
            "patch": patchDefinitions,

            "define": define,
            "redefine": redefine,

            // util
            "formatString": formatString,

            // reference
            "verbs": verbs,

            // events
            "xhrError": subscribe_xhrerror,
            "xhrSuccess": subscribe_xhrsuccess,
            "xhrComplete": subscribe_xhrcomplete
        };
    };

}).apply(this, __xiodependencies);
__xiodependencies = undefined; // cleanup
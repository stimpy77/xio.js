// xio.js
// http://github.com/stimpy77/xio.js
// version 0.1.5
// send feedback to jon@jondavis.net

var __xiodependencies = [jQuery, JSON]; // args list for IIFE on next line
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(__xiodependencies, factory);
    } else {
        // Browser globals
        var globals = this; // window || exports
        globals.Xio = factory($, JSON);
    }
}(function ($, JSON) {
    function module() {
        if (!$) throw "jQuery must be referenced before xio.js is loaded.";

        var configuration = {
            cacheInvalidateTrackingStore: 'session',
            parentDirectory: "src/"
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
            if (result && ((result.indexOf("{") == 0 && result.lastIndexOf("}") == result.length - 1) ||
                          (result.indexOf("[") == 0 && result.lastIndexOf("]") == result.length - 1))) {
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
            if (result && ((result.indexOf("{") == 0 && result.lastIndexOf("}") == result.length - 1) ||
                          (result.indexOf("[") == 0 && result.lastIndexOf("]") == result.length - 1))) {
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
            var args = cascadeargs(
                { key: [key, "string|number|array"] },
                { value: [value, "string|object|array|number"] },
                { expires: [expires, "object|date"] },
                { path: [path, "string"] },
                { domain: [domain, "string"] });
            key = args.key; value = args.value; expires = args.expires; path = args.path; domain = args.domain;

            key = formatKey(key);
            if (typeof (value) == "object") {
                value = stringify(value);
            }
            if (window.location.href.indexOf("file:///") == 0) {
                throw "Cannot set a cookie on a local file system document. Use a web server.";
            }
            if (arguments.length > 2 && typeof (arguments[2]) == "object" && Object.prototype.toString.call(arguments[2]) !== "[object Date]") {
                var o = arguments[2];
                return cookieSetDefinition(key, value, o.expires, o.path, o.domain);
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
            if (arguments.length > 1 && typeof (arguments[1]) == "object") {
                var o = arguments[1];
                return cookieDeleteDefinition(key, o.path, o.domain);
            }
            key = formatKey(key);
            cookieSetDefinition(key, "-", new Date("Jan 1, 1970"), path, domain);
        }

        function cookieGetDefinition(key) {
            key = formatKey(key);
            // from mozilla (!!)
            var result = decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
            if (result && ((result.indexOf("{") == 0 && result.lastIndexOf("}") == result.length - 1) ||
                          (result.indexOf("[") == 0 && result.lastIndexOf("]") == result.length - 1))) {
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

        function synchronousPromiseResult(promise, successfn, errorfn) { // bit of a hack to make synchronous operations appear asynchronous
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
            if (successfn) ret.success(successfn);
            if (errorfn) ret.error(errorfn);
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

        var customverbs = {};

        var verbs = { // http verbs
            "get": "GET",
            "post": "POST",
            "put": "PUT",
            "delete": "DELETE",
            "patch": "PATCH"
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
            var getcustomitems = function (contr, matches) {
                for (var i in matches) {
                    var v = $.type(matches) == "array" ? matches[i] : i;
                    if (options[v] !== undefined && typeof (options[v]) == "function") {
                        contr[v] = options[v];
                        customqty++;
                    }
                }
                return contr;
            }
            getcustomitems(custom, verbs);
            getcustomitems(custom, customverbs);
            getcustomitems(custom, options.customverbs);

            if (!options.methods) {
                options.methods = customqty == 0 ? ["GET"] : [];
            }
            var retset = { options: options };
            // add autogenerated implementations
            for (var index in options.methods) {
                var hverb = options.methods[index];
                var verbmember = hverb.toLowerCase();
                var handlers = verbs[verbmember] ? verbHandles[verbmember] : null;
                if (handlers) {
                    if (handlers[name]) throw "A " + hverb + " route named \"" + name + "\" already exists. Use redefine().";
                    retset[verbmember] = handlers[name] = createRoutedHandler(hverb, options);
                }
            }
            // add custom verbs
            for (var index in options.customverbs) {
                var customverb = options.customverbs[index];
                var handlers = customverbs[customverb] ? customverbs[customverb] : customverbs[customverb] = {};
            }
            // add custom implementations
            for (var v in custom) {
                if (custom.hasOwnProperty(v)) {
                    var xverb = verbs[v] || customverbs[v] ? v : undefined;
                    var verbmember = v;
                    var handlers = verbs[verbmember]
                        ? verbHandles[verbmember]
                        : customverbs[verbmember]
                            ? customverbs[verbmember]
                            : null;
                    if (handlers) {
                        if (handlers[name]) throw "A " + xverb + " route or action handler named \"" + name + "\" already exists. Use redefine().";
                        retset[verbmember] = handlers[name] = createCustomHandler(xverb, custom[v], options);

                        if (!moduleInstance[verbmember] && customverbs[verbmember]) { // todo: what the heck? directly accessing the output obj!? possible design flaw (but I'm still really not sure I want to return the customverbs obj)
                            moduleInstance[verbmember] = customverbs[verbmember];
                        }
                    }
                }
            }

            return retset;
        };

        function redefine(definition_name, /* optional */ verb, implementation, options) {
            var args = cascadeargs(
                { definition_name: [definition_name, "string"] },
                { verb: [verb, "string|array"] },
                { implementation: [implementation, "function|object"] },
                { options: [options, "object"] });
            definition_name = args.definition_name, verb = args.verb, implementation = args.implementation, options = args.options;

            if (!verb) {
                for (var v in verbs) {
                    if (verbHandles[v] && verbHandles[v][definition_name]) {
                        delete verbHandles[v][definition_name];
                    }
                }
                for (var v in customverbs) {
                    if (customverbs[v] && customverbs[v][definition_name]) {
                        delete customverbs[v][definition_name];
                    }
                }
                return define(definition_name, implementation || options);
            }

            else {
                if ($.type(verb) != 'array') verb = [verb];
                for (var item in verb) {
                    var verbitem = verb[item];
                    verbitem = verbitem.toLowerCase();
                    if (!verbs[verbitem] || !verbHandles[verbitem]) throw "Verb not supported: " + verbitem;
                    var handleset = {};
                    for (var v in verbs) {
                        if (verbHandles[v] && verbHandles[v][definition_name]) {
                            handleset[v] = verbHandles[v][definition_name];
                        }
                    }
                    if (typeof (implementation) == "function") {
                        var options = arguments.length > 3 ? arguments[3] : null;
                        handleset[verbitem] = verbHandles[verbitem][definition_name] = createCustomHandler(verbitem, implementation, options);
                        return handleset;
                    } else {
                        throw "implementation argument must be a function if a verb is specified"
                    }
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

        function ajax(url, jqoptions) {
            url = cachebust(url); // see cache-busting section below
            return $.ajax(url, jqoptions)
                .success(raise_xhrSuccess)
                .error(raise_xhrError)
                .complete(raise_xhrComplete);
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
            var invalidatedItems = getDefinitions[configuration.cacheInvalidateTrackingStore]("invalidated-http-cache-items")();
            invalidatedItems = invalidatedItems ? invalidatedItems : {};

            // update invalidation flags data set  
            for (var i in invalidatedItemsHeader) {
                invalidatedItems[prepurl(invalidatedItemsHeader[i])] = Date.now();
            }

            // store revised invalidation flags data set back into session storage  
            setDefinitions[configuration.cacheInvalidateTrackingStore]("invalidated-http-cache-items", stringify(invalidatedItems));
        }

        function cachebust(url) {
            // get invalidation flags from session storage  
            var invalidatedItems = getDefinitions[configuration.cacheInvalidateTrackingStore]("invalidated-http-cache-items")();
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

        var xhrsuccess_fn = [function (eventinfo, data, textStatus, xhr) {
            handleInvalidationFlags(xhr);
        }];
        var xhrerror_fn = [];
        var xhrcomplete_fn = [];
        var custom_fn = {};

        function raise(fnarray, args___) {
            if (arguments.length > 2) {
                args___ = $.makeArray(arguments);
                args___.shift(); // drop fnarray from args
            }
            for (var i = 0; i < fnarray.length; i++) {
                fnarray[i].apply(this, args___); // this?
            }
        }

        function raise_xhrSuccess(data, textStatus, xhr) {
            raise(xhrsuccess_fn, "success", data, textStatus, xhr);
        }

        function raise_xhrError(xhr, textStatus, errorThrown) {
            raise(xhrerror_fn, "error", xhr, textStatus, errorThrown);
        }

        function raise_xhrComplete(xhr, textStatus) {
            raise(xhrcomplete_fn, "complete", xhr, textStatus);
        }

        function raise_customfn(name, args___) {
            return raise.call(this, custom_fn[name], arguments);
        }

        function subscribe_xhrsuccess(fn) {
            if (!fn || typeof(fn) != "function") return raise_xhrSuccess.apply(this, arguments); // this?
            xhrsuccess_fn.push(fn);
        }

        function subscribe_xhrerror(fn) { 
            if (!fn || typeof (fn) != "function") return raise_xhrError.apply(this, arguments); // this?
            xhrerror_fn.push(fn);
        }

        function subscribe_xhrcomplete(fn) { 
            if (!fn || typeof (fn) != "function") return raise_xhrComplete.apply(this, arguments); // this? 
            xhrcomplete_fn.push(fn);
        }

        function subscribe_custom(name, fn) {
            if (!name) throw "Must specify name.";
            var fnarr = custom_fn[name] || (custom_fn[name] = []);
            if (!fn || typeof (fn) != "function") return raise_customfn.apply(this, arguments);
            fnarr.push(fn);
        }

        function cascadeargs() {
            var skip = 0;
            var ret = {};
            
            //for (var i in arguments) {
            for (var i=0; i < arguments.length; i++) {
                var parameterName, value, types;
                for (var key in arguments[i - skip]) {
                    value = arguments[i - skip][key][0];
                }
                for (var k in arguments[i]) {
                    parameterName = k;
                    types = arguments[i][k][1].split('|');
                }
                if (value === null || value === undefined) {
                    continue;
                }
                if (types.indexOf($.type(value)) == -1) {
                    skip++;
                    continue;
                }
                ret[parameterName] = value;
            }
            return ret;
        }

        function mergeNewInto(o1, o2) {
            o1 = o1 || {};
            o2 = o2 || {};
            var ret = {};
            for (var p in o2) {
                ret[p] = o1[p] !== undefined ? o1[p] : o2[p];
            };
            return ret;
        }

        function createRoutedHandler(verb, options) {

            function routedHandler (key, data, invokeoptions, successfn, errorfn) {
                var args = cascadeargs(
                    { key: [key, "string|number|array|object"] },
                    { data: [data, "string|number|object"] },
                    { invokeoptions: [invokeoptions, "object"] },
                    { successfn: [successfn, "function"] },
                    { errorfn: [errorfn, "function"] });
                key = args.key, data = args.data, invokeoptions = args.invokeoptions, successfn = args.successfn, errorfn = args.errorfn;
                var asyncopts = mergeNewInto({ async: options.async === undefined ? true : options.async }, options);
                var opts = mergeNewInto(invokeoptions, asyncopts);
                var url = opts.url;
                var urlargs = [url];
                var qs = $.type(key) == 'object' ? key : null;
                if (key === null || typeof (key) == "string" || typeof (key) == "number") urlargs.push(key);
                else if ($.type(key) == "array") { // assume array of composite key items for formatter
                    for (var i in key) urlargs.push(key[i]);
                }
                url = formatString.apply(null, urlargs);

                // querystring support -- if first param is an object it is added to querystring
                if ($.type(key) == 'object') {
                    for (var k in key) {
                        if (key.hasOwnProperty(k)) {
                            url += (url.indexOf('?') == -1 ? '?' : '&') + encodeURI(k) + '=' + encodeURI(key[k]);
                        }
                    }
                }

                var method = verb;

                
                // jquery implementation
                var jqoptions = {};
                for (var p in opts) {
                    if (opts.hasOwnProperty(p) && p !== 'url' && p !== 'methods') {
                        jqoptions[p] = opts[p];
                    }
                }
                jqoptions.type = method;
                data = data || jqoptions.data;
                jqoptions.data = data;
                if (opts.async === false) {
                    // return immediately
                    var response = ajax(url, jqoptions);
                    return synchronousPromiseResult(response, successfn, errorfn);
                }
                var ret = ajax(url, jqoptions);
                if (successfn) ret.success(successfn);
                if (errorfn) ret.error(errorfn);
                return ret;
            };
            return routedHandler;
        }

        function worker(fn, receivefn, successfn, errorfn, completefn) {
            if (typeof (fn) == "string") {
                var wkobj = new Worker(fn);
                return worker(wkobj);
            }
            receivefn = receivefn || [];
            successfn = successfn || [];
            errorfn = errorfn || [];
            completefn = completefn || [];
            if (typeof (fn) == "object" && fn.constructor == Worker) {
                var wrkr = fn;
                var ret = function (m) {
                    if (wrkr) wrkr.postMessage(m || "start");
                }
                ret.start = ret;
                ret.message = function (cb) {receivefn.push(cb); return ret; };
                ret.success = function (cb) { successfn.push(cb); return ret; };
                ret.error = function (cb) { errorfn.push(cb); return ret; };
                ret.fail = ret.error;
                ret.complete = function (cb) { completefn.push(cb); return ret; };
                ret.done = ret.complete;
                ret.post = function (data) { wrkr.postMessage(data); };

                var errhandled = false;
                ret.send = function (data) {
                    wrkr.postMessage(data);
                };
                ret.postMessage = ret.send;
                ret.terminate = function () {
                    return wrkr.terminate();
                }
                wrkr.onmessage = function (ev) {
                    var data = ev.data;
                    var sendmsg = function () {
                        var args = $.makeArray(arguments);
                        args.unshift(data);
                        raise(receivefn, args);
                    };
                    if (data) {
                        if (data["console.log"]) {
                            console.log(data["console.log"]);
                        }
                        if (data.result) {
                            switch (data.result) {
                                case "console.log":
                                    console.log()
                                    break;
                                case "success":
                                    raise(successfn, data.data, wrkr);
                                    raise(completefn, wrkr);
                                    break;
                                case "error":
                                    errhandled = true;
                                    raise(errorfn, data.data, wrkr);
                                    raise(completefn, data.data, wrkr);
                                    wrkr.terminate();
                                    break;
                                default:
                                    sendmsg();
                                    break;
                            }
                        } else {
                            sendmsg();
                        }
                    }
                }
                wrkr.onerror = function (error) {
                    if (!errhandled) {
                        wrkr.onmessage({ result: "error", error: error });
                    }
                };
                ret.worker = wrkr;
                return ret;
            }
            if (typeof (fn) == "function") {
                var throwOnError = true; 
                var userpayload = fn.toString();
                var startfn = function () {
                    try {
                        if (__xiodebug) {
                            console.log("starting");
                        }
                        var result = "fn";
                        emit({ result: "success", data: result });
                        self.close();
                    } catch (e) {
                        emit({ result: "error", error: e });
                        throw e;
                    }
                };
                var onmessage = function (d) {
                    var m = d.data;
                    if (m === "start") {
                        start.apply(this, arguments);
                    }
                };
                var workerbody = "self.onmessage = " + onmessage.toString() + "\n"
                    + "var __xiodebug = " + Xio.debug + ";"
                    + "var emit = function() { postMessage.apply(this, arguments) };"
                    + "var console = { log: function (msg) { emit({ \"console.log\": msg }); } };\n"
                    + "var start=" + startfn.toString().replace(/\"fn\"/, userpayload + ".call(this, arguments);");
                var blob;
                try {
                    blob = new Blob([workerbody], { type: "text/javascript" });
                } catch (e) { // Backwards-compatibility
                    try {
                        window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
                        blob = new BlobBuilder();
                        blob.append(workerbody);
                        blob = blob.getBlob();
                    } catch (error) {
                        debugger;
                        throw error;
                    }
                }
                var wrkr;

               
                try {
                    wrkr = new Worker(URL.createObjectURL(blob));
                } catch (err) {
                    var dir = configuration.parentDirectory;
                    wrkr = new Worker(dir + "xio-iexww.js");
                    wrkr.postMessage({ userpayload: fn.toString() });
                }
                return worker(wrkr, receivefn, successfn, errorfn, completefn);
            }
            throw "not implemented (xio.worker): " + typeof (fn);
        }

        var moduleInstance = {

            config: configuration,
             
            // verb implementations
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
            "xhrComplete": subscribe_xhrcomplete,
            "event": subscribe_custom,

            // web worker
            "worker": worker
        };
        return moduleInstance;
    };

    return module;

}).apply(this, __xiodependencies));
__xiodependencies = undefined; // cleanup
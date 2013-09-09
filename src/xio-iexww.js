// Web Worker extension for Internet Explorer which does not support inline blob scripts
var userpayload;
self.onmessage = function (d) {
    var m = d.data;
    if (m === "start") {
        start.apply(this, arguments);
    }
    if (m && m.userpayload) {
        userpayload = eval("(" + m.userpayload + ")");
    }
};
var __xiodebug = false;
var emit = function() { postMessage.apply(this, arguments) };
var console = { log: function (msg) { emit({ "console.log": msg }); } };
var start = function () {
    try {
        if (__xiodebug) {
            console.log("starting");
        }
        var result = userpayload.apply(this, arguments);
        emit({ result: "success", data: result });
        self.close();
    } catch (e) {
        emit({ result: "error", error: e });
        throw e;
    }
};

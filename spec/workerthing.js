debugger;
var console = { log: function (msg) { postMessage({ "console.log": msg }); } };
function start() {
    console.log("starting starting");
    setTimeout(function () {
        postMessage({ result: "success", data: 42 });
    }, 500);
}
self.onmessage = function (d) {
    if (d.data == "start") start();
}
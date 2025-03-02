define(["dojo/domReady!"], function () {
  var debugFlags = {
    CardSize: "off",
    Random: "on",
  };

  function debugLog(flag, statement) {
    if (debugFlags[flag] == "on") {
      console.log(statement);
    }
  }

  return {
    debugLog: debugLog,
  };
});

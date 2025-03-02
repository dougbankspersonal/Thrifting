define([
  "dojo/dom",
  "dojo/dom-style",
  "javascript/gameUtils",
  "dojo/domReady!",
], function (dom, domStyle, gameUtils) {
  function addDieFace(pageOfItems, opt_styleDescs) {
    var dieFace = gameUtils.addDiv(pageOfItems, ["dieFace"], "dieFace");
    domStyle.set(dieFace, {
      height: gameUtils.dieHeight + "px",
      width: gameUtils.dieWidth + "px",
    });

    if (opt_styleDescs) {
      for (var styleDesc of opt_styleDescs) {
        var image = gameUtils.addImage(
          dieFace,
          ["dieImage"],
          "dieImage",
          styleDesc.img
        );
        domStyle.set(image, styleDesc);
      }
    }
    return dieFace;
  }

  var huntImage = "../images/Dice/hunt.png";
  var scamperImage = "../images/Dice/scamper.png";
  var stopImage = "../images/Dice/stop.png";

  function createDieTemplate() {
    var bodyNode = dom.byId("body");

    var pageOfItems = gameUtils.addPageOfItems(bodyNode);
    for (var i = 0; i < 3; i++) {
      addDieFace(pageOfItems);
    }
    for (var i = 0; i < 1; i++) {
      addDieFace(pageOfItems, [
        {
          img: scamperImage,
          top: "10%",
          left: "10%",
          "max-width": "80%",
        },
      ]);
    }
    for (var i = 0; i < 2; i++) {
      addDieFace(pageOfItems, [
        {
          img: stopImage,
        },
      ]);
    }

    var huntScale = 0.86;
    for (var i = 0; i < 3; i++) {
      addDieFace(pageOfItems, [
        {
          img: huntImage,
          transform: `scale(${huntScale})`,
        },
      ]);
    }
  }
  return {
    createDieTemplate: createDieTemplate,
  };
});

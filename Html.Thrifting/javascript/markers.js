define([
  "dojo/dom",
  "javascript/gameUtils",
  "dojo/dom-style",
  "dojo/domReady!",
], function (dom, gameUtils, domStyle) {
  var markerTypes = {
    Almond: gameUtils.nutTypeAlmond,
    Cashew: gameUtils.nutTypeCashew,
    Peanut: gameUtils.nutTypePeanut,
    Pistachio: gameUtils.nutTypePistachio,
    Roaster: "Roaster",
    Salter: "Salter",
    ScoreCell: "ScoreCell",
    Squirrel: "Squirrel",
    StartingPlayer: "StartingPlayer",

    // For demo.
    Heart: "Heart",
    Skull: "Skull",
    Star: "Star",
  };

  var markerTypeToImageMap = {
    Almond: "almond.png",
    Cashew: "cashew.png",
    Peanut: "peanut.png",
    Pistachio: "pistachio.png",
    Roaster: "roaster.png",
    Salter: "salter.png",
    ScoreCell: "scoreCell.png",
    Squirrel: "squirrel.png",
    StartingPlayer: "startingPlayer.png",

    // For demo.
    Heart: "heart.png",
    Skull: "skull.png",
    Star: "star.png",
  };

  var shrinkage = 3;
  var markersPerPage = 42;

  function addMarker(parent, markerType, opt_classArray, opt_additionalConfig) {
    if (opt_classArray !== null) {
      console.assert(
        Array.isArray(opt_classArray),
        "opt_classArray must be an array"
      );
    }
    var classArray = gameUtils.extendOptClassArray(opt_classArray, "marker");
    classArray.push(markerType);
    var additionalConfig = opt_additionalConfig ? opt_additionalConfig : {};
    var node = gameUtils.addDiv(
      parent,
      classArray,
      "marker.".concat(markerType)
    );

    var height = additionalConfig.height
      ? additionalConfig.height
      : gameUtils.elementHeight - shrinkage;
    var width = additionalConfig.width
      ? additionalConfig.width
      : gameUtils.elementWidth - shrinkage;

    domStyle.set(node, {
      width: `${width}px`,
      height: `${height}px`,
      "z-index": `${gameUtils.markerZIndex}`,
    });

    gameUtils.addImage(node, ["image", markerType], "image");

    var text = additionalConfig.text ? additionalConfig.text : null;

    if (text) {
      gameUtils.addDiv(node, ["text"], "text", text);
    }

    if (additionalConfig.color) {
      domStyle.set(node, "background-color", additionalConfig.color);
    }

    return node;
  }

  // This returned object becomes the defined value of this module
  return {
    markerTypes: markerTypes,
    addMarker: addMarker,
    addMarkers: function (numMarkers, contentCallback) {
      var bodyNode = dom.byId("body");
      var pageOfMarkers = null;
      for (var i = 0; i < numMarkers; i++) {
        if (i % markersPerPage == 0) {
          pageOfMarkers = gameUtils.addPageOfItems(bodyNode);
        }
        contentCallback(pageOfMarkers, i);
      }
    },
  };
});

define([
  "dojo/dom-style",
  "sharedJavascript/cards",
  "sharedJavascript/debugLog",
  "sharedJavascript/htmlUtils",
  "sharedJavascript/systemConfigs",
  "javascript/cardSpec",
  "javascript/gameInfo",
  "javascript/measurements",
  "javascript/parameters",
  "javascript/cardSpec",
  "dojo/domReady!",
], function (
  // shared
  domStyle,
  cards,
  debugLog,
  htmlUtils,
  systemConfigs,
  // local
  cardSpec,
  gameInfo,
  measurements,
  parameters
) {
  function customBackCallback(parent, title, cardsPerPlayer, index) {
    var playerIndex = Math.floor(index / cardsPerPlayer);
    var rgbColorString = gameInfo.orderedPlayerColors[playerIndex];
    debugLog.debugLog("ParamCards", "Doug: rgbColorString = " + rgbColorString);
    var hexColorString = htmlUtils.rgbStringToHex(rgbColorString);
    return cards.addCardBack(parent, index, {
      hexColorString: hexColorString,
      title: title,
    });
  }

  function addNthParamCardFront(
    parentNode,
    index,
    paramTypeName,
    paramTypeClass,
    opt_skipImage
  ) {
    console.assert(parentNode, "parentNode is null");
    console.assert(index !== null, "index is null");
    console.assert(paramTypeName, "paramTypeName is null");
    console.assert(paramTypeClass, "paramTypeClass is null");

    var idElements = [paramTypeClass, index.toString()];
    var id = idElements.join(".");
    var classArray = ["param_card", paramTypeClass];

    var cardFront = cards.addCardFront(parentNode, classArray, id);

    var params = parameters[paramTypeName];
    var paramCount = params.length;
    var paramIndex = index % paramCount;
    var paramValue = params[paramIndex];
    var paramValueClass = parameters.paramToCssClass[paramValue];
    console.assert(
      paramValueClass,
      "paramValueClass is null for " + paramValue
    );

    htmlUtils.addDiv(cardFront, ["card_text"], "cardText", paramValue);

    if (!opt_skipImage) {
      var imageNode = htmlUtils.addImage(
        cardFront,
        ["param_image", paramValueClass],
        paramValue
      );

      domStyle.set(imageNode, {
        width: measurements.paramCardIconSizePx + "px",
        height: measurements.paramCardIconSizePx + "px",
      });
    }

    return cardFront;
  }

  function addNthPieceCard(parentNode, index) {
    return addNthParamCardFront(
      parentNode,
      index,
      "orderedPieces",
      parameters.pieceCssClass
    );
  }

  function addNthStyleCard(parentNode, index) {
    console.assert(index >= 0, "index is less than 0");
    console.assert(
      index < parameters.orderedStyles.length,
      "index is too high"
    );
    return addNthParamCardFront(
      parentNode,
      index,
      "orderedStyles",
      parameters.styleCssClass
    );
  }

  function addNthColorSchemeCard(parentNode, index) {
    var front = addNthParamCardFront(
      parentNode,
      index,
      "orderedColorSchemes",
      parameters.colorSchemeCssClass,
      true
    );

    var params = parameters.orderedColorSchemes;
    var paramCount = params.length;
    var paramIndex = index % paramCount;
    var paramValue = params[paramIndex];

    var colorSchemeSwatch = cardSpec.addColorSchemeSwatch(
      front,
      paramValue,
      measurements.paramCardIconSizePx
    );
    return front;
  }

  return {
    customBackCallback: customBackCallback,
    addNthPieceCard: addNthPieceCard,
    addNthStyleCard: addNthStyleCard,
    addNthColorSchemeCard: addNthColorSchemeCard,
  };
});

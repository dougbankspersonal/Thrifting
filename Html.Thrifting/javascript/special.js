// Obsolete:
// I considered some clothes cards having a "special": this piece looks good/bad with some other piece.
// Taken out for now but preserving the code.

define([
  "sharedJavascript/debugLog",
  "sharedJavascript/genericUtils",
  "sharedJavascript/htmlUtils",
  "javascript/parameters",
  "dojo/domReady!",
], function (debugLog, genericUtils, htmlUtils, parameters) {
  var minSpecialStars = 2;
  var maxSpecialStars = 4;

  var LooksGoodWith = "LooksGoodWith";
  var LooksBadWith = "LooksBadWith";
  var Discount = "Discount";

  var orderedSpecialTypes = [LooksGoodWith, Discount, LooksBadWith];

  var isPositiveSpecialType = {
    [LooksGoodWith]: true,
    [Discount]: true,
    [LooksBadWith]: false,
  };

  var getSeededRandomZeroToOne =
    genericUtils.createSeededGetZeroToOneRandomFunction(8340084);

  // Generate a "special" associative arrive, describing how the given clothes item would look good or bad
  // some other item.
  // The other item has a piece and either a color scheme or a style.
  // Item is either positive (extra stars or discount) or negative (minus stars).
  // Positive items require a non-piece prop matching the original item.
  // Negative items require a non-piece prop that does not match the original item.
  function makeRandomSpecialConfig(specialType, clothesCardConfig) {
    debugLog.debugLog(
      "Special",
      "Doug makeRandomSpecial: clothesCardConfig = " +
        JSON.stringify(clothesCardConfig)
    );

    // This <piece> would look <good|bad> with a <other piece> with <matching color/style | non-matching color/style>
    var otherPiece = genericUtils.getRandomArrayElementNotMatching(
      parameters.orderedPieces,
      clothesCardConfig.pieces,
      getSeededRandomZeroToOne
    );
    debugLog.debugLog(
      "Special",
      "Doug makeRandomSpecial: otherPiece = " + otherPiece
    );

    debugLog.debugLog(
      "Special",
      "Doug makeRandomSpecial: parameters.orderedparameterNames = " +
        JSON.stringify(parameters.orderedparameterNames)
    );

    debugLog.debugLog(
      "Special",
      "Doug makeRandomSpecial: parameters.parameterNamePieces = " +
        parameters.parameterNamePieces
    );
    // Random non-piece value to match.
    var matchingParameterName = genericUtils.getRandomArrayElementNotMatching(
      parameters.orderedparameterNames,
      parameters.parameterNamePieces,
      getSeededRandomZeroToOne
    );
    debugLog.debugLog(
      "Special",
      "Doug makeRandomSpecial: matchingParameterName = " + matchingParameterName
    );

    var specialConfig = {
      specialType: specialType,
      stars: genericUtils.getRandomIntInRange(
        minSpecialStars,
        maxSpecialStars,
        getSeededRandomZeroToOne
      ),
      otherPiece: otherPiece,
      matchingParameterName: matchingParameterName,
    };

    if (isPositiveSpecialType[specialType]) {
      // The other item must match the original item in some non-piece prop.
      specialConfig.matchingParameterValue =
        clothesCardConfig[matchingParameterName];
    } else {
      // The other item must be different from original in some non-piece prop.
      var parameterValue = genericUtils.getRandomArrayElementNotMatching(
        parameters.parameterNamesToParameterValues[matchingParameterName],
        clothesCardConfig[matchingParameterName],
        getSeededRandomZeroToOne
      );
      specialConfig.matchingParameterValue = parameterValue;
    }

    return specialConfig;
  }

  // Code block to do html rendering of "specialConfig" feature of a card.
  function addSpecialNode(parentNode, specialConfig) {
    var text = "With ";

    debugLog.debugLog(
      "Special",
      "Doug addSpecialNode: specialConfig = " + JSON.stringify(specialConfig)
    );

    if (specialConfig.matchingParameterName == parameters.style) {
      var styleText = specialConfig.matchingParameterValue;
      text += " " + styleText + " " + specialConfig.otherPiece;
    } else if (specialConfig.matchingParameterName == parameters.colorScheme) {
      var colorSchemeText = specialConfig.matchingParameterValue;
      text += specialConfig.otherPiece + " in " + colorSchemeText;
    }

    if (specialConfig.looksGoodWith == 0) {
      text += "<br>+ " + specialConfig.stars.toString() + " ⭐";
    } else if (specialConfig.specialType == 1) {
      text += "<br>%50 off!";
    } else {
      text += "<br>- " + specialConfig.stars.toString() + " ⭐";
    }

    var good_or_bad_class = specialConfig.specialType < 2 ? "good" : "bad";

    htmlUtils.addDiv(
      parentNode,
      ["special_clause", good_or_bad_class],
      "special",
      text
    );
  }

  // Every nth card is special.
  // m% are looksGoodWith, 100-m% are looksBadWith
  var specialIndex = 0;
  function maybeGetSpecialConfig(clothesCardConfig) {
    debugLog.debugLog(
      "Special",
      "Doug: maybeGetSpecialConfig: specialIndex = " + specialIndex
    );
    var index = specialIndex % 8;
    debugLog.debugLog(
      "Special",
      "Doug: maybeGetSpecialConfig: index = " + index
    );
    specialIndex = specialIndex + 1;
    if (index < orderedSpecialTypes.length) {
      specialType = orderedSpecialTypes[index];
      var retVal = makeRandomSpecialConfig(specialType, clothesCardConfig);
      debugLog.debugLog(
        "Special",
        "Doug: maybeGetSpecialConfig returning retVal = retVal",
        retVal
      );
      return retVal;
    } else {
      debugLog.debugLog(
        "Special",
        "Doug: maybeGetSpecialConfig returning null"
      );
      return null;
    }
  }

  return {
    maybeGetSpecialConfig: maybeGetSpecialConfig,
    addSpecialNode: addSpecialNode,
  };
});

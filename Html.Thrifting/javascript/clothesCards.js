define([
  "sharedJavascript/cards",
  "sharedJavascript/debugLog",
  "javascript/gameUtils",
  "javascript/markers",
  "dojo/dom-style",
  "dojo/domReady!",
], function (cards, debugLog, gameUtils, markers, domStyle) {
  // For now I will auto generate deterministically because there are too many to write by hand.
  var pieces = ["Top", "Bottom", "Shoes", "Dress", "Hat", "Accessory", "Wrap"];

  var colorSchemes = [
    "Earth Tones",
    "Jewel Tones",
    "Pastels",
    "Neutrals",
    "Monochrome",
  ];

  var styles = ["Bohemian", "Retro", "Classic", "Elegant", "Whimsical"];

  var paramaterNamesToParameterValues = {
    pieces: pieces,
    colorSchemes: colorSchemes,
    styles: styles,
  };

  var orderedParameterNames = Object.keys(paramaterNamesToParameterValues);

  // Quasi random number generator.  Returns zero to < 1.
  var getSeededRandom = gameUtils.seededRandom(3276373);

  function generateTryOnRules() {
    var retVal = [];

    // 3 of a kinds...
    var tryOnRule = {
      numDice: 4,
      details: `3 of a kind`,
    };
    retVal.push(tryOnRule);

    // 4 dice in a row...
    var tryOnRule = {
      numDice: 5,
      details: `Small straight (4 in a row)`,
    };
    retVal.push(tryOnRule);

    // Evens and odds...
    for (var i = 0; i < 2; i++) {
      var tryOnRule = {
        numDice: 5,
        details: i % 2 == 0 ? "All even numbers" : "All odd numberes",
      };
      retVal.push(tryOnRule);
    }

    // Physical challenge...
    var tryOnRule = {
      numDice: 7,
      details:
        "Stack all dice in a tower (one die per level).  Tower must be standing when you leave the dressing room",
    };
    retVal.push(tryOnRule);

    // 2 pairs
    var tryOnRule = {
      numDice: 4,
      details: "2 pairs of matching dice.",
    };

    // Doubles.
    var tryOnRule = {
      numDice: 2,
      details: "Doubles.",
    };
    retVal.push(tryOnRule);

    // Summing.
    var tryOnRule = {
      numDice: 3,
      details: "Dice sum to 15 or more.",
    };
    retVal.push(tryOnRule);

    return retVal;
  }

  var tryOnRules;
  function getRandomTryOnRule() {
    if (!tryOnRules) {
      tryOnRules = generateTryOnRules();
    }
    debugLog.debugLog(
      "Random",
      "Doug getRandomTryOnRule: tryOnRules = " + tryOnRules
    );
    return gameUtils.getRandomArrayElement(tryOnRules, getSeededRandom);
  }

  function makeRandomSpecial(isGood) {
    debugLog.debugLog("Random", "Doug makeRandomSpecial: isGood = " + isGood);
    debugLog.debugLog(
      "Random",
      "Doug makeRandomSpecial: orderedParameterNames = " + orderedParameterNames
    );

    // Pick any 2 paramters.
    var special = {
      isGood: isGood,
      stars: gameUtils.getIntRandomInRange(1, 3, getSeededRandom()),
      parameters: gameUtils.getRandomArrayElements(
        orderedParameterNames,
        2,
        getSeededRandom
      ),
    };
    return special;
  }

  function maybeGetSpecial(clothesCardConfig) {
    // Die roll.  1, add a good special.  2, add a bad special.  Anything else, no special.
    var dieRoll = gameUtils.getIntRandomInRange(1, 6, getSeededRandom());
    if (dieRoll == 1) {
      return makeRandomSpecial(true);
    } else if (dieRoll == 2) {
      return makeRandomSpecial(false);
    } else {
      return null;
    }
  }

  function generateClothesCardConfig(pieceIndex, colorSchemeIndex, styleIndex) {
    var clothesCardConfig = {
      piece: pieces[pieceIndex],
      colorScheme: colorSchemes[colorSchemeIndex],
      style: styles[styleIndex],
    };
    // Add a semi random number of duplicates
    var seededRandom = getSeededRandom();
    // The count should be from 1 to 3.
    var count = gameUtils.getIntRandomInRange(1, 3, seededRandom);
    clothesCardConfig.count = count;

    // Also add details for the "try on" rules.
    clothesCardConfig.tryOnRule = getRandomTryOnRule();

    // Maybe add a special.
    clothesCardConfig.special = maybeGetSpecial(clothesCardConfig);
  }

  function generateClothesCardConfigs() {
    var retVal = [];
    for (var i = 0; i < pieces.length; i++) {
      for (var j = 0; j < colorSchemes.length; j++) {
        for (var k = 0; k < styles.length; k++) {
          var clothesCardConfig = generateClothesCardConfig(i, j, k);
          retVal.push(clothesCardConfig);
        }
      }
    }
    return retVal;
  }

  var clothesCardConfigs = generateClothesCardConfigs();
  var numClothesCards = cards.getNumCardsForConfigs(clothesCardConfigs);

  function addClothesDesc(parentNode, clothesCardConfig) {
    // It's a "style" "piece" in "color scheme".
    // Then try on rules.
    // The special if applicable.
    var formattedWrapper = gameUtils.addDiv(
      parentNode,
      "formatted_wrapper",
      "formatted_wrapper"
    );
    var styleNode = gameUtils.addDiv(
      formattedWrapper,
      ["style", "title"],
      "style",
      clothesCardConfig.style
    );
    var pieceNode = gameUtils.addDiv(
      formattedWrapper,
      ["piece", "subtitle"],
      "piece",
      clothesCardConfig.piece
    );
    var inBreak = gameUtils.addDiv(
      formattedWrapper,
      ["in", "rulesText"],
      "in",
      "in"
    );
    var colorSchemeNode = gameUtils.addDiv(
      formattedWrapper,
      ["color_scheme", "title"],
      "color_scheme",
      clothesCardConfig.colorScheme
    );
  }

  function addClothesCard(parentNode, index) {
    var clothesCardConfig = clothesCardConfigs[index];

    var idElements = ["clothes_card", index.toString()];
    var id = idElements.join(".");
    var classArray = [];
    classArray.push("clothes_card");
    var node = cards.addCardFront(parent, classArray, id);

    addClothesDesc(node, truckCardConfig);
    return node;
  }

  return {
    numClothesCards: addClothesCard,
    addClothesCard: addClothesCard,
  };
});

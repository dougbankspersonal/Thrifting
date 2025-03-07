define([
  "sharedJavascript/cards",
  "sharedJavascript/debugLog",
  "sharedJavascript/genericUtils",
  "sharedJavascript/htmlUtils",
  "dojo/domReady!",
], function (cards, debugLog, genericUtils, htmlUtils) {
  // For now I will auto generate deterministically because there are too many to write by hand.
  var pieces = ["Top", "Bottom", "Shoes", "Dress", "Hat", "Accessory", "Wrap"];

  var minSpecialStars = 4;
  var maxSpecialStars = 6;

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
  var getSeededRandomZeroToOne =
    genericUtils.createSeededGetZeroToOneRandomFunction(3276373);

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
    return genericUtils.getRandomArrayElement(
      tryOnRules,
      getSeededRandomZeroToOne
    );
  }

  function makeRandomSpecial(isGood, clothesCardConfig) {
    debugLog.debugLog("Cards", "Doug makeRandomSpecial: isGood = " + isGood);
    debugLog.debugLog(
      "Cards",
      "Doug makeRandomSpecial: clothesCardConfig = " +
        JSON.stringify(clothesCardConfig)
    );

    // This <piece> would look <good|bad> with a <other piece> with <matching color | matching style>
    var otherPiece = genericUtils.getRandomArrayElementNotMatching(
      pieces,
      getSeededRandomZeroToOne,
      clothesCardConfig.pieces
    );
    debugLog.debugLog("Cards", "Doug makeRandomSpecial: piece = " + piece);

    // Random non-piece value to match.
    var matchingParameterName = genericUtils.getRandomArrayElementNotMatching(
      orderedParameterNames,
      getSeededRandomZeroToOne,
      paramaterNamesToParameterValues.piece
    );
    debugLog.debugLog(
      "Cards",
      "Doug makeRandomSpecial: matchingParameterName = " + matchingParameterName
    );

    var special = {
      isGood: isGood,
      stars: genericUtils.getIntRandomInRange(
        minSpecialStars,
        maxSpecialStars,
        getSeededRandomZeroToOne
      ),
      otherPiece: otherPiece,
      matchingParameterName: matchingParameterName,
      matchingParameterValue: clothesCardConfig[matchingParameterName],
    };

    return special;
  }

  function maybeGetSpecial(clothesCardConfig) {
    // Roll a 8.  1, add a good special.  2, add a bad special.  Anything else, no special.
    var dieRoll = genericUtils.getIntRandomInRange(
      1,
      8,
      getSeededRandomZeroToOne
    );
    if (dieRoll == 1) {
      return makeRandomSpecial(true, clothesCardConfig);
    } else if (dieRoll == 2) {
      return makeRandomSpecial(false, clothesCardConfig);
    } else {
      return null;
    }
  }

  function generateClothesCardConfig(pieceIndex, colorSchemeIndex, styleIndex) {
    // Add a semi random number of duplicates
    // The count should be from 1 to 3.
    var count = genericUtils.getIntRandomInRange(
      1,
      3,
      getSeededRandomZeroToOne
    );
    var tryOnRule = getRandomTryOnRule();

    var clothesCardConfig = {
      piece: pieces[pieceIndex],
      colorScheme: colorSchemes[colorSchemeIndex],
      style: styles[styleIndex],
      count: count,
      tryOnRule: tryOnRule,
    };

    // Maybe add a special.
    var special = maybeGetSpecial(clothesCardConfig);
    if (special) {
      clothesCardConfig.special = special;
    }

    return clothesCardConfig;
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
  debugLog.debugLog(
    "Cards",
    "Doug: clothesCardConfigs = " + JSON.stringify(clothesCardConfigs)
  );

  var _numClothesCards = 0;
  function getNumClothesCards() {
    if (_numClothesCards == 0) {
      _numClothesCards = cards.getNumCardsFromConfigs(clothesCardConfigs);
    }
    return _numClothesCards;
  }

  function addTryOnRules(formattedWrappper, clothesCardConfig) {
    var tryOnRule = clothesCardConfig.tryOnRule;
    var numDice = clothesCardConfig.numDice;

    var diceContainerNode = htmlUtils.addDiv(
      formattedWrapper,
      ["dice_container"],
      "diceContainer"
    );

    for (var i = 0; i < numDice; i++) {
      htmlUtils.addImage(diceContainerNode, ["die"], "die");
    }

    htmlUtils.addDiv(
      formattedWrapper,
      ["try_on_rules", "rules_text"],
      "tryOnRules",
      tryOnRule.details
    );
  }

  function addClothesDesc(parentNode, clothesCardConfig) {
    // It's a "style" "piece" in "color scheme".
    // Then try on rules.
    // The special if applicable.
    var formattedWrapper = htmlUtils.addDiv(
      parentNode,
      "formatted_wrapper",
      "formatted_wrapper"
    );

    htmlUtils.addDiv(
      formattedWrapper,
      ["style", "subtitle"],
      "style",
      clothesCardConfig.style
    );
    htmlUtils.addDiv(
      formattedWrapper,
      ["piece", "title"],
      "piece",
      clothesCardConfig.piece
    );
    htmlUtils.addDiv(formattedWrapper, ["in", "rules_text"], "in", "in");
    htmlUtils.addDiv(
      formattedWrapper,
      ["color_scheme", "subtitle"],
      "color_scheme",
      clothesCardConfig.colorScheme
    );

    addTryOnRules(formattedWrappper, clothesCardConfig);
  }

  function addClothesCard(parentNode, index) {
    var clothesCardConfig = cards.getCardConfigFromIndex(
      clothesCardConfig,
      index
    );

    var idElements = ["clothes_card", index.toString()];
    var id = idElements.join(".");
    var classArray = [];
    classArray.push("clothes_card");
    var cardFront = cards.addCardFront(parentNode, classArray, id);

    addClothesDesc(cardFront, clothesCardConfig);
    return cardFront;
  }

  return {
    getNumClothesCards: getNumClothesCards,
    addClothesCard: addClothesCard,
  };
});

define([
  "dojo/dom-style",
  "sharedJavascript/cards",
  "sharedJavascript/debugLog",
  "sharedJavascript/genericUtils",
  "sharedJavascript/htmlUtils",
  "dojo/domReady!",
], function (domStyle, cards, debugLog, genericUtils, htmlUtils) {
  var minSpecialStars = 2;
  var maxSpecialStars = 4;

  // For now I will auto generate deterministically because there are too many to write by hand.
  var pieces = ["Top", "Bottom", "Shoes", "Dress", "Hat", "Wrap"];

  var colorSchemes = ["Earth Tones", "Jewel Tones", "Pastels", "Monochrome"];

  var styles = ["Bohemian", "Retro", "Classic", "Elegant", "Whimsical"];

  var paramNamePiece = "piece";
  var paramNameStyle = "style";
  var paramNameColorScheme = "colorScheme";

  var paramaterNamesToParameterValues = {
    [paramNamePiece]: pieces,
    [paramNameStyle]: styles,
    [paramNameColorScheme]: colorSchemes,
  };

  var orderedParameterNames = Object.keys(paramaterNamesToParameterValues);

  specificInstances = {
    Top: {
      Bohemian: ["Peasant Blouse", "Tunic Top", "Off-the-Shoulder Top"],
      Retro: ["Mod Turtleneck", "Wrap Blouse", "Disco Shirt"],
      Classic: ["Button-Up Shirt", "Polo Shirt", "Crew Neck Tee"],
      Elegant: ["Silk Blouse", "Satin Camisole", "Chiffon Blouse"],
      Whimsical: ["Graphic Tee", "Novelty Print Blouse", "Pajama Top"],
    },
    Bottom: {
      Bohemian: ["Palazzo Pants", "Gaucho Pants", "Gypsy Skirt"],
      Retro: [
        "High-Waisted Pencil Skirt",
        "A-Line Mini Skirt",
        "Corduroy Flares",
      ],
      Classic: ["Chinos", "Jeans", "Bermuda Shorts"],
      Elegant: ["Pleated Trousers", "Satin Skirt", "Tulle Skirt"],
      Whimsical: ["Ptchwork Pants", "Tutu", "Fairycore Skirt"],
    },
    Shoes: {
      Bohemian: ["Espadrilles ", "Moccasins", "Beaded Slip-Ons "],
      Retro: ["Saddle Shoes", "Go-go Boots", "Clogs"],
      Classic: ["Oxford Shoes", "Slingback Heels", "Strappy Sandals"],
      Elegant: ["Satin Heels", "D'Orsay Heels", "Embellished Flats"],
      Whimsical: ["Bunny Slippers", "Combat Boots", "Heelys"],
    },
    Dress: {
      Bohemian: ["Peasant Dress", "Prairie Dress", "Bell Sleeve Dress"],
      Retro: ["Flapper Dress", "Swing Dress", "Mod Dress"],
      Classic: ["Empire Waist Dress", "Little Black Dress", "A-Line Dress"],
      Elegant: ["Ball Gown", "Cocktail Dress", "Velvet Gown"],
      Whimsical: ["Muumuu", "Evil Queen Costume", "Anime Cosplay Dress"],
    },
    Hat: {
      Bohemian: ["Frayed Edge Hat", "Oversized Sun Hat", "Felt Fedora"],
      Retro: ["Flapper Headband", "Pillbox Hat", "Bowler Hat"],
      Classic: ["Beanie", "Baseball Cap", "Bucket Hat"],
      Elegant: ["Tiara", "Fanscinator", "Turban"],
      Whimsical: ["Mickey Mouse Ears", "Gorilla Mask", "Unicorn Horn"],
    },
    Accessory: {
      Bohemian: ["Boho Choker", "Turquoise Bracelet", "Fringe Bag"],
      Retro: ["Long Gloves", "Tulle Scarf", "Cat Eye Sunglasses"],
      Classic: ["Pearl Earrings", "Clutch Purse", "Hoop Earrings"],
      Elegant: ["Tennis Bracelet", "Evening Bag", "Ring"],
      Whimsical: ["Fanny Pack", "Furry Earmuffs", "Magic Wand"],
    },
    Wrap: {
      Bohemian: ["Poncho", "Hippie Shawl", "Tie Dye Shawl"],
      Retro: ["Swing Coat", "Crochet Cardigan", "Letterman Jacket"],
      Classic: ["Trench Coat", "Peacoat", "Blazer"],
      Elegant: ["Cape", "Fur Coat", "Evening Wrap"],
      Whimsical: ["Oversize Fur Coat", "Superhero Cape", "Fairy Wings"],
    },
  };

  var itemNameIndex = 0;
  function getNextItemName(clothesCardConfig) {
    var piece = clothesCardConfig.piece;
    var style = clothesCardConfig.style;
    var possibilities = specificInstances[piece][style];
    var index = itemNameIndex % possibilities.length;
    itemNameIndex++;
    return possibilities[index];
  }

  // Quasi random number generator.  Returns zero to < 1.
  var getSeededRandomZeroToOne =
    genericUtils.createSeededGetZeroToOneRandomFunction(3276373);

  function generateTryOnRules() {
    var retVal = [
      {
        numDice: 4,
        numRolls: 3,
        details: `3 of a kind`,
      },
      {
        numDice: 5,
        numRolls: 3,
        details: `Straight of 4`,
      },
      {
        numDice: 4,
        numRolls: 2,
        details: "All even numbers",
      },
      {
        numDice: 4,
        numRolls: 2,
        details: "All odd numbers",
      },
      {
        numDice: 7,
        details: "Tower: hold 5 sec.",
      },
      {
        numDice: 4,
        numRolls: 4,
        details: "Sum to exactly 14",
      },
      {
        numDice: 4,
        numRolls: 3,
        details: "2 sets of Doubles",
      },
      {
        numDice: 2,
        numRolls: 3,
        details: "Doubles",
      },
      {
        numDice: 3,
        numRolls: 4,
        details: "Sum to 15 or more",
      },
      {
        numDice: 3,
        numRolls: 4,
        details: "Sum to 6 or less",
      },
      {
        numDice: 5,
        numRolls: 5,
        details: "4 of a kind",
      },
      {
        numDice: 6,
        numRolls: 5,
        details: "Straight of 5",
      },
    ];

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

  function makeRandomSpecial(specialType, clothesCardConfig) {
    debugLog.debugLog(
      "Cards",
      "Doug makeRandomSpecial: specialType = " + specialType
    );
    debugLog.debugLog(
      "Cards",
      "Doug makeRandomSpecial: clothesCardConfig = " +
        JSON.stringify(clothesCardConfig)
    );

    // This <piece> would look <good|bad> with a <other piece> with <matching color/style | non-matching color/style>
    var otherPiece = genericUtils.getRandomArrayElementNotMatching(
      pieces,
      clothesCardConfig.pieces,

      getSeededRandomZeroToOne
    );
    debugLog.debugLog(
      "Cards",
      "Doug makeRandomSpecial: otherPiece = " + otherPiece
    );

    // Random non-piece value to match.
    var matchingParameterName = genericUtils.getRandomArrayElementNotMatching(
      orderedParameterNames,
      paramNamePiece,
      getSeededRandomZeroToOne
    );
    debugLog.debugLog(
      "Special",
      "Doug makeRandomSpecial: matchingParameterName = " + matchingParameterName
    );
    debugLog.debugLog(
      "Special",
      "Doug makeRandomSpecial: clothesCardConfig = " + clothesCardConfig
    );

    var special = {
      specialType: specialType,
      stars: genericUtils.getIntRandomInRange(
        minSpecialStars,
        maxSpecialStars,
        getSeededRandomZeroToOne
      ),
      otherPiece: otherPiece,
      matchingParameterName: matchingParameterName,
    };

    if (specialType < 2) {
      special.matchingParameterValue = clothesCardConfig[matchingParameterName];
    } else {
      var parameterValue = genericUtils.getRandomArrayElementNotMatching(
        paramaterNamesToParameterValues[matchingParameterName],
        clothesCardConfig[matchingParameterName],
        getSeededRandomZeroToOne
      );
      special.matchingParameterValue = parameterValue;
    }

    return special;
  }

  function generateClothesCardConfig(pieceIndex, styleIndex, colorSchemeIndex) {
    var tryOnRule = getRandomTryOnRule();

    debugLog.debugLog("CardConfigs", "Doug: pieceIndex = " + pieceIndex);
    debugLog.debugLog("CardConfigs", "Doug: styleIndex = " + styleIndex);
    debugLog.debugLog(
      "CardConfigs",
      "Doug: colorSchemeIndex = " + colorSchemeIndex
    );

    var clothesCardConfig = {
      piece: pieces[pieceIndex],
      colorScheme: colorSchemes[colorSchemeIndex],
      style: styles[styleIndex],
      tryOnRule: tryOnRule,
    };

    return clothesCardConfig;
  }

  function generateClothesCardConfigs() {
    var retVal = [];
    for (var pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
      for (var styleIndex = 0; styleIndex < styles.length; styleIndex++) {
        for (
          var colorSchemeIndex = 0;
          colorSchemeIndex < colorSchemes.length;
          colorSchemeIndex++
        ) {
          var numInstances = 2;
          for (
            var instanceIndex = 0;
            instanceIndex < numInstances;
            instanceIndex++
          ) {
            var clothesCardConfig = generateClothesCardConfig(
              pieceIndex,
              styleIndex,
              colorSchemeIndex
            );
            retVal.push(clothesCardConfig);
          }
        }
      }
    }
    return retVal;
  }

  var clothesCardConfigs = generateClothesCardConfigs();
  debugLog.debugLog(
    "CardConfigs",
    "Doug: clothesCardConfigs.length = " + clothesCardConfigs.length.toString()
  );

  var _numClothesCards = 0;
  function getNumClothesCards() {
    if (_numClothesCards == 0) {
      _numClothesCards = cards.getNumCardsFromConfigs(clothesCardConfigs);
    }
    return _numClothesCards;
  }

  function addNameValuePair(parentNode, name, value) {
    var nvp = htmlUtils.addDiv(parentNode, ["name_value_pair"], "nvp");
    htmlUtils.addDiv(nvp, ["name"], "name", name.toString() + ":<nbsp>");
    htmlUtils.addDiv(nvp, ["value"], "value", value.toString());
  }

  function addTryOnRules(parentNode, clothesCardConfig) {
    var tryOnRule = clothesCardConfig.tryOnRule;
    var numDice = tryOnRule.numDice;
    var numRolls = tryOnRule.numRolls;

    htmlUtils.addDiv(
      parentNode,
      ["try_on_header"],
      "tryOnHeader",
      "To try on:"
    );

    var specsSectionNode = htmlUtils.addDiv(
      parentNode,
      ["specs_section", "try_on_specs"],
      "specsSection"
    );

    debugLog.debugLog("CardConfigs", "Doug: numDice = " + numDice);
    debugLog.debugLog("CardConfigs", "Doug: numRolls = " + numRolls);
    addNameValuePair(specsSectionNode, "#Dice", numDice);
    if (numRolls) {
      addNameValuePair(specsSectionNode, "#Rolls", numRolls);
    }

    var rulesTextNode = htmlUtils.addDiv(
      parentNode,
      ["try_on_details"],
      "tryOnRules",
      tryOnRule.details
    );
    domStyle.set(rulesTextNode, {
      "margin-top": "5px",
    });
  }

  function addSpecial(parentNode, special) {
    var text = "With ";

    debugLog.debugLog(
      "Special",
      "Doug addSpecial: special = " + JSON.stringify(special)
    );

    if (special.matchingParameterName == paramNameStyle) {
      var styleText = special.matchingParameterValue;
      text += " " + styleText + " " + special.otherPiece;
    } else if (special.matchingParameterName == paramNameColorScheme) {
      var colorSchemeText = special.matchingParameterValue;
      text += special.otherPiece + " in " + colorSchemeText;
    }

    if (special.specialType == 0) {
      text += "<br>+ " + special.stars.toString() + " ⭐";
    } else if (special.specialType == 1) {
      text += "<br>%50 off!";
    } else {
      text += "<br>- " + special.stars.toString() + " ⭐";
    }

    var good_or_bad_class = special.specialType < 2 ? "good" : "bad";

    htmlUtils.addDiv(
      parentNode,
      ["special_clause", good_or_bad_class],
      "special",
      text
    );
  }

  var specialIndex = 0;
  function maybeGetSpecial(clothesCardConfig) {
    var index = specialIndex % 8;
    specialIndex = specialIndex + 1;
    if (index == 0) {
      return makeRandomSpecial(0, clothesCardConfig);
    } else if (index == 1) {
      return makeRandomSpecial(1, clothesCardConfig);
    } else if (index == 2) {
      return makeRandomSpecial(2, clothesCardConfig);
    } else {
      return null;
    }
  }

  function addClothesDesc(parentNode, clothesCardConfig) {
    var formattedWrapper = htmlUtils.addDiv(
      parentNode,
      ["formatted_wrapper"],
      "formatted_wrapper"
    );

    // Get the name of the piece.
    var itemName = getNextItemName(clothesCardConfig);

    htmlUtils.addDiv(formattedWrapper, ["item_name"], "itemName", itemName);

    // A section of name-value pairs listing the piece, color scheme, and style.
    var specsSection = htmlUtils.addDiv(
      formattedWrapper,
      ["specs_section", "clothes_specs"],
      "specsSection"
    );

    debugLog.debugLog(
      "CardConfigs",
      "Doug: addClothesDesc clothesCardConfig = " +
        JSON.stringify(clothesCardConfig)
    );
    addNameValuePair(specsSection, "Piece", clothesCardConfig.piece);
    addNameValuePair(specsSection, "Style", clothesCardConfig.style);
    addNameValuePair(specsSection, "Colors", clothesCardConfig.colorScheme);

    // A section on how to try it on.
    addTryOnRules(formattedWrapper, clothesCardConfig);

    debugLog.debugLog(
      "Cards",
      "Doug addClothesDesc: clothesCardConfig = " +
        JSON.stringify(clothesCardConfig)
    );

    var special = maybeGetSpecial(clothesCardConfig);

    if (special) {
      debugLog.debugLog("Special", "Doug addClothesDesc: adding special");
      addSpecial(formattedWrapper, special);
    }
  }

  function addClothesCard(parentNode, index) {
    var clothesCardConfig = cards.getCardConfigFromIndex(
      clothesCardConfigs,
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

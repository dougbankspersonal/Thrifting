define([
  "dojo/dom-style",
  "sharedJavascript/debugLog",
  "sharedJavascript/genericUtils",
  "sharedJavascript/htmlUtils",
  "javascript/thriftingHtmlUtils",
  "dojo/domReady!",
], function (domStyle, debugLog, genericUtils, htmlUtils, thriftingHtmlUtils) {
  // Quasi random number generator.  Returns zero to < 1.
  var getSeededRandomZeroToOne =
    genericUtils.createSeededGetZeroToOneRandomFunction(3276373);

  function generateTryOnRuleConfigs() {
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
        numRolls: 3,
        details: "All even numbers",
      },
      {
        numDice: 4,
        numRolls: 3,
        details: "All odd numbers",
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

  // Get a random "try on" rule config.
  var tryOnRuleConfigs;
  function getRandomTryOnRuleConfig() {
    if (!tryOnRuleConfigs) {
      tryOnRuleConfigs = generateTryOnRuleConfigs();
    }
    debugLog.debugLog(
      "Random",
      "Doug getRandomTryOnRule: tryOnRules = " + tryOnRuleConfigs
    );
    return genericUtils.getRandomArrayElement(
      tryOnRuleConfigs,
      getSeededRandomZeroToOne
    );
  }

  function addTryOnRuleNode(parentNode, clothesCardConfig) {
    var tryOnRuleConfig = clothesCardConfig.tryOnRuleConfig;
    var numDice = tryOnRuleConfig.numDice;
    var numRolls = tryOnRuleConfig.numRolls;

    var tryOnRulesNode = htmlUtils.addDiv(
      parentNode,
      ["try_on_rules"],
      "tryOnRules"
    );

    debugLog.debugLog("CardConfigs", "Doug: numDice = " + numDice);
    debugLog.debugLog("CardConfigs", "Doug: numRolls = " + numRolls);

    var dicePrefix = thriftingHtmlUtils.makeImportantText(numDice.toString());
    var rollsPrefix = thriftingHtmlUtils.makeImportantText(numRolls.toString());

    var numDiceText = numDice == 1 ? dicePrefix + " die" : dicePrefix + " dice";
    var numRollsText =
      numRolls == 1 ? rollsPrefix + "  roll" : rollsPrefix + "  rolls";

    var numDiceAndRollsText = numDiceText + "&nbsp;&nbsp;&nbsp;" + numRollsText;

    var numDiceAndRollsNode = htmlUtils.addDiv(
      tryOnRulesNode,
      ["num_dice_and_rolls"],
      "numDiceAndRolls",
      numDiceAndRollsText
    );
    var tryOnDetailsNode = htmlUtils.addDiv(
      tryOnRulesNode,
      ["try_on_details"],
      "tryOnDetails",
      tryOnRuleConfig.details
    );
  }

  return {
    getRandomTryOnRuleConfig: getRandomTryOnRuleConfig,
    addTryOnRuleNode: addTryOnRuleNode,
  };
});

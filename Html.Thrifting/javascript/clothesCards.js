define([
  "dojo/dom-style",
  "sharedJavascript/cards",
  "sharedJavascript/debugLog",
  "sharedJavascript/htmlUtils",
  "javascript/instanceNames",
  "javascript/cardSpec",
  "javascript/parameters",
  "javascript/thriftingHtmlUtils",
  "javascript/tryOnRules",
  "dojo/domReady!",
], function (
  domStyle,
  cards,
  debugLog,
  htmlUtils,
  instanceNames,
  cardSpec,
  parameters,
  thriftingHtmlUtils,
  tryOnRules
) {
  var numInstancesForGivenPieceColorSchemeStyle = 2;
  // For now I will auto generate deterministically because there are too many to write by hand.

  var initialInstanceNameFontSize = 100;

  function addWidgetContainerNode(parentNode, isTop) {
    var classArray = ["widget_container"];
    if (isTop) {
      classArray.push("top");
    } else {
      classArray.push("bottom");
    }
    var widgetContainerNode = htmlUtils.addDiv(
      parentNode,
      classArray,
      "widgetContainer"
    );
    return widgetContainerNode;
  }

  function addWidgetNode(parentNode, textContents) {
    var widgetNode = htmlUtils.addDiv(parentNode, ["widget"], "topWidget");
    htmlUtils.addDiv(
      widgetNode,
      ["widget_contents"],
      "widgetContents",
      textContents
    );
    return widgetNode;
  }

  function addTopWidgets(parentNode) {
    var topWidgetContainerNode = addWidgetContainerNode(parentNode, true);
    addWidgetNode(topWidgetContainerNode, "$");
    addWidgetNode(topWidgetContainerNode, "$$");
    addWidgetNode(topWidgetContainerNode, "$$$");
    return topWidgetContainerNode;
  }

  function addBottomWidgets(parentNode) {
    var topWidgetContainerNode = addWidgetContainerNode(parentNode, false);
    addWidgetNode(topWidgetContainerNode, "1/2");
    addWidgetNode(topWidgetContainerNode, "Torn");
    return topWidgetContainerNode;
  }

  function generateClothesCardConfig(pieceIndex, styleIndex, colorSchemeIndex) {
    var tryOnRuleConfig = tryOnRules.getRandomTryOnRuleConfig();

    debugLog.debugLog("CardConfigs", "Doug: pieceIndex = " + pieceIndex);
    debugLog.debugLog("CardConfigs", "Doug: styleIndex = " + styleIndex);
    debugLog.debugLog(
      "CardConfigs",
      "Doug: colorSchemeIndex = " + colorSchemeIndex
    );

    var clothesCardConfig = {
      piece: parameters.orderedPieces[pieceIndex],
      colorScheme: parameters.orderedColorSchemes[colorSchemeIndex],
      style: parameters.orderedStyles[styleIndex],
      tryOnRuleConfig: tryOnRuleConfig,
    };

    return clothesCardConfig;
  }

  function generateClothesCardConfigs() {
    var retVal = [];
    for (
      var pieceIndex = 0;
      pieceIndex < parameters.orderedPieces.length;
      pieceIndex++
    ) {
      for (
        var styleIndex = 0;
        styleIndex < parameters.orderedStyles.length;
        styleIndex++
      ) {
        for (
          var colorSchemeIndex = 0;
          colorSchemeIndex < parameters.orderedColorSchemes.length;
          colorSchemeIndex++
        ) {
          for (
            var instanceIndex = 0;
            instanceIndex < numInstancesForGivenPieceColorSchemeStyle;
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

  function addInstanceNameNode(parentNode, clothesCardConfig, cardIndex) {
    // Get the name of the piece.
    var instanceName = instanceNames.getNextInstanceName(clothesCardConfig);

    var instanceNameContainerNode = htmlUtils.addDiv(
      parentNode,
      ["instance_name_container"],
      "instanceNameContainer" + cardIndex
    );

    var classArray = ["instance_name"];
    thriftingHtmlUtils.addStyleClasses(classArray, clothesCardConfig.style);

    var instanceNameNode = htmlUtils.addDiv(
      instanceNameContainerNode,
      classArray,
      "instanceName" + cardIndex,
      instanceName
    );

    // Set font size super large: we scale it down later.
    domStyle.set(instanceNameNode, {
      ["font-size"]: initialInstanceNameFontSize + "px",
    });
  }

  function addClothesDesc(parentNode, clothesCardConfig, cardIndex) {
    var formattedWrapper = htmlUtils.addDiv(
      parentNode,
      ["formatted_wrapper"],
      "formatted_wrapper"
    );

    // A section describing piece, style, color.
    var cardSpecNode = cardSpec.addCardSpecNode(
      formattedWrapper,
      clothesCardConfig,
      true
    );

    // The name of the piece.
    addInstanceNameNode(formattedWrapper, clothesCardConfig, cardIndex);

    debugLog.debugLog(
      "CardConfigs",
      "Doug: addClothesDesc clothesCardConfig = " +
        JSON.stringify(clothesCardConfig)
    );

    // A section on how to try it on.
    tryOnRules.addTryOnRuleNode(formattedWrapper, clothesCardConfig);

    debugLog.debugLog(
      "Cards",
      "Doug addClothesDesc: clothesCardConfig = " +
        JSON.stringify(clothesCardConfig)
    );

    addTopWidgets(parentNode);
    addBottomWidgets(parentNode);
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

    // Color of item affect styling of card.
    thriftingHtmlUtils.addColorSchemeClasses(
      classArray,
      clothesCardConfig.colorScheme
    );

    var cardFront = cards.addCardFront(parentNode, classArray, id);

    addClothesDesc(cardFront, clothesCardConfig, index);
    return cardFront;
  }

  function recursiveInstanceNameTextScalingForNthCard(
    cardIndex,
    fontSize,
    containerOffsetWidth,
    containerOffseHeight
  ) {
    var textNode = document.querySelector("#instanceName" + cardIndex);
    console.assert(textNode, "textNode is null");

    // These will change.
    var textOffsetWidth = textNode.offsetWidth;
    var textScrollHeight = textNode.scrollHeight;

    if (
      textOffsetWidth <= containerOffsetWidth &&
      textScrollHeight <= containerOffseHeight
    ) {
      // All good.
      return;
    }

    // Too big.  Shrink and try again
    if (
      textOffsetWidth > containerOffsetWidth ||
      textScrollHeight > containerOffseHeight
    ) {
      // Too big.  Shrink the font size.
      fontSize -= 2;
      if (fontSize < 10) {
        // Too small, punt.
        return;
      }

      // Apply the new font size.
      textNode.style.fontSize = fontSize + "px";
      // After everything settles,try again.
      requestAnimationFrame(() => {
        recursiveInstanceNameTextScalingForNthCard(
          cardIndex,
          fontSize,
          containerOffsetWidth,
          containerOffseHeight
        );
      });
    }
  }

  function doInstanceNameTextScalingForAllCards(numCards) {
    // All containers are the same, grab once.
    var container = document.querySelector("#instanceNameContainer0");
    var containerOffsetWidth = container.offsetWidth;
    var containerOffsetHeight = container.offsetHeight;

    debugLog.debugLog(
      "ScalingText",
      "containerOffsetWidth = " + containerOffsetWidth
    );
    debugLog.debugLog(
      "ScalingText",
      "containerOffsetHeight = " + containerOffsetHeight
    );

    for (var i = 0; i < numCards; i++) {
      recursiveInstanceNameTextScalingForNthCard(
        i,
        initialInstanceNameFontSize,
        containerOffsetWidth,
        containerOffsetHeight
      );
    }
  }

  return {
    getNumClothesCards: getNumClothesCards,
    addClothesCard: addClothesCard,
    doInstanceNameTextScalingForAllCards: doInstanceNameTextScalingForAllCards,
  };
});

define([
  "sharedJavascript/cards",
  "sharedJavascript/debugLog",
  "sharedJavascript/htmlUtils",
  "dojo/domReady!",
], function (cards, debugLog, htmlUtils) {
  var strengthCards = [
    {
      title: "Just got paid",
      rulesText: "Add $4 to your purse.",
    },
    {
      title: "Easy fit",
      rulesText: "May use one more or one fewer die on any try on attempt",
    },
    {
      title: "Persistent",
      rulesText: "One extra dice roll on any roll-based try on attempt",
    },
    {
      title: "Haggler",
      rulesText: "-2$ on any luxury item.",
    },
    {
      title: "Low standards",
      rulesText:
        'May put items in the Rejects pile into your "To Try On" basket',
    },
    {
      title: "Brought my own baskets",
      rulesText: '"To Try ON" and "It Fits!" baskets hold +1 item',
    },
    {
      title: "She wears it well...",
      rulesText: "Common items get +2 ⭐",
    },
  ];

  var weaknessCards = [
    {
      title: "Bad with money",
      rulesText: "Remove $2 from your purse.",
    },
    {
      title: "Color Picky",
      rulesText:
        "Pick any 2 Color Schemes.  You may only wear items in these schemes.",
    },
    {
      title: "Style Picky",
      rulesText: "Pick any 2 styles.  You may only wear items in these styles",
    },
    {
      title: "Glamorous",
      rulesText: "Must buy a Luxury item.  No more than one Common item.",
    },
    {
      title: "Growth Spurt",
      rulesText: "Must buy one additional piece (any type)",
    },
    {
      title: "Awkward",
      rulesText: "-1 ⭐ on any bought item.",
    },
    {
      title: "Alpha",
      rulesText: "Any player with more ⭐ than you loses two ⭐",
    },
  ];

  function addModifierCard(
    parentNode,
    index,
    modifierConfig,
    opt_extraClassArray
  ) {
    var idElements = ["clothes_card", index.toString()];
    var id = idElements.join(".");
    var classArray = [];
    classArray.push("modifier_card");
    if (opt_extraClassArray) {
      classArray = classArray.concat(opt_extraClassArray);
    }
    var cardFront = cards.addCardFront(parentNode, classArray, id);

    var formattedWrapper = htmlUtils.addDiv(
      cardFront,
      ["formatted_wrapper"],
      "formatted_wrapper"
    );

    htmlUtils.addDiv(
      formattedWrapper,
      ["title"],
      "title",
      modifierConfig.title
    );
    htmlUtils.addDiv(
      formattedWrapper,
      ["rules_text"],
      "rules_text",
      modifierConfig.rulesText
    );

    return cardFront;
  }

  function addStrengthCard(parentNode, index) {
    var modifierConfig = strengthCards[index];
    return addModifierCard(parentNode, index, modifierConfig, "strength");
  }

  function addWeaknessCard(parentNode, index) {
    var modifierConfig = weaknessCards[index];
    return addModifierCard(parentNode, index, modifierConfig, "weakness");
  }

  function getNumStrengthCards() {
    return strengthCards.length;
  }

  function getNumWeaknessCards() {
    return weaknessCards.length;
  }

  return {
    getNumStrengthCards: getNumStrengthCards,
    addStrengthCard: addStrengthCard,
    getNumWeaknessCards: getNumWeaknessCards,
    addWeaknessCard: addWeaknessCard,
  };
});

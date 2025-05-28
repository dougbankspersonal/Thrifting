define([
  "dojo/dom-style",
  "sharedJavascript/cards",
  "sharedJavascript/debugLog",
  "sharedJavascript/htmlUtils",
  "dojo/domReady!",
], function (domStyle, cards, debugLog, htmlUtils) {
  var strengthCards = [
    {
      title: "Just Got Paid",
      rulesText: "Add $20 to your purse.",
    },
    {
      title: "Easy Fit",
      rulesText: "One extra die on any Try On attempt",
    },
    {
      title: "Persistent",
      rulesText: "One extra roll on any Try On attempt",
    },
    {
      title: "Haggler",
      rulesText: "-10$ on any Luxury item.",
    },
    {
      title: "Low Standards",
      rulesText:
        'May put items in the Rejects pile into your "To Try On" basket',
    },
    {
      title: "Strong",
      rulesText:
        '"To Try On" and "It Works!" baskets can hold as many items as you want.',
    },
    {
      title: "She Wears It Well",
      rulesText: "Common items get +1 ⭐",
    },
    {
      title: "Sneaky",
      rulesText: "May place Torn items in the Rejects pile",
    },
    {
      title: "Versatile",
      rulesText: "Pick 2 favorite Color Schemes.",
    },
    {
      title: "Coordinated",
      rulesText: "+7 ⭐ if 3 bought items have the same Color Scheme.",
    },
  ];

  var weaknessCards = [
    {
      title: "Bad with money",
      rulesText: "Remove $20 from your purse.",
    },
    {
      title: "Color Picky",
      rulesText:
        "Pick any 2 Color Schemes.<br>You may only wear items in these Schemes.",
    },
    {
      title: "Style Picky",
      rulesText:
        "Pick any 2 Styles.<br>You may only wear items in these Styles.",
    },
    {
      title: "Glamorous",
      rulesText: "Must buy a Luxury item.  No more than one Common item.",
    },
    {
      title: "Growth Spurt",
      rulesText: "Must buy one additional piece (any type).",
    },
    {
      title: "Awkward",
      rulesText: "-1 ⭐ on any bought item.",
    },
    {
      title: "Alpha",
      rulesText: "Any player with more ⭐ than you loses two ⭐.",
    },
    {
      title: "Tiny Hands",
      rulesText: '"Try On" and "It Works!" baskets can only hold 2 items.',
    },
    {
      title: "Running Late",
      rulesText: "Start 2 minutes after everyone else.",
    },
    {
      title: "Hard to Please",
      rulesText: "Do not pick a favorite Style",
    },
  ];

  var modifierCardBorderWidth = 7.5;

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
    var cardFrontNode = cards.addCardFront(parentNode, classArray, id);

    domStyle.set(cardFrontNode, {
      "border-width": `${modifierCardBorderWidth}px`,
    });

    var formattedWrapperNode = htmlUtils.addDiv(
      cardFrontNode,
      ["formatted_wrapper"],
      "formatted_wrapper"
    );

    htmlUtils.addDiv(
      formattedWrapperNode,
      ["title"],
      "title",
      modifierConfig.title
    );
    htmlUtils.addDiv(
      formattedWrapperNode,
      ["rules_text"],
      "rules_text",
      modifierConfig.rulesText
    );

    return cardFrontNode;
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

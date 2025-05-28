// Given a piece type and a style, return a list of specific item names.
// E.g. a "Top" in "[parameters.Bohemian]" style might be a "Peasant Blouse", "Tunic Top", or "Off-the-Shoulder Top".
define(["javascript/parameters", "dojo/domReady!"], function (parameters) {
  var pieceAndStyleToInstanceNames = {
    [parameters.Top]: {
      [parameters.Bohemian]: [
        "Peasant Blouse",
        "Tunic Top",
        "Off-the-Shoulder Top",
      ],
      [parameters.Retro]: ["Mod Turtleneck", "Wrap Blouse", "Disco Shirt"],
      [parameters.Classic]: ["Button-Up Shirt", "Polo Shirt", "Crew Neck Tee"],
      [parameters.Elegant]: ["Silk Blouse", "Satin Camisole", "Chiffon Blouse"],
      [parameters.Whimsical]: [
        "Graphic Tee",
        "Novelty Print Blouse",
        "Pajama Top",
      ],
    },
    [parameters.Bottom]: {
      [parameters.Bohemian]: ["Palazzo Pants", "Gaucho Pants", "Gypsy Skirt"],
      [parameters.Retro]: [
        "High-Waisted Pencil Skirt",
        "A-Line Mini Skirt",
        "Corduroy Flares",
      ],
      [parameters.Classic]: ["Chinos", "Jeans", "Bermuda Shorts"],
      [parameters.Elegant]: ["Pleated Trousers", "Satin Skirt", "Tulle Skirt"],
      [parameters.Whimsical]: ["Patchwork Pants", "Tutu", "Fairycore Skirt"],
    },
    [parameters.Shoes]: {
      [parameters.Bohemian]: ["Espadrilles ", "Moccasins", "Beaded Slip-Ons "],
      [parameters.Retro]: ["Peep-Toe Pumps", "Go-go Boots", "Clogs"],
      [parameters.Classic]: [
        "Oxford Shoes",
        "Slingback Heels",
        "Strappy Sandals",
      ],
      [parameters.Elegant]: [
        "Satin Heels",
        "D'Orsay Heels",
        "Embellished Flats",
      ],
      [parameters.Whimsical]: ["Bunny Slippers", "Combat Boots", "Heelys"],
    },
    [parameters.Dress]: {
      [parameters.Bohemian]: [
        "Peasant Dress",
        "Prairie Dress",
        "Bell Sleeve Dress",
      ],
      [parameters.Retro]: ["Flapper Dress", "Swing Dress", "Mod Dress"],
      [parameters.Classic]: [
        "Empire Waist Dress",
        "Fit-and-Flare Dress",
        "A-Line Dress",
      ],
      [parameters.Elegant]: ["Ball Gown", "Cocktail Dress", "Velvet Gown"],
      [parameters.Whimsical]: [
        "Milkmaid Dress",
        "Evil Queen Costume",
        "Anime Cosplay Dress",
      ],
    },
    [parameters.Hat]: {
      [parameters.Bohemian]: [
        "Frayed Edge Hat",
        "Oversized Sun Hat",
        "Felt Fedora",
      ],
      [parameters.Retro]: ["Flapper Headband", "Pillbox Hat", "Bowler Hat"],
      [parameters.Classic]: ["Beanie", "Baseball Cap", "Bucket Hat"],
      [parameters.Elegant]: ["Tiara", "Fascinator", "Turban"],
      [parameters.Whimsical]: ["Bonnet", "Floppy Witch Hat", "Unicorn Horn"],
    },
    [parameters.Wrap]: {
      [parameters.Bohemian]: ["Poncho", "Hippie Shawl", "Tie Dye Shawl"],
      [parameters.Retro]: [
        "Swing Coat",
        "Crochet Cardigan",
        "Letterman Jacket",
      ],
      [parameters.Classic]: ["Trench Coat", "Peacoat", "Blazer"],
      [parameters.Elegant]: ["Cape", "Fur Coat", "Evening Wrap"],
      [parameters.Whimsical]: [
        "Oversize Fur Coat",
        "Superhero Cape",
        "Fairy Wings",
      ],
    },
  };

  var instanceNameIndices = {};
  function getAndIncrementInstanceNameIndex(piece, style) {
    var styleIndices = instanceNameIndices[piece]
      ? instanceNameIndices[piece]
      : {};
    var instanceNameIndex = styleIndices[style] ? styleIndices[style] : 0;
    var retVal = instanceNameIndex;
    instanceNameIndex++;
    styleIndices[style] = instanceNameIndex;
    instanceNameIndices[piece] = styleIndices;
    return retVal;
  }

  function getNextInstanceName(clothesCardConfig) {
    var piece = clothesCardConfig.piece;
    var style = clothesCardConfig.style;
    console.assert(piece, "piece is not defined");
    console.assert(style, "style is not defined");

    var possibilities = pieceAndStyleToInstanceNames[piece][style];
    console.assert(possibilities, "possibilities is not defined");

    var index = getAndIncrementInstanceNameIndex(piece, style);
    index = index % possibilities.length;

    return possibilities[index];
  }

  return {
    pieceAndStyleToInstanceNames: pieceAndStyleToInstanceNames,
    getNextInstanceName: getNextInstanceName,
  };
});

/* Obsolete */
/*
    Accessory: {
      [parameters.Bohemian]: ["Boho Choker", "Turquoise Bracelet", "Fringe Bag"],
      [parameters.Retro]: ["Long Gloves", "Tulle Scarf", "Cat Eye Sunglasses"],
      [parameters.Classic]: ["Pearl Earrings", "Clutch Purse", "Hoop Earrings"],
      [parameters.Elegant]: ["Tennis Bracelet", "Evening Bag", "Ring"],
      [parameters.Whimsical]: ["Fanny Pack", "Furry Earmuffs", "Magic Wand"],
    },
*/

define([
  "dojo/dom-style",
  "sharedJavascript/htmlUtils",
  "javascript/measurements",
  "javascript/parameters",
  "dojo/domReady!",
], function (domStyle, htmlUtils, measurements, parameters) {
  function addColorSchemeSwatch(parent, colorSchemeValue, size) {
    var colorSchemeHexColorString =
      parameters.colorSchemeHexColorStrings[colorSchemeValue];

    var colorSchemeSwatch = htmlUtils.addDiv(
      parent,
      ["color_scheme_swatch"],
      "colorSchemeSwatch"
    );
    domStyle.set(colorSchemeSwatch, {
      "background-color": colorSchemeHexColorString,
      width: size + "px",
      height: size + "px",
    });

    return colorSchemeSwatch;
  }

  function addCardSpecNode(parent, clothesCardConfig) {
    var classes = ["card_spec"];

    var cardSpecNode = htmlUtils.addDiv(parent, classes, "cardSpec");

    // 3 symbols left to right: <color scheme> <style> <piece>
    var iconsWrapperNode = htmlUtils.addDiv(
      cardSpecNode,
      ["icons_wrapper"],
      "iconsWrapper"
    );
    addColorSchemeSwatch(
      iconsWrapperNode,
      clothesCardConfig.colorScheme,
      measurements.clothesCardIconSizePx - 8
    );

    var styleImage = htmlUtils.addImage(
      iconsWrapperNode,
      ["style_icon", parameters.paramToCssClass[clothesCardConfig.style]],
      "styleIcon"
    );
    domStyle.set(styleImage, {
      width: measurements.clothesCardIconSizePx + "px",
      height: measurements.clothesCardIconSizePx + "px",
    });

    var pieceImage = htmlUtils.addImage(
      iconsWrapperNode,
      ["pieceIcon", parameters.paramToCssClass[clothesCardConfig.piece]],
      "pieceIcon"
    );
    domStyle.set(pieceImage, {
      width: measurements.clothesCardIconSizePx + "px",
      height: measurements.clothesCardIconSizePx + "px",
    });

    // 3 text top to bottom: <color scheme> <style> <piece>
    var textWrapperNode = htmlUtils.addDiv(
      cardSpecNode,
      ["text_wrapper"],
      "textWrapper"
    );
    htmlUtils.addDiv(
      textWrapperNode,
      ["color_scheme_text", "spec_text"],
      "colorSchemeText",
      clothesCardConfig.colorScheme
    );
    htmlUtils.addDiv(
      textWrapperNode,
      ["style_text", "spec_text"],
      "styleText",
      clothesCardConfig.style
    );
    htmlUtils.addDiv(
      textWrapperNode,
      ["piece_text", "spec_text"],
      "pieceText",
      clothesCardConfig.piece
    );
    return cardSpecNode;
  }

  return {
    addColorSchemeSwatch: addColorSchemeSwatch,
    addCardSpecNode: addCardSpecNode,
  };
});

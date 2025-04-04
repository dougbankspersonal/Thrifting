define([
  "dojo/dom-style",
  "sharedJavascript/htmlUtils",
  "javascript/thriftingHtmlUtils",
  "dojo/domReady!",
], function (domStyle, htmlUtils, thriftingHtmlUtils) {
  var imageRotationDeg = 10;

  function addPieceImage(cardSpecNode, pieceType) {
    return htmlUtils.addImage(
      cardSpecNode,
      ["piece_image", pieceType],
      "pieceImage"
    );
  }

  function addCardSpecNode(parent, clothesCardConfig) {
    var classes = ["card_spec"];

    var cardSpecNode = htmlUtils.addDiv(parent, classes, "cardSpec");

    var classArray = [];
    thriftingHtmlUtils.addStyleClasses(classArray, clothesCardConfig.style);
    var styleNode = htmlUtils.addDiv(
      cardSpecNode,
      classArray,
      "style",
      clothesCardConfig.style
    );

    var pieceContainerNode = htmlUtils.addDiv(
      cardSpecNode,
      ["piece_container"],
      "pieceContainer"
    );

    var preImage = addPieceImage(pieceContainerNode, clothesCardConfig.piece);
    domStyle.set(preImage, {
      transform: "rotate(" + (-imageRotationDeg).toString() + "deg)",
    });

    classArray = [];
    thriftingHtmlUtils.addPieceClasses(classArray, clothesCardConfig.piece);
    var pieceNode = htmlUtils.addDiv(
      pieceContainerNode,
      classArray,
      "piece",
      clothesCardConfig.piece
    );

    var postImage = addPieceImage(pieceContainerNode, clothesCardConfig.piece);
    domStyle.set(postImage, {
      transform: "rotate(" + imageRotationDeg.toString() + "deg)",
    });

    classArray = [];
    thriftingHtmlUtils.addPieceClasses(classArray, clothesCardConfig.piece);
    var unimportantIn = thriftingHtmlUtils.makeUnimportantText("in");

    var colorSchemeNode = htmlUtils.addDiv(
      cardSpecNode,
      classArray,
      "colorScheme",
      unimportantIn + "&nbsp;" + clothesCardConfig.colorScheme
    );
    return cardSpecNode;
  }

  return {
    addCardSpecNode: addCardSpecNode,
  };
});

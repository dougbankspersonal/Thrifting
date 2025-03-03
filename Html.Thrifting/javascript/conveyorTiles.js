define([
  "dojo/dom",
  "dojo/dom-style",
  "javascript/beltUtils",
  "sharedJavascript/debugLog",
  "javascript/gameUtils",
  "dojo/domReady!",
], function (dom, domStyle, beltUtils, debugLog, gameUtils) {
  function getCurvePoints() {
    var curvePoints = [];

    var startX = gameUtils.beltCenterOffsetInConveyorTile;
    var endX =
      gameUtils.conveyorTileInnerWidth -
      gameUtils.beltCenterOffsetInConveyorTile;

    var startY = 0;
    var endY = gameUtils.conveyorTileHeight;
    var middleX = (startX + endX) / 2;
    var middleY = (startY + endY) / 2;

    var offsetWhileTurning = gameUtils.beltSegmentHeight / 2;

    var lastX = startX;
    var lastY = startY;
    curvePoints.push({
      xOffset: lastX,
      yOffset: lastY,
    });
    // Down a step.
    lastX = lastX;
    lastY = lastY + offsetWhileTurning;
    curvePoints.push({
      xOffset: lastX,
      yOffset: lastY,
    });
    // Down and over a bit, equal measures.
    lastX = lastX + (Math.sqrt(2) * offsetWhileTurning) / 2;
    lastY = lastY + (Math.sqrt(2) * offsetWhileTurning) / 2;
    curvePoints.push({
      xOffset: lastX,
      yOffset: lastY,
    });

    // Now over to the middle.
    var distanceToMiddle = Math.sqrt(
      (lastX - middleX) ** 2 + (lastY - middleY) ** 2
    );
    var numSegments = Math.ceil(distanceToMiddle / gameUtils.beltSegmentHeight);
    var xDelta = (middleX - lastX) / numSegments;
    var yDelta = (middleY - lastY) / numSegments;
    for (let i = 0; i < numSegments; i++) {
      lastX = lastX + xDelta;
      lastY = lastY + yDelta;
      curvePoints.push({
        xOffset: lastX,
        yOffset: lastY,
      });
    }

    // Now back out...
    var startIndex = curvePoints.length - 1;
    for (let i = startIndex; i--; i >= 0) {
      var oldPoint = curvePoints[i];
      curvePoints.push({
        xOffset: gameUtils.conveyorTileInnerWidth - oldPoint.xOffset,
        yOffset: endY - oldPoint.yOffset,
      });
    }

    // Throw in angles.
    for (let index = 0; index < curvePoints.length; index++) {
      var prevCurvePoint = null;
      var nextCurvePoint = null;
      var thisCurvePoint = curvePoints[index];
      if (index > 0) {
        prevCurvePoint = curvePoints[index - 1];
      }

      if (index < curvePoints.length - 1) {
        nextCurvePoint = curvePoints[index + 1];
      }

      thisCurvePoint.rads = 0;
      if (prevCurvePoint != null && nextCurvePoint != null) {
        var xDelta = nextCurvePoint.xOffset - prevCurvePoint.xOffset;
        var yDelta = nextCurvePoint.yOffset - prevCurvePoint.yOffset;
        thisCurvePoint.rads = Math.PI / 2 + Math.atan2(yDelta, xDelta);
      }
    }

    return curvePoints;
  }

  var curvePoints = getCurvePoints();

  function addEmptyConveyorTileElement(
    parentNode,
    conveyorTileId,
    opt_classArray
  ) {
    var classArray = gameUtils.extendOptClassArray(
      opt_classArray,
      "conveyor_tile"
    );
    if (gameUtils.getSystemConfigs().isDemoBoard) {
      classArray.push("demoBoard");
    }
    var conveyorTile = gameUtils.addDiv(parentNode, classArray, conveyorTileId);
    domStyle.set(conveyorTile, {
      width: `${gameUtils.conveyorTileWidth}px`,
      height: `${gameUtils.conveyorTileHeight}px`,
      border: `${gameUtils.conveyorTileBorder}px solid #000000`,
    });
    return conveyorTile;
  }

  function addStraightBelt(conveyorTile, isLeft) {
    var belt = gameUtils.addDiv(
      conveyorTile,
      ["belt", isLeft ? "left" : "right"],
      isLeft ? "leftBelt" : "rightBelt"
    );
    var xOffset = isLeft
      ? gameUtils.beltCenterOffsetInConveyorTile
      : gameUtils.conveyorTileInnerWidth -
        gameUtils.beltCenterOffsetInConveyorTile;
    for (let i = 0; i < gameUtils.beltSegmentsPerRow; i++) {
      var yOffset =
        gameUtils.beltSegmentOffset / 2 + i * gameUtils.beltSegmentOffset;
      beltUtils.addBeltSegment(belt, xOffset, yOffset);
    }
  }

  function addRightToLeftBelt(conveyorTile) {
    belt = gameUtils.addDiv(conveyorTile, ["belt", , "right"], "rightBelt");
    for (let index = 0; index < curvePoints.length; index++) {
      var curvePoint = curvePoints[index];
      beltUtils.addBeltSegment(
        belt,
        gameUtils.conveyorTileInnerWidth - curvePoint.xOffset,
        curvePoint.yOffset,
        -curvePoint.rads
      );
    }
    return belt;
  }

  function addLeftToRightBelt(conveyorTile) {
    var belt = gameUtils.addDiv(conveyorTile, ["belt", "left"], "leftBelt");
    for (let index = 0; index < curvePoints.length; index++) {
      var curvePoint = curvePoints[index];
      beltUtils.addBeltSegment(
        belt,
        curvePoint.xOffset,
        curvePoint.yOffset,
        curvePoint.rads
      );
    }
    return belt;
  }

  function addSplitterJoinerTile(
    parentNode,
    conveyorTileId,
    arity,
    opt_classArray
  ) {
    debugLog.debugLog(
      "ConveyorTiles",
      "Doug: addSplitterJoinerTile arity == " + arity
    );
    var conveyorTile = addEmptyConveyorTileElement(
      parentNode,
      conveyorTileId,
      opt_classArray
    );

    // Add belts.
    if (arity) {
      // Left to right belt.
      addLeftToRightBelt(conveyorTile);
      // Left to left belt.
      addStraightBelt(conveyorTile, true);
    } else {
      // Right to left belt.
      addRightToLeftBelt(conveyorTile);
      addStraightBelt(conveyorTile, false);
    }

    return conveyorTile;
  }

  function addCrossTile(parentNode, conveyorTileId, opt_classArray) {
    var conveyorTile = addEmptyConveyorTileElement(
      parentNode,
      conveyorTileId,
      opt_classArray
    );

    // Add belts.
    // Left to right belt.
    addLeftToRightBelt(conveyorTile);

    // Right to left belt.
    addRightToLeftBelt(conveyorTile);

    return conveyorTile;
  }

  function addConveyorTilesPage(
    bodyNode,
    numConveyorTiles,
    opt_isSplitterJoiner
  ) {
    var pageNode = gameUtils.addPageOfItems(bodyNode);

    for (let i = 0; i < numConveyorTiles; i++) {
      var tileId = "tileId" + i;
      if (opt_isSplitterJoiner) {
        addSplitterJoinerTile(pageNode, tileId, i % 2 == 0);
      } else {
        addCrossTile(pageNode, tileId);
      }
    }

    return pageNode;
  }

  function createConveyorTiles(totalNumTiles, opt_isSplitterJoiner) {
    var bodyNode = dom.byId("body");
    var stripsPerPage = 12;
    var numPages = Math.ceil(totalNumTiles / stripsPerPage);
    for (i = 0; i < numPages; i++) {
      var numStripsThisPage = Math.min(
        stripsPerPage,
        totalNumTiles - i * stripsPerPage
      );
      addConveyorTilesPage(bodyNode, numStripsThisPage, opt_isSplitterJoiner);
    }
  }

  // This returned object becomes the defined value of this module
  return {
    createConveyorTiles: createConveyorTiles,
    addCrossTile: addCrossTile,
    addSplitterJoinerTile: addSplitterJoinerTile,
  };
});

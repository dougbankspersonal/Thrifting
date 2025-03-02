define([
  "dojo/dom",
  "dojo/query",
  "dojo/dom-style",
  "dojo/dom-class",
  "javascript/beltUtils",
  "javascript/cards",
  "javascript/conveyorTiles",
  "javascript/debugLog",
  "javascript/gameUtils",
  "javascript/markers",
  "javascript/rowTypes",
  "dojo/domReady!",
], function (
  dom,
  query,
  domStyle,
  domClass,
  beltUtils,
  cards,
  conveyorTiles,
  debugLog,
  gameUtils,
  markers,
  rowTypes
) {
  var rowZUIndex = 0;

  // Set to true to generate sidebar strips.
  var thisBoardHasSidebar = false;

  // A tile hits two slots.
  // Say first slot is row i, column j.
  // Then the tile is stored in conveyorTileIdsByRowThenColumn[i][j]
  var conveyorTileIdsByRowThenColumn = {};
  var addedConveyorTileIndex = 0;

  // Add a sidebar cell to the row with labels & whatnot.
  function addSidebarCellToRow(rowNode, rowIndex, rowType) {
    var sidebar = gameUtils.addDiv(rowNode, ["sidebar"], "sidebar");
    domStyle.set(sidebar, {
      width: `${gameUtils.sidebarWidth}px`,
    });

    var sidebarInfo = rowTypes.getSidebarInfo(rowType);

    var wrapper = gameUtils.addDiv(sidebar, ["wrapper"], "wrapper");
    gameUtils.addDiv(wrapper, ["title"], "title", sidebarInfo.title);
    if (sidebarInfo.subtitle) {
      gameUtils.addDiv(wrapper, ["subtitle"], "subtitle", sidebarInfo.subtitle);
    }
    if (sidebarInfo.instructions) {
      gameUtils.addDiv(
        wrapper,
        ["instructions"],
        "instructions",
        sidebarInfo.instructions
      );
    }

    return sidebar;
  }

  // Add a single row with one cell with sidebar info.
  // Returns the row.
  function addRowWithSingleSidebarCell(parentNode, rowIndex, rowType) {
    var rowHeight = rowTypes.getRowHeight(rowType);
    var row = gameUtils.addRow(parentNode, [], rowIndex);
    gameUtils.addStandardBorder(row);

    var finalZIndex = rowZUIndex;
    rowZUIndex--;

    domStyle.set(row, {
      height: `${rowHeight}px`,
      "z-index": `${finalZIndex}`,
    });

    addSidebarCellToRow(row, rowIndex, rowType);

    return row;
  }

  function addContent(parentNode) {
    var content = gameUtils.addDiv(parentNode, ["content"], "content");
    return content;
  }

  var validRowConfigKeys = {
    // Classes to apply to the row.
    classArray: true,
    // Configs for elements in the row.
    elementConfigs: true,
  };

  function sanityCheckRowConfigs(rowConfigs) {
    gameUtils.sanityCheckTable(rowConfigs, validRowConfigKeys);
  }

  var validElementConfigKeys = {
    // Should we even add an element?
    skipElement: true,
    // Normally elements are round.
    isSquare: true,
    // Is this circle nth space for a particular thing?
    // E.g. Nth squirrel space.
    entityName: true,
    entityIndex: true,
    // Should we hide the top of the belt (used for top row, we don't want belt above dispensers)
    hideBeltTop: true,
  };

  function sanityCheckElementConfigs(elementConfigs) {
    gameUtils.sanityCheckTable(elementConfigs, validElementConfigKeys);
  }

  // Add a row to the current strip.
  // Return the 'content' sub-node of the row.
  function addRowToStripAndReturnRowContent(
    parentNode,
    rowIndex,
    rowType,
    opt_rowConfigs
  ) {
    var rowConfigs = opt_rowConfigs ? opt_rowConfigs : {};
    sanityCheckRowConfigs(rowConfigs);

    var darkBackground = rowConfigs.darkBackground ? true : false;
    var classArray = rowConfigs.classArray ? rowConfigs.classArray : [];

    var row = gameUtils.addRow(parentNode, classArray, rowIndex);
    gameUtils.addStandardBorder(row);

    var finalHeight = rowTypes.getRowHeight(rowType);
    var finalZIndex = rowZUIndex;
    rowZUIndex--;

    domStyle.set(row, {
      height: `${finalHeight}px`,
      "z-index": `${finalZIndex}`,
    });

    if (darkBackground) {
      gameUtils.addDiv(row, ["darkBackground"], "darkBackground");
    }

    var content = addContent(row);

    return content;
  }

  function applyStandardElementStyling(element) {
    domStyle.set(element, {
      width: `${gameUtils.elementWidth}px`,
      height: `${gameUtils.elementHeight}px`,
      "z-index": `${gameUtils.elementZIndex}`,
      "margin-top": `${gameUtils.elementTopAndBottomMargin}px`,
      "margin-left": `${gameUtils.elementLeftAndRightMargin}px`,
    });
  }

  function addStraightBelt(parentNode, elementConfigs) {
    sanityCheckElementConfigs(elementConfigs);
    var hideBeltTop = elementConfigs.hideBeltTop ? true : false;
    var hideBeltBottom = elementConfigs.hideBeltBottom ? true : false;

    var belt = gameUtils.addDiv(parentNode, ["belt"], "belt");
    domStyle.set(belt, {
      "z-index": `${gameUtils.beltZIndex}`,
    });

    for (let i = 0; i < gameUtils.beltSegmentsPerRow; i++) {
      if (hideBeltTop && i < gameUtils.beltSegmentsPerRow / 2) {
        continue;
      }
      if (hideBeltBottom && i >= gameUtils.beltSegmentsPerRow / 2 - 1) {
        continue;
      }
      var yOffset =
        gameUtils.beltSegmentOffset / 2 + i * gameUtils.beltSegmentOffset;
      beltUtils.addBeltSegment(belt, gameUtils.slotWidth / 2, yOffset);
    }

    return belt;
  }

  // columnIndex is 0-based.
  function addNthElement(parentNode, columnIndex, opt_classArray) {
    var classArray = gameUtils.extendOptClassArray(opt_classArray, "element");
    var elementId = gameUtils.getElementId(columnIndex);
    var element = gameUtils.addDiv(parentNode, classArray, elementId);

    applyStandardElementStyling(element);
    gameUtils.addStandardBorder(element);

    return element;
  }

  function addEntityNameAndIndex(parentNode, entityName, entityIndex) {
    var entityNameNode = gameUtils.addDiv(
      parentNode,
      ["entityTitle"],
      "entityTitle",
      entityName
    );
    var entityIndexNode = gameUtils.addDiv(
      parentNode,
      ["entityIndex"],
      "entityIndex",
      entityIndex
    );
    return { entityNameNode, entityIndexNode };
  }

  function addStandardSlot(parentNode, rowIndex, columnIndex) {
    var slotId = gameUtils.getSlotId(rowIndex, columnIndex);
    var classArray = ["slot"];
    var node = gameUtils.addDiv(parentNode, classArray, slotId);
    domStyle.set(node, {
      width: `${gameUtils.slotWidth}px`,
    });
    return node;
  }

  function addStandardSlotWithNumber(parent, rowIndex, columnIndex) {
    var standardSlot = addStandardSlot(parent, rowIndex, columnIndex);
    var elementId = gameUtils.getElementId(columnIndex);
    // Column index is zero based: when we render the number we want it to start at one.
    var columnNumber = columnIndex + 1;
    var numberNode = gameUtils.addDiv(
      standardSlot,
      ["number"],
      elementId,
      columnNumber
    );
    applyStandardElementStyling(numberNode);
    return standardSlot;
  }

  // How many columns will be in this strip?
  // totalColumnCount = all columns in board.
  // numColumnsAlreadyHandled = columns already handled in previous strips.
  // maxColumnsPerStrip = max we can handle.
  function getNumColumnsThisPage(
    totalColumnCount,
    maxColumnsPerPage,
    numColumnsAlreadyHandled
  ) {
    var numColumnsLeft = totalColumnCount - numColumnsAlreadyHandled;
    var retVal = Math.min(numColumnsLeft, maxColumnsPerPage);
    debugLog.debugLog(
      "GameBoard",
      "Doug: getNumColumnsThisStrip retVal = " + retVal
    );
    return retVal;
  }

  function addStandardSlotWithElementAndBelt(
    parentNode,
    rowIndex,
    columnIndex,
    elementConfigs
  ) {
    sanityCheckElementConfigs(elementConfigs);

    // Column index is 0-based.
    debugLog.debugLog(
      "GameBoard",
      "Doug: addStandardSlotWithElementAndBelt: rowIndex = " +
        rowIndex +
        " columnIndex = " +
        columnIndex
    );

    var classArray = elementConfigs.classArray;
    var tweakElement = elementConfigs.tweakElement;
    var isSquare = elementConfigs.isSquare;
    var skipElement = elementConfigs.skipElement;
    var entityName = elementConfigs.entityName;
    var entityIndex = elementConfigs.entityIndex;
    var standardSlot = addStandardSlot(parentNode, rowIndex, columnIndex);

    if (!skipElement) {
      var element = addNthElement(standardSlot, columnIndex, classArray);
      if (entityName && entityIndex) {
        addEntityNameAndIndex(element, entityName, entityIndex);
      }
      if (tweakElement) {
        tweakElement(element);
      }
      if (isSquare) {
        domStyle.set(element, {
          "border-radius": "0px",
        });
      }
    }
    addStraightBelt(standardSlot, elementConfigs);

    return standardSlot;
  }

  function addNColumnRowWithElements(
    parentNode,
    rowIndex,
    rowType,
    numColumnsThisPage,
    numColumnsAlreadyHandled,
    rowConfigs
  ) {
    sanityCheckRowConfigs(rowConfigs);

    debugLog.debugLog(
      "GameBoard",
      "Doug: addNColumnRowWithElements: rowIndex = " + rowIndex
    );
    debugLog.debugLog(
      "GameBoard",
      "Doug: addNColumnRowWithElements: numColumnsThisPage = " +
        numColumnsThisPage
    );
    debugLog.debugLog(
      "GameBoard",
      "Doug: addNColumnRowWithElements: numColumnsAlreadyHandled = " +
        numColumnsAlreadyHandled
    );

    var entityName = rowTypes.getRowEntityName(rowType);
    var content = addRowToStripAndReturnRowContent(
      parentNode,
      rowIndex,
      rowType,
      rowConfigs
    );
    var elementConfigs = rowConfigs.elementConfigs
      ? rowConfigs.elementConfigs
      : {};

    for (let i = 0; i < numColumnsThisPage; i++) {
      if (entityName) {
        elementConfigs.entityIndex = i + numColumnsAlreadyHandled + 1;
        elementConfigs.entityName = entityName;
      }
      addStandardSlotWithElementAndBelt(
        content,
        rowIndex,
        numColumnsAlreadyHandled + i,
        elementConfigs
      );
    }

    return content;
  }

  function addNColumnRowWithNumbers(
    parentNode,
    rowIndex,
    rowType,
    numColumnsThisPage,
    numColumnsAlreadyHandled,
    rowConfigs
  ) {
    sanityCheckRowConfigs(rowConfigs);
    debugLog.debugLog(
      "GameBoard",
      "Doug: addNColumnRowWithNumbers: numColumnsAlreadyHandled = " +
        numColumnsAlreadyHandled
    );
    var content = addRowToStripAndReturnRowContent(
      parentNode,
      rowIndex,
      rowType,
      rowConfigs
    );

    for (let i = 0; i < numColumnsThisPage; i++) {
      var columnIndex = numColumnsAlreadyHandled + i;
      addStandardSlotWithNumber(content, rowIndex, columnIndex);
    }
    return content;
  }

  function addNColumnRowWithConveyors(
    parentNode,
    rowIndex,
    rowType,
    numColumnsThisPage,
    numColumnsAlreadyHandled,
    rowConfigs
  ) {
    sanityCheckRowConfigs(rowConfigs);
    var content = addRowToStripAndReturnRowContent(
      parentNode,
      rowIndex,
      rowType,
      rowConfigs
    );

    var elementConfigs = rowConfigs.elementConfigs
      ? rowConfigs.elementConfigs
      : {};
    elementConfigs.skipElement = true;

    for (let i = 0; i < numColumnsThisPage; i++) {
      addStandardSlotWithElementAndBelt(
        content,
        rowIndex,
        numColumnsAlreadyHandled + i,
        elementConfigs
      );
    }
    return content;
  }

  function tweakBoxesRowCardSlot(node) {
    var cardSlotHeight =
      rowTypes.standardRowHeight / 2 - 2 * gameUtils.boxesRowMarginTop;
    domStyle.set(node, {
      width: `${gameUtils.smallCardWidth}px`,
      height: `${cardSlotHeight}px`,
      "margin-top": `${gameUtils.boxesRowMarginTop}px`,
      display: "block",
    });
  }

  // Start on given page.
  // Add the sidebar, as much as will fit on page.
  // Add more pages as needed to complete the sidebar.
  function addPagesWithSidebar(
    bodyNode,
    startingPageNode,
    orderedRowTypes,
    totalNumColumns,
    maxRowsPerPage
  ) {
    var pageNodes = [];
    var currentPageNode = startingPageNode;

    var currentPageNode = gameUtils.addPageOfItems(parentNode);
    pageNodes.push(currentPageNode);
    var rowsThisPage = 0;
    var firstRowIndexThisPage = 0;

    for (let rowIndex = 0; rowIndex < orderedRowTypes.length; rowIndex++) {
      var rowType = orderedRowTypes[rowIndex];
      // If we are out of space on current page make a new one.
      if (rowsThisPage >= maxRowsPerPage) {
        currentPageNode = gameUtils.addPageOfItems(bodyNode);

        pageNodes.push(currentPageNode);
        rowsThisPage = 0;
        firstRowIndexThisPage = rowIndex;
      }

      addRowWithSingleSidebarCell(currentPageNode, rowIndex, rowType);
      rowsThisPage++;
    }
    return pageNodes;
  }

  // Adds one or more pages.
  // Each page holds at most numColumnsThisStrip columns.
  // Each page holds at most maxRowsPerPage rows.
  // Will do as many pages as needed to handle all the rows in orderedRowTypes.
  // Returns ([pages], number of columnsAdded)
  function addPagesWithNextNColumns(
    bodyNode,
    orderedRowTypes,
    maxRowsPerPage,
    totalNumColumns,
    maxColumnsPerPage,
    numColumnsAlreadyHandled
  ) {
    var allPageNodes = [];
    var numColumnsThisStrip = getNumColumnsThisPage(
      totalNumColumns,
      maxColumnsPerPage,
      numColumnsAlreadyHandled
    );
    var pageNode = gameUtils.addPageOfItems(bodyNode);
    allPageNodes.push(pageNode);
    var currentPageNode = pageNode;

    var rowsThisPage = 0;
    for (let i = 0; i < orderedRowTypes.length; i++) {
      var rowIndex = i;
      var rowType = orderedRowTypes[i];

      if (rowsThisPage >= maxRowsPerPage) {
        currentPageNode = gameUtils.addPageOfItems(bodyNode);
        allPageNodes.push(currentPageNode);
        rowsThisPage = 0;
      }

      switch (rowType) {
        case rowTypes.RowTypes.Number:
          addNColumnRowWithNumbers(
            currentPageNode,
            rowIndex,
            rowType,
            numColumnsThisStrip,
            numColumnsAlreadyHandled,
            {
              classArray: ["numbers"],
            }
          );
          break;
        case rowTypes.RowTypes.Dispenser:
          addNColumnRowWithElements(
            currentPageNode,
            rowIndex,
            rowType,
            numColumnsThisStrip,
            numColumnsAlreadyHandled,
            {
              classArray: ["nutDispensers"],
              elementConfigs: {
                hideBeltTop: true,
              },
            }
          );
          break;
        case rowTypes.RowTypes.Conveyor:
        case rowTypes.RowTypes.Path:
          addNColumnRowWithConveyors(
            currentPageNode,
            rowIndex,
            rowType,
            numColumnsThisStrip,
            numColumnsAlreadyHandled,
            {
              classArray: ["conveyors"],
            }
          );
          break;
        case rowTypes.RowTypes.Heart:
        case rowTypes.RowTypes.Skull:
        case rowTypes.RowTypes.Start:
        case rowTypes.RowTypes.End:
        case rowTypes.RowTypes.Salter:
        case rowTypes.RowTypes.Roaster:
        case rowTypes.RowTypes.Squirrel:
        case rowTypes.RowTypes.BoxRobots:
          addNColumnRowWithElements(
            currentPageNode,
            rowIndex,
            rowType,
            numColumnsThisStrip,
            numColumnsAlreadyHandled,
            {
              elementConfigs: {
                isSquare: rowType == rowTypes.RowTypes.BoxRobots,
              },
            }
          );
          break;
        case rowTypes.RowTypes.Boxes:
          addNColumnRowWithElements(
            currentPageNode,
            rowIndex,
            rowType,
            numColumnsThisStrip,
            numColumnsAlreadyHandled,
            {
              classArray: ["boxes"],
              darkBackground: true,
              elementConfigs: {
                classArray: ["cardSlot"],
                tweakElement: tweakBoxesRowCardSlot,
                hideBeltBottom: true,
              },
            }
          );
          break;
      }
      rowsThisPage++;
    }

    debugLog.debugLog(
      "GameBoard",
      "Doug: addPagesWithNextNColumns: at the end numColumnsThisPage = " +
        numColumnsThisStrip
    );
    return {
      allPageNodes: allPageNodes,
      numColumnsThisStrip: numColumnsThisStrip,
    };
  }

  function addGameBoard(configs) {
    // How many rows in this version of the game?
    var orderedRowTypes = configs.orderedRowTypes;
    // How many factory columns in this version of the game?
    var totalNumColumns = configs.totalNumColumns;

    var pageless = configs.pageless;

    // How many factory rows and columns per page?
    var maxRowsPerPage;
    if (configs.maxRowsPerPage) {
      maxRowsPerPage = configs.maxRowsPerPage;
    } else {
      maxRowsPerPage = orderedRowTypes.length;
    }

    var maxColumnsPerPage;
    if (configs.maxColumnsPerPage) {
      maxColumnsPerPage = configs.maxColumnsPerPage;
    } else {
      maxColumnsPerPage = totalNumColumns;
    }

    // Make the body node.
    var bodyNode = dom.byId("body");

    // Special case if we are doing all the columns in one go.
    if (pageless || maxColumnsPerPage >= totalNumColumns) {
      var pageNode;
      if (thisBoardHasSidebar) {
        var pageNodes = addPagesWithSidebar(
          bodyNode,
          orderedRowTypes,
          totalNumColumns,
          maxRowsPerPage
        );
        console.assert(pageNodes.length == 1);
        pageNode = pageNodes[0];
      }

      var retVal = addPagesWithNextNColumns(
        bodyNode,
        orderedRowTypes,
        maxRowsPerPage,
        totalNumColumns,
        totalNumColumns,
        0,
        pageNode
      );
      console.assert(retVal, "Doug: addGameBoard: retVal is null");
      console.assert(
        retVal.allPageNodes,
        "Doug: addGameBoard: retVal.allPageNodes is null"
      );
      var allPageNodes = retVal.allPageNodes;
      console.assert(
        allPageNodes.length == 1,
        "Doug: addGameBoard: allPageNodes.length = " + allPageNodes.length
      );
      var pageNode = allPageNodes[0];
      if (pageless) {
        domStyle.set(pageNode, {
          width: "unset",
          height: "unset",
          padding: "0px",
        });
      }
    } else {
      if (thisBoardHasSidebar) {
        addPagesWithSidebar(
          bodyNode,
          orderedRowTypes,
          totalNumColumns,
          maxRowsPerPage
        );
      }

      var numColumnsAlreadyHandled = 0;
      while (numColumnsAlreadyHandled < totalNumColumns) {
        debugLog.debugLog(
          "GameBoard",
          "Doug: totalNumColumns = " + totalNumColumns
        );
        debugLog.debugLog(
          "GameBoard",
          "Doug: numColumnsAlreadyHandled = " + numColumnsAlreadyHandled
        );
        var retVal = addPagesWithNextNColumns(
          bodyNode,
          orderedRowTypes,
          maxRowsPerPage,
          totalNumColumns,
          maxColumnsPerPage,
          numColumnsAlreadyHandled
        );
        console.assert(retVal, "Doug: addGameBoard: retVal is null");
        console.assert(
          retVal.numColumnsThisStrip,
          "Doug: addGameBoard: retVal.numColumnsThisStrip is null"
        );
        var numColumns = retVal.numColumnsThisStrip;
        debugLog.debugLog("GameBoard", "Doug: numColumns = " + numColumns);
        numColumnsAlreadyHandled += numColumns;
        debugLog.debugLog(
          "GameBoard",
          "Doug: final numColumnsAlreadyHandled = " + numColumnsAlreadyHandled
        );
      }
    }
  }

  function fixupMarkerStyling(marker) {
    var style = {};
    style["margin"] = "0px";
    style["position"] = "absolute";
    domStyle.set(marker, style);
  }

  // columnnIndex is 0-based, ignoring the sidebar.
  function addMarker(
    rowIndex,
    columnIndex,
    markerType,
    opt_classArray,
    opt_additionalConfig
  ) {
    var rowId = gameUtils.getRowId(rowIndex);
    var rowNode = dom.byId(rowId);
    // add a marker to this element.
    var elementNode = gameUtils.getElementFromRow(rowNode, columnIndex);
    // add marker here.
    var marker = markers.addMarker(
      elementNode,
      markerType,
      opt_classArray,
      opt_additionalConfig
    );
    fixupMarkerStyling(marker);
    return marker;
  }

  function storeConveyorTileId(rowIndex, columnIndex, conveyorTileId) {
    var rowIndexString = "X_" + rowIndex.toString();
    var columnIndexString = "X_" + columnIndex.toString();

    if (!conveyorTileIdsByRowThenColumn[rowIndexString]) {
      conveyorTileIdsByRowThenColumn[rowIndexString] = {};
    }
    conveyorTileIdsByRowThenColumn[rowIndexString][columnIndexString] =
      conveyorTileId;
  }

  function getStoredConveyorTileId(rowIndex, columnIndex) {
    var rowIndexString = "X_" + rowIndex.toString();
    var columnIndexString = "X_" + columnIndex.toString();

    if (!conveyorTileIdsByRowThenColumn[rowIndexString]) {
      return null;
    }
    return conveyorTileIdsByRowThenColumn[rowIndexString][columnIndexString];
  }

  function getStoredConveyorTile(rowIndex, columnIndex) {
    var conveyorTileId = getStoredConveyorTileId(rowIndex, columnIndex);
    if (!conveyorTileId) {
      return null;
    }
    var conveyorTiles = query(`#${conveyorTileId}`);
    return conveyorTiles[0];
  }

  function getNextConveyorTileId() {
    return `conveyorTile_${addedConveyorTileIndex++}`;
  }

  function placeConveyorTileOnBoard(rowIndex, columnIndex, opt_classArray) {
    var slotId = gameUtils.getSlotId(rowIndex, columnIndex);
    var slot = dom.byId(slotId);
    var conveyorTileId = getNextConveyorTileId();
    var conveyorTile = conveyorTiles.addCrossTile(
      slot,
      conveyorTileId,
      opt_classArray
    );

    domStyle.set(conveyorTile, {
      "margin-left": `${gameUtils.conveyorTileOnBoardLeftMargin}px`,
      "margin-top": `${gameUtils.conveyorTileOnBoardTopMargin}px`,
      "z-index": `${gameUtils.conveyorTileZIndex}`,
    });

    storeConveyorTileId(rowIndex, columnIndex, conveyorTileId);

    return conveyorTile;
  }

  function getConveyorTileInSlot(rowIndex, columnIndex) {
    var conveyorTile = getStoredConveyorTile(rowIndex, columnIndex);
    if (conveyorTile) {
      return [conveyorTile, true];
    }
    conveyorTile = getStoredConveyorTile(rowIndex, columnIndex - 1);
    if (conveyorTile) {
      return [conveyorTile, false];
    }
    return [null, false];
  }

  function highlightNode(node, color, opt_extra) {
    var variable = opt_extra ? "30px" : "5px";
    domStyle.set(node, {
      "box-shadow": `0 0 ${variable} ${variable} ${color}`,
      "background-color": color,
    });
  }

  function highlightQueryResult(node, queryArg, color) {
    var nodes = query(queryArg, node);
    for (var i = 0; i < nodes.length; i++) {
      var element = nodes[i];
      highlightNode(element, color);
    }
  }

  function highlightConveyorTile(
    rowIndex,
    columnIndex,
    color,
    opt_translucentColor
  ) {
    var conveyorTile = getStoredConveyorTile(rowIndex, columnIndex);
    if (conveyorTile) {
      if (domClass.contains(conveyorTile, "ghost") && opt_translucentColor) {
        highlightNode(conveyorTile, opt_translucentColor, true);
      } else {
        highlightNode(conveyorTile, color, true);
      }
    }
  }

  function getSlotAndHighlightContents(rowIndex, columnIndex, color) {
    var slot = gameUtils.getSlot(rowIndex, columnIndex);
    if (!slot) {
      return null;
    }
    // highlight elements, markers, box cards in this slot.
    var elementId = gameUtils.getElementId(columnIndex);
    highlightQueryResult(slot, "#" + elementId, color);
    highlightQueryResult(slot, ".marker", color);
    highlightQueryResult(slot, ".box", color);
    return slot;
  }

  function addToken(parent, color, text) {
    var node = gameUtils.addDiv(parent, ["token"], "token");
    domStyle.set(node, {
      "background-color": color,
    });
    gameUtils.addStandardBorder(node);

    gameUtils.addDiv(node, ["text"], "text", text);

    return node;
  }

  function highlightElementAndBeltsInSlot(rowIndex, columnIndex, color) {
    var slot = getSlotAndHighlightContents(rowIndex, columnIndex, color);
    if (!slot) {
      return false;
    }

    // Find the tile, if any, on this space.
    var [conveyorTile, isLeft] = getConveyorTileInSlot(rowIndex, columnIndex);

    if (conveyorTile) {
      var beltQuery = isLeft ? ".belt.left" : ".belt.right";
      var belts = query(beltQuery, conveyorTile);
      var belt = belts[0];
      highlightQueryResult(belt, ".beltSegment", color);
    } else {
      // Find the belt embedded on board, if any, on this space.
      var belts = query(".belt", slot);
      if (belts) {
        belt = belts[0];
        highlightQueryResult(belt, ".beltSegment", color);
      }
    }
    return true;
  }

  function getColumnIndexNextRow(rowIndex, columnIndex) {
    var [conveyorTile, isLeft] = getConveyorTileInSlot(rowIndex, columnIndex);
    if (conveyorTile) {
      if (isLeft) {
        return columnIndex + 1;
      } else {
        return columnIndex - 1;
      }
    }
    return columnIndex;
  }

  function highlightPath(columnIndex, color) {
    // Go thru each row: find the slot on the path, highlight element and belt stuff in that slot.
    var columnIndexThisRow = columnIndex;
    // First row is numbers, skip that.
    var rowIndex = 1;
    while (true) {
      var success = highlightElementAndBeltsInSlot(
        rowIndex,
        columnIndexThisRow,
        color
      );
      if (!success) {
        break;
      }
      columnIndexThisRow = getColumnIndexNextRow(rowIndex, columnIndexThisRow);
      rowIndex++;
    }
  }

  // columnnIndex is 0-based, ignoring the sidebar.
  function addBox(nutType, rowIndex, columnIndex, opt_classArray) {
    var boxesRowId = gameUtils.getRowId(rowIndex);
    var boxesRow = dom.byId(boxesRowId);
    var element = gameUtils.getElementFromRow(boxesRow, columnIndex);
    // add an oredr card to this element.
    return cards.addBoxCardSingleNut(
      element,
      nutType,
      columnIndex,
      opt_classArray
    );
  }

  // This returned object becomes the defined value of this module
  return {
    // Can be used to make a board in sections or a complete board.
    addGameBoard: addGameBoard,

    addMarker: addMarker,
    addBox: addBox,
    placeConveyorTileOnBoard: placeConveyorTileOnBoard,
    highlightPath: highlightPath,
    highlightQueryResult: highlightQueryResult,
    highlightConveyorTile: highlightConveyorTile,
    getSlotAndHighlightContents: getSlotAndHighlightContents,
    addToken: addToken,
  };
});

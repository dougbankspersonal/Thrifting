define([
  "javascript/debugLog",
  "javascript/gameUtils",
  "dojo/dom-style",
  "dojo/domReady!",
], function (debugLog, gameUtils, domStyle) {
  var numRows = 10;
  var numColumns = 10;
  var titleRowHeight = 80;
  var cellBorder = 3;
  var cellInnerWidth = 50;
  var cellInnerHeight = cellInnerWidth;
  var cellWidth = cellInnerWidth + 2 * cellBorder;
  var cellHeight = cellInnerHeight + 2 * cellBorder;
  var normalRowHeight = cellHeight;
  var normalRowMargin = 10;
  var cellSideMargin = normalRowMargin / 2;
  var totalHeight =
    titleRowHeight + numRows * normalRowHeight + numRows * normalRowMargin;
  var totalWidth = numColumns * (cellWidth + cellSideMargin * 2);

  function addMainDiv(parentNode) {
    var mainDiv = gameUtils.addDiv(parentNode, ["main_div"], "mainDiv", "");
    domStyle.set(mainDiv, {
      height: totalHeight + "px",
      width: totalWidth + "px",
      border: "4px solid black",
      padding: "10px",
    });
    return mainDiv;
  }

  function addTitle(parentNode) {
    var titleRow = gameUtils.addRow(parentNode, ["title_row"], 0);
    domStyle.set(titleRow, {
      width: "100%",
      height: titleRowHeight + "px",
    });

    var titleText = gameUtils.addDiv(
      titleRow,
      ["title_text"],
      "titleText",
      "Scoring Track"
    );
    domStyle.set(titleText, {
      width: "100%",
      height: "100%",
      "line-height": titleRowHeight + "px",
    });
  }

  function addNthRow(parentNode, rowIndex) {
    var row = gameUtils.addRow(parentNode, ["scoring_row"], rowIndex + 1);
    domStyle.set(row, {
      width: "100%",
      height: normalRowHeight + "px",
      "margin-top": normalRowMargin + "px",
      "justify-content": "center",
    });
    for (j = 0; j < numColumns; j++) {
      var div = gameUtils.addDiv(
        row,
        ["scoring_cell"],
        "scoringCell",
        `${rowIndex * 10 + j}`
      );
      domStyle.set(div, {
        width: cellInnerWidth + "px",
        height: cellInnerHeight + "px",
        "font-size": "20px",
        "text-align": "center",
        "line-height": cellInnerHeight + "px",
        border: cellBorder + "px solid black",
        "margin-left": cellSideMargin + "px",
        "margin-right": cellSideMargin + "px",
      });
    }
  }

  function makeScoringTrack(dom) {
    // Make the body node.
    var bodyNode = dom.byId("body");

    debugLog.debugLog("ScoringTrack", "Doug: in main");
    var pageNode = gameUtils.addPageOfItems(bodyNode);

    var mainDiv = addMainDiv(pageNode);

    addTitle(mainDiv);

    for (i = 0; i < numRows; i++) {
      addNthRow(mainDiv, i);
    }
  }

  return {
    makeScoringTrack: makeScoringTrack,
  };
});

define(["sharedJavascript/genericMeasurements", "dojo/domReady!"], function (
  genericMeasurements
) {
  var smallCardWidth = 160;
  var smallCardHeight = 1.4 * smallCardWidth;
  var smallCardBackFontSize = 24;

  var smallCardFitHorizontally = Math.floor(
    genericMeasurements.adjustedPageWidth / smallCardWidth
  );
  var smallCardFitVertically = Math.floor(
    genericMeasurements.adjustedPageHeight / smallCardHeight
  );
  var smallCardsPerPage = smallCardFitHorizontally * smallCardFitVertically;

  return {
    smallCardWidth: smallCardWidth,
    smallCardHeight: smallCardHeight,
    smallCardBackFontSize: smallCardBackFontSize,
    smallCardsPerPage: smallCardsPerPage,
  };
});

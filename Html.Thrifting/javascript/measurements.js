define(["sharedJavascript/genericMeasurements", "dojo/domReady!"], function (
  genericMeasurements
) {
  var clothesCardIconSizePx = genericMeasurements.standardCardWidthPx / 3 - 20;
  var paramCardIconSizePx = genericMeasurements.smallCardWidthPx * 0.7;

  return {
    clothesCardIconSizePx: clothesCardIconSizePx,
    paramCardIconSizePx: paramCardIconSizePx,
  };
});

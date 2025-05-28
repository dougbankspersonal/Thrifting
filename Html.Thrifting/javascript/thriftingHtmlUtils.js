// Given a piece type and a style, return a list of specific item names.
// E.g. a "Top" in "[parameters.Bohemian]" style might be a "Peasant Blouse", "Tunic Top", or "Off-the-Shoulder Top".
define([
  "sharedJavascript/htmlUtils",
  "javascript/parameters",
  "dojo/domReady!",
], function (htmlUtils, parameters) {
  function addNameValuePair(parentNode, name, value) {
    var nvp = htmlUtils.addDiv(parentNode, ["name_value_pair"], "nvp");
    htmlUtils.addDiv(nvp, ["name"], "name", name.toString() + ":<nbsp>");
    htmlUtils.addDiv(nvp, ["value"], "value", value.toString());
  }

  function addStyleClasses(classArray, style) {
    classArray.push(parameters.styleCssClass);
    classArray.push(parameters.paramToCssClass[style]);
  }

  function addColorSchemeClasses(classArray, colorScheme) {
    classArray.push(parameters.colorSchemeCssClass);
  }

  function addPieceClasses(classArray, piece) {
    classArray.push(parameters.pieceCssClass);
    classArray.push(parameters.paramToCssClass[piece]);
  }

  function makeImportantText(text) {
    return "<importantText>" + text + "</importantText>";
  }

  function makeUnimportantText(text) {
    return "<unimportantText>" + text + "</unimportantText>";
  }

  return {
    addNameValuePair: addNameValuePair,
    addStyleClasses: addStyleClasses,
    addColorSchemeClasses: addColorSchemeClasses,
    addPieceClasses: addPieceClasses,
    makeImportantText: makeImportantText,
    makeUnimportantText: makeUnimportantText,
  };
});

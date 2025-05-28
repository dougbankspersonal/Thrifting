define(["dojo/domReady!"], function () {
  var Bottom = "Bottom";
  var Dress = "Dress";
  var Hat = "Hat";
  var Shoes = "Shoes";
  var Top = "Top";
  var Wrap = "Wrap";

  var EarthTones = "Earth Tones";
  var JewelTones = "Jewel Tones";
  var Pastels = "Pastels";
  var Monochrome = "Monochrome";

  var Bohemian = "Bohemian";
  var Retro = "Retro";
  var Classic = "Classic";
  var Elegant = "Elegant";
  var Whimsical = "Whimsical";

  // For now I will auto generate deterministically because there are too many to write by hand.
  var orderedPieces = [Top, Bottom, Shoes, Dress, Hat, Wrap];
  var orderedColorSchemes = [EarthTones, JewelTones, Pastels, Monochrome];
  var orderedStyles = [Bohemian, Retro, Classic, Elegant, Whimsical];

  var parameterNamePieces = "pieces";
  var parameterNameColorSchemes = "colorSchemes";
  var parameterNameStyles = "styles";

  var orderedparameterNames = [
    parameterNamePieces,
    parameterNameColorSchemes,
    parameterNameStyles,
  ];

  var parameterNamesToParameterValues = {
    [parameterNamePieces]: orderedPieces,
    [parameterNameColorSchemes]: orderedColorSchemes,
    [parameterNameStyles]: orderedStyles,
  };

  var pieceCssClass = "piece";
  var styleCssClass = "style";
  var colorSchemeCssClass = "color_scheme";

  var paramToCssClass = {
    [EarthTones]: "earth_tones",
    [JewelTones]: "jewel_tones",
    [Pastels]: "pastels",
    [Monochrome]: "monochrome",

    [Bohemian]: "bohemian",
    [Retro]: "retro",
    [Classic]: "classic",
    [Elegant]: "elegant",
    [Whimsical]: "whimsical",

    [Top]: "top",
    [Bottom]: "bottom",
    [Shoes]: "shoes",
    [Dress]: "dress",
    [Hat]: "hat",
    [Wrap]: "wrap",
  };

  var colorSchemeHexColorStrings = {
    [EarthTones]: "#DEB887",
    [JewelTones]: "#1070c0",
    [Pastels]: "#e09090",
    [Monochrome]: "#808080",
  };

  return {
    Top: Top,
    Bottom: Bottom,
    Shoes: Shoes,
    Dress: Dress,
    Hat: Hat,
    Wrap: Wrap,

    EarthTones: EarthTones,
    JewelTones: JewelTones,
    Pastels: Pastels,
    Monochrome: Monochrome,

    Bohemian: Bohemian,
    Retro: Retro,
    Classic: Classic,
    Elegant: Elegant,
    Whimsical: Whimsical,

    orderedPieces: orderedPieces,
    orderedColorSchemes: orderedColorSchemes,
    orderedStyles: orderedStyles,

    orderedparameterNames: orderedparameterNames,
    parameterNamesToParameterValues: parameterNamesToParameterValues,
    paramToCssClass: paramToCssClass,

    pieceCssClass: pieceCssClass,
    styleCssClass: styleCssClass,
    colorSchemeCssClass: colorSchemeCssClass,

    parameterNamePieces: parameterNamePieces,
    parameterNameColorSchemes: parameterNameColorSchemes,
    parameterNameStyles: parameterNameStyles,

    colorSchemeHexColorStrings: colorSchemeHexColorStrings,
  };
});

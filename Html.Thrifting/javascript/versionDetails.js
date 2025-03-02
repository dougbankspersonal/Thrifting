define(["javascript/rowTypes", "dojo/domReady!"], function (rowTypes) {
  var version_004_03 = "004_03";
  var version_onePager = "onePager";
  var version_005 = "005";
  var version_006 = "006";

  var version = version_004_03;

  function setVersion(_version) {
    version = _version;
  }

  var orderedRowTypesByVersion = {};
  orderedRowTypesByVersion[version_004_03] = [
    rowTypes.RowTypes.Number,
    rowTypes.RowTypes.Dispenser,
    rowTypes.RowTypes.Conveyor,
    rowTypes.RowTypes.Conveyor,
    rowTypes.RowTypes.Salter,
    rowTypes.RowTypes.Conveyor,
    rowTypes.RowTypes.Conveyor,
    rowTypes.RowTypes.Squirrel,
    rowTypes.RowTypes.Conveyor,
    rowTypes.RowTypes.Conveyor,
    rowTypes.RowTypes.Boxes,
  ];

  orderedRowTypesByVersion[version_005] = [
    rowTypes.RowTypes.Number,
    rowTypes.RowTypes.Dispenser,
    rowTypes.RowTypes.Conveyor,
    rowTypes.RowTypes.Conveyor,
    rowTypes.RowTypes.Salter,
    rowTypes.RowTypes.Conveyor,
    rowTypes.RowTypes.Squirrel,
    rowTypes.RowTypes.Conveyor,
    rowTypes.RowTypes.Roaster,
    rowTypes.RowTypes.Conveyor,
    rowTypes.RowTypes.Conveyor,
    rowTypes.RowTypes.BoxRobots,
  ];

  orderedRowTypesByVersion[version_onePager] = [
    rowTypes.RowTypes.Number,
    rowTypes.RowTypes.Start,
    rowTypes.RowTypes.Path,
    rowTypes.RowTypes.Path,
    rowTypes.RowTypes.Heart,
    rowTypes.RowTypes.Path,
    rowTypes.RowTypes.Skull,
    rowTypes.RowTypes.Path,
    rowTypes.RowTypes.Heart,
    rowTypes.RowTypes.Path,
    rowTypes.RowTypes.Path,
    rowTypes.RowTypes.End,
  ];

  orderedRowTypesByVersion[version_006] = [
    rowTypes.RowTypes.Dispenser,
    rowTypes.RowTypes.Conveyor,
    rowTypes.RowTypes.Conveyor,
    rowTypes.RowTypes.Conveyor,
    rowTypes.RowTypes.Conveyor,
    rowTypes.RowTypes.Conveyor,
    rowTypes.RowTypes.Conveyor,
    rowTypes.RowTypes.Boxes,
  ];

  function getOrderedRowTypes() {
    return orderedRowTypesByVersion[version];
  }

  function getTotalNumColumns() {
    return 8;
  }

  return {
    version_004_03: version_004_03,
    version_005: version_005,
    version_onePager: version_onePager,
    version_006: version_006,

    setVersion: setVersion,
    getOrderedRowTypes: getOrderedRowTypes,
    getTotalNumColumns: getTotalNumColumns,
  };
});

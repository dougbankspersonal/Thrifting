define([
	'dojo/domReady!'
], function() {
	var Number = 1
	var Dispenser = 2
	var Conveyor = 3
	var Squirrel = 4
	var Roaster = 5
	var Salter = 6
	var Boxes = 7
	var Heart = 8
	var Skull = 9
	var Start = 10
	var End = 11
	var Path = 12

	var standardRowHeight = 180;
	var boxesRowHeight = standardRowHeight * 0.5

	var RowTypes = {
		// Can be used to make a board in sections or a complete board.
		Number: Number,
		Dispenser : Dispenser,
		Conveyor: Conveyor,
        Squirrel: Squirrel,
		Roaster: Roaster,
		Salter: Salter,
		Boxes: Boxes,
		Heart: Heart,
		Skull: Skull,
		Start: Start,
		End: End,
		Path: Path,
	}

	function getRowTitle(rowType)
	{
		switch (rowType) {
			case Boxes:
				return "Boxes"
			case Conveyor:
				return "Conveyors"
			case Dispenser:
				return "Dispensers"
			case Path:
				return "Paths"
			case Salter:
				return "Salters"
			case Roaster:
				return "Roasters"
			case Squirrel:
				return "Squirrel"
			case Heart:
				return "Hearts"
			case Skull:
				return "Skulls"
			case Start:
				return "Start"
			case End:
				return "End"
		}
		return null
	}

	function getSidebarInfo(rowType) {
		var sidebarInfo = {}
		sidebarInfo.title = getRowTitle(rowType)
		return sidebarInfo
	}

	function getRowEntityName(rowType) {
		switch (rowType) {
			case Salter:
				return "Salter"
			case Roaster:
				return "Roaster"
			case Squirrel:
				return "Squirrel"
		}
		return null
	}

	function getRowHeight(rowType) {
		if (rowType == Boxes)
		{
			return boxesRowHeight
		}
		return standardRowHeight
	}

	return {
		RowTypes: RowTypes,
		boxesRowHeight: boxesRowHeight,
		standardRowHeight: standardRowHeight,

		getRowTitle: getRowTitle,
		getRowEntityName: getRowEntityName,
		getSidebarInfo: getSidebarInfo,
		getRowHeight: getRowHeight,
	}
})
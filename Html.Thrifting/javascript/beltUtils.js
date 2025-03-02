define([
	'javascript/gameUtils',
	'dojo/dom-style',
	'dojo/domReady!',
], function(gameUtils, domStyle) {

    function addBeltSegment(parentNode, xOffset, yOffset, opt_rads) {
		var beltSegment = gameUtils.addDiv(parentNode, ["beltSegment"], "beltSegment")
		var style = {
			"left": `${xOffset}px`,
			"top": `${yOffset}px`,
			"z-index": gameUtils.beltSegmentZIndex,
			"height": `${gameUtils.beltSegmentHeight}px`,
			"width": `${gameUtils.beltSegmentWidth}px`,
		}
		if (opt_rads != null) {
			style["transform"] = `translate(-50%, -50%	) rotate(${opt_rads}rad)`
		}

		domStyle.set(beltSegment, style)
		gameUtils.beltSegmentZIndex--
		return beltSegment
	}

    // This returned object becomes the defined value of this module
    return {
		addBeltSegment: addBeltSegment,
	};
});
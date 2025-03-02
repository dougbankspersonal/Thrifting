/* Deprecated */

define([
	'javascript/gameUtils',
	'javascript/cards',
	'dojo/dom-style',
	'dojo/domReady!',
], function(gameUtils, cards, domStyle) {

    var warehouseCellPaddingPx = 3
    var boxWidthPx = 120
    var boxHeightPx = boxWidthPx/2
    var cellWidthPx = boxWidthPx + warehouseCellPaddingPx
    var cellHeightPx = boxHeightPx + warehouseCellPaddingPx

    var pointsHeight = 50
    var padding = 20

    function addRow(parentNode) {
        return gameUtils.addDiv(wrapper, ["row"], "row")
    }

    function addCell(parentNode, isFilled) {
        var classes = ["cell"]
        if (isFilled) {
            classes.push("filled")
        }
        var cell = gameUtils.addDiv(parentNode, classes, "cell")
        domStyle.set(cell, {
            "width": `${cellWidthPx}px`,
            "height": `${cellHeightPx}px`,
        })
    }

    function addTemplateDesc(parentNode, templateCardConfig) {
        var wrapper = gameUtils.addDiv(parentNode, ["wrapper"], "wrapper")
        domStyle.set(wrapper, {
            "padding-top": `${padding}px`,
            "padding-left": `${padding}px`,
            "padding-bottom": `${padding}px`,
            "padding-right": `${padding}px`,
        })

        var type = templateCardConfig.type

        var row
        if (type == "cross") {
            row = addRow(wrapper)
            addCell(row, false)
            addCell(row, true)
            addCell(row, false)
            row = addRow(wrapper)
            addCell(row, true)
            addCell(row, true)
            addCell(row, true)
            row = addRow(wrapper)
            addCell(row, false)
            addCell(row, true)
            addCell(row, false)
        }

        var points = templateCardConfig.points
        var scoreNode = gameUtils.addDiv(wrapper, ["points"], "points")
        domStyle.set(scoreNode, {
            "top": `${pointsTop}px`,
            "text-align": "center",
            "height": `${pointsHeight}px`,
            "width": `${smallCardWidth - padding*2}px`,
        })

        if (points == 1) {
            scoreNode.innerHTML = "1 point"
        } else {
            scoreNode.innerHTML = points.toString().concat(" points")
        }

        return wrapper
    }

    function addTemplateCard(parent, index, configs) {
        var templateCardConfig = configs[index]
        var idElements = [
            "template",
            index.toString(),
        ]
        var id = idElements.join(".")
        var classArray = []
        classArray.push("template")
        var node = cards.addCardFront(parent, classArray, id)
        addTemplateDesc(node, templateCardConfig)
        return node
}

    // This returned object becomes the defined value of this module
    return {
		addTemplateCard: addTemplateCard,
	};
});
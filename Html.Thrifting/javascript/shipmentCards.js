/* Deprecated */

define([
	'javascript/gameUtils',
	'javascript/cards',
	'dojo/dom-style',
	'dojo/domReady!',
], function(gameUtils, cards, domStyle) {

    var pointsHeight = 50
    var padding = 20

    function addShipmentDesc(parentNode, shipmentCardConfig) {
        var smallCardWidth = gameUtils.cardWidth
        var smallCardHeight = gameUtils.cardHeight
        var pointsTop = smallCardHeight - pointsHeight

        var wrapper = gameUtils.addDiv(parentNode, ["wrapper"], "wrapper")
        domStyle.set(wrapper, {
            "padding-top": `${padding}px`,
            "padding-left": `${padding}px`,
            "padding-bottom": `${padding}px`,
            "padding-right": `${padding}px`,
        })

        var nuts = shipmentCardConfig.nuts

        for (var i = 0; i < nuts.length; i++) {
            var nut = nuts[i]
            var nutType = nut.type
            var prop = gameUtils.addDiv(wrapper, ["requirement"], "requirement")
            gameUtils.addImage(prop, ["nutType", nutType], "nutType")
        }

        var points = shipmentCardConfig.points
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

    function addShipmentCard(parent, index, shipmentCardConfigs) {
        var shipmentCardConfig = shipmentCardConfigs[index]
        var idElements = [
            "shipment",
            index.toString(),
        ]
        var id = idElements.join(".")
        var classArray = []
        classArray.push("shipment")
        var node = cards.addCardFront(parent, classArray, id)
        addShipmentDesc(node, shipmentCardConfig)
        return node
    }

    // This returned object becomes the defined value of this module
    return {
		addShipmentCard: addShipmentCard,
	};
});
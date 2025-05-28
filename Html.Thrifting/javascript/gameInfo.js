// For stuff like rules variants, etc.
define(["dojo/domReady!"], function () {
  var maxPlayers = 8;
  var minPlayers = 2;

  var orderedPlayerColors = [
    "rgb(230, 230, 230)", // Player 0
    "rgb(181, 101, 29)", // Player 1
    "rgb(230, 100, 100)", // Player 2
    "rgb(230, 165, 100)", // Player 3
    "rgb(230, 230, 100)", // Player 4
    "rgb(100, 230, 100)", // Player 5
    "rgb(100, 100, 230)", // Player 6
    "rgb(165, 100, 230)", // Player 7
  ];

  return {
    maxPlayers: maxPlayers,
    minPlayers: minPlayers,
    orderedPlayerColors: orderedPlayerColors,
  };
});

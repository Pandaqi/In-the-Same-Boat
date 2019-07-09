export const mainStyle = {
	mainText: function(wordWrapWidth = 1000, fill = "#333") { 
		return { font: "Pirata One", fontSize: 26, fill: fill, wordWrap: true, wordWrapWidth: wordWrapWidth }
	},

	subText: function(wordWrapWidth = 1000, fill = "#666") {
		return { font: "Arial", fontSize: 12, fill: fill, wordWrap: true, wordWrapWidth: wordWrapWidth }
	},

	timerText: function() {
		return { font: "Pirata One", fontSize: 42, fill: "#FF0000" }
	}
}
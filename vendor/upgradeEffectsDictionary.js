// The upgrade effects dictionary contains the BENEFIT (or EFFECT/RESULT) of each upgrade
// The structure is as follows:
//  - Top level = array, index represents role
//     - 2nd level = array, index represents level (you're upgrading TO)
//        - 3rd level = object, key is the variable/thing being updated, value is to WHAT it's updated

const UPGRADE_EFFECT_DICT = [
	[], // captain (has no upgrades)
	[ { angle: 0}, { angle: 45 }, { angle: 45}, { angle: 90 }, { angle: 90 }, { angle: 135 } ], // first mate
	[ { range: 1, detail: 0 }, { range: 2, detail: 0 }, { range: 3, detail: 0 }, { range: 3, detail: 1 }, { range: 4, detail: 1 }, { range: 5, detail: 2 } ], // cartographer
	[ { speed: 1, change: 1 }, { speed: 2, change: 1}, { speed: 3, change: 1}, { speed: 3, change: 2}, { speed: 4, change: 2}, { speed: 5, change: 3} ], // sailor
	[ { range: 1, spread: 0 }, { range: 2, spread: 0}, { range: 2, spread: 1}, { range: 3, spread: 1}, { range: 3, spread: 2}, { range: 4, spread: 2} ] // weapon specialist
]

module.exports = UPGRADE_EFFECT_DICT;
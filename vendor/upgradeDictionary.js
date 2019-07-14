// The upgrade dictionary contains the cost for each upgrade
// The structure is as follows:
//  - Top level = array, index represents role
//     - 2nd level = array, index represents level (you're upgrading TO)
//        - 3rd level = object, key is the resource, value is how many of them are needed

const UPGRADE_DICT = [
	[], // captain (has no upgrades)
	[ {}, { 2: 2 }, { 2: 4}, { 0: 2, 2: 6}, { 0: 5, 2: 8 }, { 0: 10, 2: 10 } ], // first mate
	[ {}, { 2: 2}, { 0: 2, 2: 5}, { 0: 4, 2: 8}, { 0: 6, 1: 1, 2: 10}, { 0: 10, 1: 2, 2: 10 } ], // cartographer
	[ {}, { 2: 2}, { 1: 1, 2: 6}, { 1: 2, 2: 8}, { 0: 2, 1: 2, 2: 10}, { 0: 5, 1: 3, 2: 10}], // sailor
	[ { 0: 5, 1: 1, 2: 10}, { 2: 4}, {1: 1, 2: 7}, { 0: 5, 2: 10}, { 0: 5, 1: 1, 2: 10}, { 0: 10, 1: 2, 2: 10 }] // weapon specialist
]

module.exports = UPGRADE_DICT;
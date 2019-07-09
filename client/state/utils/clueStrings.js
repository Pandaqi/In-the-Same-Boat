export const CLUE_STRINGS = [
	"They say <strong>@[name]'s treasure</strong> sank in the @[0] ocean", // 0 // deep or shallow
	"The <strong>Treasure of @[name]</strong> should be @[0] tiles from the nearest island", // 1 // integer
	"<strong>@[name]</strong> hid a treasure somewhere in sector @[0]", // 2 // sector number: 1 up to and including 9
	"There are @[0] docks within a @[1] tile radius of <strong>@[name]'s treasure</strong>", // 3 // integer, integer 
	"There are @[0] cities within a @[1] tile radius of <strong>@[name]'s treasure</strong>", // 4 // integer, integer 
	"There are @[0] unique islands within a @[1] tile radius of <strong>@[name]'s treasure</strong>", // 5 // integer, integer 
	"The dock nearest to <strong>@[name]'s treasure</strong> is <em>@[0]</em>", // 6 // dock name
	"The island nearest to <strong>@[name]'s treasure</strong> is <em>@[0]</em>", // 7 // island name
	"The town nearest to <strong>@[name]'s treasure</strong> is <em>@[0]</em>", // 8 // city name
	"<em>@[0]</em> is currently closest to <strong>@[name]'s treasure</strong>!", // 9 // player ship name

]
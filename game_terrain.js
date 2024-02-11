function create_terrain(color, button){
	return {
		'color':color,
		'button':button
	}
}

var GAME_DATA = {
	'MM1':{
		'terrains':{
			'water':create_terrain('#99FFFF', 'w'),
			'desert':create_terrain('#FFD481', 'd'),
		},
		'default map size':[16, 16]
	},

	'MM2':{
		'terrains':{
			'water':create_terrain('#99FFFF', 'w'),
			'desert':create_terrain('#FFD481', 'd'),
			'ice':create_terrain('#B3FFCC', 'i'),
			'bog':create_terrain('#CC99FF', 'b'),
			'mountains':create_terrain('#CFCFCF', 'm'),
			'forest':create_terrain('#66FF66', 'f')
		},
		'default map size':[16, 16]
	},

	'MMXeen':{
		'terrains':{
			'water':create_terrain('#99FFFF', 'w'),
			'mountains':create_terrain('#CFCFCF', 'm'),
			'forest':create_terrain('#66FF66', 'f'),
			'lava':create_terrain('#FF6A4D', 'l'),
			'deep_water':create_terrain('#8080FF', 'q'),
			'clouds':create_terrain('#FFB3FF', 'c'),
			'desert':create_terrain('#FFD481', 'd'),
		},
		'default map size':[16, 16]
	}
}

function create_terrain(color, button){ //Export important for tests
	return {
		'color':color,
		'button':button
	}
}

var GAME_DATA = {
	'FALLBACK':{ //Fallback is goldboxy
		'terrains':{
		},
		'default map size':[16, 16],
		'y_order':'ascending',
		'backspace':'revert'
	},

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
	},

	'Pool of Radiance':{
		'terrains':{
			'river':create_terrain('#99FFFF', 'w'),
		},
		'default map size':[16, 16],
		'y_order':'ascending',
		'backspace':'revert'
	},
	'Curse of the Azure Bonds':{
		'terrains':{
		},
		'default map size':[16, 16],
		'y_order':'ascending',
		'backspace':'revert'
	},
	'Secret of the Silver Blades':{
		'terrains':{
		},
		'default map size':[16, 16],
		'y_order':'ascending',
		'backspace':'revert'
	},
	'Pools of Darkness':{
		'terrains':{
			'muscle':create_terrain('#9B7D4F', 'm'),
		},
		'default map size':[16, 16],
		'y_order':'ascending',
		'backspace':'revert'
	}
}

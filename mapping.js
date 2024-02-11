var GRID_SIZE = [_CONFIG_MAX_MAP_SIZE, _CONFIG_MAX_MAP_SIZE];
var _local_terrains = GAME_DATA[_CONFIG_GAME]['terrains'];

var _local_grid_default;
if ('default map size' in GAME_DATA[_CONFIG_GAME]) _local_grid_default = GAME_DATA[_CONFIG_GAME]['default map size'];
else _local_grid_default = GRID_SIZE;


var controls = {
	'general_text': document.getElementById('general_text'),
	'scripts_text': document.getElementById('scripts_text'),
	'images_text': document.getElementById('images_text'),
	'point_images': document.getElementById('point_images'),

	'shorthand_text': document.getElementById('shorthand_text'),
	'fly': document.getElementById('fly'),
	'teleport': document.getElementById('teleport'),
	'maps_list': document.getElementById("maps_list"),
	'maps_adder': document.getElementById("adder"),
	'ground_truth': document.getElementById("ground_truth"),
	'map_general': document.getElementById('map_general'),
	'terrains':{},
	'input_used': document.getElementById("usable"),
	'input_borders': ["North", "East", "South", "West"].map((direction) => document.getElementById(`${direction}_border`)),
	'order': document.getElementById('order'),
	'map_size': document.getElementById('map_size'),
	'orderer': document.getElementById('orderer')
}

function checkboxes_terrains(){
	var terrains_div = document.getElementById('terrains');
	for (var terrain in _local_terrains){
		var _input = document.createElement('input');
		_input.type = 'checkbox';
		_input.name = terrain;
		_input.id = terrain;

		var _label = document.createElement('label');
		_label.innerHTML = terrain[0].toUpperCase() + terrain.slice(1);
		_label.htmlFor = terrain;

		terrains_div.appendChild(_input);
		terrains_div.appendChild(_label);
		controls['terrains'][terrain] = _input;
	}
}
checkboxes_terrains();

var map_element_overlays = {};

var integer_to_dir = {
	0: {'x':0, 'y':1},
	1: {'x':1, 'y':0},
	2: {'x':0, 'y':-1},
	3: {'x':-1, 'y':0},
}
var dir_to_arrow = {
	0: '&uarr;',
	1: '&rarr;',
	2: '&darr;',
	3: '&larr;'
}

var dir_to_border = {
	0:'Top',
	1:'Right',
	2:'Bottom',
	3:'Left'
}

var dir_to_cardinal = {
	0: 'N',
	1: 'E',
	2: 'S',
	3: 'W'
}
var cardinal_to_dir = {
	'N':0,
	'E':1,
	'S':2,
	'W':3
}

var current_state = {
	'marked':null,
	'direction':-1,
	'map':'_unknown'
}
current_focus = null;
presentation = {};

var points_data = {};
var general_data = {};
var is_map_changed = {};
points_data[current_state.map] = {};
general_data[current_state.map] = {};

function create_basic_point(){
	return {'used':false, 'borders':[false, false, false, false], 'input':'', 'general':'', 'scripts':'', 'images':'', 'terrains':new Set()};
}

function update_presentation(current_state){
	if (!current_state['marked']) return;
	current_state['marked']._arrow.innerHTML = dir_to_arrow[current_state.direction];
}

function set_changer(map){
	if (map == '_unknown') return;
	if (is_map_changed[map]) 
		map_element_overlays[map]._changer.style.backgroundColor = '#88CC00';
	else
		map_element_overlays[map]._changer.style.backgroundColor = 'rgba(0,0,0,0)';
}

function changer(map=null){
	if (map == null) map=current_state.map;
	if (map == '_unknown') return;
	is_map_changed[map] = true;
	set_changer(map);
}

function dechanger(map=null){
	if (map == null) map=current_state.map;
	if (map == '_unknown') return;
	is_map_changed[map] = false;
	set_changer(map);
}

function proper_background(point_data, signature){
	if (point_data.used) points[signature].style['backgroundColor'] = 'white';
	else points[signature].style['backgroundColor'] = 'grey';

	for (var terrain in _local_terrains){
		if (point_data['terrains'].has(terrain)) points[signature].style.backgroundColor = _local_terrains[terrain]['color'];
	}
}

function update_field(signature){
	var to_load = points_data[current_state.map];
	for (var i=0; i<4; i+=1){
		if (to_load[signature].borders[i]) points[signature].style[`border${dir_to_border[i]}`] = `1px dashed #CCCCCC`;
		else points[signature].style[`border${dir_to_border[i]}`] = '1px solid black';
	}
	proper_background(to_load[signature], signature);

	points[signature]._input.innerHTML = to_load[signature].input;
	for (var _ of [0, 1, 2, 3]){
		for (var minor in [0, 1]){
			points[signature]._teleports._mini_teleports[_]._minors[minor].style.background = 'rgba(0, 0, 0, 0)';
		}
	}
	points[signature]._teleports._mini_teleports[4].style.background = 'rgba(0, 0, 0, 0)';
	if (to_load[signature].scripts){
		var scripts = to_load[signature].scripts.split('\n');
		for (var script of scripts){
			if (script == 'undefined') continue;
			var proper_script = script.split(';');
			var color = '#AA0000'; //For W, WS
			if (proper_script[0] == 'P') color = '#008055';
			if (proper_script[0] == 'R') color = '#9900E6';

			var direction = proper_script[1];
			var base_teleport = points[signature]._teleports;
			if (direction.includes('N') || proper_script[0] == 'T'){
				var mini_teleports = base_teleport._mini_teleports[cardinal_to_dir['N']];
				mini_teleports._minors[0].style.background = `linear-gradient(to right bottom, rgba(0, 0, 0, 0) 50%, ${color} 50%)`;
				mini_teleports._minors[1].style.background = `linear-gradient(to right top, ${color} 50%, rgba(0, 0, 0, 0) 50%)`;
			}

			if (direction.includes('S') || proper_script[0] == 'T'){
				var mini_teleports = base_teleport._mini_teleports[cardinal_to_dir['S']];
				mini_teleports._minors[0].style.background = `linear-gradient(to right top, rgba(0, 0, 0, 0) 50%, ${color} 50%)`;
				mini_teleports._minors[1].style.background = `linear-gradient(to right bottom, ${color} 50%, rgba(0, 0, 0, 0) 50%)`;
			}

			if (direction.includes('W') || proper_script[0] == 'T'){
				var mini_teleports = base_teleport._mini_teleports[cardinal_to_dir['W']];
				mini_teleports._minors[0].style.background = `linear-gradient(to right bottom, rgba(0, 0, 0, 0) 50%, ${color} 50%)`;
				mini_teleports._minors[1].style.background = `linear-gradient(to right top, rgba(0, 0, 0, 0) 50%, ${color} 50%)`;
			}
			if (direction.includes('E') || proper_script[0] == 'T'){
				var mini_teleports = base_teleport._mini_teleports[cardinal_to_dir['E']];
				mini_teleports._minors[0].style.background = `linear-gradient(to right top, ${color} 50%, rgba(0, 0, 0, 0) 50%)`;
				mini_teleports._minors[1].style.background = `linear-gradient(to right bottom, ${color} 50%, rgba(0, 0, 0, 0) 50%)`;
			}
			if (proper_script[0] == 'R' || proper_script[0] == 'T') points[signature]._teleports._mini_teleports[4].style.background = color;
		}
	}
}

function update_part(map_name, movement, element){
	if (!general_data[map_name][movement] || general_data[map_name][movement] == '') element.style.display = 'none';

	else if (general_data[map_name][movement]!='undefined'){
		element.style.display = 'inline-block';
		element.onmouseover = function(){this.style.backgroundColor = '#440000';};
		element.onmouseout = function(){this.style.backgroundColor = '#880000';};

		element.onclick = function(){
			var new_direction, new_place;
			if (this._type == 'F'){
				new_direction = current_state.direction;
				if (new_direction == -1) new_direction = 0; //By default - northern
				new_place = general_data[map_name][movement];
			}
			else{
				var _tmp = general_data[map_name][movement].split(';');
				new_direction = cardinal_to_dir[_tmp[1]];
				new_place = _tmp[0];
			}

			change_map(this._overlay._element._map_name);

			current_state.direction = new_direction;
			current_state.marked = points[new_place];
			update_presentation(current_state);
		}
	}
}

function update_flight(map_name){
	if (map_name == '_unknown') return;
	update_part(map_name, 'fly', map_element_overlays[map_name]._flier);
	update_part(map_name, 'teleport', map_element_overlays[map_name]._teleporter);
}

function save_focus(map_switch=false){
	if (current_focus){
		var coordinate = current_focus._signature;
		var past_point = Object.assign({}, points_data[current_state.map][coordinate]);

		points_data[current_state.map][coordinate]['general'] = controls.general_text.value;
		points_data[current_state.map][coordinate]['scripts'] = controls.scripts_text.value;
		points_data[current_state.map][coordinate]['images'] = controls.images_text.value;
		points_data[current_state.map][coordinate]['input'] = controls.shorthand_text.value;

		for (var terrain in _local_terrains){
			if (controls['terrains'][terrain].checked) points_data[current_state.map][coordinate]['terrains'].add(terrain);
			else points_data[current_state.map][coordinate]['terrains'].delete(terrain);
		}

		points_data[current_state.map][coordinate].used = controls.input_used.checked;
		var ordering = ['N', 'E', 'S', 'W'];
		for (var index of [0, 1, 2, 3]){
			 points_data[current_state.map][coordinate].borders[cardinal_to_dir[ordering[index]]] = controls.input_borders[index].checked;
		}

		if (Object.entries(points_data[current_state.map][coordinate]).sort().toString() !== Object.entries(past_point).sort().toString())
			changer();

		if (!map_switch) update_field(coordinate);
	}
}


//TODO: Can be sped up
function redefine_map_size(map_data, new_map_size, old_map_size){
	var new_x = new_map_size[1], new_y = new_map_size[0];
	var old_x = old_map_size[1], old_y = old_map_size[0];

	var max_x = Math.max(new_x, old_x);
	var max_y = Math.max(new_y, old_y);

	var min_x = Math.min(new_x, old_x);
	var min_y = Math.min(new_y, old_y);

	for (var y=0; y<max_y; y++){
		for (var x=0; x<max_x; x++){
			if (y<min_y && x<min_x) continue;
			if (x<new_x && y<new_y) map_data[`${y} ${x}`] = create_basic_point();
			else if (x<old_x && y<old_y) delete map_data[`${y} ${x}`];
		}
	}
}

function save_map_data(){
	save_focus(true);
	general_data[current_state.map]['order'] = controls.order.value
	general_data[current_state.map]['ground truth'] = controls.ground_truth.checked;
	general_data[current_state.map]['fly'] = controls.fly.value;
	general_data[current_state.map]['teleport'] = controls.teleport.value;

	var old_map_size = general_data[current_state.map]['map size'];
	general_data[current_state.map]['map size'] = controls.map_size.value.split(',').map((x) => Number(x));

	if (old_map_size && (old_map_size[0] != general_data[current_state.map]['map size'][0] || old_map_size[1] != general_data[current_state.map]['map size'][1]) && current_state.map != '_unknown')
		redefine_map_size(points_data[current_state.map], general_data[current_state.map]['map size'], old_map_size);

	general_data[current_state.map]['map general'] = controls.map_general.value;
}

function load_map_presentation(to_load, map_name){
	current_state['map'] = map_name;
	resize_grid(general_data[map_name]['map size']);

	controls.ground_truth.checked = general_data[map_name]['ground truth'];
	controls.fly.value = general_data[map_name]['fly'];
	controls.teleport.value = general_data[map_name]['teleport']??'';

	controls.map_size.value = general_data[map_name]['map size'];

	if ('map general' in general_data[map_name]) controls.map_general.value = general_data[map_name]['map general'];
	else controls.map_general.value = '';

	if ('order' in general_data[map_name]) controls.order.value = general_data[map_name]['order'];
	else controls.order.value = '';

	for (var coordinates in to_load) update_field(coordinates);

	if (current_state['marked']){
		current_state['marked']._arrow.innerHTML = "";
		current_state.marked = null;
		current_state.direction = -1;
	}
}

function change_map(new_map){
	save_map_data();

	if (current_focus){
		current_focus._marking.style.background = 'rgba(0, 0, 0, 0)';
		current_focus = null;
	}
	if (map_element_overlays[current_state.map]){
		map_element_overlays[current_state.map]._element.style.backgroundColor = '#880000';
	}
	map_element_overlays[new_map]._element.style.backgroundColor = '#000000';
	update_flight(current_state.map);

	current_state['map'] = new_map;
	load_map_presentation(points_data[new_map], new_map);
}

function create_movement_overlay(letter){
	var flier = document.createElement('div');
	assign_style_to_element(flier, map_element_style);
	flier.style.width = "50px";
	flier.innerHTML = letter;
	flier._type = letter;
	flier.style.display = "none";
	return flier;
}

function create_new_map_overlay(map_name){
	var map_overlay = document.createElement('div');
	var new_map_element = document.createElement('div');

	var flier = create_movement_overlay('F');
	var teleporter = create_movement_overlay('T');

	var changer = document.createElement('div');
	var text = document.createElement('span');
	map_overlay.classList.add('map_overlay');

	assign_style_to_element(changer, {
		'position':'absolute', 
		'backgroundColor':'rgba(0, 0, 0, 0)',
		'top':'5px',
		'right':'5px',
		'width':'15px',
		'height':'15px',
		'borderRadius':'100%'
	});
	new_map_element._map_name = map_name;

	text.textContent = map_name;
	new_map_element.appendChild(changer);
	new_map_element.onclick = function(){
		change_map(this._map_name);
	};

	new_map_element.onmouseover = function(){
		if (current_state.map != this._map_name) this.style['backgroundColor'] = '#440000';
	}
	new_map_element.onmouseout = function(){
		if (current_state.map != this._map_name) this.style['backgroundColor'] = '#880000';
	}

	assign_style_to_element(new_map_element, map_element_style);
	new_map_element.style.position = 'relative';

	map_overlay.appendChild(new_map_element);
	map_overlay.appendChild(flier);
	map_overlay.appendChild(teleporter);

	new_map_element.appendChild(text);
	map_overlay._text = text;
	map_overlay._element = new_map_element;
	map_overlay._changer = changer;
	map_overlay._flier = flier;
	map_overlay._flier._overlay = map_overlay;

	map_overlay._teleporter = teleporter;
	map_overlay._teleporter._overlay = map_overlay;
	return map_overlay;
}

function initialize_map_data(map_name, grid_size){
	points_data[map_name] = {};

	for (var row_nr = 0; row_nr < grid_size[0]; row_nr+=1){
		for (var column_nr = 0; column_nr < grid_size[1]; column_nr+=1){
			points_data[map_name][`${row_nr} ${column_nr}`] = create_basic_point();
		}
	}
}

function get_map_size(points){
	all_points = Object.keys(points).map((x) => (x.split(' ').map((y) => Number(y))));

	var max_x = 0, max_y = 0;
	for (var coordinates of all_points){
		if (coordinates[0] > max_y) max_y = coordinates[0];
		if (coordinates[1] > max_x) max_x = coordinates[1];
	}
	return [max_y+1, max_x+1];
}

function create_data_dump(){
	var map_name = current_state['map'];
	save_map_data();
	var save_data = general_data[map_name];

	to_save = {'title':map_name, 'ground truth':save_data['ground truth'], 'fly':save_data['fly'], 'teleport':save_data['teleport'], 'map size':save_data['map size'], 'map general':save_data['map general'], 'order':save_data['order'], 'points':{}};

	for (var point_coordinate in points_data[map_name]){
		var point = points_data[map_name][point_coordinate];
		var terrains = [...point.terrains];

		to_save.points[point_coordinate] = {
			'used': point.used,
			'borders': point.borders,
			'input': point.input, //Move to shorthand
			'general': point.general??'',
			'scripts': point.scripts??'',
			'images': point.images??'',
			'terrains':[...point.terrains]
		}
	}
	return to_save;
}

function resize_grid(new_size){
	size_y = new_size[0];
	size_x = new_size[1];

	for (var y=0; y<GRID_SIZE[0]; y++){
		if (y<size_y) presentation['row_labels'][y].style.display = 'inline-block';
		else presentation['row_labels'][y].style.display = 'none';

		for (var x=0; x<GRID_SIZE[1]; x++){
			if (x<size_x && y<size_y) points[`${y} ${x}`].style.display = 'inline-block';
			else points[`${y} ${x}`].style.display = 'none';
		}
	}

	for (var x=0; x<GRID_SIZE[1]; x++){
		if (x<size_x) presentation['column_labels'][x].style.display = 'inline-block';
		else presentation['column_labels'][x].style.display = 'none';
	}
}

function create_grid(grid_size){
	var points = {};
	var row_with_labels = document.createElement('div');
	var basis = document.getElementById('map_proper');
	var wonder_golden = '#B37700';

	row_with_labels.style['position'] = 'sticky';
	row_with_labels.style['top'] = '0';

	var point_of_entry = document.createElement('div');
	assign_style_to_element(point_of_entry, standard_style);
	assign_style_to_element(point_of_entry, point_of_entry_style);
	point_of_entry.innerHTML = 'y\\x'
	row_with_labels.appendChild(point_of_entry);

	presentation['column_labels'] = {};
	for (var column_nr=0; column_nr<grid_size[1]; column_nr+=1){
		var column_label = document.createElement('div');
		column_label.innerHTML = `${column_nr}`;
		assign_style_to_element(column_label, standard_style);
		column_label.style['backgroundColor'] = wonder_golden;
		column_label.style['height'] = '50px';
		column_label.style['lineHeight'] = '50px';
		presentation['column_labels'][column_nr] = column_label;
		row_with_labels.appendChild(column_label);
	}
	basis.appendChild(row_with_labels);

	presentation['row_labels'] = {};
	for (var row_nr=grid_size[0]-1; row_nr>=0; row_nr-=1){
		var row = document.createElement('div');
		basis.appendChild(row);

		var row_label = document.createElement('div');
		assign_style_to_element(row_label, standard_style);
		row_label.style['backgroundColor'] = wonder_golden;
		row_label.style['width'] = '50px';
		row_label.innerHTML = `${row_nr}`;
		presentation['row_labels'][row_nr] = row_label;
		row.appendChild(row_label);

		for (var column_nr=0; column_nr<grid_size[1]; column_nr+=1){
			var point = document.createElement('div');

			var input_part = document.createElement('div');
			var arrow_part = document.createElement('div');
			var marking = document.createElement('div');
			var teleports = document.createElement('div');

			var north_teleport = document.createElement('div');
			var south_teleport = document.createElement('div');
			var west_teleport = document.createElement('div');
			var east_teleport = document.createElement('div');
			var mid_teleport = document.createElement('div');

			point.appendChild(arrow_part);
			point.appendChild(input_part);
			point.appendChild(marking);
			point.appendChild(teleports);

			teleports._mini_teleports = [north_teleport, east_teleport, south_teleport, west_teleport, mid_teleport];
			for (var mini_teleport of teleports._mini_teleports){
				teleports.appendChild(mini_teleport);
				assign_style_to_element(mini_teleport, mini_teleport_style);
			}
			mid_teleport.style.borderRadius = '100%';
			mid_teleport.style.top = `${single_distance_teleport}px`;
			mid_teleport.style.left = `${single_distance_teleport}px`;

			var n_left = document.createElement('div');
			var n_right = document.createElement('div');
			var s_left = document.createElement('div');
			var s_right = document.createElement('div');
			var e_top = document.createElement('div');
			var e_bottom = document.createElement('div');
			var w_top = document.createElement('div');
			var w_bottom = document.createElement('div');

			north_teleport._minors = [n_left, n_right];
			south_teleport._minors = [s_left, s_right];
			west_teleport._minors = [w_top, w_bottom];
			east_teleport._minors = [e_top, e_bottom];
			for (var mini_teleport of teleports._mini_teleports.slice(0, -1)){
				for (var minor of mini_teleport._minors){
					mini_teleport.appendChild(minor);
				}
			}

			for (var mini_teleport of [north_teleport, south_teleport]){
				for (var minor of mini_teleport._minors){
					assign_style_to_element(minor, mini_teleport_style);
					minor.style.width = `${single_distance_teleport/2}px`;
				}
				mini_teleport._minors[1].style.left = `${single_distance_teleport/2}px`;
			}

			for (var mini_teleport of [east_teleport, west_teleport]){
				for (var minor of mini_teleport._minors){
					assign_style_to_element(minor, mini_teleport_style);
					minor.style.height = `${single_distance_teleport/2}px`;
				}
				mini_teleport._minors[1].style['top'] = `${single_distance_teleport/2}px`;
			}

			north_teleport.style['left'] = `${single_distance_teleport}px`;
			south_teleport.style['left'] = `${single_distance_teleport}px`;
			south_teleport.style['top'] = `${2*single_distance_teleport}px`;
			west_teleport.style['top'] = `${single_distance_teleport}px`;
			east_teleport.style['top'] = `${single_distance_teleport}px`;
			east_teleport.style['left'] = `${2*single_distance_teleport}px`;

			point._arrow = arrow_part;
			point._input = input_part;
			point._marking = marking;
			point._teleports = teleports;

			assign_style_to_element(point, standard_style);
			assign_style_to_element(marking, standard_style);
			assign_style_to_element(marking, marking_style);

			assign_style_to_element(teleports, standard_style);
			assign_style_to_element(teleports, marking_style);
			assign_style_to_element(teleports, teleports_style);

			assign_style_to_element(point._arrow, standard_style);
			assign_style_to_element(point._arrow, arrowy_style);
			assign_style_to_element(point._input, inputter_style);

			point._coordinates = {'row':row_nr, 'column':column_nr};
			point._signature = `${point._coordinates.row} ${point._coordinates.column}`;

			points[`${row_nr} ${column_nr}`] = point;

			point.addEventListener(_CONFIG_ACCESS_POINT_DATA, function(_event){
				if (_CONFIG_ACCESS_POINT_DATA == 'contextmenu') _event.preventDefault();
				point_images.innerHTML = '';
				if (current_focus){
					current_focus._marking.style.background = 'rgba(0, 0, 0, 0)';
					save_focus();
					current_focus._input.innerHTML = shorthand_text.value;
				}

				this._marking.style.background = 'linear-gradient(to right bottom, #AA0000 50%, rgba(0, 0, 0, 0) 50%)';
				current_focus = this;
				controls.images_text.value = points_data[current_state.map][current_focus._signature].images;
				controls.scripts_text.value = points_data[current_state.map][current_focus._signature].scripts;
				controls.shorthand_text.value = points_data[current_state.map][current_focus._signature].input;
				controls.general_text.value = points_data[current_state.map][current_focus._signature].general;

				for (var terrain in _local_terrains){
					if (points_data[current_state.map][current_focus._signature]['terrains'].has(terrain)) controls['terrains'][terrain].checked = true;
					else controls['terrains'][terrain].checked = false;
				}

				controls.input_used.checked = points_data[current_state.map][current_focus._signature].used;
				var ordering = ['N', 'E', 'S', 'W'];
				for (var index of [0, 1, 2, 3]){
					controls.input_borders[index].checked = points_data[current_state.map][current_focus._signature].borders[cardinal_to_dir[ordering[index]]];
				}
				for (var image of points_data[current_state.map][current_focus._signature].images.split('\n')){
					if (image){
						var pic = document.createElement('img');
						pic.src = _CONFIG_PREFIX + image;
						pic.alt = "image should be here";
						pic.width = "600";
						point_images.appendChild(pic);
					}
				}
			});

			point.addEventListener('click', function(){
				if (ground_truth.checked && !points_data[current_state.map][this._signature].used) return;
				if (current_state.marked) current_state.marked._arrow.innerHTML = '';
				
				current_state.direction = 0;
				this._arrow.innerHTML = dir_to_arrow[current_state.direction];

				current_state.marked = this;

				var data_to_push = [];
				if (!points_data[current_state.map][this._signature].used){
					if (map_element_overlays[current_state.map]) changer();
					points_data[current_state.map][this._signature].used = true;
					proper_background(points_data[current_state.map][this._signature], this._signature);
					data_to_push.push([0, this._signature]);
				}
				subsequent_changes.push([Object.assign({}, current_state), data_to_push]);
				update_presentation(current_state);
			});

			row.appendChild(point);
		}
	}
	return points;
}

function create_map_adder(){
	var add_map = document.createElement('input');
	assign_style_to_element(add_map, map_element_style);
	add_map.style['backgroundColor'] = '#008800';
	add_map.placeholder = 'Map name';
	controls.maps_adder.appendChild(add_map);

	var map_adder = document.createElement('div');
	assign_style_to_element(map_adder, map_element_style);
	map_adder.style['backgroundColor'] = '#008800';
	map_adder.style['display'] = 'inline-block';
	map_adder.style['width'] = '80px';
	map_adder.innerHTML = '+';
	map_adder.onclick = function(){
		map_name = add_map.value;
		general_data[map_name] = {};
		general_data[map_name]['ground truth'] = false;
		general_data[map_name]['fly'] = "";
		general_data[map_name]['teleport'] = "";
		general_data[map_name]['map size'] = [_local_grid_default[0], _local_grid_default[1]]; //TODO: Defaulting
		general_data[map_name]['order'] = "";
		is_map_changed[map_name] = false;

		var map_overlay = create_new_map_overlay(map_name);
		map_element_overlays[map_name] = map_overlay;

		controls.maps_list.appendChild(map_overlay);

		initialize_map_data(map_name, _local_grid_default);
		change_map(map_name);
	};
	controls.maps_adder.appendChild(map_adder);
}

var points = create_grid(GRID_SIZE);
create_map_adder();
var subsequent_changes = [];
initialize_map_data('_unknown', GRID_SIZE);
controls.orderer.onclick = function(){
	if (current_state.map != '_unknown')
		map_element_overlays[current_state.map]._element.style.backgroundColor = '#880000';

	var sorted_maps = [];
	for (var map_name in general_data){
		if (map_name == '_unknown') continue;
		sorted_maps.push([general_data[map_name]['order'], map_name])
	}
	sorted_maps.sort();

	var sorted_divs = document.getElementsByClassName('map_overlay');
	for (var [index, map_data] of sorted_maps.entries()){
		var map_name = map_data[1];
		sorted_divs[index]._element._map_name = map_name;
		sorted_divs[index]._text.innerHTML = map_name;
		map_element_overlays[map_name] = sorted_divs[index];
		update_flight(map_name);
		set_changer(map_name);
	}

	if (current_state.map != '_unknown')
		map_element_overlays[current_state.map]._element.style.backgroundColor = 'black';
}


function enforce_new_state(new_state){
	if (current_state.map != new_state.map) change_map(new_state.map);
	if ('direction' in new_state) current_state.direction = new_state.direction;

	if (current_state.marked) current_state.marked._arrow.innerHTML = '';
	current_state.marked = points[new_state.signature];
	update_presentation(current_state);
}

//direction - as int, moves - amount of moves towards given direction -> resulting Signature
function move_in_direction(signature, direction_int, moves=1){
	[row, column] = signature.split(' ').map((x) => Number(x));
	return `${row + moves*integer_to_dir[direction_int].y} ${column + moves*integer_to_dir[direction_int].x}`;
}

function determine_next_map(map_name){
	if (map_name[0] == '_'){
		if (map_name == '_S') return current_state.map;
		current_name_split = current_state.map.split(' ');
		last = Number(current_name_split[current_name_split.length-1]);
		if (map_name == '_UP') to_add = 1;
		else to_add = -1;

		current_name_split[current_name_split.length-1] = (last+to_add).toString();
		console.log(current_name_split.join(' '));
		return current_name_split.join(' ');
	}
	return map_name;
}
function determine_next_signature(signature){
	if (signature == '_P') return current_state.marked._signature;
	return signature;
}
function determine_next_direction(direction){
	if (typeof direction == 'number') return direction;
	if (direction == 'R') return (current_state.direction+2)%4;
	return cardinal_to_dir[direction];

}
function create_next_state(map, signature, direction){
	return {'map':determine_next_map(map), 'signature':determine_next_signature(signature), 'direction':determine_next_direction(direction)};
}


//Returns: [change]; new state established immediately
function process_move_forward(e_key){
	var current_place = current_state.marked._coordinates;
	var direction_int = current_state.direction;
	var direction = integer_to_dir[current_state.direction];
	var changes_introduced = [];

	var direction_proper = ((e_key == 'ArrowUp') ? direction_int : (direction_int+2)%4);
	if (points_data[current_state.map][current_state.marked._signature]['scripts']){
		var partial_scripts = points_data[current_state.map][current_state.marked._signature]['scripts'].split('\n');

		for (var script of partial_scripts){
			var proper_script = script.split(';');
			if (proper_script[0] == 'W' && proper_script[1] == dir_to_cardinal[direction_proper]){
				var old_direction = current_state.direction;
				enforce_new_state(create_next_state(proper_script[2], proper_script[3], proper_script[4]??old_direction));
				return [];
			}

			if (proper_script[0] == 'WS' && proper_script[1] == dir_to_cardinal[direction_proper]){
				var old_direction = current_state.direction;
				var ln = current_state.map.length;

				var map_column = current_state.map.charCodeAt(ln-2);
				var map_row = current_state.map.charCodeAt(ln-1);
				var start = current_state.map.substring(0, ln-2);

				var coordinate_x = current_state.marked._coordinates['column'];
				var coordinate_y = current_state.marked._coordinates['row'];

				if (proper_script[1] == 'N'){
					coordinate_y = 0;
					map_row = map_row-1;
				}
				if (proper_script[1] == 'S'){
					coordinate_y = 15;
					map_row = map_row+1;
				}

				if (proper_script[1] == 'W'){
					coordinate_x = 15;
					map_column = map_column-1;
				}
				if (proper_script[1] == 'E'){
					coordinate_x = 0;
					map_column = map_column+1;
				}
				map_row = String.fromCharCode(map_row);
				map_column = String.fromCharCode(map_column);
				enforce_new_state({'map':`${start}${map_column}${map_row}`, 'signature':`${coordinate_y} ${coordinate_x}`, 'direction':old_direction});

				return [];
			}
		}
	}

	var new_place_signature = move_in_direction(current_state.marked._signature, direction_proper);
	var new_place_presentation = points[new_place_signature];
	var new_place_data = points_data[current_state.map][new_place_signature];

	if (new_place_data && (!ground_truth.checked || (new_place_data.used && points_data[current_state.map][current_state.marked._signature].borders[direction_proper]))){
		if (!ground_truth.checked){
			if (!new_place_data.used){
				new_place_data.used = true;
				changes_introduced.push([0, new_place_signature]);
				new_place_presentation.style['backgroundColor'] = 'white';
				if (current_focus && current_focus._signature == new_place_signature) controls.input_used.checked = true;
			}
			if (!points_data[current_state.map][current_state.marked._signature].borders[direction_proper]){
				current_state.marked.style[`border${dir_to_border[direction_proper]}`] = `1px dashed #CCCCCC`;
				points_data[current_state.map][current_state.marked._signature].borders[direction_proper] = true;
				changes_introduced.push([1, current_state.marked._signature, direction_proper]);
				if (current_focus && current_focus._signature == current_state.marked._signature) controls.input_borders[direction_proper].checked = true;

				new_place_presentation.style[`border${dir_to_border[(direction_proper+2)%4]}`] = `1px dashed #CCCCCC`;
				new_place_data.borders[(direction_proper+2)%4] = true;
				changes_introduced.push([1, new_place_signature, (direction_proper+2)%4]);
				if (current_focus && current_focus._signature == new_place_signature) controls.input_borders[(direction_proper+2)%4].checked = true;
			}
		}

		if (new_place_data && new_place_data['scripts']){
			var partial_scripts = new_place_data['scripts'].split('\n');
			for (var script of partial_scripts){
				var proper_script = script.split(';');
				if (proper_script[0] == 'T'){
					enforce_new_state(create_next_state(proper_script[1], proper_script[2], current_state.direction));
					return changes_introduced;
				}
			}
		}
		enforce_new_state({'map':current_state.map, 'signature':new_place_signature, 'direction':current_state.direction});
	}
	return changes_introduced;
}

document.addEventListener('keydown', function(e){
	if((e.target.tagName == 'INPUT' && e.target.getAttribute('type') != 'checkbox') || e.target.tagName == 'TEXTAREA') return;
	if (e.key == 't') ground_truth.checked = !ground_truth.checked;

	if (!current_state.marked) return;

	var current_place = current_state.marked._coordinates;
	var direction_int = current_state.direction;
	var direction = integer_to_dir[current_state.direction];
	var changes_introduced = [];

	if (e.key == 'ArrowUp' || e.key == 'ArrowDown'){
		changes_introduced = process_move_forward(e.key);
		if (current_state.map && map_element_overlays[current_state.map] && changes_introduced.length) changer();
		subsequent_changes.push([Object.assign({}, current_state), changes_introduced]);
	}

	if (e.key == 'y'){
		if (points_data[current_state.map][current_state.marked._signature]['scripts']){
			var partial_scripts = points_data[current_state.map][current_state.marked._signature]['scripts'].split('\n');
			for (var script of partial_scripts){
				var proper_script = script.split(';');

				if (proper_script[0] == 'P' && proper_script[1].includes(dir_to_cardinal[direction_int])){
					enforce_new_state(create_next_state(proper_script[2], proper_script[3], proper_script[4]??current_state.direction));
					subsequent_changes.push([Object.assign({}, current_state), []]);
				}

				if (proper_script[0] == 'R' && proper_script[1] == dir_to_cardinal[direction_int]){
					current_state.direction = (current_state.direction+2)%4;
					subsequent_changes.push([Object.assign({}, current_state), []]);
					update_presentation(current_state);
				}
			}
		}
	}

	//Change: teleporting into unknown
	if (e.key == 'j'){
		var new_signature = move_in_direction(current_state.marked._signature, current_state.direction, 2);
		enforce_new_state({'map':current_state.map, 'signature':new_signature, 'direction':current_state.direction});
		subsequent_changes.push([Object.assign({}, current_state), []]);
	}

	for (var terrain in _local_terrains){
		if (e.key == _local_terrains[terrain]['button']){
			if (points_data[current_state.map][current_state.marked._signature]['terrains'].has(terrain)) 
				points_data[current_state.map][current_state.marked._signature]['terrains'].delete(terrain);
			else points_data[current_state.map][current_state.marked._signature]['terrains'].add(terrain);
			proper_background(points_data[current_state.map][current_state.marked._signature], current_state.marked._signature);
			changer();
		}
	}

	if (e.key == 'ArrowLeft' || e.key == 'ArrowRight'){
		if (e.key == 'ArrowLeft'){
			current_state.direction -= 1;
			if (current_state.direction < 0) current_state.direction += 4;
		}
		else current_state.direction = (current_state.direction + 1)%4;
		update_presentation(current_state);
		subsequent_changes.push([Object.assign({}, current_state), []]);
	}

	if (e.key == 'Backspace'){
		if (document.activeElement.tagName == 'INPUT') ;
		else if (subsequent_changes){
			current_state.marked._arrow.innerHTML = '';
			var dead_state, last_changes;
			[dead_state, last_changes] = subsequent_changes.pop();

			for (var change of last_changes){
				if (change[0] == 1){
					points[change[1]].style[`border${dir_to_border[change[2]]}`] = '1px solid black';
					points_data[current_state.map][change[1]].borders[change[2]] = false;
				}
				if (change[0] == 0){
					points[change[1]].style[`backgroundColor`] = 'grey';
					points_data[current_state.map][change[1]].used = false;
				}
			}

			if (subsequent_changes.length){
				var last_state = subsequent_changes[subsequent_changes.length-1][0];
				if (last_state.map != current_state.map) change_map(last_state.map);
				current_state.direction = last_state.direction;
				current_state.marked = last_state.marked;
			}
			else{
				current_state.direction = -1;
				current_state.marked = null;
			}
			update_presentation(current_state);
		}
	}
});

document.getElementById('saver').onclick = function(){
	dechanger();
	var points_data = [JSON.stringify(create_data_dump())];
	var blob = new Blob(points_data, {type : 'text/plain'}); // the blob
	//window.open(URL.createObjectURL(blob));

	var _a = document.createElement('a');
	_a.download = current_state.map + '.txt';
	_a.href = URL.createObjectURL(blob);
	_a.dataset.downloadurl = ['json', _a.download, _a.href].join(':');
	_a.style.display = 'none';
	document.body.appendChild(_a);
	_a.click();
	document.body.removeChild(_a);
};

//TODO: old version files: change everything... somehow
function terrainer(points_data){
	for (var signature in points_data){
		if (!('terrains' in points_data[signature])){
			points_data[signature]['terrains'] = new Set();
			if ('desert' in points_data[signature] && points_data[signature]['desert']) points_data[signature]['terrains'].add('desert')
			if ('water' in points_data[signature] && points_data[signature]['water']) points_data[signature]['terrains'].add('water')
		}
		else points_data[signature]['terrains'] = new Set(points_data[signature]['terrains']);
	}
	return points_data;
}

const file_input = document.getElementById('loader');
file_input.onchange = () => {
	var all_selected = file_input.files;

	save_map_data();
	for (var map of all_selected){
		var _ = map.text().then(function(result){
			full_data = JSON.parse(result);
			map_name = full_data['title'];
			is_map_changed[map_name] = false;

			general_data[map_name] = {};
			general_data[map_name]['ground truth'] = full_data['ground truth'];
			general_data[map_name]['fly'] = full_data['fly'];
			general_data[map_name]['teleport'] = full_data['teleport'];
			general_data[map_name]['order'] = full_data['order'];

			if ('map general' in full_data) general_data[map_name]['map general'] = full_data['map general'];
			else general_data[map_name]['map general'] = '';

			points_data[map_name] = terrainer(full_data['points']);
			if ('map size' in full_data) general_data[map_name]['map size'] = full_data['map size'];
			else general_data[map_name]['map size'] = get_map_size(points_data[map_name]);

			if (map_name in map_element_overlays) dechanger(map_name);
			else{
				var map_overlay = create_new_map_overlay(map_name);
				map_element_overlays[map_name] = map_overlay;
				controls.maps_list.appendChild(map_overlay);
				update_flight(map_name);
			}
		});
	}
}

var GRID_SIZE = 16;

var general_text = document.getElementById('general_text');
var scripts_text = document.getElementById('scripts_text');
var images_text = document.getElementById('images_text');

var shorthand_text = document.getElementById('shorthand_text');
var fly = document.getElementById('fly');
var maps_list = document.getElementById("maps_list");
var maps_adder = document.getElementById("adder");
var ground_truth = document.getElementById("ground_truth");
var map_general = document.getElementById('map_general');
var desert = document.getElementById('desert');
var water = document.getElementById('water');

var input_borders = ["North", "East", "South", "West"].map((direction) => document.getElementById(`${direction}_border`));
var input_used = document.getElementById("usable");

var map_elements = {};
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

var points_data = {};
var general_data = {};
points_data[current_state.map] = {};
general_data[current_state.map] = {};

function update_presentation(current_state){
	if (!current_state['marked']) return;
	current_state['marked']._arrow.innerHTML = dir_to_arrow[current_state.direction];
}

function changer(map=null){
	if (map == null) map=current_state.map;
	if (map == '_unknown') return;
	map_element_overlays[map]._changer.style.backgroundColor = '#88CC00';
}

function proper_background(point_data, signature){
	if (point_data.used) points[signature].style['backgroundColor'] = 'white';
	else points[signature].style['backgroundColor'] = 'grey';

	if ('desert' in point_data && point_data.desert==true) points[signature].style.backgroundColor = '#FFD481';
	if ('water' in point_data && point_data.water==true) points[signature].style.backgroundColor = '#99FFFF';
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
			if (direction == 'N' || proper_script[0] == 'T'){
				var mini_teleports = base_teleport._mini_teleports[cardinal_to_dir['N']];
				mini_teleports._minors[0].style.background = `linear-gradient(to right bottom, rgba(0, 0, 0, 0) 50%, ${color} 50%)`;
				mini_teleports._minors[1].style.background = `linear-gradient(to right top, ${color} 50%, rgba(0, 0, 0, 0) 50%)`;
			}

			if (direction == 'S' || proper_script[0] == 'T'){
				var mini_teleports = base_teleport._mini_teleports[cardinal_to_dir['S']];
				mini_teleports._minors[0].style.background = `linear-gradient(to right top, rgba(0, 0, 0, 0) 50%, ${color} 50%)`;
				mini_teleports._minors[1].style.background = `linear-gradient(to right bottom, ${color} 50%, rgba(0, 0, 0, 0) 50%)`;
			}

			if (direction == 'W' || proper_script[0] == 'T'){
				var mini_teleports = base_teleport._mini_teleports[cardinal_to_dir['W']];
				mini_teleports._minors[0].style.background = `linear-gradient(to right bottom, rgba(0, 0, 0, 0) 50%, ${color} 50%)`;
				mini_teleports._minors[1].style.background = `linear-gradient(to right top, rgba(0, 0, 0, 0) 50%, ${color} 50%)`;
			}
			if (direction == 'E' || proper_script[0] == 'T'){
				var mini_teleports = base_teleport._mini_teleports[cardinal_to_dir['E']];
				mini_teleports._minors[0].style.background = `linear-gradient(to right top, ${color} 50%, rgba(0, 0, 0, 0) 50%)`;
				mini_teleports._minors[1].style.background = `linear-gradient(to right bottom, ${color} 50%, rgba(0, 0, 0, 0) 50%)`;
			}
			if (proper_script[0] == 'R' || proper_script[0] == 'T') points[signature]._teleports._mini_teleports[4].style.background = color;
		}
	}
}

function update_flight(map_name){
	if (general_data[map_name]['fly'] && general_data[map_name]['fly']!='undefined' && map_name!='_unknown'){
		map_element_overlays[map_name]._flier.style.display = 'inline-block';
		map_element_overlays[map_name]._flier.onmouseover = function(){this.style.backgroundColor = '#440000';};
		map_element_overlays[map_name]._flier.onmouseout = function(){this.style.backgroundColor = '#880000';};

		map_element_overlays[map_name]._flier.onclick = function(){
			var current_direction = current_state.direction;
			if (current_direction == -1) current_direction = 0; //By default - northern
			change_map(map_name);

			current_state.direction = current_direction;
			current_state.marked = points[general_data[map_name]['fly']];
			update_presentation(current_state);
		}
	}
}

function save_focus(map_switch=false){
	if (current_focus){
		var coordinate = current_focus._signature;
		var past_point = Object.assign({}, points_data[current_state.map][coordinate]);

		points_data[current_state.map][coordinate]['general'] = general_text.value;
		points_data[current_state.map][coordinate]['scripts'] = scripts_text.value;
		points_data[current_state.map][coordinate]['images'] = images_text.value;
		points_data[current_state.map][coordinate]['input'] = shorthand_text.value;

		points_data[current_state.map][coordinate]['desert'] = desert.checked;
		points_data[current_state.map][coordinate]['water'] = water.checked;

		points_data[current_state.map][coordinate].used = input_used.checked;
		var ordering = ['N', 'E', 'S', 'W'];
		for (var index of [0, 1, 2, 3]){
			 points_data[current_state.map][coordinate].borders[cardinal_to_dir[ordering[index]]] = input_borders[index].checked;
		}

		if (Object.entries(points_data[current_state.map][coordinate]).sort().toString() !== Object.entries(past_point).sort().toString())
			changer();

		if (!map_switch) update_field(coordinate);
	}
}

function save_map_data(){
	save_focus(true);
	general_data[current_state.map]['ground truth'] = ground_truth.checked;
	general_data[current_state.map]['fly'] = fly.value
	general_data[current_state.map]['map general'] = map_general.value
}

function load_map_presentation(to_load, map_name){
	current_state['map'] = map_name;
	ground_truth.checked = general_data[map_name]['ground truth'];
	fly.value = general_data[map_name]['fly'];
	if ('map general' in general_data[map_name]) map_general.value = general_data[map_name]['map general'];
	else map_general.value = '';

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

function create_new_map_overlay(map_name){
	var map_overlay = document.createElement('div');
	var new_map_element = document.createElement('div');
	var flier = document.createElement('div');
	var changer = document.createElement('div');

	assign_style_to_element(changer, {
		'position':'absolute', 
		//'backgroundColor':'#88CC00',
		'backgroundColor':'rgba(0, 0, 0, 0)',
		'top':'5px',
		'right':'5px',
		'width':'15px',
		'height':'15px',
		'borderRadius':'100%'
	});
	new_map_element._map_name = map_name;

	new_map_element.textContent = map_name;
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
	assign_style_to_element(flier, map_element_style);
	flier.style.width = "50px";
	flier.innerHTML = "F";
	flier.style.display = "none";

	map_overlay.appendChild(new_map_element);
	map_overlay.appendChild(flier);

	map_overlay._element = new_map_element;
	map_overlay._changer = changer;
	map_overlay._flier = flier;
	flier._map_name = map_name;
	return map_overlay;
}

function initialize_map_data(map_name){
	points_data[map_name] = {};
	grid_size = GRID_SIZE;

	for (var row_nr = 0; row_nr < grid_size; row_nr+=1){
		for (var column_nr = 0; column_nr < grid_size; column_nr+=1){
			points_data[map_name][`${row_nr} ${column_nr}`] = {'used':false, 'borders':[false, false, false, false], 'input':'', 'general':'', 'scripts':''}
		}
	}
}

function create_data_dump(){
	var map_name = current_state['map'];
	to_save = {'title':map_name, 'ground truth':ground_truth.checked, 'fly':fly.value, 'map general':map_general.value, 'points':{}};

	for (var point_coordinate in points){
		var point = points_data[map_name][point_coordinate];
		var presentation = points[point_coordinate];
		to_save.points[point_coordinate] = {
			'used': point.used,
			'borders': point.borders,
			'input': point.input, //Move to shorthand
			'general': point.general??'',
			'scripts': point.scripts??'',
			'images': point.images??'',
			'desert': point.desert?true:false,
			'water': point.water?true:false
		}
	}
	return to_save;
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

	for (var column_nr=0; column_nr<grid_size; column_nr+=1){
		var column_label = document.createElement('div');
		column_label.innerHTML = `${column_nr}`;
		assign_style_to_element(column_label, standard_style);
		column_label.style['backgroundColor'] = wonder_golden;
		column_label.style['height'] = '50px';
		column_label.style['lineHeight'] = '50px';
		row_with_labels.appendChild(column_label);
	}
	basis.appendChild(row_with_labels);

	for (var row_nr=grid_size-1; row_nr>=0; row_nr-=1){
		var row = document.createElement('div');
		basis.appendChild(row);

		var row_label = document.createElement('div');
		assign_style_to_element(row_label, standard_style);
		row_label.style['backgroundColor'] = wonder_golden;
		row_label.style['width'] = '50px';
		row_label.innerHTML = `${row_nr}`;

		row.appendChild(row_label);

		for (var column_nr=0; column_nr<grid_size; column_nr+=1){
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

			point.addEventListener('auxclick', function(){
				if (current_focus){
					current_focus._marking.style.background = 'rgba(0, 0, 0, 0)';
					save_focus();
					current_focus._input.innerHTML = shorthand_text.value;
				}

				this._marking.style.background = 'linear-gradient(to right bottom, #AA0000 50%, rgba(0, 0, 0, 0) 50%)';
				current_focus = this;
				images_text.value = points_data[current_state.map][current_focus._signature].images;
				scripts_text.value = points_data[current_state.map][current_focus._signature].scripts;
				shorthand_text.value = points_data[current_state.map][current_focus._signature].input;
				general_text.value = points_data[current_state.map][current_focus._signature].general;

				if ('desert' in points_data[current_state.map][current_focus._signature]) desert.checked = points_data[current_state.map][current_focus._signature].desert;
				else desert.checked = false;
				if ('water' in points_data[current_state.map][current_focus._signature]) water.checked = points_data[current_state.map][current_focus._signature].water;
				else water.checked = false;

				input_used.checked = points_data[current_state.map][current_focus._signature].used;
				var ordering = ['N', 'E', 'S', 'W'];
				for (var index of [0, 1, 2, 3]){
					input_borders[index].checked = points_data[current_state.map][current_focus._signature].borders[cardinal_to_dir[ordering[index]]];
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
	maps_adder.appendChild(add_map);

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

		var map_overlay = create_new_map_overlay(map_name);
		map_elements[map_name] = map_overlay._element;
		map_element_overlays[map_name] = map_overlay;

		maps_list.appendChild(map_overlay);

		initialize_map_data(map_name);
		change_map(map_name);
	};
	maps_adder.appendChild(map_adder);
}

var points = create_grid(GRID_SIZE);
create_map_adder();
var subsequent_changes = [];
initialize_map_data('_unknown');


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
				enforce_new_state({'map':proper_script[2], 'signature':proper_script[3], 'direction':old_direction});
				return [];
			}

			if (proper_script[0] == 'WS' && proper_script[1] == dir_to_cardinal[direction_proper]){
				var old_direction = current_state.direction;

				var map_column = current_state.map.charCodeAt(0);
				var map_row = current_state.map.charCodeAt(1);

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
				enforce_new_state({'map':`${map_column}${map_row}`, 'signature':`${coordinate_y} ${coordinate_x}`, 'direction':old_direction});

				return [];
			}
		}
	}

	var new_place_signature = move_in_direction(current_state.marked._signature, direction_proper);
	var new_place_presentation = points[new_place_signature];
	var new_place_data = points_data[current_state.map][new_place_signature];

	if (new_place_presentation && (!ground_truth.checked || (new_place_data.used && points_data[current_state.map][current_state.marked._signature].borders[direction_proper]))){
		if (!ground_truth.checked){
			if (!new_place_data.used){
				new_place_data.used = true;
				changes_introduced.push([0, new_place_signature]);
				new_place_presentation.style['backgroundColor'] = 'white';
				if (current_focus && current_focus._signature == new_place_signature) input_used.checked = true;
			}
			if (!points_data[current_state.map][current_state.marked._signature].borders[direction_proper]){
				current_state.marked.style[`border${dir_to_border[direction_proper]}`] = `1px dashed #CCCCCC`;
				points_data[current_state.map][current_state.marked._signature].borders[direction_proper] = true;
				changes_introduced.push([1, current_state.marked._signature, direction_proper]);
				if (current_focus && current_focus._signature == current_state.marked._signature) input_borders[direction_proper].checked = true;

				new_place_presentation.style[`border${dir_to_border[(direction_proper+2)%4]}`] = `1px dashed #CCCCCC`;
				new_place_data.borders[(direction_proper+2)%4] = true;
				changes_introduced.push([1, new_place_signature, (direction_proper+2)%4]);
				if (current_focus && current_focus._signature == new_place_signature) input_borders[(direction_proper+2)%4].checked = true;
			}
		}

		if (new_place_data && new_place_data['scripts']){
			var partial_scripts = new_place_data['scripts'].split('\n');
			for (var script of partial_scripts){
				var proper_script = script.split(';');
				if (proper_script[0] == 'T'){
					var next_map = (proper_script[1]=='_S') ? current_state.map : proper_script[1];
					enforce_new_state({'map':next_map, 'signature':proper_script[2], 'direction':current_state.direction});
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

				if (proper_script[0] == 'P' && proper_script[1] == dir_to_cardinal[direction_int]){
					enforce_new_state({'map':proper_script[2], 'signature':proper_script[3], 'direction':current_state.direction});
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

	if (e.key == 'd'){
		points_data[current_state.map][current_state.marked._signature].desert = !points_data[current_state.map][current_state.marked._signature].desert;
		proper_background(points_data[current_state.map][current_state.marked._signature], current_state.marked._signature);
		changer();
	}
	if (e.key == 'w'){
		points_data[current_state.map][current_state.marked._signature].water = !points_data[current_state.map][current_state.marked._signature].water;
		proper_background(points_data[current_state.map][current_state.marked._signature], current_state.marked._signature);
		changer();
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
	if (current_state.map != '_unknown')
		map_element_overlays[current_state.map]._changer.style.backgroundColor = 'rgba(0, 0, 0, 0)';
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

const file_input = document.getElementById('loader');
file_input.onchange = () => {
	var all_selected = file_input.files;

	save_map_data();
	for (var map of all_selected){
		var _ = map.text().then(function(result){
			full_data = JSON.parse(result);
			map_name = full_data['title'];

			general_data[map_name] = {};
			general_data[map_name]['ground truth'] = full_data['ground truth'];
			general_data[map_name]['fly'] = full_data['fly'];

			if ('map general' in full_data) general_data[map_name]['map general'] = full_data['map general'];
			else general_data[map_name]['map general'] = '';

			points_data[map_name] = full_data['points']

			if (map_name in map_elements) map_element_overlays[map_name]._changer.style.backgroundColor = 'rgba(0, 0, 0, 0)';
			else{
				var map_overlay = create_new_map_overlay(map_name);
				map_element_overlays[map_name] = map_overlay;
				map_elements[map_name] = map_overlay._element;
				maps_list.appendChild(map_overlay);
				update_flight(map_name);
			}
		});
	}
}

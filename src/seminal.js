import {_CONFIG_ACCESS_POINT_DATA, _CONFIG_GAME, _CONFIG_PREFIX, _CONFIG_MAX_MAP_SIZE} from './config.js';
import {GAME_DATA} from './game_terrain.js';
import {standard_style, map_element_style, arrowy_style, inputter_style, point_of_entry_style, marking_style, teleports_style, mini_teleport_style, assign_style_to_element, single_distance_teleport} from './presentation.js';

const integer_to_dir = {
	0: {'x':0, 'y':1},
	1: {'x':1, 'y':0},
	2: {'x':0, 'y':-1},
	3: {'x':-1, 'y':0},
}
const dir_to_arrow = {
	0: '&uarr;',
	1: '&rarr;',
	2: '&darr;',
	3: '&larr;'
}

const dir_to_border = {
	0:'Top',
	1:'Right',
	2:'Bottom',
	3:'Left'
}

const dir_to_cardinal = {
	0: 'N',
	1: 'E',
	2: 'S',
	3: 'W'
}
const cardinal_to_dir = {
	'N':0,
	'E':1,
	'S':2,
	'W':3
}
const arrow_to_dir = {
	'ArrowUp':0,
	'ArrowRight':1,
	'ArrowDown':2,
	'ArrowLeft':3
};

export class Map{
	static create_basic_point(){
		return {'used':false, 'borders':[false, false, false, false], 'input':'', 'general':'', 'scripts':'', 'images':'', 'terrains':new Set()};
	}

	translate(translate_y, translate_x){
		var new_points = {};
		var max_y = this.general_data['map size'][0];
		var max_x = this.general_data['map size'][1];

		for (var point in this.points_data){
			var [old_y, old_x] = point.split(' ').map(z => Number(z));
			var new_y = old_y + translate_y;
			var new_x = old_x + translate_x;
			if (new_y >= 0 && new_y < max_y && new_x >= 0 && new_x < max_x){
				new_points[`${new_y} ${new_x}`] = this.points_data[point];
			}
		}

		for (var y=Math.min(0, translate_y); y<Math.max(0, translate_y); y+=1){
			for (var x=0; x<max_x; x+=1){
				new_points[`${(max_y+y)%max_y} ${x}`] = Map.create_basic_point();
			}
		}

		for (var x=Math.min(0, translate_x); x<Math.max(0, translate_x); x+=1){
			for (var y=0; y<max_y; y+=1){
				new_points[`${y} ${(max_x+x)%max_x}`] = Map.create_basic_point();
			}
		}

		this.points_data = new_points;
	}

	//TODO: Can be sped up
	resize_map(new_size){
		var new_x = new_size[1], new_y = new_size[0];
		var old_x = this.general_data['map size'][1], old_y = this.general_data['map size'][0];

		var max_x = Math.max(new_x, old_x);
		var max_y = Math.max(new_y, old_y);

		var min_x = Math.min(new_x, old_x);
		var min_y = Math.min(new_y, old_y);

		var map_data = this.points_data;
		for (var y=0; y<max_y; y++){
			for (var x=0; x<max_x; x++){
				if (y<min_y && x<min_x) continue;
				if (x<new_x && y<new_y) map_data[`${y} ${x}`] = Map.create_basic_point();
				else if (x<old_x && y<old_y) delete map_data[`${y} ${x}`];
			}
		}
		this.general_data['map size'] = new_size;
	}

	get_extremities(){
		var size_x = this.general_data['map size'][1], size_y = this.general_data['map size'][0];
		var max_x=0, max_y=0, min_y=size_y, min_x=size_x;

		for (var y=0; y<size_y; y++){
			for (var x=0; x<size_x; x++){
				var point = this.points_data[`${y} ${x}`];
				if (point.used == true || point.input != ''){
					if (x < min_x) min_x = x;
					if (y < min_y) min_y = y;
					if (x > max_x) max_x = x;
					if (y > max_y) max_y = y;
				}
			}
		}
		return [[min_y, min_x], [max_y, max_x]];
	}

	cut_map(){
		var [[y_min, x_min], [y_max, x_max]] = this.get_extremities();
		this.translate(-y_min, -x_min);
		this.resize_map([y_max-y_min+1, x_max-x_min+1]);
	}

	//TODO: old version files: change everything... somehow
	terrainer(points_data){
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

	get_map_size(){
		var all_points = Object.keys(this.point_data).map((x) => (x.split(' ').map((y) => Number(y))));

		var max_x = 0, max_y = 0;
		for (var coordinates of all_points){
			if (coordinates[0] > max_y) max_y = coordinates[0];
			if (coordinates[1] > max_x) max_x = coordinates[1];
		}
		return [max_y+1, max_x+1];
	}

	initialize_map_data(){
		var map_size = this.general_data['map size'];
		this.points_data = {};

		for (var row_nr = 0; row_nr < map_size[0]; row_nr+=1){
			for (var column_nr = 0; column_nr < map_size[1]; column_nr+=1){
				this.points_data[`${row_nr} ${column_nr}`] = Map.create_basic_point();
			}
		}
	}

	construct_from_data(full_data){
		var _map_gd = this.general_data;

		_map_gd['ground truth'] = full_data['ground truth'];
		_map_gd['fly'] = full_data['fly'];
		_map_gd['teleport'] = full_data['teleport'];
		_map_gd['order'] = full_data['order'];
		_map_gd['exploration_blobber'] = full_data['exploration_blobber']??true;
		_map_gd['map general'] = full_data['map general']??'';
		this.points_data = this.terrainer(full_data['points']);
		_map_gd['map size'] = full_data['map size']??this.get_map_size(); //can be done with get_extremities
	}

	construct_from_nothing(grid_size){
		var _map_gd = this.general_data;

		_map_gd['ground truth'] = false;
		_map_gd['fly'] = "";
		_map_gd['teleport'] = "";
		_map_gd['order'] = "";
		_map_gd['exploration_blobber'] = true;
		_map_gd['map size'] = [grid_size[0], grid_size[1]]; //TODO: Defaulting
	}

	//proper_data fields: title, full_data, local_grid_default (ignored if full_data)
	constructor(proper_data){
		this.title = proper_data.map_name;
		this.is_map_changed = false;
		this.general_data = {};

		if (proper_data.full_data)
			this.construct_from_data(proper_data.full_data);
		else
			this.construct_from_nothing(proper_data.grid_size);
	}
}

class Point{
	constructor(){
		this.element = document.createElement('div');

		var input_part = document.createElement('div');
		var arrow_part = document.createElement('div');
		var marking = document.createElement('div');
		var teleports = document.createElement('div');

		var north_teleport = document.createElement('div');
		var south_teleport = document.createElement('div');
		var west_teleport = document.createElement('div');
		var east_teleport = document.createElement('div');
		var mid_teleport = document.createElement('div');

		this.element.appendChild(arrow_part);
		this.element.appendChild(input_part);
		this.element.appendChild(marking);
		this.element.appendChild(teleports);

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

		this._arrow = arrow_part;
		this._input = input_part;
		this._marking = marking;
		this._teleports = teleports;
		this.element.general = this;

		//FIXME later
		this.element._arrow = arrow_part;
		this.element._input = input_part;
		this.element._marking = marking;
		this.element._teleports = teleports;

		assign_style_to_element(this.element, standard_style);
		assign_style_to_element(marking, standard_style);
		assign_style_to_element(marking, marking_style);

		assign_style_to_element(teleports, standard_style);
		assign_style_to_element(teleports, marking_style);
		assign_style_to_element(teleports, teleports_style);

		assign_style_to_element(this._arrow, standard_style);
		assign_style_to_element(this._arrow, arrowy_style);
		assign_style_to_element(this._input, inputter_style);
	}

	proper_background(point_data){
		if (point_data.used) this.element.style['backgroundColor'] = 'white';
		else this.element.style['backgroundColor'] = 'grey';

		for (var terrain in this._local_terrains){
			if (point_data['terrains'].has(terrain)) this.element.style.backgroundColor = this._local_terrains[terrain]['color'];
		}
	}
}

class Grid{
}

export class Application{
	checkboxes_terrains(){
		var terrains_div = document.getElementById('terrains');
		for (var terrain in this._local_terrains){
			var _input = document.createElement('input');
			_input.type = 'checkbox';
			_input.name = terrain;
			_input.id = terrain;

			var _label = document.createElement('label');
			_label.innerHTML = terrain[0].toUpperCase() + terrain.slice(1);
			_label.htmlFor = terrain;

			terrains_div.appendChild(_input);
			terrains_div.appendChild(_label);
			this.controls['terrains'][terrain] = _input;
		}
	}

	update_presentation(current_state){
		if (!this.current_state['marked']) return;
		this.current_state['marked']._arrow.innerHTML = dir_to_arrow[this.current_state.direction];
	}

	set_changer(map){
		if (map == '_unknown') return;
		if (this.maps[map]['is_map_changed']) 
			this.map_element_overlays[map]._changer.style.backgroundColor = '#88CC00';
		else
			this.map_element_overlays[map]._changer.style.backgroundColor = 'rgba(0,0,0,0)';
	}

	changer(map=null){
		if (map == null) map=this.current_state.map;
		if (map == '_unknown') return;
		this.maps[map]['is_map_changed'] = true;
		this.set_changer(map);
	}

	dechanger(map=null){
		if (map == null) map=this.current_state.map;
		if (map == '_unknown') return;
		this.maps[map]['is_map_changed'] = false;
		this.set_changer(map);
	}

	update_field(signature){
		var to_load = this.maps[this.current_state.map]['points_data'];
		for (var i=0; i<4; i+=1){
			if (to_load[signature].borders[i]) this.points[signature].element.style[`border${dir_to_border[i]}`] = `1px dashed #CCCCCC`;
			else this.points[signature].element.style[`border${dir_to_border[i]}`] = '1px solid black';
		}
		this.points[signature].proper_background(to_load[signature]);

		this.points[signature]._input.innerHTML = to_load[signature].input;
		for (var _ of [0, 1, 2, 3]){
			for (var minor in [0, 1]){
				this.points[signature]._teleports._mini_teleports[_]._minors[minor].style.background = 'rgba(0, 0, 0, 0)';
			}
		}
		this.points[signature]._teleports._mini_teleports[4].style.background = 'rgba(0, 0, 0, 0)';
		if (to_load[signature].scripts){
			var scripts = to_load[signature].scripts.split('\n');
			for (var script of scripts){
				if (script == 'undefined') continue;
				var proper_script = script.split(';');
				var color = '#AA0000'; //For W, WS
				if (proper_script[0] == 'P') color = '#008055';
				if (proper_script[0] == 'R') color = '#9900E6';

				var direction = proper_script[1];
				var base_teleport = this.points[signature]._teleports;
				if ((direction && direction.includes('N')) || proper_script[0] == 'T'){
					var mini_teleports = base_teleport._mini_teleports[cardinal_to_dir['N']];
					mini_teleports._minors[0].style.background = `linear-gradient(to right bottom, rgba(0, 0, 0, 0) 50%, ${color} 50%)`;
					mini_teleports._minors[1].style.background = `linear-gradient(to right top, ${color} 50%, rgba(0, 0, 0, 0) 50%)`;
				}

				if ((direction && direction.includes('S')) || proper_script[0] == 'T'){
					var mini_teleports = base_teleport._mini_teleports[cardinal_to_dir['S']];
					mini_teleports._minors[0].style.background = `linear-gradient(to right top, rgba(0, 0, 0, 0) 50%, ${color} 50%)`;
					mini_teleports._minors[1].style.background = `linear-gradient(to right bottom, ${color} 50%, rgba(0, 0, 0, 0) 50%)`;
				}

				if ((direction && direction.includes('W')) || proper_script[0] == 'T'){
					var mini_teleports = base_teleport._mini_teleports[cardinal_to_dir['W']];
					mini_teleports._minors[0].style.background = `linear-gradient(to right bottom, rgba(0, 0, 0, 0) 50%, ${color} 50%)`;
					mini_teleports._minors[1].style.background = `linear-gradient(to right top, rgba(0, 0, 0, 0) 50%, ${color} 50%)`;
				}
				if ((direction && direction.includes('E')) || proper_script[0] == 'T'){
					var mini_teleports = base_teleport._mini_teleports[cardinal_to_dir['E']];
					mini_teleports._minors[0].style.background = `linear-gradient(to right top, ${color} 50%, rgba(0, 0, 0, 0) 50%)`;
					mini_teleports._minors[1].style.background = `linear-gradient(to right bottom, ${color} 50%, rgba(0, 0, 0, 0) 50%)`;
				}
				if (proper_script[0] == 'R' || proper_script[0] == 'T') this.points[signature]._teleports._mini_teleports[4].style.background = color;
			}
		}
	}

	update_part(map_name, movement, element){
		var _map_gd = this.maps[map_name]['general_data'];
		if (!_map_gd[movement] || _map_gd[movement] == '') element.style.display = 'none';

		else if (_map_gd[movement]!='undefined'){
			element.style.display = 'inline-block';
			element.onmouseover = function(){this.style.backgroundColor = '#440000';};
			element.onmouseout = function(){this.style.backgroundColor = '#880000';};

			element._entry = this;
			element.onclick = function(){
				var base = this._entry;
				var new_direction, new_place;
				if (this._type == 'F'){
					new_direction = base.current_state.direction;
					if (new_direction == -1) new_direction = 0; //By default - northern
					new_place = _map_gd[movement];
				}
				else{
					var _tmp = _map_gd[movement].split(';');
					new_direction = cardinal_to_dir[_tmp[1]];
					new_place = _tmp[0];
				}

				base.change_map(this._overlay._element._map_name);

				base.current_state.direction = new_direction;
				base.current_state.marked = base.points[new_place];
				base.update_presentation(base.current_state);
			}
		}
	}

	update_flight(map_name){
		if (map_name == '_unknown') return;
		this.update_part(map_name, 'fly', this.map_element_overlays[map_name]._flier);
		this.update_part(map_name, 'teleport', this.map_element_overlays[map_name]._teleporter);
	}

	save_focus(map_switch=false){
		if (this.current_focus){
			var coordinate = this.current_focus._signature;
			var past_point = Object.assign({}, this.maps[this.current_state.map]['points_data'][coordinate]);

			this.maps[this.current_state.map]['points_data'][coordinate]['general'] = this.controls.general_text.value;
			this.maps[this.current_state.map]['points_data'][coordinate]['scripts'] = this.controls.scripts_text.value;
			this.maps[this.current_state.map]['points_data'][coordinate]['images'] = this.controls.images_text.value;
			this.maps[this.current_state.map]['points_data'][coordinate]['input'] = this.controls.shorthand_text.value;

			for (var terrain in this._local_terrains){
				if (this.controls['terrains'][terrain].checked) this.maps[this.current_state.map]['points_data'][coordinate]['terrains'].add(terrain);
				else this.maps[this.current_state.map]['points_data'][coordinate]['terrains'].delete(terrain);
			}

			this.maps[this.current_state.map]['points_data'][coordinate].used = this.controls.input_used.checked;
			var ordering = ['N', 'E', 'S', 'W'];
			for (var index of [0, 1, 2, 3]){
				 this.maps[this.current_state.map]['points_data'][coordinate].borders[cardinal_to_dir[ordering[index]]] = this.controls.input_borders[index].checked;
			}

			if (Object.entries(this.maps[this.current_state.map]['points_data'][coordinate]).sort().toString() !== Object.entries(past_point).sort().toString())
				this.changer();

			if (!map_switch) this.update_field(coordinate);
		}
	}

	save_map_data(){
		this.save_focus(true);
		var _map_gd = this.maps[this.current_state.map]['general_data'];
		_map_gd['order'] = this.controls.order.value;
		_map_gd['ground truth'] = this.controls.ground_truth.checked;
		_map_gd['fly'] = this.controls.fly.value;
		_map_gd['teleport'] = this.controls.teleport.value;
		_map_gd['exploration_blobber'] = this.controls.blobber.checked;

		var old_map_size = _map_gd['map size'];
		var new_map_size = this.controls.map_size.value.split(',').map((x) => Number(x));

		if (old_map_size && (old_map_size[0] != new_map_size[0] || old_map_size[1] != new_map_size[1]) && this.current_state.map != '_unknown')
			this.maps[this.current_state.map].resize_map(new_map_size);
		if (this.controls.translate.value){
			this.maps[this.current_state.map].translate(...this.controls.translate.value.split(',').map(z => Number(z)));
			this.controls.translate.value = '';
		}

		_map_gd['map general'] = this.controls.map_general.value;
	}

	load_map_presentation(to_load, map_name){
		this.current_state['map'] = map_name;
		this.resize_grid(this.maps[map_name]['general_data']['map size']);

		var _map_gd = this.maps[this.current_state.map]['general_data'];
		this.controls.ground_truth.checked = _map_gd['ground truth'];
		this.controls.fly.value = _map_gd['fly'];
		this.controls.teleport.value = _map_gd['teleport']??'';

		this.controls.map_size.value = _map_gd['map size'];
		this.controls.blobber.checked = _map_gd['exploration_blobber'];
		this.controls.overhead.checked = !_map_gd['exploration_blobber'];

		this.controls.map_general.value = _map_gd['map general']??'';
		this.controls.order.value = _map_gd['order']??'';

		for (var coordinates in to_load) this.update_field(coordinates);

		if (this.current_state['marked']){
			this.current_state['marked']._arrow.innerHTML = "";
			this.current_state.marked = null;
			this.current_state.direction = -1;
		}
	}

	change_map(new_map){
		this.save_map_data();

		if (this.current_focus){
			this.current_focus._marking.style.background = 'rgba(0, 0, 0, 0)';
			this.current_focus = null;
		}
		if (this.map_element_overlays[this.current_state.map]){
			this.map_element_overlays[this.current_state.map]._element.style.backgroundColor = '#880000';
		}
		this.map_element_overlays[new_map]._element.style.backgroundColor = '#000000';
		this.update_flight(this.current_state.map);

		this.current_state['map'] = new_map;
		this.load_map_presentation(this.maps[new_map]['points_data'], new_map);
		this.controls.map_name.value = new_map;
	}

	rename_map(old_map_name, new_map_name){
		if (old_map_name == new_map_name)
			return;
		if (this.map_element_overlays[old_map_name]){
			this.map_element_overlays[old_map_name]._element.getElementsByTagName('span')[0].innerHTML = new_map_name;
			this.map_element_overlays[old_map_name]._element._map_name = new_map_name;

			this.maps[new_map_name] = this.maps[old_map_name];
			delete this.maps[old_map_name];

			this.map_element_overlays[new_map_name] = this.map_element_overlays[old_map_name];
			delete this.map_element_overlays[old_map_name];
		}

		if (this.current_state.map == old_map_name)
			this.current_state.map = new_map_name;
	}

	create_movement_overlay(letter){
		var flier = document.createElement('div');
		assign_style_to_element(flier, map_element_style);
		flier.style.width = "50px";
		flier.innerHTML = letter;
		flier._type = letter;
		flier.style.display = "none";
		return flier;
	}

	create_new_map_overlay(map_name){
		var map_overlay = document.createElement('div');
		var new_map_element = document.createElement('div');
		new_map_element.id = `__map ${map_name}`;
		new_map_element.classList.add(`__map`);

		var flier = this.create_movement_overlay('F');
		var teleporter = this.create_movement_overlay('T');

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
		new_map_element._entry = this;
		new_map_element.onclick = function(){
			var base = this._entry;
			base.change_map(this._map_name);
		};

		new_map_element.onmouseover = function(){
			var base = this._entry;
			if (base.current_state.map != this._map_name) this.style['backgroundColor'] = '#440000';
		}
		new_map_element.onmouseout = function(){
			var base = this._entry;
			if (base.current_state.map != this._map_name) this.style['backgroundColor'] = '#880000';
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

	create_data_dump(){
		var map_name = this.current_state['map'];
		this.save_map_data();
		var save_data = this.maps[map_name]['general_data'];

		var to_save = {'title':map_name, 'ground truth':save_data['ground truth'], 'fly':save_data['fly'], 'exploration_blobber':save_data['exploration_blobber'], 'teleport':save_data['teleport'], 'map size':save_data['map size'], 'map general':save_data['map general'], 'order':save_data['order'], 'points':{}};

		for (var point_coordinate in this.maps[map_name]['points_data']){
			var point = this.maps[map_name]['points_data'][point_coordinate];
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

	resize_grid(new_size){
		var size_y = new_size[0];
		var size_x = new_size[1];

		for (var y=0; y<this.GRID_SIZE[0]; y++){
			if (y<size_y) this.presentation['row_labels'][y].style.display = 'inline-block';
			else this.presentation['row_labels'][y].style.display = 'none';

			for (var x=0; x<this.GRID_SIZE[1]; x++){
				if (x<size_x && y<size_y) this.points[`${y} ${x}`].element.style.display = 'inline-block';
				else this.points[`${y} ${x}`].element.style.display = 'none';
			}
		}

		for (var x=0; x<this.GRID_SIZE[1]; x++){
			if (x<size_x) this.presentation['column_labels'][x].style.display = 'inline-block';
			else this.presentation['column_labels'][x].style.display = 'none';
		}
	}

	create_grid(grid_size){
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

		this.presentation['column_labels'] = {};
		for (var column_nr=0; column_nr<grid_size[1]; column_nr+=1){
			var column_label = document.createElement('div');
			column_label.innerHTML = `${column_nr}`;
			assign_style_to_element(column_label, standard_style);
			column_label.style['backgroundColor'] = wonder_golden;
			column_label.style['height'] = '50px';
			column_label.style['lineHeight'] = '50px';
			this.presentation['column_labels'][column_nr] = column_label;
			row_with_labels.appendChild(column_label);
		}
		basis.appendChild(row_with_labels);

		this.presentation['row_labels'] = {};
		var row_start=grid_size[0]-1, row_end=-1, row_diff = -1;
		if (this.ascending_y){
			row_start = 0;
			row_end = grid_size[0];
			row_diff = 1;
		}

		for (var row_nr=row_start; row_nr != row_end; row_nr += row_diff){
			var row = document.createElement('div');
			basis.appendChild(row);

			var row_label = document.createElement('div');
			assign_style_to_element(row_label, standard_style);
			row_label.style['backgroundColor'] = wonder_golden;
			row_label.style['width'] = '50px';
			row_label.innerHTML = `${row_nr}`;
			this.presentation['row_labels'][row_nr] = row_label;
			row.appendChild(row_label);

			for (var column_nr=0; column_nr<grid_size[1]; column_nr+=1){
				var point = new Point();

				point._coordinates = {'row':row_nr, 'column':column_nr};
				point._signature = `${point._coordinates.row} ${point._coordinates.column}`;
				point.element._signature = point._signature;

				point.element.id = `__sig ${point._signature}`;

				points[`${row_nr} ${column_nr}`] = point;
				point.element._entry = this;
				point.element.addEventListener(_CONFIG_ACCESS_POINT_DATA, function(_event){
					var base = this._entry;
					if (_CONFIG_ACCESS_POINT_DATA == 'contextmenu') _event.preventDefault();
					point_images.innerHTML = '';
					if (base.current_focus){
						base.current_focus._marking.style.background = 'rgba(0, 0, 0, 0)';
						base.save_focus();
						base.current_focus._input.innerHTML = shorthand_text.value;
					}

					base.current_focus = this;
					base.current_focus._marking.style.background = 'linear-gradient(to right bottom, #AA0000 50%, rgba(0, 0, 0, 0) 50%)';
					base.controls.images_text.value = base.maps[base.current_state.map]['points_data'][base.current_focus._signature].images;
					base.controls.scripts_text.value = base.maps[base.current_state.map]['points_data'][base.current_focus._signature].scripts;
					base.controls.shorthand_text.value = base.maps[base.current_state.map]['points_data'][base.current_focus._signature].input;
					base.controls.general_text.value = base.maps[base.current_state.map]['points_data'][base.current_focus._signature].general;

					for (var terrain in base._local_terrains){
						if (base.maps[base.current_state.map]['points_data'][base.current_focus._signature]['terrains'].has(terrain)) base.controls['terrains'][terrain].checked = true;
						else base.controls['terrains'][terrain].checked = false;
					}

					base.controls.input_used.checked = base.maps[base.current_state.map]['points_data'][base.current_focus._signature].used;
					var ordering = ['N', 'E', 'S', 'W'];
					for (var index of [0, 1, 2, 3]){
						base.controls.input_borders[index].checked = base.maps[base.current_state.map]['points_data'][base.current_focus._signature].borders[cardinal_to_dir[ordering[index]]];
					}
					for (var image of base.maps[base.current_state.map]['points_data'][base.current_focus._signature].images.split('\n')){
						if (image){
							var pic = document.createElement('img');
							pic.src = '../' + _CONFIG_PREFIX + image;
							pic.alt = "image should be here";
							pic.width = "600";
							point_images.appendChild(pic);
						}
					}
				});

				point.element.addEventListener('click', function(){
					var base = this._entry;
					if (base.controls.ground_truth.checked && !base.maps[base.current_state.map]['points_data'][this._signature].used) return;
					if (base.current_state.marked) base.current_state.marked._arrow.innerHTML = '';
					
					base.current_state.direction = 0;
					this._arrow.innerHTML = dir_to_arrow[base.current_state.direction];

					base.current_state.marked = this.general;

					var data_to_push = [];
					if (!base.maps[base.current_state.map]['points_data'][this._signature].used){
						if (base.map_element_overlays[base.current_state.map]) base.changer();
						base.maps[base.current_state.map]['points_data'][this._signature].used = true;
						base.points[this._signature].proper_background(base.maps[base.current_state.map]['points_data'][this._signature]);
						data_to_push.push([0, this._signature]);
					}
					base.subsequent_changes.push([Object.assign({}, base.current_state), data_to_push]);
					base.update_presentation(base.current_state);
				});

				row.appendChild(point.element);
			}
		}
		return points;
	}

	create_map_adder(){
		var add_map = this.controls.map_adder_input;
		assign_style_to_element(add_map, map_element_style);
		add_map.style['backgroundColor'] = '#008800';
		add_map.placeholder = 'Map name';

		var map_adder = this.controls.map_adder_button;
		assign_style_to_element(map_adder, map_element_style);
		map_adder.style['backgroundColor'] = '#008800';
		map_adder.style['display'] = 'inline-block';
		map_adder.style['width'] = '80px';
		map_adder.innerHTML = '+';

		map_adder._entry = this;
		map_adder.onclick = function(){
			var base = this._entry;
			var map_name = add_map.value;

			base.maps[map_name] = new Map({'title':map_name, 'grid_size':base._local_grid_default});

			var map_overlay = base.create_new_map_overlay(map_name);
			base.map_element_overlays[map_name] = map_overlay;

			base.controls.maps_list.appendChild(map_overlay);

			base.maps[map_name].initialize_map_data();
			base.change_map(map_name);
		};
	}


	enforce_new_state(new_state){
		if (this.current_state.map != new_state.map) this.change_map(new_state.map);
		if ('direction' in new_state) this.current_state.direction = new_state.direction;

		if (this.current_state.marked) this.current_state.marked._arrow.innerHTML = '';
		this.current_state.marked = this.points[new_state.signature];
		this.update_presentation(this.current_state);
	}

	//direction - as int, moves - amount of moves towards given direction -> resulting Signature
	move_in_direction(signature, direction_int, moves=1){
		var descend = this.ascending_y?-1:1, row, column;
		[row, column] = signature.split(' ').map((x) => Number(x));
		return `${row + moves*integer_to_dir[direction_int].y*descend} ${column + moves*integer_to_dir[direction_int].x}`;
	}

	determine_next_map(map_name){
		if (map_name[0] == '_'){
			if (map_name == '_S') return this.current_state.map;
			current_name_split = this.current_state.map.split(' ');
			last = Number(current_name_split[current_name_split.length-1]);
			if (map_name == '_UP') to_add = 1;
			else to_add = -1;

			current_name_split[current_name_split.length-1] = (last+to_add).toString();
			return current_name_split.join(' ');
		}
		return map_name;
	}

	determine_next_signature(signature){
		if (signature == '_P') return this.current_state.marked._signature;
		return signature;
	}
	determine_next_direction(direction){
		if (typeof direction == 'number') return direction;
		if (direction == 'R') return (this.current_state.direction+2)%4;
		return cardinal_to_dir[direction];

	}
	create_next_state(map, signature, direction){
		return {'map':this.determine_next_map(map), 'signature':this.determine_next_signature(signature), 'direction':this.determine_next_direction(direction)};
	}

	//start can be inferred from direction
	//start, end - both cells; if start + direction unspecified: border not changed
	penetrate(end, direction = -1, start = null){
		var new_place_presentation = this.points[end];
		var new_place_data = this.maps[this.current_state.map]['points_data'][end];

		var old_place_presentation = this.points[start];
		var old_place_data = this.maps[this.current_state.map]['points_data'][start];

		var changes = [];
		if (!new_place_data.used){
			new_place_data.used = true;
			changes.push([0, end]);
			new_place_presentation.element.style['backgroundColor'] = 'white';
			if (this.current_focus && this.current_focus._signature == end) this.controls.input_used.checked = true;
		}
		if (start && !this.maps[this.current_state.map]['points_data'][start].borders[direction]){
			this.current_state.marked.element.style[`border${dir_to_border[direction]}`] = `1px dashed #CCCCCC`;
			this.maps[this.current_state.map]['points_data'][start].borders[direction] = true;
			changes.push([1, start, direction]);
			if (this.current_focus && this.current_focus._signature == start) this.controls.input_borders[direction].checked = true;

			new_place_presentation.element.style[`border${dir_to_border[(direction+2)%4]}`] = `1px dashed #CCCCCC`;
			new_place_data.borders[(direction+2)%4] = true;
			changes.push([1, end, (direction+2)%4]);
			if (this.current_focus && this.current_focus._signature == end) this.controls.input_borders[(direction+2)%4].checked = true;
		}

		return changes;
	}

	process_overhead_move(e_key){
		var changes_introduced = [];
		var direction = arrow_to_dir[e_key];

		var new_place_signature = this.move_in_direction(this.current_state.marked._signature, direction);
		var new_place_data = this.maps[this.current_state.map]['points_data'][new_place_signature];

		if (new_place_data && (!this.controls.ground_truth.checked || (new_place_data.used && this.maps[this.current_state.map]['points_data'][this.current_state.marked._signature].borders[direction]))){
			if (!this.controls.ground_truth.checked){
				changes_introduced.push(...this.penetrate(new_place_signature, direction, this.current_state.marked._signature));
			}
			this.enforce_new_state({'map':this.current_state.map, 'signature':new_place_signature, 'direction':this.current_state.direction});
		}

		return changes_introduced;
	}

	//Returns: [change]; new state established immediately
	process_move_forward(e_key){
		var current_place = this.current_state.marked._coordinates;
		var direction_int = this.current_state.direction;
		var direction = integer_to_dir[this.current_state.direction];
		var changes_introduced = [];

		var direction_proper = ((e_key == 'ArrowUp') ? direction_int : (direction_int+2)%4);
		if (this.maps[this.current_state.map]['points_data'][this.current_state.marked._signature]['scripts']){
			var partial_scripts = this.maps[this.current_state.map]['points_data'][this.current_state.marked._signature]['scripts'].split('\n');

			for (var script of partial_scripts){
				var proper_script = script.split(';');
				if (proper_script[0] == 'W' && proper_script[1] == dir_to_cardinal[direction_proper]){
					var old_direction = this.current_state.direction;
					this.enforce_new_state(this.create_next_state(proper_script[2], proper_script[3], proper_script[4]??old_direction));
					return [];
				}

				if (proper_script[0] == 'WS' && proper_script[1] == dir_to_cardinal[direction_proper]){
					var old_direction = this.current_state.direction;
					var ln = this.current_state.map.length;

					var map_column = this.current_state.map.charCodeAt(ln-2);
					var map_row = this.current_state.map.charCodeAt(ln-1);
					var start = this.current_state.map.substring(0, ln-2);

					var coordinate_x = this.current_state.marked._coordinates['column'];
					var coordinate_y = this.current_state.marked._coordinates['row'];

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
					this.enforce_new_state({'map':`${start}${map_column}${map_row}`, 'signature':`${coordinate_y} ${coordinate_x}`, 'direction':old_direction});

					return [];
				}
			}
		}

		var new_place_signature = this.move_in_direction(this.current_state.marked._signature, direction_proper);
		var new_place_data = this.maps[this.current_state.map]['points_data'][new_place_signature];

		if (new_place_data && (!this.controls.ground_truth.checked || (new_place_data.used && this.maps[this.current_state.map]['points_data'][this.current_state.marked._signature].borders[direction_proper]))){
			if (!this.controls.ground_truth.checked){
				changes_introduced.push(...this.penetrate(new_place_signature, direction_proper, this.current_state.marked._signature));
			}

			if (new_place_data && new_place_data['scripts']){
				var partial_scripts = new_place_data['scripts'].split('\n');
				for (var script of partial_scripts){
					var proper_script = script.split(';');
					if (proper_script[0] == 'T'){
						this.enforce_new_state(this.create_next_state(proper_script[1], proper_script[2], this.current_state.direction));
						return changes_introduced;
					}
				}
			}
			this.enforce_new_state({'map':this.current_state.map, 'signature':new_place_signature, 'direction':this.current_state.direction});
		}
		return changes_introduced;
	}

	constructor(){
		this.controls = {
			'map_name': document.getElementById('map_name'),
			'general_text': document.getElementById('general_text'),
			'scripts_text': document.getElementById('scripts_text'),
			'images_text': document.getElementById('images_text'),
			'point_images': document.getElementById('point_images'),

			'rename': document.getElementById('rename'),
			'save_name': document.getElementById('save_name'),

			'shorthand_text': document.getElementById('shorthand_text'),
			'fly': document.getElementById('fly'),
			'teleport': document.getElementById('teleport'),
			'maps_list': document.getElementById("maps_list"),
			'ground_truth': document.getElementById("ground_truth"),
			'map_general': document.getElementById('map_general'),
			'terrains':{},
			'input_used': document.getElementById("usable"),
			'input_borders': ["North", "East", "South", "West"].map((direction) => document.getElementById(`${direction}_border`)),
			'order': document.getElementById('order'),
			'map_size': document.getElementById('map_size'),
			'orderer': document.getElementById('orderer'),

			'blobber': document.getElementById('model_blobber'),
			'overhead': document.getElementById('model_overhead'),

			'map_adder_input': document.getElementById('map_adder_input'),
			'map_adder_button': document.getElementById('map_adder_button'),
			'translate': document.getElementById('translate'),
			'cutter': document.getElementById('cutter')
		}

		this.checkboxes_terrains();
		this.map_element_overlays = {};

		this.current_state = {
			'marked':null,
			'direction':-1,
			'map':'_unknown'
		}
		this.current_focus = null;
		this.presentation = {};

		this.GRID_SIZE = [_CONFIG_MAX_MAP_SIZE, _CONFIG_MAX_MAP_SIZE];

		this.maps = {};
		this.maps[this.current_state.map] = new Map({'title':'_unknown', 'grid_size': this.GRID_SIZE});
		this.maps[this.current_state.map].initialize_map_data();

		this._game_config = GAME_DATA[_CONFIG_GAME];
		this._local_terrains = this._game_config['terrains'];

		this.ascending_y = false;
		this.revert = false;
		if ('y_order' in this._game_config && this._game_config['y_order'] == 'ascending')
			this.ascending_y = true;
		if ('backspace' in this._game_config && this._game_config['backspace'] == 'revert')
			this.revert = true;

		if ('default map size' in this._game_config) this._local_grid_default = this._game_config['default map size'];
		else this._local_grid_default = this.GRID_SIZE;

		this.create_map_adder();
		this.points = this.create_grid(this.GRID_SIZE);
		this.subsequent_changes = [];

		this.controls.orderer._entry = this;
		this.controls.orderer.onclick = function(){
			var base = this._entry;
			base.maps[base.current_state.map]['general_data'].order = base.controls['order'].value;

			if (base.current_state.map != '_unknown')
				base.map_element_overlays[base.current_state.map]._element.style.backgroundColor = '#880000';

			var sorted_maps = [];
			for (var map_name in base.maps){
				if (map_name == '_unknown') continue;
				sorted_maps.push([base.maps[map_name]['general_data']['order'], map_name])
			}
			sorted_maps.sort();

			var sorted_divs = document.getElementsByClassName('map_overlay');
			for (var [index, map_data] of sorted_maps.entries()){
				var map_name = map_data[1];
				sorted_divs[index]._element._map_name = map_name;
				sorted_divs[index]._text.innerHTML = map_name;
				base.map_element_overlays[map_name] = sorted_divs[index];
				base.update_flight(map_name);
				base.set_changer(map_name);
			}

			if (base.current_state.map != '_unknown')
				base.map_element_overlays[base.current_state.map]._element.style.backgroundColor = 'black';
		}

		document._entry = this;
		document.addEventListener('keydown', function(e){
			var base = this._entry;
			if((e.target.tagName == 'INPUT' && e.target.getAttribute('type') != 'checkbox') || e.target.tagName == 'TEXTAREA') return;
			if (e.key == 't') base.controls.ground_truth.checked = !base.controls.ground_truth.checked;

			if (!base.current_state.marked) return;

			var current_place = base.current_state.marked._coordinates;
			var direction_int = base.current_state.direction;
			var direction = integer_to_dir[direction_int];
			var changes_introduced = [];
			var directional_keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

			if (directional_keys.includes(e.key) && base.controls.overhead.checked){
				changes_introduced = base.process_overhead_move(e.key);
				if (base.current_state.map && base.map_element_overlays[base.current_state.map] && changes_introduced.length) base.changer();
				base.subsequent_changes.push([Object.assign({}, base.current_state), changes_introduced]);
				return;
			}


			if (e.key == 'ArrowUp' || (e.key == 'ArrowDown' && !base.revert)){
				changes_introduced = base.process_move_forward(e.key);
				if (base.current_state.map && base.map_element_overlays[base.current_state.map] && changes_introduced.length) base.changer();
				base.subsequent_changes.push([Object.assign({}, base.current_state), changes_introduced]);
				return;
			}
			if (e.key == 'ArrowDown' && base.revert){
				base.current_state.direction = (base.current_state.direction+2)%4;
				base.subsequent_changes.push([Object.assign({}, base.current_state), []]);
				base.update_presentation(base.current_state);
				return;
			}

			if (e.key == 'y'){
				if (this.maps[base.current_state.map]['points_data'][base.current_state.marked._signature]['scripts']){
					var partial_scripts = this.maps[base.current_state.map]['points_data'][base.current_state.marked._signature]['scripts'].split('\n');
					for (var script of partial_scripts){
						var proper_script = script.split(';');

						if (proper_script[0] == 'P' && proper_script[1].includes(dir_to_cardinal[direction_int])){
							base.enforce_new_state(base.create_next_state(proper_script[2], proper_script[3], proper_script[4]??base.current_state.direction));
							base.subsequent_changes.push([Object.assign({}, base.current_state), []]);
						}

						if (proper_script[0] == 'R' && proper_script[1] == dir_to_cardinal[direction_int]){
							base.current_state.direction = (base.current_state.direction+2)%4;
							base.subsequent_changes.push([Object.assign({}, base.current_state), []]);
							base.update_presentation(base.current_state);
						}
					}
				}
				return;
			}

			//Change: teleporting into unknown
			if (e.key == 'j'){
				var new_signature = base.move_in_direction(base.current_state.marked._signature, base.current_state.direction, 2);
				base.enforce_new_state({'map':base.current_state.map, 'signature':new_signature, 'direction':base.current_state.direction});
				base.subsequent_changes.push([Object.assign({}, base.current_state), []]);
				return;
			}

			for (var terrain in this._local_terrains){
				if (e.key == this._local_terrains[terrain]['button']){
					if (this.maps[base.current_state.map]['points_data'][base.current_state.marked._signature]['terrains'].has(terrain)) 
						this.maps[base.current_state.map]['points_data'][base.current_state.marked._signature]['terrains'].delete(terrain);
					else this.maps[base.current_state.map]['points_data'][base.current_state.marked._signature]['terrains'].add(terrain);
					this.points[base.current_state.marked._signature].proper_background(this.maps[base.current_state.map]['points_data'][base.current_state.marked._signature], );
					this.changer();
					return;
				}
			}

			if (e.key == 'ArrowLeft' || e.key == 'ArrowRight'){
				if (e.key == 'ArrowLeft'){
					base.current_state.direction -= 1;
					if (base.current_state.direction < 0) base.current_state.direction += 4;
				}
				else base.current_state.direction = (base.current_state.direction + 1)%4;
				base.update_presentation(base.current_state);
				base.subsequent_changes.push([Object.assign({}, base.current_state), []]);
				return;
			}

			if (e.key == 'Backspace'){
				if (document.activeElement.tagName == 'INPUT') ;
				else if (base.subsequent_changes){
					base.current_state.marked._arrow.innerHTML = '';
					var dead_state, last_changes;
					[dead_state, last_changes] = base.subsequent_changes.pop();

					for (var change of last_changes){
						if (change[0] == 1){
							base.points[change[1]].style[`border${dir_to_border[change[2]]}`] = '1px solid black';
							base.maps[base.current_state.map]['points_data'][change[1]].borders[change[2]] = false;
						}
						if (change[0] == 0){
							base.points[change[1]].style[`backgroundColor`] = 'grey';
							base.maps[base.current_state.map]['points_data'][change[1]].used = false;
						}
					}

					if (base.subsequent_changes.length){
						var last_state = base.subsequent_changes[base.subsequent_changes.length-1][0];
						if (last_state.map != base.current_state.map) base.change_map(last_state.map);
						base.current_state.direction = last_state.direction;
						base.current_state.marked = last_state.marked;
					}
					else{
						base.current_state.direction = -1;
						base.current_state.marked = null;
					}
					base.update_presentation(base.current_state);
				}
				return;
			}
		});

		document.getElementById('saver')._entry = this;
		document.getElementById('saver').onclick = function(){
			this._entry.dechanger();
			var points_data = [JSON.stringify(this._entry.create_data_dump())];
			var blob = new Blob(points_data, {type : 'text/plain'}); // the blob

			var _a = document.createElement('a');
			_a.download = this._entry.current_state.map + '.json';
			_a.href = URL.createObjectURL(blob);
			_a.dataset.downloadurl = ['json', _a.download, _a.href].join(':');
			_a.style.display = 'none';
			document.body.appendChild(_a);
			_a.click();
			document.body.removeChild(_a);
		};

		const file_input = document.getElementById('loader');
		file_input._entry = this;
		file_input.onchange = () => {
			var all_selected = file_input.files;

			this.save_map_data();
			var base = this;
			for (var map of all_selected){
				var _ = map.text().then(function(result){
					var full_data = JSON.parse(result);
					var map_name = full_data['title'];
					base.maps[map_name] = new Map({'title':map_name, 'full_data':full_data});

					if (map_name in base.map_element_overlays) base.dechanger(map_name);
					else{
						var map_overlay = base.create_new_map_overlay(map_name);
						base.map_element_overlays[map_name] = map_overlay;
						base.controls.maps_list.appendChild(map_overlay);
						base.update_flight(map_name);
					}
				});
			}
		}

		document.getElementById('rename')._entry = this;
		document.getElementById('rename').onclick = function(){
			this._entry.controls.map_name.disabled = false;
		};

		document.getElementById('save_name')._entry = this;
		document.getElementById('save_name').onclick = function(){
			this._entry.controls.map_name.disabled = true;
			this._entry.rename_map(this._entry.current_state.map, this._entry.controls.map_name.value);
		};

		document.getElementById('cutter')._entry = this;
		document.getElementById('cutter').onclick = function(){
			var map = this._entry.maps[this._entry.current_state.map];
			map.cut_map();
			this._entry.controls.map_size.value = `${map.general_data['map size'][0]},${map.general_data['map size'][1]}`;
		};
	}
}

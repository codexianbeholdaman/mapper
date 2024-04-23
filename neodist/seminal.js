
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

class Map{
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
	resize(new_size){
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

	cut(){
		var [[y_min, x_min], [y_max, x_max]] = this.get_extremities();
		this.translate(-y_min, -x_min);
		this.resize([y_max-y_min+1, x_max-x_min+1]);
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

	//TODO: remove in favor of get_extremities
	get_size(){
		var all_points = Object.keys(this.points_data).map((x) => (x.split(' ').map((y) => Number(y))));

		var max_x = 0, max_y = 0;
		for (var coordinates of all_points){
			if (coordinates[0] > max_y) max_y = coordinates[0];
			if (coordinates[1] > max_x) max_x = coordinates[1];
		}
		return [max_y+1, max_x+1];
	}

	initialize_data(){
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
		_map_gd['map size'] = full_data['map size']??this.get_size(); //can be done with get_extremities
		_map_gd['map_type'] = full_data['map_type']??'_default';
	}

	construct_from_nothing(grid_size){
		var _map_gd = this.general_data;

		_map_gd['ground truth'] = false;
		_map_gd['fly'] = "";
		_map_gd['teleport'] = "";
		_map_gd['order'] = "";
		_map_gd['exploration_blobber'] = true;
		_map_gd['map size'] = [grid_size[0], grid_size[1]]; //TODO: Defaulting
		_map_gd['map_type'] = '_default';
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

//Point as presented within a grid
class Point{
	//Terrains data, point data, ground_truth should be the only things taken from the base!
	construct_teleports(){
		var teleports = this._teleports;
		this._teleports_present = true;

		var north_teleport = document.createElement('div');
		var south_teleport = document.createElement('div');
		var west_teleport = document.createElement('div');
		var east_teleport = document.createElement('div');
		var mid_teleport = document.createElement('div');

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
	}

	//If a move occured over field with a focus, update only those; TODO: needs borders
	set_focus_movables(){
		this.base.controls.input_used.checked = this.base.maps[this.base.current_state.map]['points_data'][this.base.current_focus._signature].used;
	}

	constructor(application){
		this.element = document.createElement('div');

		var input_part = document.createElement('div');
		var arrow_part = document.createElement('div');
		var marking = document.createElement('div');
		var teleports = document.createElement('div');

		this.element.appendChild(arrow_part);
		this.element.appendChild(input_part);
		this.element.appendChild(marking);
		this.element.appendChild(teleports);

		this._arrow = arrow_part;
		this._input = input_part;
		this._marking = marking;
		this._teleports = teleports;
		this.element.general = this;

		assign_style_to_element(this.element, standard_style);
		assign_style_to_element(marking, standard_style);
		assign_style_to_element(marking, marking_style);

		assign_style_to_element(teleports, standard_style);
		assign_style_to_element(teleports, marking_style);
		assign_style_to_element(teleports, teleports_style);

		assign_style_to_element(this._arrow, standard_style);
		assign_style_to_element(this._arrow, arrowy_style);
		assign_style_to_element(this._input, inputter_style);
		this.base = application;

		this.element.addEventListener('click', function(){
			var base = this.general.base;
			if (base.controls.ground_truth.checked && !base.maps[base.current_state.map]['points_data'][this._signature].used) return;
			if (base.current_state.marked) base.current_state.marked.clear_pointer();
			
			base.current_state.direction = 0;
			this.general._arrow.innerHTML = dir_to_arrow[base.current_state.direction];

			base.current_state.marked = this.general;

			var data_to_push = [];
			if (!base.maps[base.current_state.map]['points_data'][this._signature].used){
				if (base.map_element_overlays[base.current_state.map]) base.changer();
				base.maps[base.current_state.map]['points_data'][this._signature].used = true;
				base.points[this._signature].proper_background();
				data_to_push.push([0, this._signature]);
			}
			base.subsequent_changes.push([Object.assign({}, base.current_state), data_to_push]);
			base.update_presentation(base.current_state);
		});

		this.element.addEventListener(_CONFIG_ACCESS_POINT_DATA, function(_event){
			var base = this.general.base;
			if (_CONFIG_ACCESS_POINT_DATA == 'contextmenu') _event.preventDefault();
			point_images.innerHTML = '';
			if (base.current_focus){
				base.current_focus._marking.style.background = 'rgba(0, 0, 0, 0)';
				base.save_focus();
				base.current_focus._input.innerHTML = shorthand_text.value;
			}

			base.current_focus = this.general;
			base.current_focus._marking.style.background = 'linear-gradient(to right bottom, #AA0000 50%, rgba(0, 0, 0, 0) 50%)';
			base.controls.images_text.value = base.maps[base.current_state.map]['points_data'][base.current_focus._signature].images;
			base.controls.scripts_text.value = base.maps[base.current_state.map]['points_data'][base.current_focus._signature].scripts;
			base.controls.shorthand_text.value = base.maps[base.current_state.map]['points_data'][base.current_focus._signature].input;
			base.controls.general_text.value = base.maps[base.current_state.map]['points_data'][base.current_focus._signature].general;

			for (var terrain in base._local_terrains){
				if (base.maps[base.current_state.map]['points_data'][base.current_focus._signature]['terrains'].has(terrain)) base.controls['terrains'][terrain].checked = true;
				else base.controls['terrains'][terrain].checked = false;
			}

			//base.controls.input_used.checked = base.maps[base.current_state.map]['points_data'][base.current_focus._signature].used;
			this.general.set_focus_movables();
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
	}

	fix_coordinates(row_nr, column_nr){
		this._coordinates = {'row':row_nr, 'column':column_nr};
		this._signature = `${this._coordinates.row} ${this._coordinates.column}`;
		this.element._signature = this._signature;
		this.element.id = `__sig ${this._signature}`;
	}

	proper_background(){
		var point_data = this.base.maps[this.base.current_state.map]['points_data'][this._signature];
		if (point_data.used) this.element.style['backgroundColor'] = 'white';
		else this.element.style['backgroundColor'] = 'grey';

		//should work after refactor - check
		if (point_data['terrains'].size > 0){
			const [terrain] = point_data['terrains'];
			this.element.style.backgroundColor = this.base._local_terrains[terrain]['color'];
		}
	}

	clear_pointer(){
		this._arrow.innerHTML = '';
	}

	update_teleports(){
		var to_load = this.base.maps[this.base.current_state.map]['points_data'][this._signature];
		if (!this._teleports_present && !to_load.scripts) return;
		if (!this._teleports_present) this.construct_teleports();

		for (var _ of [0, 1, 2, 3]){
			for (var minor in [0, 1]){
				this._teleports._mini_teleports[_]._minors[minor].style.background = 'rgba(0, 0, 0, 0)';
			}
		}
		this._teleports._mini_teleports[4].style.background = 'rgba(0, 0, 0, 0)';

		if (to_load.scripts){
			var scripts = to_load.scripts.split('\n');
			for (var script of scripts){
				if (script == 'undefined') continue;
				var proper_script = script.split(';');
				var color = '#AA0000'; //For W, WS
				if (proper_script[0] == 'P') color = '#008055';
				if (proper_script[0] == 'R') color = '#9900E6';

				var direction = proper_script[1];
				var base_teleport = this._teleports;
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
				if (proper_script[0] == 'R' || proper_script[0] == 'T') this._teleports._mini_teleports[4].style.background = color;
			}
		}
	}

	//TODO: to point; overkill sometimes ('y' for example)
	update_field(){
		var to_load = this.base.maps[this.base.current_state.map]['points_data'][this._signature];

		for (var i=0; i<4; i+=1){
			if (to_load.borders[i]) this.element.style[`border${dir_to_border[i]}`] = `1px dashed #CCCCCC`;
			else this.element.style[`border${dir_to_border[i]}`] = '1px solid black';
		}
		this.proper_background();

		this._input.innerHTML = to_load.input;
		this.update_teleports();
	}
}

class Grid{
	create_label(value, type){
		var wonder_golden = '#B37700';
		var label = document.createElement('div');

		label.innerHTML = `${value}`;
		assign_style_to_element(label, standard_style);
		label.style['backgroundColor'] = wonder_golden;
		
		if (type == 'r'){
			label.style['width'] = '50px';
			label.style['position'] = 'sticky';
			label.style['left'] = '0';
			label.style['zIndex'] = '1';
		}
		else{
			label.style['height'] = '50px';
			label.style['lineHeight'] = '50px';
		}

		return label;
	}

	constructor(grid_size, application){
		this.base = application;
		this.full_size = grid_size;

		var points = {};
		this.row_with_labels = document.createElement('div');
		this.grid = document.getElementById('map_proper');

		this.row_with_labels.style['position'] = 'sticky';
		this.row_with_labels.style['top'] = '0';
		this.row_with_labels.style['zIndex'] = '10';
		this.rows = {};

		var point_of_entry = document.createElement('div');
		assign_style_to_element(point_of_entry, standard_style);
		assign_style_to_element(point_of_entry, point_of_entry_style);
		point_of_entry.innerHTML = 'y\\x'
		this.row_with_labels.appendChild(point_of_entry);

		this.column_labels = {};
		for (var column_nr=0; column_nr<grid_size[1]; column_nr+=1){
			var column_label = this.create_label(column_nr, 'c');
			this.column_labels[column_nr] = column_label;
			this.row_with_labels.appendChild(column_label);
		}
		this.grid.appendChild(this.row_with_labels);

		this.row_labels = {};
		var row_start=grid_size[0]-1, row_end=-1, row_diff = -1;
		if (application.ascending_y){
			row_start = 0;
			row_end = grid_size[0];
			row_diff = 1;
		}

		for (var row_nr=row_start; row_nr != row_end; row_nr += row_diff){
			var row = document.createElement('div');
			this.rows[row_nr] = row;
			this.grid.appendChild(row);

			var row_label = this.create_label(row_nr, 'r');
			this.row_labels[row_nr] = row_label;
			row.appendChild(row_label);

			for (var column_nr=0; column_nr<grid_size[1]; column_nr+=1){
				var point = new Point(application);
				point.fix_coordinates(row_nr, column_nr);
				points[`${row_nr} ${column_nr}`] = point;
				row.appendChild(point.element);
			}
		}
		this.points = points;
	}

	//a lot of constructor is copied
	enlarge(new_size){
		for (var column_nr=this.full_size[1]; column_nr<new_size[1]; column_nr+=1){
			var column_label = this.create_label(column_nr, 'c');
			this.column_labels[column_nr] = column_label;
			this.row_with_labels.appendChild(column_label);
		}

		for (var row_nr=0; row_nr<this.full_size[0]; row_nr++){
			var row = this.rows[row_nr];
			for (var column_nr=this.full_size[1]; column_nr<new_size[1]; column_nr+=1){
				var point = new Point(this.base);
				point.fix_coordinates(row_nr, column_nr);
				this.points[`${row_nr} ${column_nr}`] = point;
				this.rows[row_nr].appendChild(point.element);
			}
		}

		for (var row_nr=this.full_size[0]; row_nr<new_size[0]; row_nr++){
			var row = document.createElement('div');
			this.rows[row_nr] = row;
			if (this.base.ascending_y) this.grid.append(row);
			else this.row_with_labels.insertAdjacentElement('afterend', row);

			var row_label = this.create_label(row_nr, 'r');
			this.row_labels[row_nr] = row_label;
			row.appendChild(row_label);

			for (var column_nr=0; column_nr<new_size[1]; column_nr+=1){
				var point = new Point(this.base);
				point.fix_coordinates(row_nr, column_nr);
				this.points[`${row_nr} ${column_nr}`] = point;
				row.appendChild(point.element);
			}
		}
		this.full_size = new_size;
	}

	resize(new_size){
		var size_y = new_size[0];
		var size_x = new_size[1];
		if (size_y > this.full_size[0] || size_x > this.full_size[1])
			this.enlarge([Math.max(size_y, this.full_size[0]), Math.max(size_x, this.full_size[1])]);

		for (var y=0; y<this.full_size[0]; y++){
			if (y<size_y) this.row_labels[y].style.display = 'inline-block';
			else this.row_labels[y].style.display = 'none';

			for (var x=0; x<this.full_size[1]; x++){
				if (x<size_x && y<size_y) this.points[`${y} ${x}`].element.style.display = 'inline-block';
				else this.points[`${y} ${x}`].element.style.display = 'none';
			}
		}

		for (var x=0; x<this.full_size[1]; x++){
			if (x<size_x) this.column_labels[x].style.display = 'inline-block';
			else this.column_labels[x].style.display = 'none';
		}
	}
}

class Renamer{
	activate(){
		this.app.controls.map_name.disabled = false;
		this.active = true;
		this.element.classList.add('active');
	}

	deactivate(valid=true){
		this.app.controls.map_name.disabled = true;
		if (valid)
			this.app.rename_map(this.app.current_state.map, this.app.controls.map_name.value);
		this.active = false;
		this.element.classList.remove('active');
	}

	constructor(element, app){
		this.renamer = element;
		this.active = false;

		this.app = app;
		this.element = element;

		element._entry = this;
		element.onclick = function(){
			if (!this._entry.active) this._entry.activate();
			else this._entry.deactivate();
		};
	}

}

class Map_overlay{
	static create_movement_overlay(letter){
		var flier = document.createElement('div');
		assign_style_to_element(flier, map_element_style);

		flier.classList.add(`__movement_${letter}`);
		flier.style.width = "50px";
		flier.innerHTML = letter;
		flier._type = letter;
		flier.style.display = "none";
		return flier;
	}

	get_colors(){
		return this.app._local_map_types[this.app.maps[this.map_name]['general_data']['map_type']];
	}

	constructor(map_name, app){
		this.app = app;
		var map_overlay = document.createElement('div');
		var new_map_element = document.createElement('div');
		new_map_element.id = `__map ${map_name}`;
		new_map_element.classList.add(`__map`);
		map_overlay.classList.add(`__overlay`);

		var flier = Map_overlay.create_movement_overlay('F');
		var teleporter = Map_overlay.create_movement_overlay('T');

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
		this.map_name = map_name;

		text.textContent = map_name;
		new_map_element.appendChild(changer);
		new_map_element._entry = app;
		new_map_element.onclick = function(){
			var app = this._entry;
			app.change_map(this.base.map_name);
		};

		new_map_element.onmouseover = function(){
			var app = this._entry;
			if (app.current_state.map != this.base.map_name) this.style['backgroundColor'] = this.base.get_colors()['hover'];
		}
		new_map_element.onmouseout = function(){
			var app = this._entry;
			if (app.current_state.map != this.base.map_name) this.style['backgroundColor'] = this.base.get_colors()['inactive'];
		}

		assign_style_to_element(new_map_element, map_element_style);
		new_map_element.style.position = 'relative';

		map_overlay.appendChild(new_map_element);
		map_overlay.appendChild(flier);
		map_overlay.appendChild(teleporter);

		new_map_element.appendChild(text);
		this._text = text;
		this._element = new_map_element;
		this._element.base = this;

		this._changer = changer;
		this._fly = flier;
		this._fly.base = this;

		this._teleport = teleporter;
		this._teleport.base = this;
		this._overlay = map_overlay;

		this._overlay.base = this;
		this.deactivate();
	}

	update_part(map_name, movement){
		var _map_gd = this.app.maps[map_name]['general_data'];
		var element = this['_' + movement];

		if (!_map_gd[movement] || _map_gd[movement] == '') element.style.display = 'none';
		else if (_map_gd[movement]!='undefined'){
			element.style.display = 'inline-block';
			element._entry = this.app;
			element.onmouseover = function(){this.style.backgroundColor = this.base.get_colors()['hover'];};
			element.onmouseout = function(){this.style.backgroundColor = this.base.get_colors()['inactive'];};
			element.style.backgroundColor = this.get_colors()['inactive'];

			element.onclick = function(){
				var app = this._entry;
				var new_direction, new_place;

				if (this._type == 'F'){
					new_direction = app.current_state.direction;
					if (new_direction == -1) new_direction = 0; //By default - northern
					new_place = _map_gd[movement];
				}
				else{
					var _tmp = _map_gd[movement].split(';');
					new_direction = cardinal_to_dir[_tmp[1]];
					new_place = _tmp[0];
				}

				var map_proper = app.maps[this.base.map_name];
				if (!map_proper.points_data[new_place].used) map_proper.points_data[new_place].used = true; //TODO: acknowledge in subsequent changes

				app.enforce_new_state({'map':this.base.map_name, 'direction':new_direction, 'signature':new_place});
			}
		}
	}

	set_changer(){
		if (this.app.maps[this.map_name]['is_map_changed']) 
			this._changer.style.backgroundColor = '#88CC00';
		else
			this._changer.style.backgroundColor = 'rgba(0,0,0,0)';
	}

	activate(){
		this._element.style.backgroundColor = '#000000';
	}
	deactivate(){
		this._element.style.backgroundColor = this.get_colors()['inactive'];
	}
}

class Movement_processor{
	constructor(maps){
		this.maps = maps;
	}

	define_world(current_state, operation){
		this.state = Movement_processor.translate_state(current_state);
		this.operation = operation;
	}

	determine_next_map(map_name){
		if (map_name[0] == '_'){
			if (map_name == '_S') return this.state.map;
			var current_name_split = this.state.map.split(' ');
			var last = Number(current_name_split[current_name_split.length-1]);

			var to_add = -1;
			if (map_name == '_UP') to_add = 1;

			current_name_split[current_name_split.length-1] = (last+to_add).toString();
			return current_name_split.join(' ');
		}
		return map_name;
	}

	determine_next_signature(signature){
		if (signature == '_P') return this.state.signature.join(' ');
		return signature;
	}
	determine_next_direction(direction){
		if (typeof direction == 'number') return direction;
		if (direction == 'R') return (this.state.direction+2)%4;
		return cardinal_to_dir[direction];
	}

	create_next_state(map, signature, direction){
		return {'map':this.determine_next_map(map), 'signature':this.determine_next_signature(signature), 'direction':this.determine_next_direction(direction)};
	}

	mark_if_unused(next_state){
		return (!this.maps[next_state.map].points_data[next_state.signature].used)?[[0, next_state.signature]]:[]
	}

	trap_movement(proper_script){
		var next_state = this.create_next_state(proper_script[1], proper_script[2], this.state.direction);
		var changes = this.mark_if_unused(next_state);
		return [next_state, changes];
	}

	wilderness_movement(proper_script){
		var old_direction = this.state.direction;
		var next_state = this.create_next_state(proper_script[2], proper_script[3], proper_script[4]??old_direction);
		var changes = this.mark_if_unused(next_state);
		return [next_state, changes];
	}

	wilderness_movement_simplified(proper_script){
		var old_direction = this.state.direction;
		var map = this.state.map;
		var [coordinate_y, coordinate_x] = this.state.signature;
		var ln = map.length;

		var map_column = map.charCodeAt(ln-2);
		var map_row = map.charCodeAt(ln-1);
		var start = map.substring(0, ln-2);


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

		var next_state = {'map':`${start}${map_column}${map_row}`, 'signature':`${coordinate_y} ${coordinate_x}`, 'direction':old_direction};
		var changes = this.mark_if_unused(next_state);
		return [next_state, changes];
	}

	process_blobber_movement(old_state, movement_type){
	}

	static translate_state(state){
		return {'map':state.map, 'signature':state.marked._signature.split(' ').map(x => Number(x)), 'direction':state.direction};
	}
}

class Application{
	checkboxes_terrains(){
		var terrains_div = document.getElementById('terrains');
		for (var terrain in this._local_terrains){
			var _input = document.createElement('input');
			_input.type = 'checkbox';
			_input.name = terrain;
			_input.id = `terrain_` + terrain;

			var _label = document.createElement('label');
			_label.innerHTML = terrain[0].toUpperCase() + terrain.slice(1);
			_label.htmlFor = terrain;

			terrains_div.appendChild(_input);
			terrains_div.appendChild(_label);
			this.controls['terrains'][terrain] = _input;
		}
	}

	radios_map_types(){
		var map_types_div = this.controls.map_types_box;
		for (var map_type in this._local_map_types){
			var _input = document.createElement('input');
			_input.type = 'radio';
			_input.name = 'map_types';
			_input.value = map_type;
			_input.id = `map_type_` + map_type;

			var _label = document.createElement('label');
			_label.innerHTML = map_type[0].toUpperCase() + map_type.slice(1);
			_label.htmlFor = `map_type_` + map_type;

			map_types_div.appendChild(_input);
			map_types_div.appendChild(_label);
			this.controls['map_types'][map_type] = _input;
		}
	}

	update_presentation(current_state){
		if (!this.current_state['marked']) return;
		this.current_state['marked']._arrow.innerHTML = dir_to_arrow[this.current_state.direction];
	}

	set_changer(map){
		if (map == '_unknown') return;
		this.map_element_overlays[map].set_changer();
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

	update_flight(map_name){
		if (map_name == '_unknown') return;
		this.map_element_overlays[map_name].update_part(map_name, 'fly');
		this.map_element_overlays[map_name].update_part(map_name, 'teleport');
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

			if (!map_switch) this.points[coordinate].update_field();
		}
	}

	get_checked_map_type(){
		var radios = this.controls.map_types_box.querySelectorAll('input[name="map_types"]:checked');
		return (radios.length>0) ? radios[0].value: null;
	}

	save_map_data(){
		this.save_focus(true);
		var _map_gd = this.maps[this.current_state.map]['general_data'];
		_map_gd['order'] = this.controls.order.value;
		_map_gd['ground truth'] = this.controls.ground_truth.checked;
		_map_gd['fly'] = this.controls.fly.value;
		_map_gd['teleport'] = this.controls.teleport.value;
		_map_gd['exploration_blobber'] = this.controls.blobber.checked;
		_map_gd['map_type'] = this.get_checked_map_type();

		var old_map_size = _map_gd['map size'];
		var new_map_size = this.controls.map_size.value.split(',').map((x) => Number(x));

		if (old_map_size && (old_map_size[0] != new_map_size[0] || old_map_size[1] != new_map_size[1]) && this.current_state.map != '_unknown')
			this.maps[this.current_state.map].resize(new_map_size);
		if (this.controls.translate.value){
			this.maps[this.current_state.map].translate(...this.controls.translate.value.split(',').map(z => Number(z)));
			this.controls.translate.value = '';
		}

		_map_gd['map general'] = this.controls.map_general.value;
	}

	load_map_presentation(map_name){
		var to_load = this.maps[map_name]['points_data'];
		this.current_state['map'] = map_name;
		this.grid.resize(this.maps[map_name]['general_data']['map size']);

		var _map_gd = this.maps[this.current_state.map]['general_data'];
		this.controls.ground_truth.checked = _map_gd['ground truth'];
		this.controls.fly.value = _map_gd['fly'];
		this.controls.teleport.value = _map_gd['teleport']??'';

		this.controls.map_size.value = _map_gd['map size'];
		this.controls.blobber.checked = _map_gd['exploration_blobber'];
		this.controls.overhead.checked = !_map_gd['exploration_blobber'];
		this.controls.map_types[_map_gd['map_type']].checked = true;

		this.controls.map_general.value = _map_gd['map general']??'';
		this.controls.order.value = _map_gd['order']??'';

		for (var coordinates in to_load) this.points[coordinates].update_field();

		if (this.current_state['marked']){
			this.current_state['marked'].clear_pointer();
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
			this.map_element_overlays[this.current_state.map].deactivate();
		}
		this.map_element_overlays[new_map].activate();
		this.update_flight(this.current_state.map);

		this.current_state['map'] = new_map;
		this.load_map_presentation(new_map);
		this.controls.map_name.value = new_map;
		this.renamer.deactivate(false);
	}

	rename_map(old_map_name, new_map_name){
		if (old_map_name == new_map_name)
			return;
		if (this.map_element_overlays[old_map_name]){
			this.map_element_overlays[old_map_name]._text.innerHTML = new_map_name;
			this.map_element_overlays[old_map_name].map_name = new_map_name;

			this.maps[new_map_name] = this.maps[old_map_name];
			delete this.maps[old_map_name];

			this.map_element_overlays[new_map_name] = this.map_element_overlays[old_map_name];
			delete this.map_element_overlays[old_map_name];
		}

		if (this.current_state.map == old_map_name)
			this.current_state.map = new_map_name;
	}

	create_data_dump(){
		var map_name = this.current_state['map'];
		this.save_map_data();
		var save_data = this.maps[map_name]['general_data'];

		var to_save = {'title':map_name, 'ground truth':save_data['ground truth'], 'fly':save_data['fly'], 'map_type':save_data['map_type'], 'exploration_blobber':save_data['exploration_blobber'], 'teleport':save_data['teleport'], 'map size':save_data['map size'], 'map general':save_data['map general'], 'order':save_data['order'], 'points':{}};

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

			var map_overlay = new Map_overlay(map_name, base);
			base.map_element_overlays[map_name] = map_overlay;

			base.controls.maps_list.appendChild(map_overlay._overlay);

			base.maps[map_name].initialize_data();
			base.change_map(map_name);
		};
	}

	//Requires: 'map' field, 'signature' field; optionally 'direction' field (integer)
	enforce_new_state(new_state){
		if (this.current_state.map != new_state.map) this.change_map(new_state.map);
		if ('direction' in new_state) this.current_state.direction = new_state.direction;

		if (this.current_state.marked) this.current_state.marked.clear_pointer();
		this.current_state.marked = this.points[new_state.signature];
		this.update_presentation(this.current_state);
	}

	//direction - as int, moves - amount of moves towards given direction -> resulting Signature
	move_in_direction(signature, direction_int, moves=1){
		var descend = this.ascending_y?-1:1, row, column;
		[row, column] = signature.split(' ').map((x) => Number(x));
		return `${row + moves*integer_to_dir[direction_int].y*descend} ${column + moves*integer_to_dir[direction_int].x}`;
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

	execute_changes(changes){
		for (var change of changes){
			if (change[0] == 0){
				var signature = change[1];
				this.maps[this.current_state.map].points_data[signature].used = true;
				if (this.current_focus == this.points[signature])
					this.points[signature].set_focus_movables();
				this.points[signature].proper_background();
			}
		}
	}

	//Returns: [change]; new state establishement deferred to the application
	process_move_forward(e_key){
		this.movement_processor.define_world(this.current_state, e_key);
		var current_place = this.current_state.marked._coordinates;
		var direction_int = this.current_state.direction;
		var direction = integer_to_dir[this.current_state.direction];
		var changes_introduced = [];

		var direction_proper = ((e_key == 'ArrowUp') ? direction_int : (direction_int+2)%4);
		if (this.maps[this.current_state.map]['points_data'][this.current_state.marked._signature]['scripts']){
			var partial_scripts = this.maps[this.current_state.map]['points_data'][this.current_state.marked._signature]['scripts'].split('\n');

			for (var script of partial_scripts){
				var proper_script = script.split(';');
				if (proper_script[0] == 'W' && proper_script[1].includes(dir_to_cardinal[direction_proper])){
					var [new_state, changes] = this.movement_processor.wilderness_movement(proper_script);
					this.enforce_new_state(new_state);
					this.execute_changes(changes);
					return changes;
				}

				if (proper_script[0] == 'WS' && proper_script[1].includes(dir_to_cardinal[direction_proper])){
					var [new_state, changes] = this.movement_processor.wilderness_movement_simplified(proper_script);
					this.enforce_new_state(new_state);
					this.execute_changes(changes);
					return changes;
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
					//TODO: Makeshift operation - awaiting for the advent of Movement_processor proper
					if (proper_script[0] == 'T'){
						this.movement_processor.define_world(this.current_state, e_key);
						var [new_state, changes] = this.movement_processor.trap_movement(proper_script);
						this.enforce_new_state(new_state);
						this.execute_changes(changes);
						return [...changes_introduced, ...changes];
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
			'map_types_box': document.getElementById('map_types_box'),
			'map_types':{},

			'map_adder_input': document.getElementById('map_adder_input'),
			'map_adder_button': document.getElementById('map_adder_button'),
			'translate': document.getElementById('translate'),
			'cutter': document.getElementById('cutter'),
			'renamer': document.getElementById('rename')
		};

		if (_CONFIG_GAME in GAME_DATA) this._game_config = GAME_DATA[_CONFIG_GAME];
		else this._game_config = GAME_DATA['FALLBACK'];

		this._local_terrains = this._game_config['terrains'] ?? {};
		this._local_map_types = this._game_config['map_types'] ?? {};
		this._local_map_types['_default'] = create_map_type('#880000', '#440000');

		this.checkboxes_terrains();
		this.radios_map_types();
		this.map_element_overlays = {};

		this.current_state = {
			'marked':null,
			'direction':-1,
			'map':'_unknown'
		}
		this.current_focus = null;

		if ('default map size' in this._game_config) this._local_grid_default = this._game_config['default map size'];
		else this._local_grid_default = [16, 16];

		this.maps = {};
		this.movement_processor = new Movement_processor(this.maps);
		this.maps[this.current_state.map] = new Map({'title':'_unknown', 'grid_size': this._local_grid_default});
		this.maps[this.current_state.map].initialize_data();

		this.ascending_y = false;
		this.revert = false;
		if ('y_order' in this._game_config && this._game_config['y_order'] == 'ascending')
			this.ascending_y = true;
		if ('backspace' in this._game_config && this._game_config['backspace'] == 'revert')
			this.revert = true;


		this.create_map_adder();
		this.grid = new Grid(this._local_grid_default, this);
		this.points = this.grid.points;

		this.subsequent_changes = [];
		this.controls.orderer._entry = this;
		this.controls.orderer.onclick = function(){
			var base = this._entry;
			base.maps[base.current_state.map]['general_data'].order = base.controls['order'].value;

			if (base.current_state.map != '_unknown')
				base.map_element_overlays[base.current_state.map].deactivate();

			var sorted_maps = [];
			for (var map_name in base.maps){
				if (map_name == '_unknown') continue;
				sorted_maps.push([base.maps[map_name]['general_data']['order'], map_name])
			}
			sorted_maps.sort();

			var sorted_overlays = [...document.getElementsByClassName('map_overlay')].map(x => x.base);
			for (var [index, map_data] of sorted_maps.entries()){
				var map_name = map_data[1]; //TODO: map name affix
				sorted_overlays[index].map_name = map_name;
				sorted_overlays[index]._text.innerHTML = map_name;
				base.map_element_overlays[map_name] = sorted_overlays[index];
				base.update_flight(map_name);
				base.set_changer(map_name);
				sorted_overlays[index].deactivate();
			}

			if (base.current_state.map != '_unknown')
				base.map_element_overlays[base.current_state.map].activate();
		}

		document._entry = this;
		document.addEventListener('keydown', function(e){
			var base = this._entry;
			if((e.target.tagName == 'INPUT' && e.target.getAttribute('type') != 'checkbox' && e.target.getAttribute('type') != 'radio') || e.target.tagName == 'TEXTAREA') return;
			if (e.key == 't') base.controls.ground_truth.checked = !base.controls.ground_truth.checked;

			if (!base.current_state.marked) return;

			var current_place = base.current_state.marked._coordinates;
			var direction_int = base.current_state.direction;
			var direction = integer_to_dir[direction_int];
			var changes_introduced = [];
			var directional_keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

			if (directional_keys.includes(e.key))
				e.preventDefault();
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
				if (base.maps[base.current_state.map]['points_data'][base.current_state.marked._signature]['scripts']){
					var partial_scripts = base.maps[base.current_state.map]['points_data'][base.current_state.marked._signature]['scripts'].split('\n');
					for (var script of partial_scripts){
						var proper_script = script.split(';');

						if (proper_script[0] == 'P' && proper_script[1].includes(dir_to_cardinal[direction_int])){
							base.movement_processor.define_world(base.current_state);
							base.enforce_new_state(base.movement_processor.create_next_state(proper_script[2], proper_script[3], proper_script[4]??base.current_state.direction));
							var changed = [];
							if (!base.maps[base.current_state.map].points_data[base.current_state.marked._signature].used){
								base.maps[base.current_state.map].points_data[base.current_state.marked._signature].used = true;
								changed = [[0, base.current_state.marked._signature]];
							}
							base.subsequent_changes.push([Object.assign({}, base.current_state), changed]);
							base.points[base.current_state.marked._signature].proper_background();
						}

						if (proper_script[0] == 'R' && proper_script[1].includes(dir_to_cardinal[direction_int])){
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

			for (var terrain in base._local_terrains){
				if (e.key == base._local_terrains[terrain]['button']){
					if (base.maps[base.current_state.map]['points_data'][base.current_state.marked._signature]['terrains'].has(terrain)) 
						base.maps[base.current_state.map]['points_data'][base.current_state.marked._signature]['terrains'].delete(terrain);
					else base.maps[base.current_state.map]['points_data'][base.current_state.marked._signature]['terrains'].add(terrain);
					base.points[base.current_state.marked._signature].proper_background();
					base.changer();
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
					base.current_state.marked.clear_pointer();
					var dead_state, last_changes;
					[dead_state, last_changes] = base.subsequent_changes.pop();

					for (var change of last_changes){
						if (change[0] == 1){
							base.points[change[1]].element.style[`border${dir_to_border[change[2]]}`] = '1px solid black';
							base.maps[base.current_state.map]['points_data'][change[1]].borders[change[2]] = false;
						}
						if (change[0] == 0){
							base.points[change[1]].element.style[`backgroundColor`] = 'grey';
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

			//TODO: Only for nw's eyes
			//if (e.ctrlKey && e.key == 'r'){
			//	var win = nw.Window.get();
			//	win.reload();
			//}
		});

		//TODO: Only for nw's eyes
		//this.base_scale = 1;
		//document.addEventListener('wheel', function(e){
		//	if (e.ctrlKey){
		//		this._entry.base_scale = this._entry.base_scale + e.deltaY * (-0.01);
		//		nw.Window.get(window).zoomLevel = this._entry.base_scale;
		//	}
		//	
		//});

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
						var map_overlay = new Map_overlay(map_name, base);
						base.map_element_overlays[map_name] = map_overlay;
						base.controls.maps_list.appendChild(map_overlay._overlay);
						base.update_flight(map_name);
					}
				});
			}
		}

		this.renamer = new Renamer(this.controls.renamer, this);

		this.controls.cutter._entry = this;
		this.controls.cutter.onclick = function(){
			this._entry.save_focus();
			this._entry.current_focus = null;
			var map = this._entry.maps[this._entry.current_state.map];
			map.cut();
			this._entry.controls.map_size.value = `${map.general_data['map size'][0]},${map.general_data['map size'][1]}`;
			this._entry.change_map(this._entry.current_state.map);
		};
	}
}

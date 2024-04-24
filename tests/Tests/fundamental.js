import * as configs from '../../src/config.js';
import * as game_configs from '../../src/game_terrain.js';

game_configs.GAME_DATA['mock'] = {
	'terrains':{
		'river':game_configs.create_terrain('#99FFFF', 'w'),
		'muscle':game_configs.create_terrain('#9B7D4F', 'm'),
	},
	'map_types':{
		'typo':game_configs.create_map_type('#AAAAAA', '#BBBBBB'),
	},
	'default map size':[16, 16],
	'y_order':'ascending',
	'backspace':'revert'
}

export var full_mock = `
<!DOCTYPE html>

<html lang="en">
	<body>
		<div id="maps">
			<div id="adder">
				<input id="map_adder_input">
				<div id="map_adder_button"></div>
			</div>
			<div id="maps_list"></div>
		</div>

		<div id="map_data">
			<header>
				<input id="map_name" value="map name" disabled>
				<div class="standard_button" id="rename">Rename</div>
			</header>
			<div id="map_proper"></div>
			<div id="data">
				<div class="partial_data" id="point_data">
					<textarea name="general" id="general_text"></textarea>
					<textarea name="scripts" id="scripts_text"></textarea>
					<textarea name="images" id="images_text"></textarea>
					<input name="shorthand" id="shorthand_text"/>

					<input type="checkbox" name="usable" id="usable"/>
					<input type="checkbox" name="North_border" id="North_border"/>
					<input type="checkbox" name="West_border" id="West_border"/>
					<input type="checkbox" name="East_border" id="East_border"/>
					<input type="checkbox" name="South_border" id="South_border"/>

					<div id="terrains"></div>
					<div id="point_images"></div>
					<div class="data_type_label">Point data</div>
				</div>

				<div class="partial_data" id="general_data">
					<textarea name="map_general" id="map_general"></textarea>
					<input type="checkbox" name="ground_truth" id="ground_truth"/>
					<input name="fly" id="fly"/>
					<input name="teleport" id="teleport"/>
					<input name="order" id="order"/>
					<input type="radio" name="model" id="model_blobber"/>
					<input type="radio" name="model" id="model_overhead"/>
					<input name="map_size" id="map_size"/>
					<div class="data_type_label">Map data</div>
				</div>

				<div class="partial_data" id="transforms">
					<label for="translate" style="font-size:20px">Translate</label> <input name="translate" id="translate" style="width:200px; height:30px; font-size:20px"/>
				</div>
				<div id="cutter"></div>
				<div id="killer"></div>
				<div id="map_types_box"></div>
			</div>
		</div>

		<div>
			<a id="saver">Save</a>
			<label id="load_label"><input id="loader" multiple type="file" style="display:none"/>Load</label>
			<div id="orderer">Order</div>
		</div>
	</body>
</html>
`;

export const click_event = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
});
export const auxclick_event = new MouseEvent("auxclick", {
        view: window,
        bubbles: true,
        cancelable: true,
});

const direction_to_key = {
	'R': 'ArrowRight',
	'U': 'ArrowUp',
	'D': 'ArrowDown',
	'L': 'ArrowLeft'
}

export class Document_utils{
	constructor(doc){
		this.doc = doc;
	}
	add_map(name){
		var input = this.doc.getElementById('map_adder_input');
		input.value = name;
		var adder = this.doc.getElementById('map_adder_button');
		adder.dispatchEvent(click_event);
	}
	rename_map(new_name){
		var rename_button = this.doc.getElementById('rename');
		rename_button.dispatchEvent(click_event);
		var map_name = this.doc.getElementById('map_name');
		map_name.value = new_name;

		rename_button.dispatchEvent(click_event);
	}

	static get_point(y, x){
		return `__sig ${y} ${x}`;
	}

	click_on_id(id){
		var element = this.doc.getElementById(id);
		element.dispatchEvent(click_event);
	}

	get_map_overlay(name){
		return Array.from(this.doc.getElementsByClassName('__overlay')).filter(x => x.getElementsByTagName('span')[0].innerHTML == name)[0];
	}

	click_on_map(name){
		var element = this.get_map_overlay(name).getElementsByClassName('__map')[0];
		element.dispatchEvent(click_event);
	}

	click_on_flight(name, letter='F'){
		var element = this.get_map_overlay(name).getElementsByClassName(`__movement_${letter}`)[0];
		element.dispatchEvent(click_event);
	}

	click_on_point(y, x){
		this.click_on_id(Document_utils.get_point(y, x));
	}

	auxclick_on_point(y, x){
		var element = this.doc.getElementById(Document_utils.get_point(y, x));
		element.dispatchEvent(auxclick_event);
	}

	press_key(key){
		this.doc.dispatchEvent(new KeyboardEvent('keydown', {'key': key}));
	}

	chain_directions(directions){
		for (var direction of directions){
			this.press_key(direction_to_key[direction]);
		}
	}

	auxclick_set(signature, id, value){
		this.auxclick_on_point(...signature);
		this.doc.getElementById(id).value = value;
		this.auxclick_on_point(...signature);
	}
}

export class Map_data_parser{
	constructor(data){
		this.data = data;
	}

	check_usable(y, x){
		return this.data.points[`${y} ${x}`].used;
	}
	get_all_usable(){
		var entries = Object.entries(this.data.points);
		return new Set(entries.filter(x => x[1].used).map(x => x[0]));
	}
}

export class Application_utils{
	static check_all_fields(app, expected){
		var result = new Map_data_parser(app.create_data_dump());
		expect(result.get_all_usable()).toStrictEqual(new Set(expected));
	}
}

export function set_configs(map_size = 16){ //unused arg
	configs._CONFIG_GAME = 'mock';
}

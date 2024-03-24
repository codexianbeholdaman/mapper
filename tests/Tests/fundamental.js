import * as configs from '../../src/config.js';

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
				<div class="standard_button" id="save_name">Savo</div>
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

		var save_button = this.doc.getElementById('save_name');
		save_button.dispatchEvent(click_event);
	}

	click_on_id(id){
		var element = this.doc.getElementById(id);
		element.dispatchEvent(click_event);
	}

	click_on_map(name){
		var element = Array.from(this.doc.getElementsByClassName('__map')).filter(x => x.getElementsByTagName('span')[0].innerHTML == name)[0];
		element.dispatchEvent(click_event);
	}

	click_on_point(y, x){
		this.click_on_id(`__sig ${y} ${x}`);
	}

	press_key(key, element=null){
		if (!element)
			this.doc.dispatchEvent(new KeyboardEvent('keydown', {'key': key}));
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

export function set_configs(map_size = 16){
	configs._CONFIG_GAME = 'Pool of Radiance';
	configs._CONFIG_MAX_MAP_SIZE = 16;
}

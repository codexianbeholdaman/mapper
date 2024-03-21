/**
 * @jest-environment jsdom
 */
import {Application} from '../../src/seminal.js';
import 'jsdom-worker';

var full_mock = `
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

const click_event = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
});

class Document_utils{
	constructor(doc){
		this.doc = doc;
	}
	add_map(name){
		var input = this.doc.getElementById('map_adder_input');
		input.value = name;
		var adder = this.doc.getElementById('map_adder_button');
		adder.dispatchEvent(click_event);
	}

	click_on_id(id){
		var element = this.doc.getElementById(id);
		element.dispatchEvent(click_event);
	}

	click_on_map(name){
		this.click_on_id(`__map ${name}`);
	}

	click_on_point(y, x){
		this.click_on_id(`__sig ${y} ${x}`);
	}

	press_key(key){
		this.doc.dispatchEvent(new KeyboardEvent('keydown', {'key': key}));
	}
}

test('movement', () => {
	document.write(full_mock);
	var _ = new Application();

	var doc = new Document_utils(document);
	doc.add_map('alpha');
	doc.click_on_map('alpha');

	doc.click_on_point(7, 5);

	for (var i=7; i<20; i+=1){
		doc.press_key('ArrowUp');
	}
	doc.press_key('ArrowRight');
	doc.press_key('ArrowUp');
	doc.press_key('ArrowRight');
	doc.press_key('ArrowUp');
	doc.press_key('ArrowRight');
	doc.press_key('ArrowUp');
	doc.press_key('ArrowUp');
	doc.press_key('ArrowUp');

	doc.click_on_id('saver');
});

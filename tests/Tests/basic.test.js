/**
 * @jest-environment jsdom
 */
import {main} from '../../src/seminal.js';

var full_mock = `
<!DOCTYPE html>

<html lang="en">
	<body>
		<div id="maps">
			<div id="adder"></div>
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

test('movement', () => {
	document.write(full_mock);
});

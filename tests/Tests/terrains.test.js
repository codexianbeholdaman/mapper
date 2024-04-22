/**
 * @jest-environment jsdom
 */
import {Application} from '../../src/seminal.js';
import * as configs from '../../src/config.js';
import {full_mock, click_event, Document_utils, Map_data_parser, Application_utils, set_configs} from './fundamental.js';


test('backspacing', () => {
	set_configs();

	document.write(full_mock);
	var app = new Application();

	var doc = new Document_utils(document);
	doc.add_map('alpha');
	doc.click_on_map('alpha');
	doc.click_on_point(7, 5);
	doc.press_key('w');
	doc.press_key('m');
	doc.press_key('k'); //Should be immaterial

	doc.chain_directions('UU');
	doc.press_key('m');

	doc.auxclick_on_point(6, 5);
	document.getElementById('terrain_river').dispatchEvent(click_event);
	doc.auxclick_on_point(6, 5);

	doc.auxclick_on_point(5, 5);
	document.getElementById('terrain_muscle').dispatchEvent(click_event);
	doc.auxclick_on_point(5, 5);

	doc.click_on_map('alpha');

	var map_data = new Map_data_parser(app.create_data_dump());
	expect(new Set(map_data.data['points']['7 5'].terrains)).toStrictEqual(new Set(['river', 'muscle']));
	expect(map_data.data['points']['6 5'].terrains).toStrictEqual(['river']);
	expect(map_data.data['points']['5 5'].terrains).toStrictEqual([]);
	expect(map_data.get_all_usable()).toStrictEqual(new Set(['7 5', '6 5', '5 5']));

	console.log
	expect(app.points['6 5'].element.style.backgroundColor).toStrictEqual('rgb(153, 255, 255)'); //Data repetition, ugly (color: from river: #99FFFF
});

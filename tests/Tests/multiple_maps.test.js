/**
 * @jest-environment jsdom
 */
import {Application} from '../../src/seminal.js';
import * as configs from '../../src/config.js';
import {full_mock, click_event, Document_utils, Map_data_parser, set_configs} from './fundamental.js';


test('multiple_maps', () => {
	set_configs();

	document.write(full_mock);
	var app = new Application();

	var doc = new Document_utils(document);
	doc.add_map('alpha');
	doc.add_map('beta');
	doc.click_on_map('alpha');

	var data_0 = new Map_data_parser(app.create_data_dump());

	doc.click_on_point(7, 5);
	for (var i=0; i<4; i+=1) doc.press_key('ArrowUp');

	doc.click_on_map('beta');
	doc.click_on_point(7, 5);
	for (var i=0; i<4; i+=1){
		doc.chain_directions('UR');
	}

	var data_1 = new Map_data_parser(app.create_data_dump());
	expect(data_1.get_all_usable()).toStrictEqual(new Set(['7 5', '6 5', '6 6', '7 6']));

	doc.click_on_map('alpha');
	var data_2 = new Map_data_parser(app.create_data_dump());
	expect(data_2.get_all_usable()).toStrictEqual(new Set(['7 5', '6 5', '5 5', '4 5', '3 5']));
});

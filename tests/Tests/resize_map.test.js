/**
 * @jest-environment jsdom
 */
import {Application} from '../../src/seminal.js';
import * as configs from '../../src/config.js';
import {full_mock, click_event, Document_utils, Map_data_parser, Application_utils, set_configs} from './fundamental.js';


test('resize_maps', () => {
	configs._CONFIG_GAME = 'Pool of Radiance';
	configs._CONFIG_MAX_MAP_SIZE = 24;

	document.write(full_mock);
	var app = new Application();
	var doc = new Document_utils(document);
	doc.add_map('alpha');
	doc.click_on_map('alpha');

	doc.click_on_point(7, 5);
	for (var i=0; i<2; i+=1) doc.press_key('ArrowUp');

	var sizer = document.getElementById('map_size');
	sizer.value = '20,20';
	doc.click_on_map('alpha');

	doc.click_on_point(18, 18);
	for (var i=0; i<2; i+=1) doc.press_key('ArrowUp');
	Application_utils.check_all_fields(app, ['7 5', '6 5', '5 5', '18 18', '17 18', '16 18']);

	sizer.value = '7,7';
	doc.click_on_map('alpha');
	Application_utils.check_all_fields(app, ['6 5', '5 5']);
});

/**
 * @jest-environment jsdom
 */
import {Application} from '../../src/seminal.js';
import * as configs from '../../src/config.js';
import {full_mock, click_event, Document_utils, Map_data_parser, Application_utils, set_configs} from './fundamental.js';


test('teleport', () => {
	set_configs();

	document.write(full_mock);
	var app = new Application();

	var doc = new Document_utils(document);
	doc.add_map('alpha');
	doc.add_map('beta');
	doc.click_on_map('alpha');
	doc.click_on_point(7, 5);
	doc.chain_directions('UU');

	document.getElementById('teleport').value = '3 3;S';
	doc.click_on_map('beta');
	doc.click_on_point(7, 5);
	doc.chain_directions('RU');

	doc.click_on_flight('alpha', 'T');
	doc.chain_directions('UU');
	Application_utils.check_all_fields(app, ['7 5', '6 5', '5 5', '3 3', '4 3', '5 3']);

	doc.click_on_map('beta');
	Application_utils.check_all_fields(app, ['7 5', '7 6']);
});

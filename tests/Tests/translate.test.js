/**
 * @jest-environment jsdom
 */
import {Application} from '../../src/seminal.js';
import * as configs from '../../src/config.js';
import {full_mock, click_event, Document_utils, Map_data_parser, set_configs} from './fundamental.js';


test('translate', () => {
	set_configs();

	document.write(full_mock);
	var app = new Application();

	var doc = new Document_utils(document);
	doc.add_map('alpha');
	doc.add_map('beta');
	doc.click_on_map('alpha');
	doc.click_on_point(7, 5);
	doc.chain_directions('URU');

	var data_1 = new Map_data_parser(app.create_data_dump());
	expect(data_1.get_all_usable()).toStrictEqual(new Set(['7 5', '6 5', '6 6']));

	document.getElementById('translate').value = '2,0';
	doc.click_on_map('alpha');
	var data_2 = new Map_data_parser(app.create_data_dump());
	expect(data_2.get_all_usable()).toStrictEqual(new Set(['9 5', '8 5', '8 6']));

	document.getElementById('translate').value = '-3,-2';
	doc.click_on_map('beta');
	doc.click_on_map('alpha');
	var data_3 = new Map_data_parser(app.create_data_dump());
	expect(data_3.get_all_usable()).toStrictEqual(new Set(['6 3', '5 3', '5 4']));
});

/**
 * @jest-environment jsdom
 */
import {Application} from '../../src/seminal.js';
import * as configs from '../../src/config.js';
import {full_mock, click_event, Document_utils, Map_data_parser, set_configs} from './fundamental.js';


test('movement', () => {
	set_configs();

	document.write(full_mock);
	var app = new Application();

	var doc = new Document_utils(document);
	doc.add_map('alpha');
	doc.add_map('beta');
	doc.click_on_map('alpha');

	doc.click_on_point(7, 5);

	var data_1 = new Map_data_parser(app.create_data_dump());
	expect(data_1.get_all_usable()).toStrictEqual(new Set(['7 5']));
	expect(data_1.data.title).toStrictEqual('alpha');

	doc.rename_map('sigma');
	doc.click_on_map('beta');
	doc.click_on_map('sigma');

	var data_2 = new Map_data_parser(app.create_data_dump());
	expect(data_2.get_all_usable()).toStrictEqual(new Set(['7 5']));
	expect(data_2.data.title).toStrictEqual('sigma');

	doc.rename_map('sigma');
	var data_3 = new Map_data_parser(app.create_data_dump());
	expect(data_3.get_all_usable()).toStrictEqual(new Set(['7 5']));
	expect(data_3.data.title).toStrictEqual('sigma');
});

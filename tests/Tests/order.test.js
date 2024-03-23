/**
 * @jest-environment jsdom
 */
import {Application} from '../../src/seminal.js';
import * as configs from '../../src/config.js';
import {full_mock, click_event, Document_utils, Map_data_parser, set_configs} from './fundamental.js';


test('order', () => {
	set_configs(5);

	document.write(full_mock);
	var app = new Application();
	var doc = new Document_utils(document);
	doc.add_map('a');
	doc.add_map('b');
	doc.add_map('c');
	doc.add_map('xa');
	doc.add_map('aac');
	doc.add_map('xar');

	doc.click_on_map('a');
	doc.click_on_point(2, 2);

	var order = document.getElementById('order');
	order.value = '1';

	doc.click_on_map('b');
	order.value = 0;

	doc.click_on_map('c');
	order.value = 3;

	doc.click_on_map('xa');
	doc.click_on_point(0, 1);

	doc.click_on_map('aac');
	order.value = 5;

	doc.click_on_id('orderer')
	var proper_maps = Array.from(document.getElementsByClassName('__map')).map(x => x.getElementsByTagName('span')[0].innerHTML);
	expect(proper_maps).toStrictEqual(['xa', 'xar', 'b', 'a', 'c', 'aac']);

	doc.click_on_map('a');
	var data_1 = new Map_data_parser(app.create_data_dump());
	expect(data_1.get_all_usable()).toStrictEqual(new Set(['2 2']));

	doc.click_on_map('xa');
	var data_1 = new Map_data_parser(app.create_data_dump());
	expect(data_1.get_all_usable()).toStrictEqual(new Set(['0 1']));
});

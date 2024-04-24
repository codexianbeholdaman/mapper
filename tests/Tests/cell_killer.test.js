/**
 * @jest-environment jsdom
 */
import {Application} from '../../src/seminal.js';
import * as configs from '../../src/config.js';
import {full_mock, click_event, Document_utils, Map_data_parser, set_configs} from './fundamental.js';


test('cutter', () => {
	set_configs();

	document.write(full_mock);
	var app = new Application();
	var doc = new Document_utils(document);
	doc.add_map('alpha');
	doc.click_on_map('alpha');

	doc.click_on_point(7, 5);
	doc.chain_directions('UURURURUU')

	doc.click_on_id('killer');
	doc.click_on_point(6, 5);

	var data = new Map_data_parser(app.create_data_dump());
	expect(data.data.points['6 5'].used).toBe(false);
	expect(data.data.points['6 5'].borders).toStrictEqual([false, false, false, false]);
	expect(data.data.points['5 5'].borders).toStrictEqual([false, true, false, false]);
	expect(data.data.points['7 5'].borders).toStrictEqual([false, false, false, false]);
	expect(data.data.points['6 6'].borders).toStrictEqual([true, false, false, false]);
	expect(data.data.points['6 4'].borders).toStrictEqual([false, false, false, false]);
	expect(data.get_all_usable()).toStrictEqual(new Set(['7 5', '5 5', '5 6', '6 6', '6 4']));
});

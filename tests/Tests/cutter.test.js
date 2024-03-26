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
	doc.chain_directions('URU')

	doc.auxclick_on_point(5, 7);
	document.getElementById('shorthand_text').value = '1184';
	doc.auxclick_on_point(12, 12);

	doc.click_on_id('cutter');
	var data = new Map_data_parser(app.create_data_dump());
	expect(data.get_all_usable()).toStrictEqual(new Set(['2 0', '1 0', '1 1']));
	expect(data.data['map size']).toStrictEqual([3,3]);
});

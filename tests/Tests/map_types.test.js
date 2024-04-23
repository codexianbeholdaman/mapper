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
	doc.add_map('beta');
	doc.add_map('theta');
	doc.click_on_map('alpha');
	doc.click_on_id('map_type_typo');

	doc.click_on_map('theta');
	doc.click_on_id('map_type_typo');
	var _ = new Map_data_parser(app.create_data_dump());
	expect(_.data.map_type).toStrictEqual('typo');

	doc.click_on_map('beta');
	_ = new Map_data_parser(app.create_data_dump());
	expect(_.data.map_type).toStrictEqual('_default');

	doc.click_on_map('alpha');
	_ = new Map_data_parser(app.create_data_dump());
	expect(_.data.map_type).toStrictEqual('typo');
	doc.click_on_id('map_type__default');
	_ = new Map_data_parser(app.create_data_dump());
	expect(_.data.map_type).toStrictEqual('_default');

	expect(document.getElementById('__map beta').style.backgroundColor).toStrictEqual('rgb(136, 0, 0)');
	expect(document.getElementById('__map theta').style.backgroundColor).toStrictEqual('rgb(170, 170, 170)');
});

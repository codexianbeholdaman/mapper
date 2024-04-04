/**
 * @jest-environment jsdom
 */
import {Application} from '../../src/seminal.js';
import * as configs from '../../src/config.js';
import {full_mock, click_event, Document_utils, Map_data_parser, Application_utils, set_configs} from './fundamental.js';


test('script_R', () => {
	set_configs();

	document.write(full_mock);
	var app = new Application();
	var doc = new Document_utils(document);
	doc.add_map('alpha 1');
	doc.add_map('alpha 2');
	doc.click_on_map('alpha 1');

	doc.click_on_point(7, 5);
	doc.chain_directions('U');
	doc.auxclick_set([6, 5], 'scripts_text', 'P;N;_UP;_P;R');
	doc.press_key('y');

	doc.chain_directions('U');

	var result = new Map_data_parser(app.create_data_dump());
	expect(result.get_all_usable()).toStrictEqual(new Set(['7 5', '6 5']));
	expect(result.data.title).toStrictEqual('alpha 2');

	doc.auxclick_set([6, 5], 'scripts_text', 'P;N;_DOWN;_P');
	doc.chain_directions('LLU');
	doc.press_key('y');
	doc.chain_directions('U');

	result = new Map_data_parser(app.create_data_dump());
	expect(result.get_all_usable()).toStrictEqual(new Set(['7 5', '6 5', '5 5']));
	expect(result.data.title).toStrictEqual('alpha 1');
});

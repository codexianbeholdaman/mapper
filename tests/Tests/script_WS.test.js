/**
 * @jest-environment jsdom
 */
import {Application} from '../../src/seminal.js';
import * as configs from '../../src/config.js';
import {full_mock, click_event, Document_utils, Map_data_parser, Application_utils, set_configs} from './fundamental.js';


test('script_W', () => {
	configs._CONFIG_GAME = 'MM2';

	document.write(full_mock);
	var app = new Application();
	var doc = new Document_utils(document);
	doc.add_map('a1');
	doc.add_map('b1');
	doc.add_map('a2');
	doc.click_on_map('a1');

	doc.click_on_point(1, 1);
	doc.auxclick_set([0, 1], 'scripts_text', 'WS;S');
	doc.chain_directions('RRUU');
	doc.auxclick_set([15, 2], 'scripts_text', 'WS;N');

	doc.chain_directions('ULULU');
	Application_utils.check_all_fields(app, ['15 1', '14 1', '14 2', '15 2']);
	doc.chain_directions('U');
	Application_utils.check_all_fields(app, ['1 1', '0 1', '0 2']);

	doc.auxclick_set([1, 15], 'scripts_text', 'WS;E');
	doc.click_on_point(1, 14);
	doc.chain_directions('RUUU');
	Application_utils.check_all_fields(app, ['1 0', '1 1']);
	doc.chain_directions('RRUUUUUU');
	Application_utils.check_all_fields(app, ['1 0', '1 1']);
	doc.auxclick_set([2, 0], 'scripts_text', 'WS;W');

	doc.chain_directions('RULU');
	Application_utils.check_all_fields(app, ['1 1', '0 1', '0 2', '1 14', '1 15', '2 15']);
});

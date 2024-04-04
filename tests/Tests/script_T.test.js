/**
 * @jest-environment jsdom
 */
import {Application} from '../../src/seminal.js';
import * as configs from '../../src/config.js';
import {full_mock, click_event, Document_utils, Map_data_parser, Application_utils, set_configs} from './fundamental.js';


test('script_T', () => {
	set_configs();

	document.write(full_mock);
	var app = new Application();
	var doc = new Document_utils(document);
	doc.add_map('alpha');
	doc.add_map('beta');
	doc.click_on_map('alpha');

	doc.click_on_point(7, 5);
	doc.chain_directions('UR');

	doc.auxclick_set([6, 6], 'scripts_text', 'T;_S;10 10');
	doc.auxclick_set([10, 10], 'scripts_text', 'T;beta;4 6');

	doc.chain_directions('U');

	var result = new Map_data_parser(app.create_data_dump());

	Application_utils.check_all_fields(app, ['7 5', '6 5', '6 6', '10 10']);
	doc.chain_directions('ULU');
	Application_utils.check_all_fields(app, ['7 5', '6 5', '6 6', '10 10', '10 11', '9 11']);
	doc.chain_directions('LULU');

	doc.auxclick_set([3, 6], 'scripts_text', 'T;alpha;6 5');
	doc.chain_directions('U');
	Application_utils.check_all_fields(app, ['4 6', '5 6']);
	doc.chain_directions('LLUU');
	Application_utils.check_all_fields(app, ['7 5', '6 5', '6 6', '10 10', '10 11', '9 11', '9 10']);
});

/**
 * @jest-environment jsdom
 */
import {Application} from '../../src/seminal.js';
import * as configs from '../../src/config.js';
import {full_mock, click_event, Document_utils, Map_data_parser, Application_utils, set_configs} from './fundamental.js';


test('script_W', () => {
	set_configs();

	document.write(full_mock);
	var app = new Application();
	var doc = new Document_utils(document);
	doc.add_map('a1');
	doc.add_map('a2');
	doc.click_on_map('a1');

	doc.click_on_point(7, 5);
	doc.chain_directions('UR');

	doc.auxclick_set([6, 6], 'scripts_text', 'W;E;_S;10 10;N');
	doc.auxclick_set([9, 10], 'scripts_text', 'W;N;a2;5 5');

	doc.chain_directions('UU');

	var result = new Map_data_parser(app.create_data_dump());

	Application_utils.check_all_fields(app, ['7 5', '6 5', '6 6', '10 10']);
	doc.chain_directions('UU');
	Application_utils.check_all_fields(app, ['5 5']);
	doc.auxclick_set([5, 5], 'scripts_text', 'W;WES;a1;5 5');
	doc.chain_directions('URURUR');
	Application_utils.check_all_fields(app, ['5 5', '4 5', '4 6', '5 6']);
	doc.chain_directions('UU');
	Application_utils.check_all_fields(app, ['7 5', '6 5', '6 6', '10 10', '9 10', '5 5']);
});

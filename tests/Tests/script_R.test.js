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
	doc.add_map('alpha');
	doc.click_on_map('alpha');

	doc.click_on_point(7, 5);
	doc.chain_directions('URU');

	doc.auxclick_on_point(6, 6);
	document.getElementById('scripts_text').value = 'R;WE';
	doc.auxclick_on_point(12, 12);

	doc.press_key('y');
	doc.chain_directions('UU')
	Application_utils.check_all_fields(app, ['7 5', '6 5', '6 6', '6 4']);
	doc.chain_directions('RRUUL');
	doc.press_key('y'); //expect to ignore the key
	doc.chain_directions('UU');
	Application_utils.check_all_fields(app, ['7 5', '6 5', '6 6', '6 4', '5 6', '4 6']);
});

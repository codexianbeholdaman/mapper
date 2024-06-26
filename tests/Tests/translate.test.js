/**
 * @jest-environment jsdom
 */
import {Application} from '../../src/seminal.js';
import * as configs from '../../src/config.js';
import {full_mock, click_event, Document_utils, Map_data_parser, Application_utils, set_configs} from './fundamental.js';


test('translate', () => {
	set_configs();

	document.write(full_mock);
	var app = new Application();

	var doc = new Document_utils(document);
	doc.add_map('alpha');
	doc.add_map('beta');
	doc.click_on_map('alpha');
	doc.click_on_point(7, 5);
	doc.chain_directions('URU');

	Application_utils.check_all_fields(app, ['7 5', '6 5', '6 6']);

	document.getElementById('translate').value = '2,0';
	doc.click_on_map('alpha');
	Application_utils.check_all_fields(app, ['9 5', '8 5', '8 6']);

	document.getElementById('translate').value = '-3,-2';
	doc.click_on_map('beta');
	doc.click_on_map('alpha');
	Application_utils.check_all_fields(app, ['6 3', '5 3', '5 4']);
});

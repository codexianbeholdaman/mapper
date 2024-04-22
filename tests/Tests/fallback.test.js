/**
 * @jest-environment jsdom
 */
import {Application} from '../../src/seminal.js';
import * as configs from '../../src/config.js';
import {full_mock, click_event, Document_utils, Map_data_parser, Application_utils, set_configs} from './fundamental.js';


test('backspacing', () => {
	configs._CONFIG_GAME = 'some_absolutely_nonsensical_name';

	document.write(full_mock);
	var app = new Application();

	var doc = new Document_utils(document);
	doc.add_map('alpha');
	doc.click_on_map('alpha');
	doc.click_on_point(7, 5);

	doc.chain_directions('RU');

	Application_utils.check_all_fields(app, ['7 5', '7 6']);
});

/**
 * @jest-environment jsdom
 */
import {Application} from '../../src/seminal.js';
import * as configs from '../../src/config.js';
import {full_mock, click_event, Document_utils, Map_data_parser, Application_utils, set_configs} from './fundamental.js';


test('movement', () => {
	set_configs();

	document.write(full_mock);
	var app = new Application();

	var doc = new Document_utils(document);
	doc.add_map('alpha');
	doc.click_on_map('alpha');

	doc.click_on_point(7, 5);

	for (var i=7; i<20; i+=1){
		doc.press_key('ArrowUp');
	}
	doc.chain_directions('RURURUUU');

	Application_utils.check_all_fields(app, ['0 6', '0 5', '1 3', '1 4', '1 5', '1 6', '2 5', '3 5', '4 5', '5 5', '6 5', '7 5']);
});

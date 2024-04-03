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
	doc.click_on_map('alpha');
	doc.click_on_point(7, 5);

	doc.auxclick_on_point(6, 5);
	document.getElementById('scripts_text').value = 'P;N;beta;7 1';
	doc.auxclick_on_point(6, 5);

	doc.press_key('ArrowUp');
	doc.press_key('y');

	doc.chain_directions('UU');

	doc.auxclick_on_point(4, 1);
	document.getElementById('scripts_text').value = 'P;N;alpha;10 8';
	doc.auxclick_on_point(12, 12);

	doc.press_key('ArrowUp');
	doc.press_key('y');

	doc.auxclick_on_point(9, 8);
	document.getElementById('scripts_text').value = 'P;N;_S;6 5';
	doc.auxclick_on_point(12, 12);
	doc.press_key('ArrowUp');
	doc.press_key('y');

	Application_utils.check_all_fields(app, ['7 5', '6 5', '10 8', '9 8']);

	doc.press_key('Backspace');
	doc.press_key('Backspace');
	doc.press_key('Backspace');
	doc.chain_directions('RUU');

	Application_utils.check_all_fields(app, ['7 1', '6 1', '5 1', '4 1', '4 2', '4 3']);

	for (var i=0; i<7; i+=1){
		doc.press_key('Backspace');
	}
	Application_utils.check_all_fields(app, ['7 5', '6 5']);
});
